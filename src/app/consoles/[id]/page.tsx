import { ConsoleBookingClient } from "./ConsoleBookingClient";
import { getConsoleStaticParams } from "@/lib/static-params";
import type { Metadata } from "next";

interface PageProps {
  params: Promise<{ id: string }>;
}

export const metadata: Metadata = {
  title: "Book Console",
};

export async function generateStaticParams() {
  return getConsoleStaticParams();
}

export default async function ConsoleDetailPage({ params }: PageProps) {
  const { id } = await params;
  return <ConsoleBookingClient consoleId={id} />;
}
