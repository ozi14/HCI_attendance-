"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Loader2, Users, UserCheck, UserX, ExternalLink } from "lucide-react";

type AttendanceResponse = {
  session: {
    id: string;
    name: string;
    createdAt: string;
    isActive: boolean;
    qrToken: string;
  };
  totals: { students: number; present: number; missing: number };
  present: Array<{
    id: string;
    name: string;
    email: string;
    studentId: string | null;
    timestamp: string | null;
    status: string | null;
  }>;
  missing: Array<{
    id: string;
    name: string;
    email: string;
    studentId: string | null;
  }>;
};

function StatCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
}) {
  return (
    <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm text-gray-500">{label}</div>
          <div className="text-2xl font-bold text-gray-900">{value}</div>
        </div>
        <div className="text-gray-400">{icon}</div>
      </div>
    </div>
  );
}

export function ClientAttendance({ id }: { id: string }) {
  const [data, setData] = useState<AttendanceResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    async function run() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/admin/sessions/${id}/attendance`, {
          cache: "no-store",
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json?.error || "Failed to load attendance");
        if (mounted) setData(json);
      } catch (e: any) {
        if (mounted) setError(e?.message || "Failed to load attendance");
      } finally {
        if (mounted) setLoading(false);
      }
    }
    run();
    return () => {
      mounted = false;
    };
  }, [id]);

  const attendanceUrl = useMemo(() => {
    if (!data?.session?.qrToken) return null;
    if (typeof window === "undefined") return null;
    return `${window.location.origin}/attendance/${data.session.qrToken}`;
  }, [data?.session?.qrToken]);

  if (loading) {
    return (
      <div className="bg-white border border-gray-100 rounded-xl p-10 shadow-sm flex items-center justify-center gap-3 text-gray-600">
        <Loader2 className="w-5 h-5 animate-spin" />
        Loading attendance…
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="bg-white border border-red-100 rounded-xl p-10 shadow-sm">
        <div className="text-red-700 font-medium">Failed to load</div>
        <div className="text-sm text-red-600 mt-1">{error ?? "Unknown error"}</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white border border-gray-100 rounded-xl p-6 shadow-sm space-y-2">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="text-xl font-bold text-gray-900">{data.session.name}</div>
            <div className="text-sm text-gray-500">
              Created {new Date(data.session.createdAt).toLocaleString()} •{" "}
              {data.session.isActive ? "Active" : "Closed"}
            </div>
          </div>

          {attendanceUrl && (
            <Link
              href={attendanceUrl}
              target="_blank"
              className="text-sm font-medium text-blue-600 hover:underline inline-flex items-center gap-1"
            >
              Open QR Link <ExternalLink className="w-4 h-4" />
            </Link>
          )}
        </div>
      </div>

      <div className="grid sm:grid-cols-3 gap-4">
        <StatCard
          label="Total Students"
          value={data.totals.students}
          icon={<Users className="w-6 h-6" />}
        />
        <StatCard
          label="Present"
          value={data.totals.present}
          icon={<UserCheck className="w-6 h-6" />}
        />
        <StatCard
          label="Missing"
          value={data.totals.missing}
          icon={<UserX className="w-6 h-6" />}
        />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <div className="font-semibold text-gray-900">Present</div>
            <div className="text-sm text-gray-500">Students who checked in.</div>
          </div>
          <div className="divide-y divide-gray-100">
            {data.present.length === 0 ? (
              <div className="p-6 text-sm text-gray-500">No one has checked in yet.</div>
            ) : (
              data.present.map((s) => (
                <div key={s.id} className="p-4 flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <div className="font-medium text-gray-900 truncate">{s.name}</div>
                    <div className="text-xs text-gray-500 truncate">
                      {s.email} {s.studentId ? `• ${s.studentId}` : ""}
                    </div>
                  </div>
                  <div className="text-xs text-gray-500 whitespace-nowrap">
                    {s.timestamp ? new Date(s.timestamp).toLocaleTimeString() : "—"}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <div className="font-semibold text-gray-900">Missing</div>
            <div className="text-sm text-gray-500">Registered students without a record.</div>
          </div>
          <div className="divide-y divide-gray-100">
            {data.missing.length === 0 ? (
              <div className="p-6 text-sm text-gray-500">Everyone is present.</div>
            ) : (
              data.missing.map((s) => (
                <div key={s.id} className="p-4 flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <div className="font-medium text-gray-900 truncate">{s.name}</div>
                    <div className="text-xs text-gray-500 truncate">
                      {s.email} {s.studentId ? `• ${s.studentId}` : ""}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

