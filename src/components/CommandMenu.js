"use client";

import { useEffect, useMemo, useState } from "react";
import { navLinks } from "@/data/nav";
import { openAchievements, playSnake, toggleTheme } from "@/lib/theme";
import { unlock } from "@/lib/achievements";

function buildActions(profile, socials) {
  return [
    ...navLinks.map((l) => ({
      group: "Navigate",
      label: `Go to ${l.label}`,
      run: () => document.querySelector(l.href)?.scrollIntoView({ behavior: "smooth" }),
    })),
    { group: "Navigate", label: "Back to top", run: () => window.scrollTo({ top: 0, behavior: "smooth" }) },
    { group: "Actions", label: "Copy email address", hint: profile.email, run: () => navigator.clipboard?.writeText(profile.email) },
    { group: "Actions", label: "Send an email", run: () => (window.location.href = `mailto:${profile.email}`) },
    { group: "Actions", label: "Toggle theme", run: toggleTheme },
    {
      group: "Fun",
      label: "Play snake",
      hint: "in the terminal",
      run: () => {
        window.scrollTo({ top: 0, behavior: "smooth" });
        playSnake();
      },
    },
    { group: "Fun", label: "View achievements", run: openAchievements },
    { group: "Fun", label: "Replay intro", run: () => window.dispatchEvent(new Event("intro:replay")) },
    ...socials.map((s) => ({
      group: "Links",
      label: `Open ${s.label}`,
      run: () => window.open(s.href, "_blank", "noopener"),
    })),
  ];
}

export default function CommandMenu({ profile, socials }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const actions = useMemo(() => buildActions(profile, socials), [profile, socials]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    return q ? actions.filter((a) => a.label.toLowerCase().includes(q)) : actions;
  }, [actions, query]);

  useEffect(() => {
    const reset = () => {
      setQuery("");
      setActive(0);
      unlock("power");
    };
    const onKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        reset();
        setOpen((o) => !o);
      }
    };
    const onOpen = () => {
      reset();
      setOpen(true);
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("open-command-menu", onOpen);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("open-command-menu", onOpen);
    };
  }, []);

  if (!open) return null;

  const execute = (action) => {
    setOpen(false);
    action?.run();
  };

  const onKeyDown = (e) => {
    if (e.key === "Escape") setOpen(false);
    else if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((i) => (i + 1) % Math.max(results.length, 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((i) => (i - 1 + results.length) % Math.max(results.length, 1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      execute(results[active]);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 px-4 pt-[15vh] backdrop-blur-sm"
      onMouseDown={(e) => e.target === e.currentTarget && setOpen(false)}
      role="dialog"
      aria-modal="true"
      aria-label="Command menu"
    >
      <div className="w-full max-w-lg overflow-hidden rounded-xl border border-line bg-bg shadow-2xl">
        <div className="flex items-center gap-3 border-b border-line px-4">
          <span className="font-mono text-sm text-accent">&gt;</span>
          <input
            autoFocus
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setActive(0);
            }}
            onKeyDown={onKeyDown}
            placeholder="Type a command or search…"
            className="h-12 flex-1 bg-transparent text-sm outline-none placeholder:text-muted"
          />
          <kbd className="rounded border border-line px-1.5 font-mono text-[10px] text-muted">ESC</kbd>
        </div>

        <ul className="max-h-80 overflow-y-auto p-2" role="listbox">
          {results.length === 0 && (
            <li className="px-3 py-6 text-center text-sm text-muted">No results. Try “email”.</li>
          )}
          {results.map((action, i) => {
            const showGroup = action.group !== results[i - 1]?.group;
            return (
              <li key={`${action.group}-${i}`}>
                {showGroup && (
                  <p className="px-3 pt-3 pb-1 font-mono text-[11px] text-muted">{action.group}</p>
                )}
                <button
                  type="button"
                  role="option"
                  aria-selected={i === active}
                  onMouseMove={() => setActive(i)}
                  onClick={() => execute(action)}
                  className={`flex w-full items-center justify-between rounded-md px-3 py-2 text-left text-sm ${
                    i === active ? "bg-surface text-fg" : "text-muted"
                  }`}
                >
                  {action.label}
                  {action.hint && <span className="font-mono text-xs text-muted">{action.hint}</span>}
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
