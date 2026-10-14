"use client";

import { useSyncExternalStore } from "react";

function subscribe(callback) {
  const id = setInterval(callback, 30_000);
  return () => clearInterval(id);
}

export default function LocalTime({ timeZone }) {
  const time = useSyncExternalStore(
    subscribe,
    () =>
      new Intl.DateTimeFormat("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
        timeZone,
      }).format(new Date()),
    () => "--:--"
  );

  return <span>{time}</span>;
}
