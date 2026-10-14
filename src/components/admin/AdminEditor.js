"use client";

import { useEffect, useMemo, useReducer, useRef, useState, useSyncExternalStore } from "react";
import { logout, saveContent } from "@/app/admin/actions";
import { cleanContent } from "@/lib/content-shape";
import { SECTIONS, sectionForPath, setIn, validate } from "./schema";
import { FieldsBlock, ListBlock, StringsBlock } from "./fields";
import PreviewPane from "./PreviewPane";
import Icon from "./Icon";

const DRAFT_KEY = "admin-draft";
const WELCOME_KEY = "admin-welcome-dismissed";

// ── Undo / redo history ───────────────────────────────────────
// Consecutive edits to the same field count as one undo step until a
// short pause "seals" it.
function historyReducer(state, action) {
  const { past, present, future } = state;
  switch (action.type) {
    case "change": {
      const merge = action.key === state.lastKey;
      return {
        past: merge ? past : [...past.slice(-99), present],
        present: action.value,
        future: [],
        lastKey: action.key,
      };
    }
    case "seal":
      return { ...state, lastKey: null };
    case "replace": // an undoable jump, e.g. restore or discard
      return { past: [...past, present], present: action.value, future: [], lastKey: null };
    case "saved": // server returned the cleaned content; not an edit
      return { ...state, present: action.value, lastKey: null };
    case "undo":
      if (!past.length) return state;
      return { past: past.slice(0, -1), present: past.at(-1), future: [present, ...future], lastKey: null };
    case "redo":
      if (!future.length) return state;
      return { past: [...past, present], present: future[0], future: future.slice(1), lastKey: null };
    default:
      return state;
  }
}

// Reads a localStorage value once per page load (safe during SSR).
const storedOnce = {};
function useStoredOnce(key) {
  return useSyncExternalStore(
    () => () => {},
    () => {
      if (!(key in storedOnce)) {
        try {
          storedOnce[key] = localStorage.getItem(key);
        } catch {
          storedOnce[key] = null;
        }
      }
      return storedOnce[key];
    },
    () => null
  );
}

function store(key, value) {
  try {
    if (value == null) localStorage.removeItem(key);
    else localStorage.setItem(key, value);
  } catch {}
}

// ── Small pieces ──────────────────────────────────────────────

function StatusChip({ saving, dirty }) {
  if (saving) {
    return (
      <span className="flex items-center gap-2 rounded-full bg-surface px-2.5 py-1 text-xs text-muted">
        <span className="size-3 animate-spin rounded-full border-2 border-muted/30 border-t-accent" /> Saving…
      </span>
    );
  }
  return dirty ? (
    <span className="flex items-center gap-2 rounded-full bg-amber-500/10 px-2.5 py-1 text-xs text-amber-500">
      <span className="size-1.5 rounded-full bg-amber-500" /> Unsaved changes
    </span>
  ) : (
    <span className="flex items-center gap-1.5 rounded-full bg-accent-soft px-2.5 py-1 text-xs text-accent">
      <Icon name="check" className="size-3.5" /> All changes saved
    </span>
  );
}

function ToolbarButton({ icon, label, onClick, disabled, showLabel = false }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={label}
      aria-label={label}
      className="flex h-8 items-center gap-1.5 rounded-md px-2 text-sm text-muted transition hover:bg-surface hover:text-fg disabled:pointer-events-none disabled:opacity-35"
    >
      <Icon name={icon} className="size-4" />
      {showLabel && <span className="hidden sm:inline">{label}</span>}
    </button>
  );
}

