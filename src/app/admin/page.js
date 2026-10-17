import { redirect } from "next/navigation";
import { connection } from "next/server";
import { adminMode, isAuthed } from "@/lib/admin-auth";
import { readContent, storageLabel, storageMode } from "@/lib/content-store";
import { listMessages } from "@/lib/inbox-store";
import AdminEditor from "@/components/admin/AdminEditor";
import AdminNotice from "@/components/admin/AdminNotice";

export default async function AdminPage() {
  await connection();

  if (adminMode() === "disabled") {
    return (
      <AdminNotice title="Admin is turned off">
        Set an <code>ADMIN_PASSWORD</code> environment variable on your host to enable the
        editor. See <code>ADMIN.md</code> in the project for a step-by-step guide.
      </AdminNotice>
    );
  }
  if (!(await isAuthed())) redirect("/admin/login");

  let content;
  try {
    content = await readContent();
  } catch (err) {
    return (
      <AdminNotice title="Couldn't load your content">
        {err.message}
      </AdminNotice>
    );
  }

  const unread = await listMessages()
    .then((messages) => messages.filter((m) => !m.read).length)
    .catch(() => 0);

  return (
    <AdminEditor
      initialContent={content}
      storage={{ mode: storageMode(), label: storageLabel() }}
      passwordProtected={adminMode() === "password"}
      unread={unread}
    />
  );
}
