"use client";

import { openCommandMenu } from "@/lib/theme";

export default function CommandButton() {
  return (
    <button
      type="button"
      onClick={openCommandMenu}
      aria-label="Open command menu"
      className="flex h-8 items-center gap-2 rounded-md border border-line px-2.5 font-mono text-xs text-muted transition-colors hover:border-muted/40 hover:text-fg"
    >
      <svg viewBox="0 0 24 24" className="size-3.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
        <circle cx="11" cy="11" r="7" />
        <path d="m20 20-3.5-3.5" />
      </svg>
      <kbd className="hidden font-mono sm:inline">Ctrl K</kbd>
    </button>
  );
}
