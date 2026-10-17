"use client";

import { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import { getMessages, logout, markMessageRead, removeMessage } from "@/app/admin/actions";
import AdminTabs from "./AdminTabs";
import Icon from "./Icon";

const POLL_MS = 30_000;

// Current time rounded to the minute, so "5m ago" labels stay fresh.
function subscribeMinute(callback) {
  const id = setInterval(callback, 30_000);
  return () => clearInterval(id);
}
const useNowMinute = () =>
  useSyncExternalStore(subscribeMinute, () => Math.floor(Date.now() / 60_000), () => null);

function timeAgo(iso, nowMinute) {
  const date = new Date(iso);
  if (nowMinute == null) return date.toLocaleDateString();
  const minutes = nowMinute - Math.floor(date.getTime() / 60_000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  if (minutes < 60 * 24) return `${Math.floor(minutes / 60)}h ago`;
  if (minutes < 60 * 24 * 7) return `${Math.floor(minutes / 1440)}d ago`;
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

const fullDate = (iso) =>
  new Date(iso).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });

function initials(name, email) {
  const source = name?.trim() || email || "?";
  return source
    .split(/[\s@._-]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join("");
}

function Avatar({ message, size = "size-9" }) {
  return (
    <span className={`grid ${size} shrink-0 place-items-center rounded-full bg-accent-soft font-mono text-xs font-semibold text-accent`}>
      {initials(message.name, message.email)}
    </span>
  );
}

function replyLink(m) {
  const quoted = m.message.split("\n").map((l) => `> ${l}`).join("\n");
  const body = `\n\n—\nOn ${fullDate(m.createdAt)}, ${m.name || m.email} wrote:\n${quoted}`;
  return `mailto:${m.email}?subject=${encodeURIComponent("Re: your message")}&body=${encodeURIComponent(body)}`;
}

function ActionButton({ icon, label, onClick, danger, href }) {
  const className = `flex h-8 items-center gap-1.5 rounded-md border border-line px-2.5 text-xs transition hover:bg-surface ${danger ? "text-red-500 hover:border-red-500/40" : "text-muted hover:text-fg"}`;
  const content = (
    <>
      <Icon name={icon} className="size-3.5" />
      <span className="hidden sm:inline">{label}</span>
    </>
  );
  return href ? (
    <a href={href} className={className} title={label}>
      {content}
    </a>
  ) : (
    <button type="button" onClick={onClick} className={className} title={label}>
      {content}
    </button>
  );
}

export default function InboxView({ initialMessages, loadError, storage, passwordProtected }) {
  const [messages, setMessages] = useState(initialMessages);
  const [selectedId, setSelectedId] = useState(null);
  const [filter, setFilter] = useState("all");
  const [query, setQuery] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(loadError);
  const [copied, setCopied] = useState(false);
  const nowMinute = useNowMinute();

  const unread = messages.filter((m) => !m.read).length;
  const selected = messages.find((m) => m.id === selectedId) ?? null;

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return messages.filter(
      (m) =>
        (filter === "all" || !m.read) &&
        (!q || [m.name, m.email, m.message].some((v) => v?.toLowerCase().includes(q)))
    );
  }, [messages, filter, query]);

  const refresh = async () => {
    setRefreshing(true);
    const result = await getMessages();
    setRefreshing(false);
    if (result.ok) {
      setMessages(result.messages);
      setError(null);
    } else {
      setError(result.error);
    }
  };

  // Check for new messages every 30 seconds while the tab is open.
  useEffect(() => {
    const id = setInterval(async () => {
      if (document.hidden) return;
      const result = await getMessages();
      if (result.ok) setMessages(result.messages);
    }, POLL_MS);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    document.title = unread ? `(${unread}) Inbox` : "Inbox";
  }, [unread]);

  const patch = (id, changes) =>
    setMessages((list) => list.map((m) => (m.id === id ? { ...m, ...changes } : m)));

  const setRead = async (id, read) => {
    patch(id, { read });
    const result = await markMessageRead(id, read);
    if (!result.ok) {
      patch(id, { read: !read });
      setError(result.error);
    }
  };

  const open = (m) => {
    setSelectedId(m.id);
    setConfirmDelete(false);
    setCopied(false);
    if (!m.read) setRead(m.id, true);
  };

  const remove = async (m) => {
    const index = messages.findIndex((x) => x.id === m.id);
    setMessages((list) => list.filter((x) => x.id !== m.id));
    setSelectedId(null);
    setConfirmDelete(false);
    const result = await removeMessage(m.id);
    if (!result.ok) {
      setMessages((list) => [...list.slice(0, index), m, ...list.slice(index)]);
      setError(result.error);
    }
  };

  const copyEmail = async (email) => {
    try {
      await navigator.clipboard.writeText(email);
      setCopied(true);
    } catch {}
  };

  return (
    <div className="flex h-dvh flex-col bg-surface/40">
      {/* ── Top bar ── */}
      <header className="flex h-14 shrink-0 items-center gap-2 border-b border-line bg-bg px-3 sm:gap-3 sm:px-4">
        <a href="/admin" className="hidden font-mono text-sm font-medium sm:block">
          <span className="text-accent">~/</span>admin
        </a>
        <AdminTabs unread={unread} />
        <div className="flex-1" />
        <button
          type="button"
          onClick={refresh}
          disabled={refreshing}
          title="Check for new messages"
          className="flex h-8 items-center gap-1.5 rounded-md px-2 text-sm text-muted transition hover:bg-surface hover:text-fg"
        >
          <Icon name="refresh" className={`size-4 ${refreshing ? "animate-spin" : ""}`} />
          <span className="hidden sm:inline">Refresh</span>
        </button>
        <a
          href="/"
          target="_blank"
          rel="noreferrer"
          className="hidden h-8 items-center gap-1.5 rounded-md px-2 text-sm text-muted transition hover:bg-surface hover:text-fg md:flex"
        >
          View site <Icon name="external" className="size-3.5" />
        </a>
        {passwordProtected && (
          <form action={logout}>
            <button type="submit" title="Log out" className="grid size-8 place-items-center rounded-md text-muted hover:bg-surface hover:text-red-500">
              <Icon name="logout" className="size-4" />
            </button>
          </form>
        )}
      </header>

      {storage.mode === "none" && (
        <div className="flex items-start gap-2 border-b border-amber-500/30 bg-amber-500/10 px-4 py-2.5 text-sm text-amber-500">
          <Icon name="alert" className="mt-0.5 size-4 shrink-0" />
          <p>
            The inbox isn&apos;t set up on this server yet, so the contact form can&apos;t receive messages. See
            <b> ADMIN.md → Inbox</b> to connect a free Upstash Redis database.
          </p>
        </div>
      )}
      {error && (
        <div className="flex items-center gap-2 border-b border-red-500/30 bg-red-500/10 px-4 py-2.5 text-sm text-red-500">
          <Icon name="alert" className="size-4 shrink-0" />
          <p className="flex-1">{error}</p>
          <button type="button" onClick={() => setError(null)} aria-label="Dismiss">
            <Icon name="x" className="size-4" />
          </button>
        </div>
      )}

      <div className="flex min-h-0 flex-1">
        {/* ── Message list ── */}
        <aside className={`min-h-0 w-full flex-col border-r border-line bg-bg md:flex md:w-[360px] md:shrink-0 lg:w-[400px] ${selected ? "hidden" : "flex"}`}>
          <div className="space-y-3 border-b border-line p-4">
            <div className="flex items-baseline justify-between">
              <h1 className="text-lg font-semibold tracking-tight">Inbox</h1>
              <p className="font-mono text-xs text-muted">
                {messages.length} total · <span className={unread ? "text-accent" : ""}>{unread} unread</span>
              </p>
            </div>
            <div className="relative">
              <svg viewBox="0 0 24 24" className="pointer-events-none absolute top-1/2 left-3 size-3.5 -translate-y-1/2 text-muted" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                <circle cx="11" cy="11" r="7" />
                <path d="m20 20-3.5-3.5" />
              </svg>
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search messages…"
                className="h-9 w-full rounded-lg border border-line bg-bg pr-3 pl-8 text-sm outline-none transition placeholder:text-muted/60 focus:border-accent focus:ring-4 focus:ring-accent-soft"
              />
            </div>
            <div className="flex gap-1 rounded-lg bg-surface p-0.5 text-xs" role="radiogroup" aria-label="Filter">
              {[
                ["all", "All"],
                ["unread", `Unread${unread ? ` (${unread})` : ""}`],
              ].map(([id, label]) => (
                <button
                  key={id}
                  type="button"
                  role="radio"
                  aria-checked={filter === id}
                  onClick={() => setFilter(id)}
                  className={`flex-1 rounded-md py-1.5 transition ${filter === id ? "bg-bg font-medium text-fg shadow-sm" : "text-muted hover:text-fg"}`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <ul className="min-h-0 flex-1 divide-y divide-line overflow-y-auto">
            {visible.length === 0 && (
              <li className="px-6 py-16 text-center">
                <div className="mx-auto mb-4 grid size-12 place-items-center rounded-xl bg-surface text-muted">
                  <Icon name="mail" className="size-5" />
                </div>
                <p className="text-sm font-medium">
                  {messages.length === 0 ? "No messages yet" : query ? "No matches" : "You're all caught up"}
                </p>
                <p className="mx-auto mt-1 max-w-60 text-xs text-muted">
                  {messages.length === 0
                    ? "When someone pushes a commit from your contact form, it shows up here."
                    : query
                      ? "Try a different search."
                      : "No unread messages."}
                </p>
              </li>
            )}
            {visible.map((m) => (
              <li key={m.id}>
                <button
                  type="button"
                  onClick={() => open(m)}
                  className={`relative flex w-full gap-3 px-4 py-3.5 text-left transition ${m.id === selectedId ? "bg-surface" : "hover:bg-surface/60"}`}
                >
                  {!m.read && <span className="absolute top-1/2 left-1.5 size-1.5 -translate-y-1/2 rounded-full bg-accent" aria-label="Unread" />}
                  <Avatar message={m} />
                  <span className="min-w-0 flex-1">
                    <span className="flex items-baseline justify-between gap-2">
                      <span className={`truncate text-sm ${m.read ? "text-fg/80" : "font-semibold"}`}>{m.name || m.email}</span>
                      <span className="shrink-0 font-mono text-[11px] text-muted">{timeAgo(m.createdAt, nowMinute)}</span>
                    </span>
                    {m.name && <span className="block truncate text-xs text-muted">{m.email}</span>}
                    <span className={`mt-1 line-clamp-2 text-xs leading-relaxed ${m.read ? "text-muted" : "text-fg/80"}`}>{m.message}</span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </aside>

        {/* ── Message detail ── */}
        <main className={`min-h-0 min-w-0 flex-1 overflow-y-auto ${selected ? "block" : "hidden md:block"}`}>
          {!selected ? (
            <div className="grid h-full place-items-center p-8 text-center">
              <div>
                <div className="mx-auto mb-4 grid size-14 place-items-center rounded-2xl border border-line bg-bg text-muted">
                  <Icon name="mail" className="size-6" />
                </div>
                <p className="font-medium">Select a message to read it</p>
                <p className="mt-1 text-sm text-muted">
                  Messages are stored in <span className="font-mono text-xs">{storage.label}</span>
                </p>
              </div>
            </div>
          ) : (
            <article className="mx-auto max-w-3xl p-4 sm:p-8">
              <button
                type="button"
                onClick={() => setSelectedId(null)}
                className="mb-4 flex items-center gap-1 text-sm text-muted hover:text-fg md:hidden"
              >
                ← Back to inbox
              </button>

              <div className="flex flex-wrap items-start gap-4">
                <Avatar message={selected} size="size-12" />
                <div className="min-w-0 flex-1">
                  <h2 className="truncate text-xl font-semibold tracking-tight">{selected.name || "Someone"}</h2>
                  <button
                    type="button"
                    onClick={() => copyEmail(selected.email)}
                    className="flex items-center gap-1.5 text-sm text-muted hover:text-fg"
                    title="Copy email address"
                  >
                    {selected.email}
                    <Icon name={copied ? "check" : "copy"} className={`size-3.5 ${copied ? "text-accent" : ""}`} />
                  </button>
                  <p className="mt-0.5 text-xs text-muted">{fullDate(selected.createdAt)}</p>
                </div>
              </div>

              <div className="mt-5 flex flex-wrap gap-2">
                <a
                  href={replyLink(selected)}
                  className="flex h-8 items-center gap-1.5 rounded-md bg-fg px-3 text-xs font-medium text-bg transition hover:opacity-85"
                >
                  <Icon name="mail" className="size-3.5" /> Reply by email
                </a>
                <ActionButton
                  icon={selected.read ? "eye" : "check"}
                  label={selected.read ? "Mark as unread" : "Mark as read"}
                  onClick={() => setRead(selected.id, !selected.read)}
                />
                <ActionButton icon="trash" label="Delete" danger onClick={() => setConfirmDelete(true)} />
              </div>

              {confirmDelete && (
                <div className="mt-4 flex flex-wrap items-center gap-3 rounded-lg bg-red-500/10 px-4 py-3 text-sm">
                  <p className="flex-1 text-red-500">Delete this message for good? This can&apos;t be undone.</p>
                  <button type="button" onClick={() => setConfirmDelete(false)} className="text-muted hover:text-fg">
                    Cancel
                  </button>
                  <button type="button" onClick={() => remove(selected)} className="rounded-md bg-red-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-red-600">
                    Delete
                  </button>
                </div>
              )}

              {/* The message, styled as a git commit */}
              <div className="mt-6 overflow-hidden rounded-xl border border-line bg-bg font-mono text-[13px]">
                <div className="space-y-0.5 border-b border-line px-5 py-4 text-xs">
                  <p className="text-hash">commit {selected.id.replace(/-/g, "").slice(0, 12)}</p>
                  <p className="text-muted">
                    Author: <span className="text-fg">{selected.name || "anonymous"}</span> &lt;{selected.email}&gt;
                  </p>
                  <p className="text-muted">Date:   {fullDate(selected.createdAt)}</p>
                </div>
                <p className="px-5 py-5 font-sans text-[15px] leading-relaxed break-words whitespace-pre-wrap">{selected.message}</p>
              </div>
            </article>
          )}
        </main>
      </div>
    </div>
  );
}
