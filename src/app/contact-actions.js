"use server";

import { headers } from "next/headers";
import { addMessage, allowSubmission, inboxMode } from "@/lib/inbox-store";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Called by the contact form on the public site.
export async function sendMessage(input) {
  const name = String(input?.name ?? "").trim().slice(0, 100);
  const email = String(input?.email ?? "").trim().slice(0, 200);
  const message = String(input?.message ?? "").trim();

  // Honeypot: real people never see or fill this field; bots do.
  if (input?.website) return { ok: true };

  if (!message) return { ok: false, error: "empty commit message." };
  if (message.length > 5000) return { ok: false, error: "message is too long (5000 characters max)." };
  if (!EMAIL.test(email)) return { ok: false, error: "add a valid email so I can reply." };

  if (inboxMode() === "none") {
    return { ok: false, error: "the inbox isn't set up yet.", fallback: true };
  }

  const h = await headers();
  const ip = h.get("x-forwarded-for")?.split(",")[0].trim() || h.get("x-real-ip") || "unknown";
  if (!(await allowSubmission(ip))) {
    return { ok: false, error: "too many messages — please try again in an hour." };
  }

  try {
    await addMessage({ name, email, message });
    return { ok: true };
  } catch {
    return { ok: false, error: "couldn't deliver your message.", fallback: true };
  }
}
