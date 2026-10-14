"use client";

import { useState } from "react";

export default function CopyEmail({ email }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(email);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {}
  };

  return (
    <button
      type="button"
      onClick={copy}
      className="inline-flex h-11 items-center gap-2 rounded-md border border-line px-4 font-mono text-xs text-muted transition-colors hover:bg-surface hover:text-fg"
    >
      {copied ? (
        <>
          <span className="text-accent">✓</span> copied
        </>
      ) : (
        "copy email"
      )}
    </button>
  );
}
