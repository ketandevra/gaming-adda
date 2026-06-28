"use client";

import { useAuth } from "@/contexts/AuthContext";
import { ADMIN_DISPLAY_NAME, isAdminMobile } from "@/lib/auth/admin";
import { isValidMobileInput } from "@/lib/auth/login";
import { lookupCustomerName } from "@/lib/auth/lookup";
import { sanitizeRedirectPath } from "@/lib/auth/paths";
import { normalizeMobile } from "@/lib/auth/mobile";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { LockIcon, PhoneIcon, UserIcon } from "@/components/icons";
import { useSearchParams } from "next/navigation";
import { useState, type FormEvent } from "react";

type Step = "mobile" | "name" | "password";

export function LoginForm() {
  const { login } = useAuth();
  const searchParams = useSearchParams();
  const [step, setStep] = useState<Step>("mobile");
  const [mobile, setMobile] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [pendingMobile, setPendingMobile] = useState("");
  const [errors, setErrors] = useState<{
    name?: string;
    mobile?: string;
    password?: string;
  }>({});
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function redirectAfterLogin() {
    const redirectTo = sanitizeRedirectPath(searchParams.get("redirect"));
    window.location.assign(redirectTo);
  }

  async function completeLogin(
    mobileValue: string,
    nameValue: string,
    adminPassword?: string,
  ) {
    await login({
      name: nameValue.trim(),
      mobile: mobileValue,
      adminPassword,
    });
    if (isAdminMobile(mobileValue)) {
      window.location.assign("/admin");
      return;
    }
    redirectAfterLogin();
  }

  async function handleMobileSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);
    const mobileRaw = String(formData.get("mobile") ?? mobile).trim();
    const mobileValue = normalizeMobile(mobileRaw);

    const next: { mobile?: string } = {};
    if (!mobileRaw) {
      next.mobile = "Mobile number is required";
    } else if (!isValidMobileInput(mobileRaw)) {
      next.mobile = "Enter a valid 10-digit mobile number";
    }
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    setSubmitting(true);
    setError(null);

    try {
      if (isAdminMobile(mobileValue)) {
        setPendingMobile(mobileValue);
        setMobile(mobileValue);
        setStep("password");
        setSubmitting(false);
        return;
      }

      const existingName = await lookupCustomerName(mobileValue);
      if (existingName) {
        await completeLogin(mobileValue, existingName);
        return;
      }

      setPendingMobile(mobileValue);
      setMobile(mobileValue);
      setStep("name");
      setSubmitting(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not continue");
      setSubmitting(false);
    }
  }

  async function handleNameSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);
    const nameValue = String(formData.get("name") ?? name).trim();

    if (!nameValue) {
      setErrors({ name: "Name is required" });
      return;
    }
    setErrors({});

    setSubmitting(true);
    setError(null);

    try {
      await completeLogin(pendingMobile, nameValue);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
      setSubmitting(false);
    }
  }

  async function handlePasswordSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);
    const passwordValue = String(formData.get("password") ?? password);

    if (!passwordValue) {
      setErrors({ password: "Password is required" });
      return;
    }
    setErrors({});

    setSubmitting(true);
    setError(null);

    try {
      await completeLogin(pendingMobile, ADMIN_DISPLAY_NAME, passwordValue);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
      setSubmitting(false);
    }
  }

  function resetToMobile() {
    setStep("mobile");
    setPassword("");
    setError(null);
    setErrors({});
  }

  if (step === "password") {
    return (
      <form onSubmit={handlePasswordSubmit} className="space-y-4" noValidate>
        <p className="rounded-lg bg-[var(--surface-elevated)] px-3 py-2.5 text-sm text-[var(--foreground-secondary)]">
          Admin sign-in for{" "}
          <span className="font-semibold text-[var(--foreground)]">
            {pendingMobile}
          </span>
          . Enter your password to continue.
        </p>

        <Input
          label={
            <span className="inline-flex items-center gap-1.5">
              <LockIcon size={16} className="text-[var(--accent-muted)]" />
              Admin password
            </span>
          }
          name="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onInput={(e) => setPassword(e.currentTarget.value)}
          error={errors.password}
          placeholder="Enter admin password"
          autoComplete="current-password"
          autoFocus
          enterKeyHint="go"
        />

        {error ? (
          <p className="alert-error rounded-lg px-3 py-2 text-sm" role="alert">
            {error}
          </p>
        ) : null}

        <Button type="submit" size="md" fullWidth disabled={submitting}>
          {submitting ? "Signing in..." : "Sign in as admin"}
        </Button>

        <button
          type="button"
          onClick={resetToMobile}
          className="w-full text-center text-sm font-medium text-[var(--accent-muted)] hover:underline"
        >
          Change mobile number
        </button>
      </form>
    );
  }

  if (step === "name") {
    return (
      <form onSubmit={handleNameSubmit} className="space-y-4" noValidate>
        <p className="rounded-lg bg-[var(--surface-elevated)] px-3 py-2.5 text-sm text-[var(--foreground-secondary)]">
          Welcome! Enter your name to finish signing in with{" "}
          <span className="font-semibold text-[var(--foreground)]">
            {pendingMobile}
          </span>
          .
        </p>

        <Input
          label={
            <span className="inline-flex items-center gap-1.5">
              <UserIcon size={16} className="text-[var(--accent-muted)]" />
              Full name
            </span>
          }
          name="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onInput={(e) => setName(e.currentTarget.value)}
          error={errors.name}
          placeholder="Your name"
          autoComplete="name"
          autoFocus
          enterKeyHint="go"
        />

        {error ? (
          <p className="alert-error rounded-lg px-3 py-2 text-sm" role="alert">
            {error}
          </p>
        ) : null}

        <Button type="submit" size="md" fullWidth disabled={submitting}>
          {submitting ? "Signing in..." : "Continue"}
        </Button>

        <button
          type="button"
          onClick={resetToMobile}
          className="w-full text-center text-sm font-medium text-[var(--accent-muted)] hover:underline"
        >
          Change mobile number
        </button>
      </form>
    );
  }

  return (
    <form onSubmit={handleMobileSubmit} className="space-y-4" noValidate>
      <Input
        label={
          <span className="inline-flex items-center gap-1.5">
            <PhoneIcon size={16} className="text-[var(--accent-muted)]" />
            Mobile number
          </span>
        }
        name="mobile"
        type="tel"
        inputMode="numeric"
        value={mobile}
        onChange={(e) => setMobile(e.target.value)}
        onInput={(e) => setMobile(e.currentTarget.value)}
        error={errors.mobile}
        placeholder="9999999999"
        autoComplete="tel"
        maxLength={14}
        enterKeyHint="go"
      />

      {error ? (
        <p className="alert-error rounded-lg px-3 py-2 text-sm" role="alert">
          {error}
        </p>
      ) : null}

      <Button type="submit" size="md" fullWidth disabled={submitting}>
        {submitting ? "Checking..." : "Continue"}
      </Button>
    </form>
  );
}
