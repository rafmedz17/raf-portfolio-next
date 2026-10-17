// God mode: the Konami-code cheat. Lasts for the current visit (tab).
// While on, <html data-god> switches the site to a retro CRT look, 8-bit
// sounds, director's-commentary notes and an invincible Snake.
import { unlock } from "./achievements";
import { DEV_NOTES } from "@/data/devnotes";

const KEY = "god";
const NOTES_KEY = "god-notes";

export function isGod() {
  try {
    return sessionStorage.getItem(KEY) === "1";
  } catch {
    return false;
  }
}

export function setGod(on) {
  try {
    if (on) sessionStorage.setItem(KEY, "1");
    else sessionStorage.removeItem(KEY);
  } catch {}
  window.dispatchEvent(new CustomEvent("godchange", { detail: on }));
  return on;
}

export const toggleGod = () => setGod(!isGod());

export function subscribeGod(callback) {
  window.addEventListener("godchange", callback);
  return () => window.removeEventListener("godchange", callback);
}

// ── Director's commentary progress ────────────────────────────

export function readNotes() {
  try {
    return JSON.parse(sessionStorage.getItem(NOTES_KEY) || "[]");
  } catch {
    return [];
  }
}

export function markNoteRead(id) {
  const read = new Set(readNotes());
  read.add(id);
  try {
    sessionStorage.setItem(NOTES_KEY, JSON.stringify([...read]));
  } catch {}
  window.dispatchEvent(new Event("notesread"));
  if (Object.keys(DEV_NOTES).every((noteId) => read.has(noteId))) unlock("god");
  return read.size;
}

export function subscribeNotes(callback) {
  window.addEventListener("notesread", callback);
  return () => window.removeEventListener("notesread", callback);
}
