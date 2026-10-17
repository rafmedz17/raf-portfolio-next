// Server-only: reads and writes the site content (src/data/content.json).
//
// - GITHUB_TOKEN + GITHUB_REPO set → saves commit the file to GitHub, and your
//   host (e.g. Vercel) redeploys the site automatically. Works online.
// - otherwise, in development      → saves write the file on your computer.
// - otherwise, in production       → saving is unavailable (read-only).
import fs from "node:fs/promises";
import path from "node:path";
import bundled from "@/data/content.json";
export { cleanContent } from "./content-shape";

const FILE = "src/data/content.json";

export function storageMode() {
  if (process.env.GITHUB_TOKEN && process.env.GITHUB_REPO) return "github";
  if (process.env.NODE_ENV !== "production") return "file";
  return "none";
}

export function storageLabel() {
  const mode = storageMode();
  if (mode === "github") return `GitHub · ${process.env.GITHUB_REPO}@${githubBranch()}`;
  if (mode === "file") return `Local file · ${FILE}`;
  return "Read-only (saving not set up)";
}

const githubBranch = () => process.env.GITHUB_BRANCH || "master";

async function github(init = {}, filePath = FILE) {
  const url = `https://api.github.com/repos/${process.env.GITHUB_REPO}/contents/${filePath}`;
  const res = await fetch(init.method ? url : `${url}?ref=${githubBranch()}`, {
    ...init,
    cache: "no-store",
    headers: {
      Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
      ...(init.body ? { "Content-Type": "application/json" } : {}),
    },
  });
  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(`GitHub responded ${res.status}. ${detail.slice(0, 200)}`);
  }
  return res.json();
}

export async function readContent() {
  const mode = storageMode();
  if (mode === "github") {
    const file = await github();
    return JSON.parse(Buffer.from(file.content, "base64").toString("utf8"));
  }
  if (mode === "file") {
    return JSON.parse(await fs.readFile(path.join(process.cwd(), FILE), "utf8"));
  }
  return bundled;
}

export async function writeContent(content) {
  const body = JSON.stringify(content, null, 2) + "\n";
  const mode = storageMode();

  if (mode === "github") {
    const { sha } = await github();
    await github({
      method: "PUT",
      body: JSON.stringify({
        message: "Update site content from admin",
        content: Buffer.from(body, "utf8").toString("base64"),
        sha,
        branch: githubBranch(),
      }),
    });
    return;
  }
  if (mode === "file") {
    await fs.writeFile(path.join(process.cwd(), FILE), body, "utf8");
    return;
  }
  throw new Error("Saving isn't set up on this server. See ADMIN.md to connect GitHub.");
}

// Saves an uploaded file under public/uploads and returns its public URL.
// `bytes` is a Buffer; `ext` is e.g. "jpg" or "pdf"; `prefix` names the file.
export async function writeUpload(bytes, ext, prefix = "photo") {
  const name = `${prefix}-${Date.now()}.${ext}`;
  const repoPath = `public/uploads/${name}`;
  const mode = storageMode();

  if (mode === "github") {
    await github(
      {
        method: "PUT",
        body: JSON.stringify({
          message: `Upload ${name} from admin`,
          content: bytes.toString("base64"),
          branch: githubBranch(),
        }),
      },
      repoPath
    );
  } else if (mode === "file") {
    const dir = path.join(process.cwd(), "public", "uploads");
    await fs.mkdir(dir, { recursive: true });
    await fs.writeFile(path.join(dir, name), bytes);
  } else {
    throw new Error("Uploading isn't set up on this server. See ADMIN.md to connect GitHub.");
  }
  return `/uploads/${name}`;
}
