// Server-only: stores messages sent from the contact form.
//
// - Upstash Redis env vars set → messages are stored there. Works online.
//   (Vercel's Upstash integration adds KV_REST_API_URL / KV_REST_API_TOKEN.)
// - otherwise, in development  → stored in .data/inbox.json (git-ignored).
// - otherwise, in production   → inbox unavailable.
import fs from "node:fs/promises";
import path from "node:path";
import { createHash, randomUUID } from "node:crypto";

const FILE = path.join(process.cwd(), ".data", "inbox.json");
const HASH = "inbox:messages";
const LIMIT_PER_HOUR = 5;

// Also finds renamed variables (e.g. MESSAGE_KV_REST_API_URL or MESSAGE_REST_API_URL),
// which Vercel creates when a custom prefix is set while connecting the database.
function redisConfig() {
  const exact = ["KV_REST_API_URL", "UPSTASH_REDIS_REST_URL"];
  const prefixed = Object.keys(process.env)
    .filter((k) => /REST(_API)?_URL$/.test(k) && !exact.includes(k))
    .sort((a, b) => a.length - b.length);
  for (const key of [...exact, ...prefixed]) {
    const url = process.env[key]?.trim();
    const token = process.env[key.replace(/URL$/, "TOKEN")]?.trim();
    if (url && token && /upstash\.io/i.test(url)) return { url, token };
  }
  return null;
}

export function inboxMode() {
  if (redisConfig()) return "redis";
  if (process.env.NODE_ENV !== "production") return "file";
  return "none";
}

export function inboxLabel() {
  const mode = inboxMode();
  if (mode === "redis") return "Upstash Redis";
  if (mode === "file") return "Local file · .data/inbox.json";
  return "Not set up";
}

// Runs several Redis commands in one request via Upstash's REST API.
async function redis(...commands) {
  const { url, token } = redisConfig();
  const res = await fetch(`${url}/pipeline`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify(commands),
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`Inbox storage responded ${res.status}.`);
  const results = await res.json();
  const failed = results.find((r) => r.error);
  if (failed) throw new Error(failed.error);
  return results.map((r) => r.result);
}

async function readFile() {
  try {
    return JSON.parse(await fs.readFile(FILE, "utf8"));
  } catch (err) {
    if (err.code === "ENOENT") return [];
    throw err;
  }
}

async function writeFile(messages) {
  await fs.mkdir(path.dirname(FILE), { recursive: true });
  await fs.writeFile(FILE, JSON.stringify(messages, null, 2), "utf8");
}

const newestFirst = (a, b) => b.createdAt.localeCompare(a.createdAt);

export async function listMessages() {
  const mode = inboxMode();
  let messages = [];
  if (mode === "redis") {
    const [flat] = await redis(["HGETALL", HASH]);
    for (let i = 1; i < (flat?.length ?? 0); i += 2) messages.push(JSON.parse(flat[i]));
  } else if (mode === "file") {
    messages = await readFile();
  }
  return messages.sort(newestFirst);
}

export async function addMessage({ name, email, message }) {
  const entry = {
    id: randomUUID(),
    name,
    email,
    message,
    createdAt: new Date().toISOString(),
    read: false,
  };
  const mode = inboxMode();
  if (mode === "redis") {
    await redis(["HSET", HASH, entry.id, JSON.stringify(entry)]);
  } else if (mode === "file") {
    await writeFile([...(await readFile()), entry]);
  } else {
    throw new Error("Inbox storage isn't set up.");
  }
  return entry;
}

export async function setMessageRead(id, read) {
  if (inboxMode() === "redis") {
    const [raw] = await redis(["HGET", HASH, id]);
    if (raw) await redis(["HSET", HASH, id, JSON.stringify({ ...JSON.parse(raw), read })]);
  } else if (inboxMode() === "file") {
    await writeFile((await readFile()).map((m) => (m.id === id ? { ...m, read } : m)));
  }
}

export async function deleteMessage(id) {
  if (inboxMode() === "redis") await redis(["HDEL", HASH, id]);
  else if (inboxMode() === "file") await writeFile((await readFile()).filter((m) => m.id !== id));
}

// Basic spam protection: a few messages per visitor per hour.
// The IP is hashed so it's never stored as-is.
const memoryHits = new Map();

export async function allowSubmission(ip) {
  const key = createHash("sha256").update(`inbox:${ip}`).digest("hex").slice(0, 32);
  if (inboxMode() === "redis") {
    const [count] = await redis(["INCR", `inbox:rl:${key}`], ["EXPIRE", `inbox:rl:${key}`, 3600, "NX"]);
    return count <= LIMIT_PER_HOUR;
  }
  const now = Date.now();
  const hit = memoryHits.get(key);
  if (!hit || hit.reset < now) {
    memoryHits.set(key, { count: 1, reset: now + 3600_000 });
    return true;
  }
  hit.count++;
  return hit.count <= LIMIT_PER_HOUR;
}
