"use client";

import { useEffect, useSyncExternalStore } from "react";
import { isSoundOn, setSound, soundOnChime, subscribeSound, unlockAudio } from "@/lib/sound";

export default function SoundToggle() {
  const on = useSyncExternalStore(subscribeSound, isSoundOn, () => true);

  // Browsers keep audio locked until a click or key press; unlock on the first one.
  useEffect(() => {
    const unlock = () => isSoundOn() && unlockAudio();
    window.addEventListener("pointerdown", unlock, true);
    window.addEventListener("keydown", unlock, true);
    return () => {
      window.removeEventListener("pointerdown", unlock, true);
      window.removeEventListener("keydown", unlock, true);
    };
  }, []);

  return (
    <button
      type="button"
      onClick={() => {
        setSound(!on);
        if (!on) setTimeout(soundOnChime, 60);
      }}
      aria-label={on ? "Turn sound off" : "Turn sound on"}
      aria-pressed={on}
      title={on ? "Sound on" : "Sound off"}
      className={`grid size-8 place-items-center rounded-md transition-colors hover:bg-surface ${on ? "text-accent" : "text-muted hover:text-fg"}`}
    >
      <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M4 9v6h4l5 4V5L8 9H4Z" />
        {on ? <path d="M16.5 8.5a5 5 0 0 1 0 7M19 6a8.5 8.5 0 0 1 0 12" /> : <path d="m17 9 5 5m0-5-5 5" />}
      </svg>
    </button>
  );
}
