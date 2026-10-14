"use client";

import { useState } from "react";
import { unlock } from "@/lib/achievements";
import { prefersReducedMotion } from "@/lib/theme";

const PUSH_LOG = [
  "Enumerating objects: 3, done.",
  "Compressing objects: 100% (3/3), done.",
  "Writing objects: 100% (3/3), 1.21 KiB | 1.21 MiB/s, done.",
];

// A "git commit + push" styled message box that opens a prefilled email.
export default function CommitForm({ email, name }) {
  const [message, setMessage] = useState("");
  const [log, setLog] = useState([]);
  const [shake, setShake] = useState(false);
  const [pushing, setPushing] = useState(false);

  const push = (e) => {
    e.preventDefault();
    if (!message.trim()) {
      setShake(true);
      setLog(["error: empty commit message — aborting commit."]);
      setTimeout(() => setShake(false), 400);
      return;
    }
    setPushing(true);
    const lines = [...PUSH_LOG, `To mailto:${email}`, " * [new branch]      your-idea -> inbox", "✓ Opening your mail client…"];
    const delay = prefersReducedMotion() ? 0 : 280;
    setLog([]);
    lines.forEach((line, i) => setTimeout(() => setLog((l) => [...l, line]), i * delay));
    setTimeout(() => {
      unlock("contact");
      const subject = encodeURIComponent(`Hello ${name} — from your portfolio`);
      window.location.href = `mailto:${email}?subject=${subject}&body=${encodeURIComponent(message)}`;
      setPushing(false);
    }, lines.length * delay + 200);
  };

  return (
    <form
      onSubmit={push}
      className={`overflow-hidden rounded-xl border border-line bg-surface font-mono text-[13px] ${shake ? "shake" : ""}`}
    >
      <div className="flex items-center justify-between border-b border-line px-4 py-2.5 text-xs text-muted">
        <span>~/inbox (main)</span>
        <span className="hidden sm:inline">⌘/Ctrl + Enter to push</span>
      </div>
      <label className="block p-4">
        <span className="text-muted">
          <span className="text-accent">$</span> git commit -m &quot;
        </span>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) push(e);
          }}
          rows={3}
          placeholder="Hey, I've got a project / role you might like…"
          className="mt-2 block w-full resize-none bg-transparent leading-relaxed text-fg outline-none placeholder:text-muted/60"
        />
        <span className="text-muted">&quot;</span>
      </label>

      {log.length > 0 && (
        <div className="space-y-0.5 border-t border-line px-4 py-3 text-xs text-muted" aria-live="polite">
          {log.map((line, i) => (
            <p key={i} className={line.startsWith("✓") ? "text-accent" : line.startsWith("error") ? "text-hash" : ""}>
              {line}
            </p>
          ))}
        </div>
      )}

      <div className="flex justify-end border-t border-line p-3">
        <button
          type="submit"
          disabled={pushing}
          className="inline-flex h-9 items-center gap-2 rounded-md bg-fg px-4 text-xs font-medium text-bg transition-opacity hover:opacity-85 disabled:opacity-50"
        >
          git push origin inbox
          <span aria-hidden="true">→</span>
        </button>
      </div>
    </form>
  );
}
