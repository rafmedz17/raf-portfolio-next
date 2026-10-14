"use client";

import { useSyncExternalStore } from "react";

function subscribe(callback) {
  const id = setInterval(callback, 30_000);
  return () => clearInterval(id);
}

function formatTime(timeZone) {
  try {
    return new Intl.DateTimeFormat("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
      timeZone: timeZone || undefined,
    }).format(new Date());
  } catch {
    return "--:--"; // invalid time zone (e.g. half-typed in the admin)
  }
}

export default function LocalTime({ timeZone }) {
  const time = useSyncExternalStore(subscribe, () => formatTime(timeZone), () => "--:--");
  return <span>{time}</span>;
}
