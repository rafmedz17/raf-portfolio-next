import { redirect } from "next/navigation";
import { connection } from "next/server";
import { adminMode, isAuthed } from "@/lib/admin-auth";
import { inboxLabel, inboxMode, listMessages } from "@/lib/inbox-store";
import InboxView from "@/components/admin/InboxView";
import AdminNotice from "@/components/admin/AdminNotice";

export const metadata = { title: "Inbox" };

export default async function InboxPage() {
  await connection();

  if (adminMode() === "disabled") {
    return (
      <AdminNotice title="Admin is turned off">
        Set an <code>ADMIN_PASSWORD</code> environment variable to enable it.
      </AdminNotice>
    );
  }
  if (!(await isAuthed())) redirect("/admin/login");

  let messages = [];
  let loadError = null;
  try {
    messages = await listMessages();
  } catch (err) {
    loadError = err.message;
  }

  return (
    <InboxView
      initialMessages={messages}
      loadError={loadError}
      storage={{ mode: inboxMode(), label: inboxLabel() }}
      passwordProtected={adminMode() === "password"}
    />
  );
}
