"use client";

import { useEffect, useState } from "react";
import { resumeFileName } from "@/lib/theme";

function DownloadIcon({ className = "size-4" }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 4v12m-5-5 5 5 5-5M4 20h16" />
    </svg>
  );
}

function ExternalIcon({ className = "size-4" }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M14 4h6v6m0-6-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5" />
    </svg>
  );
}

// Full-screen résumé viewer. Opened from anywhere via openResume().
// Desktop: the PDF is embedded. Phones (which often can't embed PDFs):
// a card with Open / Download buttons instead.
export default function ResumeViewer({ url, name }) {
  const [open, setOpen] = useState(false);
  const fileName = resumeFileName(name);

  useEffect(() => {
    const onOpen = () => setOpen(true);
    window.addEventListener("open-resume", onOpen);
    return () => window.removeEventListener("open-resume", onOpen);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && setOpen(false);
    const root = document.documentElement;
    const previous = root.style.overflow;
    root.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      root.style.overflow = previous;
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  if (!open) return null;

  const actions = (
    <>
      <a
        href={url}
        target="_blank"
        rel="noreferrer"
        className="flex h-9 items-center gap-1.5 rounded-md border border-line px-3 text-sm text-muted transition hover:bg-surface hover:text-fg"
      >
        <ExternalIcon className="size-3.5" />
        <span>Open</span>
      </a>
      <a
        href={url}
        download={fileName}
        className="flex h-9 items-center gap-1.5 rounded-md bg-fg px-3 text-sm font-medium text-bg transition hover:opacity-85"
      >
        <DownloadIcon className="size-3.5" />
        <span>Download</span>
      </a>
    </>
  );

  return (
    <div
      className="fixed inset-0 z-[90] flex items-center justify-center bg-black/60 p-3 backdrop-blur-sm sm:p-6"
      onMouseDown={(e) => e.target === e.currentTarget && setOpen(false)}
      role="dialog"
      aria-modal="true"
      aria-label="Résumé"
    >
      <div className="toast-in flex h-full max-h-[94vh] w-full max-w-4xl flex-col overflow-hidden rounded-xl border border-line bg-bg shadow-2xl sm:h-[92vh]">
        {/* Header */}
        <div className="flex items-center gap-3 border-b border-line px-4 py-3">
          <span className="grid h-9 w-7 shrink-0 place-items-center rounded border border-red-500/30 bg-red-500/10 font-mono text-[8px] font-bold text-red-500">
            PDF
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate font-mono text-sm">~/resume.pdf</p>
            <p className="truncate text-xs text-muted">{fileName}</p>
          </div>
          <div className="hidden items-center gap-2 sm:flex">{actions}</div>
          <button
            type="button"
            onClick={() => setOpen(false)}
            autoFocus
            aria-label="Close résumé"
            className="grid size-9 place-items-center rounded-md text-muted transition hover:bg-surface hover:text-fg"
          >
            <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
              <path d="M6 6l12 12M18 6 6 18" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="relative min-h-0 flex-1 bg-surface">
          <object data={`${url}#view=FitH&toolbar=1`} type="application/pdf" className="hidden size-full sm:block" aria-label={`${name} résumé`}>
            <Fallback actions={actions} />
          </object>
          <div className="size-full sm:hidden">
            <Fallback actions={actions} />
          </div>
        </div>
      </div>
    </div>
  );
}

function Fallback({ actions }) {
  return (
    <div className="grid size-full place-items-center p-6 text-center">
      <div>
        <div className="mx-auto grid h-24 w-20 place-items-center rounded-lg border border-line bg-bg shadow-xl">
          <span className="font-mono text-xs font-bold text-red-500">PDF</span>
        </div>
        <p className="mt-5 font-medium">My résumé</p>
        <p className="mx-auto mt-1 max-w-64 text-sm text-muted">Open it in your browser&apos;s PDF viewer, or save a copy.</p>
        <div className="mt-5 flex justify-center gap-2">{actions}</div>
      </div>
    </div>
  );
}
