import { unlock } from "./achievements";

// Dark unless the visitor switched to light.
export function currentTheme() {
  return document.documentElement.dataset.theme || "dark";
}

export function toggleTheme() {
  const next = currentTheme() === "dark" ? "light" : "dark";
  document.documentElement.dataset.theme = next;
  try {
    localStorage.setItem("theme", next);
  } catch {}
  unlock("theme");
  return next;
}

// Cross-component signals, kept as window events so server components
// can stay server components.
export const emit = (name, detail) =>
  window.dispatchEvent(new CustomEvent(name, { detail }));

export const openCommandMenu = () => emit("open-command-menu");
export const openAchievements = () => emit("open-achievements");
export const playSnake = () => emit("play-snake");
export const filterTech = (tech) => emit("filter-tech", tech);
export const openResume = () => emit("open-resume");
export const focusContact = () => emit("focus-contact");

// "Rafael Vincent D. Medina" → "Rafael_Vincent_D_Medina_Resume.pdf"
export const resumeFileName = (name) =>
  `${(name || "My").trim().replace(/[^A-Za-z0-9]+/g, "_").replace(/^_|_$/g, "")}_Resume.pdf`;

export function cssVar(name) {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}

export function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}
