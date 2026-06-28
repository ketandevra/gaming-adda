import { ConsolesListClient } from "./ConsolesListClient";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Consoles",
};

export default function ConsolesPage() {
  return (
    <div className="page-shell">
      <div className="page-header">
        <p className="text-label">Stations</p>
        <h1 className="page-title mt-1">Gaming Consoles</h1>
        <p className="page-subtitle">
          Select a station and book your preferred time slot.
        </p>
      </div>
      <ConsolesListClient />
    </div>
  );
}
