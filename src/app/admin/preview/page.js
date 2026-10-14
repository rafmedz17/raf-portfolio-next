import { notFound } from "next/navigation";
import { connection } from "next/server";
import { isAuthed } from "@/lib/admin-auth";
import { readContent } from "@/lib/content-store";
import PreviewClient from "@/components/admin/PreviewClient";

export const metadata = { title: "Preview" };

// Rendered inside the editor's iframe. Starts with saved content, then
// switches to the editor's live draft as soon as it arrives.
export default async function PreviewPage() {
  await connection();
  if (!(await isAuthed())) notFound();
  return <PreviewClient initialContent={await readContent()} />;
}
