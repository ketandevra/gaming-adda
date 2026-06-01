import { BookingDetailView } from "./BookingDetailView";
import type { Metadata } from "next";

interface PageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ confirmed?: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  return { title: `Booking ${id}` };
}

export default async function BookingDetailPage({
  params,
  searchParams,
}: PageProps) {
  const { id } = await params;
  const { confirmed } = await searchParams;

  return (
    <BookingDetailView id={id} confirmed={confirmed === "1"} />
  );
}
