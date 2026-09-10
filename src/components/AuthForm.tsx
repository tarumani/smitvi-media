"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

export function AuthForm({ mode }: { mode: "login" | "register" }) {
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("next") || "/";
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  return (
    <form
      className="mx-auto max-w-md space-y-4 rounded-3xl border border-line bg-bg-elev p-8"
      onSubmit={async (e) => {
        e.preventDefault();
        setError("");
        setPending(true);
        const form = new FormData(e.currentTarget);
        const body = Object.fromEntries(form.entries());
        const res = await fetch(mode === "login" ? "/api/auth/login" : "/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        const data = await res.json();
        setPending(false);
        if (!res.ok) {
          setError(data.error || "Something went wrong");
          return;
        }
        router.push(next);
        router.refresh();
      }}
    >
      <h1 className="display text-3xl">{mode === "login" ? "Welcome back" : "Create an account"}</h1>
      <p className="text-sm text-muted">Smitvi Media is independent of Smitvi.com.</p>
      {mode === "register" ? (
        <>
          <Field name="name" label="Name" />
          <Field name="username" label="Username" />
        </>
      ) : null}
      <Field name="email" label="Email" type="email" />
      <Field name="password" label="Password" type="password" />
      {error ? <p className="text-sm text-danger">{error}</p> : null}
      <button disabled={pending} className="w-full rounded-full bg-ink py-3 text-sm text-bg disabled:opacity-60">
        {pending ? "Please wait…" : mode === "login" ? "Log in" : "Register"}
      </button>
      {mode === "login" ? (
        <p className="text-sm text-muted">
          <Link href="/reset-password">Forgot password?</Link>
        </p>
      ) : null}
      <p className="text-sm text-muted">
        {mode === "login" ? (
          <>
            New here? <Link href="/register">Register</Link>
          </>
        ) : (
          <>
            Already have an account? <Link href="/login">Log in</Link>
          </>
        )}
      </p>
    </form>
  );
}

function Field({ name, label, type = "text" }: { name: string; label: string; type?: string }) {
  return (
    <label className="block text-sm">
      {label}
      <input
        name={name}
        type={type}
        required
        className="mt-1 w-full rounded-xl border border-line bg-bg px-3 py-2"
        autoComplete={type === "password" ? (name === "password" ? "current-password" : "new-password") : name}
      />
    </label>
  );
}
