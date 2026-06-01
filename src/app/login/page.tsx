import { LoginForm } from "./LoginForm";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Login",
};

export default function LoginPage() {
  return (
    <div className="relative flex min-h-[calc(100dvh-3.5rem)] items-center justify-center overflow-hidden px-3.5 py-6">
      <div className="glow-orb -left-16 top-8 h-40 w-40 bg-[var(--accent)]" />
      <div className="glow-orb right-0 bottom-0 h-44 w-44 bg-[var(--accent-secondary)]" />

      <div className="relative w-full max-w-sm">
        <p className="font-display text-center text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--accent)]">
          Welcome
        </p>
        <h1 className="font-display mt-1.5 text-center text-xl font-bold">
          The Gaming Adda
        </h1>
        <p className="mt-1.5 text-center text-xs text-[var(--muted)]">
          Enter your name and mobile to continue.
        </p>
        <div className="section-card mt-5 p-4 shadow-[0_0_32px_rgba(0,255,198,0.05)]">
          <LoginForm />
        </div>
      </div>
    </div>
  );
}
