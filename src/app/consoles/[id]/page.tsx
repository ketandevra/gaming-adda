import { ConsoleBookingClient } from "./ConsoleBookingClient";
import type { Metadata } from "next";

interface PageProps {
  params: Promise<{ id: string }>;
}

export const metadata: Metadata = {
  title: "Book Console",
};

export default async function ConsoleDetailPage({ params }: PageProps) {
  const { id } = await params;
  return <ConsoleBookingClient consoleId={id} />;
}
