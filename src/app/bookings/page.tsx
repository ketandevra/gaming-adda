import { BookingsLookupClient } from "./BookingsLookupClient";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "My Bookings",
};

export default function BookingsPage() {
  return (
    <div className="page-shell max-w-2xl">
      <div className="page-header">
        <h1 className="page-title">My Bookings</h1>
        <p className="page-subtitle">
          Upcoming sessions and past bookings, including expired.
        </p>
      </div>
      <BookingsLookupClient />
    </div>
  );
}
