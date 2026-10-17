"use client";

import { useSyncExternalStore } from "react";
import { isGod, setGod, subscribeGod } from "@/lib/god";

// Blinking "GOD MODE" pill in the nav while the cheat is on. Click to exit.
export default function GodBadge() {
  const god = useSyncExternalStore(subscribeGod, isGod, () => false);
  if (!god) return null;
  return (
    <button
      type="button"
      onClick={() => setGod(false)}
      data-sfx="none"
      title="Exit god mode"
      className="god-badge flex h-8 items-center gap-1.5 rounded-md border border-accent px-2.5 font-mono text-[11px] font-bold tracking-widest text-accent uppercase"
    >
      <span className="god-star">★</span>
      <span className="hidden sm:inline">god mode</span>
      <span className="text-muted">×</span>
    </button>
  );
}
