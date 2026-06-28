import { getApiBaseUrl } from "@/lib/api/config";
import { NextRequest, NextResponse } from "next/server";

function corsHeaders(request: NextRequest): Record<string, string> {
  const origin = request.headers.get("origin");
  return {
    ...(origin ? { "Access-Control-Allow-Origin": origin } : {}),
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Accept",
    Vary: "Origin",
  };
}

function buildUpstreamUrl(searchParams: URLSearchParams): string {
  const base = getApiBaseUrl();
  if (!base) {
    throw new Error("NEXT_PUBLIC_API_URL is not configured");
  }

  const url = new URL(base);
  searchParams.forEach((value, key) => {
    url.searchParams.set(key, value);
  });
  return url.toString();
}

export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 204,
    headers: corsHeaders(request),
  });
}

export async function GET(request: NextRequest) {
  const base = getApiBaseUrl();
  if (!base) {
    return NextResponse.json(
      { success: false, message: "API URL not configured" },
      { status: 500, headers: corsHeaders(request) },
    );
  }

  try {
    const upstream = buildUpstreamUrl(request.nextUrl.searchParams);
    const response = await fetch(upstream, {
      headers: { Accept: "application/json" },
      cache: "no-store",
      redirect: "follow",
    });
    const text = await response.text();

    return new NextResponse(text, {
      status: response.status,
      headers: {
        ...corsHeaders(request),
        "Content-Type": "application/json",
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Upstream request failed";
    return NextResponse.json(
      { success: false, message },
      { status: 502, headers: corsHeaders(request) },
    );
  }
}

export async function POST(request: NextRequest) {
  const base = getApiBaseUrl();
  if (!base) {
    return NextResponse.json(
      { success: false, message: "API URL not configured" },
      { status: 500, headers: corsHeaders(request) },
    );
  }

  try {
    const rawBody = await request.text();
    let forwardBody = rawBody;

    try {
      const parsed = rawBody ? JSON.parse(rawBody) : null;
      if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
        const record = parsed as Record<string, unknown>;
        const action = String(record.action ?? "");

        // Legacy verifyPayment used hardcoded column indices and shifted values into
        // endTime / bookingStatus. Always forward the header-safe action instead.
        if (action === "verifyPayment") {
          record.fields = {
            bookingStatus:
              (record.fields as Record<string, unknown> | undefined)
                ?.bookingStatus ??
              record.bookingStatus ??
              "Confirmed",
            paymentStatus:
              (record.fields as Record<string, unknown> | undefined)
                ?.paymentStatus ??
              record.paymentStatus ??
              "Paid",
          };
          delete record.bookingStatus;
          delete record.paymentStatus;
          forwardBody = JSON.stringify(record);
        }
      }
    } catch {
      // Non-JSON body — forward unchanged
    }

    const response = await fetch(base, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: forwardBody,
      cache: "no-store",
      redirect: "follow",
    });
    const text = await response.text();

    return new NextResponse(text, {
      status: response.status,
      headers: {
        ...corsHeaders(request),
        "Content-Type": "application/json",
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Upstream request failed";
    return NextResponse.json(
      { success: false, message },
      { status: 502, headers: corsHeaders(request) },
    );
  }
}
