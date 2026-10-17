"use client";

import { openResume } from "@/lib/theme";

// Opens the résumé viewer. Styling comes from the caller.
export default function ResumeButton({ className = "", children }) {
  return (
    <button type="button" onClick={openResume} data-sfx="none" className={className}>
      {children}
    </button>
  );
}
