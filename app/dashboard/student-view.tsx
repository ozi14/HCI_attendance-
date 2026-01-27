"use client";

import { LogOut, QrCode, History, Smartphone } from "lucide-react";
import { signOut } from "next-auth/react";

export default function StudentDashboard({ user }: { user: any }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-2 font-bold text-xl text-blue-600">
          <QrCode className="w-6 h-6" />
          <span>Student Portal</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-600">
            {user.name}
          </span>
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="p-2 text-gray-500 hover:text-red-600 transition-colors"
            title="Sign Out"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </nav>

      <main className="p-6 max-w-lg mx-auto space-y-8">
        <div className="bg-white p-8 rounded-2xl shadow-lg border border-blue-100 text-center space-y-6">
          <div className="mx-auto w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center">
            <QrCode className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Mark Attendance</h2>
            <p className="text-gray-500 mt-2">
              Use your <span className="font-medium">phone camera</span> to scan the QR code displayed in class.
              It will open a link where you can log in / register and then check in.
            </p>
          </div>
          
          <div className="w-full py-4 bg-gray-50 text-gray-700 font-medium rounded-xl border border-gray-200 flex items-center justify-center gap-2">
            <Smartphone className="w-5 h-5 text-blue-600" />
            Scan QR with your phone to check in
          </div>

          <p className="text-xs text-gray-500">
            Location will be verified (within the allowed radius) before you can mark attendance.
          </p>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <History className="w-5 h-5" />
            Recent Activity
          </h3>
          
          {/* Empty State */}
          <div className="bg-white p-6 rounded-xl border border-gray-100 text-center text-gray-500 text-sm">
            No attendance records found yet.
          </div>
        </div>
      </main>
    </div>
  );
}