function Toast({ toast, onClose }) {
  if (!toast) return null;
  const tone =
    toast.type === "error"
      ? "border-red-500/40 text-red-500"
      : "border-accent/40 text-accent";
  return (
    <div className="toast-in fixed bottom-20 left-1/2 z-50 w-[calc(100%-2rem)] max-w-md -translate-x-1/2 lg:bottom-6" role="status">
      <div className={`flex items-start gap-3 rounded-xl border bg-bg px-4 py-3 shadow-2xl ${tone}`}>
        <Icon name={toast.type === "error" ? "alert" : "check"} className="mt-0.5 size-4 shrink-0" />
        <p className="flex-1 text-sm text-fg">{toast.message}</p>
        <button type="button" onClick={onClose} className="text-muted hover:text-fg" aria-label="Dismiss">
          <Icon name="x" className="size-4" />
        </button>
      </div>
    </div>
  );
}

function MoreMenu({ onExport, onImport, onDiscard, canDiscard, passwordProtected }) {
  const [open, setOpen] = useState(false);
  const fileRef = useRef(null);
  const item = "flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-left text-sm hover:bg-surface disabled:opacity-40 disabled:pointer-events-none";

  return (
    <div className="relative">
      <ToolbarButton icon="more" label="More options" onClick={() => setOpen((o) => !o)} />
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 z-50 mt-1 w-60 rounded-xl border border-line bg-bg p-1.5 shadow-2xl">
            <button type="button" className={item} onClick={() => { onExport(); setOpen(false); }}>
              <Icon name="download" /> Download backup
            </button>
            <button type="button" className={item} onClick={() => fileRef.current?.click()}>
              <Icon name="upload" /> Restore from backup…
            </button>
            <button type="button" className={item} disabled={!canDiscard} onClick={() => { onDiscard(); setOpen(false); }}>
              <Icon name="undo" /> Discard unsaved changes
            </button>
            {passwordProtected && (
              <form action={logout} className="mt-1 border-t border-line pt-1">
                <button type="submit" className={`${item} text-red-500`}>
                  <Icon name="logout" /> Log out
                </button>
              </form>
            )}
            <input
              ref={fileRef}
              type="file"
              accept="application/json,.json"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) onImport(file);
                e.target.value = "";
                setOpen(false);
              }}
            />
          </div>
        </>
      )}
    </div>
  );
}

// ── Editor ────────────────────────────────────────────────────

