"use client";

import { useState } from "react";
import { sendMessage } from "@/app/contact-actions";
import { unlock } from "@/lib/achievements";
import { prefersReducedMotion } from "@/lib/theme";
import * as sound from "@/lib/sound";

const PUSH_LOG = [
  "Enumerating objects: 3, done.",
  "Compressing objects: 100% (3/3), done.",
  "Writing objects: 100% (3/3), 1.21 KiB | 1.21 MiB/s, done.",
];

const wait = (ms) => new Promise((r) => setTimeout(r, ms));
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function GitLine({ command, children }) {
  return (
    <label className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
      <span className="shrink-0 text-muted">
        <span className="text-accent">$</span> {command}
      </span>
      {children}
    </label>
  );
}

// A "git commit + push" styled contact form. Messages land in the admin inbox.
export default function CommitForm({ email, name }) {
  const [form, setForm] = useState({ name: "", email: "", message: "", website: "" });
  const [log, setLog] = useState([]);
  const [shake, setShake] = useState(false);
  const [pushing, setPushing] = useState(false);
  const [fallback, setFallback] = useState(false);

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const fail = (message) => {
    setShake(true);
    setLog((l) => [...l, `error: ${message}`]);
    sound.error();
    setTimeout(() => setShake(false), 400);
  };

  const push = async (e) => {
    e.preventDefault();
    if (pushing) return;
    setFallback(false);
    setLog([]);
    if (!form.message.trim()) return fail("empty commit message — aborting commit.");
    if (!EMAIL.test(form.email.trim())) return fail("add your email so I can reply.");

    setPushing(true);
    const delay = prefersReducedMotion() ? 0 : 260;
    const request = sendMessage(form);
    for (const line of PUSH_LOG) {
      setLog((l) => [...l, line]);
      sound.tick();
      await wait(delay);
    }
    const result = await request;

    if (result.ok) {
      setLog((l) => [...l, `To ${name.toLowerCase() || "me"}:inbox`, " * [new branch]      your-idea -> inbox", "✓ Delivered. I'll get back to you soon!"]);
      setForm({ name: "", email: "", message: "", website: "" });
      unlock("contact");
      sound.success();
    } else {
      fail(`failed to push — ${result.error}`);
      setFallback(Boolean(result.fallback));
    }
    setPushing(false);
  };

  const field = "min-w-0 flex-1 bg-transparent text-fg outline-none placeholder:text-muted/50";

  return (
    <form
      onSubmit={push}
      onKeyDown={sound.keySound}
      className={`overflow-hidden rounded-xl border border-line bg-surface font-mono text-[13px] ${shake ? "shake" : ""}`}
    >
      <div className="flex items-center justify-between border-b border-line px-4 py-2.5 text-xs text-muted">
        <span>~/inbox (main)</span>
        <span className="hidden sm:inline">⌘/Ctrl + Enter to push</span>
      </div>

      <div className="space-y-3 p-4">
        <GitLine command="git config user.name">
          <input value={form.name} onChange={set("name")} placeholder='"Your name"' autoComplete="name" maxLength={100} className={field} />
        </GitLine>
        <GitLine command="git config user.email">
          <input type="email" value={form.email} onChange={set("email")} placeholder='"you@example.com"' autoComplete="email" maxLength={200} required className={field} />
        </GitLine>

        <label className="block pt-1">
          <span className="text-muted">
            <span className="text-accent">$</span> git commit -m &quot;
          </span>
          <textarea
            value={form.message}
            onChange={set("message")}
            onKeyDown={(e) => {
              if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) push(e);
            }}
            rows={4}
            maxLength={5000}
            placeholder="Hey, I've got a project / role you might like…"
            className="mt-2 block w-full resize-none bg-transparent leading-relaxed text-fg outline-none placeholder:text-muted/50"
          />
          <span className="text-muted">&quot;</span>
        </label>

        {/* Honeypot: hidden from people, irresistible to bots. */}
        <input
          type="text"
          name="website"
          value={form.website}
          onChange={set("website")}
          tabIndex={-1}
          autoComplete="off"
          aria-hidden="true"
          className="absolute -left-[9999px] h-px w-px opacity-0"
        />
      </div>

      {log.length > 0 && (
        <div className="space-y-0.5 border-t border-line px-4 py-3 text-xs text-muted" aria-live="polite">
          {log.map((line, i) => (
            <p key={i} className={line.startsWith("✓") ? "text-accent" : line.startsWith("error") ? "text-hash" : ""}>
              {line}
            </p>
          ))}
          {fallback && (
            <p className="pt-1">
              hint: email me directly at{" "}
              <a href={`mailto:${email}?body=${encodeURIComponent(form.message)}`} className="text-fg underline underline-offset-4">
                {email}
              </a>
            </p>
          )}
        </div>
      )}

      <div className="flex justify-end border-t border-line p-3">
        <button
          type="submit"
          disabled={pushing}
          className="inline-flex h-9 items-center gap-2 rounded-md bg-fg px-4 text-xs font-medium text-bg transition-opacity hover:opacity-85 disabled:opacity-50"
        >
          {pushing ? "pushing…" : "git push origin inbox"}
          <span aria-hidden="true">→</span>
        </button>
      </div>
    </form>
  );
}
