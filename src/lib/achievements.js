export const ACHIEVEMENTS = [
  { id: "hello", title: "Hello, World", hint: "Run a command in the terminal" },
  { id: "power", title: "Power User", hint: "Open the command menu" },
  { id: "theme", title: "Light Switch", hint: "Change the theme" },
  { id: "filter", title: "Code Reviewer", hint: "Filter projects by tech" },
  { id: "sudo", title: "Root Access", hint: "Find the hidden sudo command" },
  { id: "snake", title: "Snake Charmer", hint: "Score 5+ in terminal snake" },
  { id: "konami", title: "Old School", hint: "↑ ↑ ↓ ↓ ← → ← → B A" },
  { id: "explorer", title: "Explorer", hint: "Scroll to the very bottom" },
  { id: "contact", title: "Ship It", hint: "Push a commit to the inbox" },
];

const KEY = "achievements";
const memory = new Set();

export function getUnlocked() {
  try {
    const saved = JSON.parse(localStorage.getItem(KEY) || "[]");
    saved.forEach((id) => memory.add(id));
  } catch {}
  return [...memory];
}

export function unlock(id) {
  if (getUnlocked().includes(id)) return;
  memory.add(id);
  try {
    localStorage.setItem(KEY, JSON.stringify([...memory]));
  } catch {}
  window.dispatchEvent(new CustomEvent("achievement", { detail: id }));
}

export function subscribeAchievements(callback) {
  window.addEventListener("achievement", callback);
  return () => window.removeEventListener("achievement", callback);
}
