"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { adminMode, checkPassword, endSession, isAuthed, startSession } from "@/lib/admin-auth";
import { cleanContent, storageMode, writeContent, writeUpload } from "@/lib/content-store";
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

// ── Images ────────────────────────────────────────────────────

const MAX_UPLOAD = 1.5 * 1024 * 1024;

// Detects the real image type from the file's first bytes.
function imageType(bytes) {
  if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return "jpg";
  if (bytes.subarray(0, 4).toString("hex") === "89504e47") return "png";
  if (bytes.subarray(0, 4).toString() === "RIFF" && bytes.subarray(8, 12).toString() === "WEBP") return "webp";
  return null;
}

const IMAGE_KINDS = ["photo", "project"];

// Takes a data URL (the admin resizes images in the browser first).
// `kind` names the file: "photo" (profile) or "project" (screenshot).
export async function uploadImage(dataUrl, kind = "photo") {
  if (!(await isAuthed())) return { ok: false, error: "Your session expired. Log in again." };
  const match = /^data:image\/[a-z+]+;base64,(.+)$/.exec(String(dataUrl ?? ""));
  if (!match) return { ok: false, error: "That file isn't an image." };

  const bytes = Buffer.from(match[1], "base64");
  if (bytes.length > MAX_UPLOAD) return { ok: false, error: "That image is too large (1.5 MB max)." };
  const ext = imageType(bytes);
  if (!ext) return { ok: false, error: "Please use a JPG, PNG or WebP image." };

  try {
    const prefix = IMAGE_KINDS.includes(kind) ? kind : "photo";
    return { ok: true, url: await writeUpload(bytes, ext, prefix), mode: storageMode() };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}

const MAX_PDF = 4 * 1024 * 1024;

// Takes a PDF as a data URL (used for the résumé).
export async function uploadDocument(dataUrl) {
  if (!(await isAuthed())) return { ok: false, error: "Your session expired. Log in again." };
  const match = /^data:application\/pdf;base64,(.+)$/.exec(String(dataUrl ?? ""));
  if (!match) return { ok: false, error: "Please choose a PDF file." };

  const bytes = Buffer.from(match[1], "base64");
  if (bytes.length > MAX_PDF) return { ok: false, error: "That PDF is too large (4 MB max)." };
  if (bytes.subarray(0, 5).toString() !== "%PDF-") return { ok: false, error: "That file isn't a valid PDF." };

  try {
    return { ok: true, url: await writeUpload(bytes, "pdf", "resume"), mode: storageMode() };
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
