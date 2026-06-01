"use client";

import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

export function LoginForm() {
  const { login } = useAuth();
  const router = useRouter();
  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [errors, setErrors] = useState<{ name?: string; mobile?: string }>({});
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function validate() {
    const next: { name?: string; mobile?: string } = {};
    if (!name.trim()) next.name = "Name is required";
    if (!mobile.trim()) {
      next.mobile = "Mobile number is required";
    } else if (mobile.replace(/\D/g, "").length < 10) {
      next.mobile = "Enter a valid 10-digit mobile number";
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    setError(null);

    try {
      await login({
        name: name.trim(),
        mobile: mobile.trim(),
      });
      router.replace("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="Full name"
        name="name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        error={errors.name}
        placeholder="Your name"
        autoComplete="name"
      />
      <Input
        label="Mobile number"
        name="mobile"
        type="tel"
        inputMode="tel"
        value={mobile}
        onChange={(e) => setMobile(e.target.value)}
        error={errors.mobile}
        placeholder="9999999999"
        autoComplete="tel"
      />

      {error ? (
        <p className="rounded-xl bg-red-500/10 px-3 py-2 text-sm text-red-300">
          {error}
        </p>
      ) : null}

      <Button type="submit" size="md" fullWidth disabled={submitting}>
        {submitting ? "Signing in..." : "Continue"}
      </Button>
    </form>
  );
}
