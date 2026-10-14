import { redirect } from "next/navigation";
import { connection } from "next/server";
import { adminMode, isAuthed } from "@/lib/admin-auth";
import LoginForm from "@/components/admin/LoginForm";
import AdminNotice from "@/components/admin/AdminNotice";

export const metadata = { title: "Admin login" };

export default async function LoginPage() {
  await connection();
  const mode = adminMode();

  if (mode === "disabled") {
    return (
      <AdminNotice title="Admin is turned off">
        Set an <code>ADMIN_PASSWORD</code> environment variable to enable it.
      </AdminNotice>
    );
  }
  if (mode === "open-dev" || (await isAuthed())) redirect("/admin");

  return <LoginForm />;
}
