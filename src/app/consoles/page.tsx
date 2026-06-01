import { ConsolesListClient } from "./ConsolesListClient";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Consoles",
};

export default function ConsolesPage() {
  return (
    <div className="page-shell">
      <div className="mb-5">
        <h1 className="page-title">Gaming Consoles</h1>
        <p className="page-subtitle">
          Select a station and book your preferred time slot.
        </p>
      </div>
      <ConsolesListClient />
    </div>
  );
}
