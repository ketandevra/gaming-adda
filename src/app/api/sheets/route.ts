import { getApiBaseUrl } from "@/lib/api/config";
import { NextRequest, NextResponse } from "next/server";

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

export async function GET(request: NextRequest) {
  const base = getApiBaseUrl();
  if (!base) {
    return NextResponse.json(
      { success: false, message: "API URL not configured" },
      { status: 500 },
    );
  }

  try {
    const upstream = buildUpstreamUrl(request.nextUrl.searchParams);
    const response = await fetch(upstream, {
      headers: { Accept: "application/json" },
      cache: "no-store",
    });
    const text = await response.text();

    return new NextResponse(text, {
      status: response.status,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Upstream request failed";
    return NextResponse.json({ success: false, message }, { status: 502 });
  }
}

export async function POST(request: NextRequest) {
  const base = getApiBaseUrl();
  if (!base) {
    return NextResponse.json(
      { success: false, message: "API URL not configured" },
      { status: 500 },
    );
  }

  try {
    const body = await request.text();
    const response = await fetch(base, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body,
      cache: "no-store",
    });
    const text = await response.text();

    return new NextResponse(text, {
      status: response.status,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Upstream request failed";
    return NextResponse.json({ success: false, message }, { status: 502 });
  }
}
