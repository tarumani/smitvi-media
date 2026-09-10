"use client";

import { useState } from "react";

export function ResetPasswordForm() {
  const [sent, setSent] = useState(false);
  const [token, setToken] = useState("");
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <h1 className="display text-3xl">Reset password</h1>
      <p className="mt-2 text-sm text-muted">
        Request a reset token, then choose a new password. Email delivery can be connected later.
      </p>
      {!sent ? (
        <form
          className="mt-6 space-y-3"
          onSubmit={async (e) => {
            e.preventDefault();
            const email = new FormData(e.currentTarget).get("email");
            const res = await fetch("/api/auth/reset-password", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ email, step: "request" }),
            });
            const data = await res.json();
            if (data.token) setToken(data.token);
            setSent(true);
          }}
        >
          <input name="email" type="email" required placeholder="Email" className="w-full rounded-xl border border-line bg-bg-elev px-3 py-2" />
          <button className="rounded-full bg-ink px-5 py-2 text-sm text-bg">Send reset</button>
        </form>
      ) : !done ? (
        <form
          className="mt-6 space-y-3"
          onSubmit={async (e) => {
            e.preventDefault();
            const fd = new FormData(e.currentTarget);
            const res = await fetch("/api/auth/reset-password", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                step: "confirm",
                token: fd.get("token"),
                password: fd.get("password"),
              }),
            });
            if (!res.ok) {
              setError("Invalid or expired token");
              return;
            }
            setDone(true);
          }}
        >
          <input name="token" defaultValue={token} placeholder="Token" className="w-full rounded-xl border border-line bg-bg-elev px-3 py-2" />
          <input name="password" type="password" minLength={8} required placeholder="New password" className="w-full rounded-xl border border-line bg-bg-elev px-3 py-2" />
          {error ? <p className="text-sm text-danger">{error}</p> : null}
          <button className="rounded-full bg-ink px-5 py-2 text-sm text-bg">Update password</button>
        </form>
      ) : (
        <p className="mt-6">Password updated. You can log in.</p>
      )}
    </div>
  );
}
