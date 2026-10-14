"use client";

import { useSyncExternalStore } from "react";
import { ACHIEVEMENTS, getUnlocked, subscribeAchievements } from "@/lib/achievements";
import { openAchievements } from "@/lib/theme";

export default function AchievementCounter() {
  const count = useSyncExternalStore(subscribeAchievements, () => getUnlocked().length, () => 0);

  return (
    <button
      type="button"
      onClick={openAchievements}
      className="inline-flex items-center gap-1.5 rounded border border-line px-2 py-1 transition-colors hover:border-accent hover:text-accent"
    >
      🏆 {count}/{ACHIEVEMENTS.length}
    </button>
  );
}
