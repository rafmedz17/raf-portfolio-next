"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { DEV_NOTES } from "@/data/devnotes";
import { markNoteRead, readNotes, subscribeNotes } from "@/lib/god";

const TOTAL = Object.keys(DEV_NOTES).length;
// Read-note ids as a string snapshot (safe for server rendering).
const readSnapshot = () => readNotes().join(",");

// A "★ dev note" pin that opens a short behind-the-scenes explanation.
// Only shown in god mode (hidden by CSS otherwise).
export default function DevNote({ id, align = "left", side = "bottom", className = "" }) {
  const note = DEV_NOTES[id];
  const [open, setOpen] = useState(false);
  const read = useSyncExternalStore(subscribeNotes, readSnapshot, () => "");
  const readIds = read ? read.split(",") : [];
  const count = readIds.length;
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return;
    const outside = (e) => !ref.current?.contains(e.target) && setOpen(false);
    const esc = (e) => e.key === "Escape" && setOpen(false);
    document.addEventListener("pointerdown", outside);
    document.addEventListener("keydown", esc);
    return () => {
      document.removeEventListener("pointerdown", outside);
      document.removeEventListener("keydown", esc);
    };
  }, [open]);

  if (!note) return null;
  const isRead = readIds.includes(id);

  return (
    <span ref={ref} className={`dev-note relative inline-block align-middle ${className}`}>
      <button
        type="button"
        onClick={() => {
          setOpen((o) => !o);
          markNoteRead(id);
        }}
        aria-expanded={open}
        className={`inline-flex items-center gap-1 border border-dashed px-2 py-0.5 font-mono text-[10px] tracking-wider uppercase transition-colors ${isRead ? "border-muted text-muted" : "dev-note-new border-accent text-accent"}`}
      >
        ★ dev note
      </button>
      {open && (
        <span
          role="note"
          className={`absolute z-30 block w-72 border border-accent bg-bg p-4 text-left shadow-2xl sm:w-80 ${side === "top" ? "bottom-full mb-2" : "top-full mt-2"} ${align === "right" ? "right-0" : "left-0"}`}
        >
          <span className="block font-mono text-[10px] tracking-widest text-muted uppercase">{"// director's commentary"}</span>
          <span className="mt-2 block text-sm font-semibold text-fg">{note.title}</span>
          <span className="mt-1.5 block text-xs leading-relaxed text-muted">{note.body}</span>
          <span className="mt-3 block font-mono text-[10px] text-accent">
            notes read {count}/{TOTAL}
            {count === TOTAL && " — all unlocked ★"}
          </span>
        </span>
      )}
    </span>
  );
}
