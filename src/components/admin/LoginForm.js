"use client";

import { useActionState, useState } from "react";
import { login } from "@/app/admin/actions";
import Icon from "./Icon";
import Link from "next/link";

export default function LoginForm() {
  const [state, formAction, pending] = useActionState(login, null);
  const [show, setShow] = useState(false);

  return (
    <main className="relative grid min-h-dvh place-items-center px-4">
      <div className="dot-grid pointer-events-none absolute inset-0" aria-hidden="true" />
      <form action={formAction} className="relative w-full max-w-sm rounded-2xl border border-line bg-bg p-7 shadow-2xl">
        <div className="mb-6 grid size-11 place-items-center rounded-xl bg-accent-soft text-accent">
          <Icon name="lock" className="size-5" />
        </div>
        <h1 className="text-xl font-semibold tracking-tight">Welcome back</h1>
        <p className="mt-1 text-sm text-muted">Enter your admin password to edit your site.</p>

        <label htmlFor="password" className="mt-6 mb-1.5 block text-[13px] font-medium">
          Password
        </label>
        <div className="relative">
          <input
            id="password"
            name="password"
            type={show ? "text" : "password"}
            autoFocus
            required
            autoComplete="current-password"
            className={`w-full rounded-lg border bg-bg py-2.5 pr-10 pl-3 text-sm outline-none transition focus:border-accent focus:ring-4 focus:ring-accent-soft ${state?.error ? "border-red-500/70" : "border-line"}`}
          />
          <button
            type="button"
            onClick={() => setShow((s) => !s)}
            className="absolute inset-y-0 right-0 grid w-10 place-items-center text-muted hover:text-fg"
            aria-label={show ? "Hide password" : "Show password"}
          >
            <Icon name="eye" className="size-4" />
          </button>
        </div>
        {state?.error && (
          <p className="mt-2 flex items-center gap-1.5 text-xs text-red-500" role="alert">
            <Icon name="alert" className="size-3.5" /> {state.error}
          </p>
        )}

        <button
          type="submit"
          disabled={pending}
          className="mt-6 flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-fg text-sm font-medium text-bg transition hover:opacity-85 disabled:opacity-60"
        >
          {pending ? "Checking…" : "Log in"}
        </button>

        <Link href="/" className="mt-5 block text-center text-xs text-muted hover:text-fg">
          ← Back to the site
        </Link>
      </form>
    </main>
  );
}