export default function AdminEditor({ initialContent, storage, passwordProtected }) {
  const [history, dispatch] = useReducer(historyReducer, {
    past: [],
    present: initialContent,
    future: [],
    lastKey: null,
  });
  const content = history.present;

  const [savedJson, setSavedJson] = useState(() => JSON.stringify(initialContent));
  const [activeId, setActiveId] = useState(SECTIONS[0].id);
  const [mobileView, setMobileView] = useState("edit");
  const [saving, setSaving] = useState(false);
  const [attempted, setAttempted] = useState(false);
  const [toast, setToast] = useState(null);
  const [restoreDismissed, setRestoreDismissed] = useState(false);
  const [welcomeDismissed, setWelcomeDismissed] = useState(false);
  const scrollRef = useRef(null);

  const storedDraft = useStoredOnce(DRAFT_KEY);
  const welcomeStored = useStoredOnce(WELCOME_KEY);

  const json = useMemo(() => JSON.stringify(content), [content]);
  const dirty = json !== savedJson;
  const section = SECTIONS.find((s) => s.id === activeId);
  const sectionIndex = SECTIONS.indexOf(section);

  // Required-field errors only show after the first save attempt;
  // format errors (bad email/link) show right away.
  const allErrors = useMemo(() => validate(content), [content]);
  const errors = useMemo(
    () => (attempted ? allErrors : Object.fromEntries(Object.entries(allErrors).filter(([, m]) => !m.endsWith("is required.")))),
    [allErrors, attempted]
  );
  const errorCount = (id) => Object.keys(errors).filter((p) => sectionForPath(p)?.id === id).length;

  const showRestore = !restoreDismissed && storedDraft && storedDraft !== savedJson && storedDraft !== json;
  const showWelcome = !welcomeDismissed && !welcomeStored;

  const notify = (type, message) => {
    setToast({ type, message, id: Date.now() });
  };

  useEffect(() => {
    if (!toast) return;
    const id = setTimeout(() => setToast(null), toast.type === "error" ? 7000 : 4500);
    return () => clearTimeout(id);
  }, [toast]);

  // Keep a local copy of unsaved work so a refresh never loses it.
  useEffect(() => {
    const id = setTimeout(() => store(DRAFT_KEY, dirty ? json : null), 400);
    return () => clearTimeout(id);
  }, [json, dirty]);

  // Warn before leaving with unsaved changes.
  useEffect(() => {
    if (!dirty) return;
    const warn = (e) => e.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  const onChange = (path, value) =>
    dispatch({ type: "change", key: path, value: setIn(content, path, value) });

  // A pause in typing closes the current undo step.
  useEffect(() => {
    if (!history.lastKey) return;
    const id = setTimeout(() => dispatch({ type: "seal" }), 1000);
    return () => clearTimeout(id);
  }, [history.present, history.lastKey]);

  const goTo = (id) => {
    setActiveId(id);
    scrollRef.current?.scrollTo({ top: 0 });
  };

  const save = async () => {
    if (saving || !dirty) return;
    const problems = Object.keys(allErrors);
    if (problems.length) {
      setAttempted(true);
      goTo(sectionForPath(problems[0])?.id ?? activeId);
      notify("error", `Please fix ${problems.length} ${problems.length === 1 ? "problem" : "problems"} before saving — they're highlighted in red.`);
      return;
    }
    setSaving(true);
    const result = await saveContent(content);
    setSaving(false);
    if (!result.ok) {
      notify("error", result.error);
      return;
    }
    dispatch({ type: "saved", value: result.content });
    setSavedJson(JSON.stringify(result.content));
    setAttempted(false);
    notify(
      "success",
      result.mode === "github"
        ? "Saved to GitHub! Your live site will update in a minute or two."
        : "Saved! Your site is updated."
    );
  };

  // Keyboard shortcuts: Ctrl/⌘+S saves; Ctrl/⌘+Z undoes outside text fields.
  const saveRef = useRef(save);
  useEffect(() => {
    saveRef.current = save;
  });
  useEffect(() => {
    const onKey = (e) => {
      const mod = e.metaKey || e.ctrlKey;
      if (mod && e.key.toLowerCase() === "s") {
        e.preventDefault();
        saveRef.current();
      }
      const typing = e.target.closest?.("input, textarea");
      if (mod && !typing && e.key.toLowerCase() === "z") {
        e.preventDefault();
        dispatch({ type: e.shiftKey ? "redo" : "undo" });
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const exportBackup = () => {
    const blob = new Blob([JSON.stringify(content, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `portfolio-content-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  const importBackup = async (file) => {
    try {
      const parsed = JSON.parse(await file.text());
      dispatch({ type: "replace", value: cleanContent(parsed) });
      notify("success", "Backup loaded. Check the preview, then Save to keep it.");
    } catch {
      notify("error", "That file isn't a valid backup.");
    }
  };

  const discard = () => {
    dispatch({ type: "replace", value: JSON.parse(savedJson) });
    setAttempted(false);
    notify("success", "Changes discarded. (You can still undo this.)");
  };

  return (
    <div className="flex h-dvh flex-col bg-surface/40">
      {/* ── Top bar ── */}
      <header className="flex h-14 shrink-0 items-center gap-2 border-b border-line bg-bg px-3 sm:gap-3 sm:px-4">
        <a href="/admin" className="font-mono text-sm font-medium">
          <span className="text-accent">~/</span>admin
        </a>
        <span className="hidden sm:block">
          <StatusChip saving={saving} dirty={dirty} />
        </span>

        <div className="flex-1" />

        <ToolbarButton icon="undo" label="Undo" onClick={() => dispatch({ type: "undo" })} disabled={!history.past.length} />
        <ToolbarButton icon="redo" label="Redo" onClick={() => dispatch({ type: "redo" })} disabled={!history.future.length} />
        <MoreMenu
          onExport={exportBackup}
          onImport={importBackup}
          onDiscard={discard}
          canDiscard={dirty}
          passwordProtected={passwordProtected}
        />
        <a
          href="/"
          target="_blank"
          rel="noreferrer"
          className="hidden h-8 items-center gap-1.5 rounded-md px-2 text-sm text-muted transition hover:bg-surface hover:text-fg md:flex"
        >
          View site <Icon name="external" className="size-3.5" />
        </a>
        <button
          type="button"
          onClick={save}
          disabled={!dirty || saving}
          className="flex h-9 items-center gap-2 rounded-lg bg-fg px-3.5 text-sm font-medium text-bg transition hover:opacity-85 disabled:opacity-40"
        >
          {saving ? "Saving…" : "Save"}
          <kbd className="hidden rounded bg-bg/15 px-1 font-mono text-[10px] sm:inline">Ctrl S</kbd>
        </button>
      </header>

      <div className="flex min-h-0 flex-1">
        {/* ── Sidebar ── */}
        <aside className="hidden w-56 shrink-0 flex-col border-r border-line bg-bg md:flex">
          <nav className="flex-1 space-y-0.5 overflow-y-auto p-3">
            <p className="px-2.5 pt-1 pb-2 font-mono text-[11px] text-muted">Sections</p>
            {SECTIONS.map((s) => {
              const count = errorCount(s.id);
              const active = s.id === activeId;
              return (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => goTo(s.id)}
                  className={`flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm transition ${active ? "bg-surface font-medium text-fg" : "text-muted hover:bg-surface/60 hover:text-fg"}`}
                >
                  <Icon name={s.icon} className={`size-4 ${active ? "text-accent" : ""}`} />
                  <span className="flex-1 text-left">{s.label}</span>
                  {count > 0 && <span className="rounded-full bg-red-500 px-1.5 text-[10px] font-semibold text-white">{count}</span>}
                </button>
              );
            })}
          </nav>

          <div className="space-y-2 border-t border-line p-3 text-xs">
            <div className="rounded-lg bg-surface px-3 py-2.5">
              <p className="font-medium">Saves to</p>
              <p className="mt-0.5 font-mono text-[11px] break-all text-muted">{storage.label}</p>
            </div>
            {!passwordProtected && (
              <div className="rounded-lg bg-amber-500/10 px-3 py-2.5 text-amber-500">
                <p className="font-medium">No password set</p>
                <p className="mt-0.5 opacity-80">Fine on your computer. Set ADMIN_PASSWORD before going online — see ADMIN.md.</p>
              </div>
            )}
          </div>
        </aside>

        {/* ── Form ── */}
        <main
          ref={scrollRef}
          className={`min-h-0 flex-1 overflow-y-auto border-r border-line lg:w-[520px] lg:flex-none xl:w-[580px] ${mobileView === "preview" ? "hidden lg:block" : ""}`}
        >
          {/* Section tabs on small screens */}
          <div className="sticky top-0 z-10 flex gap-1 overflow-x-auto border-b border-line bg-bg/95 px-3 py-2 backdrop-blur md:hidden">
            {SECTIONS.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => goTo(s.id)}
                className={`flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-xs ${s.id === activeId ? "bg-fg text-bg" : "bg-surface text-muted"}`}
              >
                {s.label}
                {errorCount(s.id) > 0 && <span className="size-1.5 rounded-full bg-red-500" />}
              </button>
            ))}
          </div>

          <div className="mx-auto max-w-2xl space-y-5 px-4 py-6 pb-28 sm:px-6 lg:pb-10">
            {showRestore && (
              <div className="flex flex-wrap items-center gap-3 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm">
                <Icon name="alert" className="size-4 text-amber-500" />
                <p className="flex-1">You have unsaved changes from last time.</p>
                <button type="button" onClick={() => setRestoreDismissed(true)} className="text-muted hover:text-fg">
                  Ignore
                </button>
                <button
                  type="button"
                  onClick={() => {
                    dispatch({ type: "replace", value: cleanContent(JSON.parse(storedDraft)) });
                    setRestoreDismissed(true);
                  }}
                  className="rounded-md bg-fg px-3 py-1 text-xs font-medium text-bg"
                >
                  Restore them
                </button>
              </div>
            )}

            {showWelcome && (
              <div className="relative overflow-hidden rounded-xl border border-line bg-bg p-5">
                <div className="dot-grid pointer-events-none absolute inset-0 opacity-60" aria-hidden="true" />
                <div className="relative">
                  <p className="flex items-center gap-2 text-sm font-semibold">
                    <Icon name="sparkle" className="size-4 text-accent" /> Welcome to your site editor
                  </p>
                  <ol className="mt-3 space-y-1.5 text-sm text-muted">
                    <li><span className="font-mono text-accent">1.</span> Pick a section on the left.</li>
                    <li><span className="font-mono text-accent">2.</span> Edit the fields — the preview updates as you type.</li>
                    <li><span className="font-mono text-accent">3.</span> Hit <b className="text-fg">Save</b> (or Ctrl+S) when you&apos;re happy.</li>
                  </ol>
                  <p className="mt-3 text-xs text-muted">Made a mistake? Use Undo, or More → Discard unsaved changes.</p>
                  <button
                    type="button"
                    onClick={() => {
                      store(WELCOME_KEY, "1");
                      setWelcomeDismissed(true);
                    }}
                    className="mt-4 rounded-md border border-line px-3 py-1.5 text-xs hover:bg-surface"
                  >
                    Got it
                  </button>
                </div>
              </div>
            )}

            <div className="pt-1">
              <div className="flex items-center gap-3">
                <span className="grid size-9 place-items-center rounded-lg bg-accent-soft text-accent">
                  <Icon name={section.icon} className="size-[18px]" />
                </span>
                <div>
                  <h1 className="text-lg font-semibold tracking-tight">{section.label}</h1>
                  <p className="text-sm text-muted">{section.description}</p>
                </div>
              </div>
            </div>

            {section.blocks.map((block) => {
              const key = `${section.id}-${block.path ?? block.title}`;
              const props = { block, content, onChange, errors };
              if (block.type === "list") return <ListBlock key={key} {...props} />;
              if (block.type === "strings") return <StringsBlock key={key} {...props} />;
              return <FieldsBlock key={key} {...props} />;
            })}

            <div className="flex justify-between pt-2 text-sm">
              {sectionIndex > 0 ? (
                <button type="button" onClick={() => goTo(SECTIONS[sectionIndex - 1].id)} className="text-muted hover:text-fg">
                  ← {SECTIONS[sectionIndex - 1].label}
                </button>
              ) : <span />}
              {sectionIndex < SECTIONS.length - 1 && (
                <button type="button" onClick={() => goTo(SECTIONS[sectionIndex + 1].id)} className="text-muted hover:text-fg">
                  {SECTIONS[sectionIndex + 1].label} →
                </button>
              )}
            </div>
          </div>
        </main>

        {/* ── Preview ── */}
        <section className={`min-h-0 min-w-0 flex-1 flex-col bg-bg ${mobileView === "edit" ? "hidden lg:flex" : "flex"}`} aria-label="Preview">
          <PreviewPane content={content} anchor={section.anchor} />
        </section>
      </div>

      {/* Edit / Preview switch on small screens */}
      <div className="fixed bottom-4 left-1/2 z-30 flex -translate-x-1/2 gap-1 rounded-full border border-line bg-bg/95 p-1 shadow-xl backdrop-blur lg:hidden">
        {[
          ["edit", "edit", "Edit"],
          ["preview", "eye", "Preview"],
        ].map(([id, icon, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => setMobileView(id)}
            className={`flex items-center gap-1.5 rounded-full px-4 py-2 text-sm ${mobileView === id ? "bg-fg text-bg" : "text-muted"}`}
          >
            <Icon name={icon} className="size-4" /> {label}
          </button>
        ))}
      </div>

      <Toast key={toast?.id} toast={toast} onClose={() => setToast(null)} />
    </div>
  );
}
