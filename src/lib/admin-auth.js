// Server-only helpers for the hidden /admin page.
//
// - ADMIN_PASSWORD set      → login required (use this anywhere online)
// - not set, in development → open, so you can start editing right away
// - not set, in production  → admin is switched off entirely
import { cookies } from "next/headers";
import { createHmac, timingSafeEqual } from "node:crypto";

const COOKIE = "admin_session";
const MAX_AGE = 60 * 60 * 24 * 7; // 7 days

export function adminMode() {
  if (process.env.ADMIN_PASSWORD) return "password";
  if (process.env.NODE_ENV !== "production") return "open-dev";
  return "disabled";
}

function sign(value) {
  return createHmac("sha256", process.env.ADMIN_PASSWORD).update(String(value)).digest("hex");
}

function safeEqual(a, b) {
  const x = Buffer.from(a);
  const y = Buffer.from(b);
  return x.length === y.length && timingSafeEqual(x, y);
}

export function checkPassword(input) {
  if (adminMode() !== "password") return false;
  return safeEqual(sign(`pw:${input}`), sign(`pw:${process.env.ADMIN_PASSWORD}`));
}

export async function isAuthed() {
  const mode = adminMode();
  if (mode === "open-dev") return true;
  if (mode === "disabled") return false;

  const token = (await cookies()).get(COOKIE)?.value;
  const [expires, signature] = token?.split(".") ?? [];
  if (!expires || !signature || Number(expires) < Date.now()) return false;
  return safeEqual(signature, sign(`session:${expires}`));
}

export async function startSession() {
  const expires = Date.now() + MAX_AGE * 1000;
  (await cookies()).set(COOKIE, `${expires}.${sign(`session:${expires}`)}`, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: MAX_AGE,
  });
}

export async function endSession() {
  (await cookies()).delete(COOKIE);
}
