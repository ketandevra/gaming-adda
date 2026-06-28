"use client";

import {
  ADMIN_STATS_PERIODS,
  DEFAULT_ADMIN_STATS_PERIOD,
  computeAdminBookingStats,
  getAdminStatsPeriodLabel,
  type AdminStatsPeriod,
} from "@/lib/bookings/admin-stats";
import { formatCurrency } from "@/lib/utils";
import type { Booking } from "@/types";
import { useMemo } from "react";

interface AdminBookingSummaryProps {
  bookings: Booking[];
  period: AdminStatsPeriod;
  loading?: boolean;
  onPeriodChange: (period: AdminStatsPeriod) => void;
}

interface StatCardConfig {
  key: keyof ReturnType<typeof computeAdminBookingStats>;
  label: string;
  tone?: "default" | "success" | "warning" | "danger" | "accent";
  format?: "currency";
}

const STAT_CARDS: StatCardConfig[] = [
  { key: "total", label: "Total booked", tone: "accent" },
  { key: "confirmed", label: "Confirmed", tone: "success" },
  { key: "paymentPending", label: "Payment pending", tone: "warning" },
  { key: "verifyingPayment", label: "Verifying payment", tone: "warning" },
  { key: "cancelled", label: "Cancelled", tone: "danger" },
  { key: "refund", label: "Refund", tone: "danger" },
  { key: "revenue", label: "Revenue", tone: "success", format: "currency" },
];

function SummarySkeleton() {
  return (
    <div className="admin-summary-grid">
      {Array.from({ length: 7 }).map((_, index) => (
        <div key={index} className="admin-summary-card admin-summary-card--loading">
          <div className="h-3 w-16 animate-pulse rounded bg-[var(--surface-elevated)]" />
          <div className="mt-2 h-6 w-10 animate-pulse rounded bg-[var(--surface-elevated)]" />
        </div>
      ))}
    </div>
  );
}

export function AdminBookingSummary({
  bookings,
  period,
  loading = false,
  onPeriodChange,
}: AdminBookingSummaryProps) {
  const stats = useMemo(
    () => computeAdminBookingStats(bookings, period),
    [bookings, period],
  );

  return (
    <section className="admin-summary" aria-labelledby="admin-summary-title">
      <div className="admin-summary-header">
        <div className="min-w-0">
          <h2 id="admin-summary-title" className="admin-summary-title">
            Booking summary
          </h2>
          <p className="admin-summary-subtitle">
            Stats for {getAdminStatsPeriodLabel(period).toLowerCase()}
          </p>
        </div>
        <label className="admin-summary-period">
          <span className="sr-only">Choose summary period</span>
          <select
            value={period}
            onChange={(event) =>
              onPeriodChange(event.target.value as AdminStatsPeriod)
            }
            className="admin-summary-period-select"
            disabled={loading}
          >
            {ADMIN_STATS_PERIODS.map((item) => (
              <option key={item.id} value={item.id}>
                {item.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      {loading ? (
        <SummarySkeleton />
      ) : (
        <div className="admin-summary-grid">
          {STAT_CARDS.map((card) => {
            const value = stats[card.key];
            const displayValue =
              card.format === "currency" ? formatCurrency(value) : String(value);

            return (
              <div
                key={card.key}
                className={`admin-summary-card admin-summary-card--${card.tone ?? "default"}`}
              >
                <span className="admin-summary-card-label">{card.label}</span>
                <span className="admin-summary-card-value">{displayValue}</span>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}

export { DEFAULT_ADMIN_STATS_PERIOD };
