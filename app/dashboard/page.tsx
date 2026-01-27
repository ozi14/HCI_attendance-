import { getServerSession } from "next-auth";
import { authOptions } from "../api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import AdminDashboard from "./admin-view";
import StudentDashboard from "./student-view";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  if (session.user.role === "ADMIN") {
    return <AdminDashboard user={session.user} />;
  }

  return <StudentDashboard user={session.user} />;
}
