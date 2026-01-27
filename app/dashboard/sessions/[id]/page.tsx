import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ClientAttendance } from "./client-attendance";

export default async function SessionDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");
  if (session.user.role !== "ADMIN") redirect("/dashboard");

  const { id } = await params;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Session Details</h1>
            <p className="text-sm text-gray-500">View present vs missing students.</p>
          </div>
          <Link
            href="/dashboard"
            className="text-sm font-medium text-blue-600 hover:underline"
          >
            ← Back to Dashboard
          </Link>
        </div>

        <ClientAttendance id={id} />
      </div>
    </div>
  );
}

