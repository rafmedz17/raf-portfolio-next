"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { adminMode, checkPassword, endSession, isAuthed, startSession } from "@/lib/admin-auth";
import { cleanContent, storageMode, writeContent } from "@/lib/content-store";
import { deleteMessage, listMessages, setMessageRead } from "@/lib/inbox-store";

export async function login(_prevState, formData) {
  if (adminMode() === "disabled") {
    return { error: "Admin is turned off. Set ADMIN_PASSWORD on the server first." };
  }
  // Small delay makes password guessing slower.
  await new Promise((r) => setTimeout(r, 400));
  if (!checkPassword(formData.get("password") ?? "")) {
    return { error: "That password isn't right. Try again." };
  }
  await startSession();
  redirect("/admin");
}

export async function logout() {
  await endSession();
  redirect("/admin/login");
}

// ── Inbox ─────────────────────────────────────────────────────

export async function getMessages() {
  if (!(await isAuthed())) return { ok: false, error: "Your session expired. Log in again." };
  try {
    return { ok: true, messages: await listMessages() };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}

export async function markMessageRead(id, read) {
  if (!(await isAuthed())) return { ok: false, error: "Your session expired. Log in again." };
  try {
    await setMessageRead(String(id), Boolean(read));
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}

export async function removeMessage(id) {
  if (!(await isAuthed())) return { ok: false, error: "Your session expired. Log in again." };
  try {
    await deleteMessage(String(id));
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}

// ── Content ───────────────────────────────────────────────────

export async function saveContent(content) {
  if (!(await isAuthed())) {
    return { ok: false, error: "Your session expired. Log in again to save." };
  }
  try {
    const cleaned = cleanContent(content);
    await writeContent(cleaned);
    revalidatePath("/");
    return { ok: true, mode: storageMode(), content: cleaned };
  } catch (err) {
    return { ok: false, error: err.message || "Something went wrong while saving." };
  }
}
