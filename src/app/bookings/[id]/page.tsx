import { BookingDetailView } from "./BookingDetailView";
import { getBookingStaticParams } from "@/lib/static-params";
import type { Metadata } from "next";
import { Suspense } from "react";

interface PageProps {
  params: Promise<{ id: string }>;
}

export function generateStaticParams() {
  return getBookingStaticParams();
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  return { title: `Booking ${id}` };
}

function BookingDetailFallback() {
  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-8 pb-24 sm:px-6">
      <div className="h-40 animate-pulse rounded-2xl bg-white/5" />
    </div>
  );
}

export default async function BookingDetailPage({ params }: PageProps) {
  const { id } = await params;

  return (
    <Suspense fallback={<BookingDetailFallback />}>
      <BookingDetailView id={id} />
    </Suspense>
  );
}
