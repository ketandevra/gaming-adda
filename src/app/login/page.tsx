import { LoginForm } from "./LoginForm";
import { Logo } from "@/components/layout/Logo";
import { LoginIcon } from "@/components/icons";
import type { Metadata } from "next";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Login",
};

function LoginFormFallback() {
  return (
    <div className="card mt-6 p-5">
      <div className="h-32 animate-pulse rounded-lg bg-[var(--surface-elevated)]" />
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="flex min-h-[calc(100dvh-3.5rem)] items-center justify-center px-4 py-8">
      <div className="w-full max-w-sm">
        <div className="text-center">
          <div className="mx-auto mb-4 flex justify-center">
            <Logo size={120} priority />
          </div>
          <p className="inline-flex items-center justify-center gap-1.5 text-label">
            <LoginIcon size={14} />
            Welcome
          </p>
          <h1 className="font-display mt-2 text-2xl font-bold text-[var(--foreground)]">
            The Gaming Adda
          </h1>
          <p className="mt-2 text-sm text-[var(--foreground-secondary)]">
            Sign in with your 10-digit mobile number to book or view bookings.
          </p>
        </div>
        <Suspense fallback={<LoginFormFallback />}>
          <div className="card mt-6 p-5">
            <LoginForm />
          </div>
        </Suspense>
      </div>
    </div>
  );
}
