import { BookingsLookupClient } from "./BookingsLookupClient";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "My Bookings",
};

export default function BookingsPage() {
  return (
    <div className="mx-auto max-w-2xl px-3.5 py-4 sm:px-5 sm:py-6">
      <h1 className="page-title">My Bookings</h1>
      <p className="page-subtitle">
        Upcoming sessions and past bookings, including expired.
      </p>
      <div className="mt-5">
        <BookingsLookupClient />
      </div>
    </div>
  );
}
