"use client";

import { useState, useEffect } from "react";
import { LogOut, Plus, QrCode, Users, Calendar, MapPin, X, Trash2, Copy, Check } from "lucide-react";
import { signOut } from "next-auth/react";
import { QRCodeSVG } from "qrcode.react";
import Link from "next/link";

type Session = {
  id: string;
  name: string;
  createdAt: string;
  isActive: boolean;
  qrToken: string;
  _count: { records: number };
};

export default function AdminDashboard({ user }: { user: any }) {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [createdSession, setCreatedSession] = useState<Session | null>(null);
  const [copyOk, setCopyOk] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    latitude: "",
    longitude: "",
    radius: "30", // Default 30 meters
  });
  const appBaseUrl = process.env.NEXT_PUBLIC_APP_URL || "";

  const getBaseUrl = () => {
    const raw =
      appBaseUrl || (typeof window !== "undefined" ? window.location.origin : "");
    if (!raw) return "";
    return raw.endsWith("/") ? raw.slice(0, -1) : raw;
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    try {
      const res = await fetch("/api/admin/sessions");
      const data = await res.json();
      if (res.ok) {
        setSessions(data.sessions);
      }
    } catch (error) {
      console.error("Failed to fetch sessions", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSession = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/admin/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        alert(data?.error || "Failed to create session");
        return;
      }

      setCreatedSession(data.session);
      setCopyOk(false);
      fetchSessions();
    } catch (error) {
      console.error("Failed to create session", error);
    }
  };

  const handleDeleteSession = async (id: string) => {
    if (!confirm("Are you sure you want to delete this session? This will remove all attendance records associated with it.")) return;

    try {
      const res = await fetch(`/api/admin/sessions/${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setSessions(sessions.filter((s) => s.id !== id));
      } else {
        alert("Failed to delete session");
      }
    } catch (error) {
      console.error("Error deleting session:", error);
    }
  };

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        setFormData((prev) => ({
          ...prev,
          latitude: position.coords.latitude.toString(),
          longitude: position.coords.longitude.toString(),
        }));
      });
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setCreatedSession(null);
    setCopyOk(false);
    setFormData({ name: "", latitude: "", longitude: "", radius: "30" });
  };

  const createdAttendanceUrl = createdSession
    ? `${getBaseUrl()}/attendance/${createdSession.qrToken}`
    : "";

  const copyLink = async () => {
    if (!createdAttendanceUrl) return;
    try {
      await navigator.clipboard.writeText(createdAttendanceUrl);
      setCopyOk(true);
      window.setTimeout(() => setCopyOk(false), 1500);
    } catch {
      // fallback
      prompt("Copy this link:", createdAttendanceUrl);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm px-6 py-4 flex justify-between items-center sticky top-0 z-10">
        <div className="flex items-center gap-2 font-bold text-xl text-blue-600">
          <QrCode className="w-6 h-6" />
          <span>Admin Dashboard</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-600">
            Welcome, {user.name}
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

      <main className="p-6 max-w-7xl mx-auto space-y-6">
        <header className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Class Sessions</h1>
          <button 
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            New Session
          </button>
        </header>

        {loading ? (
          <div className="text-center py-12">Loading...</div>
        ) : sessions.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
            <div className="inline-flex p-4 bg-gray-100 rounded-full mb-4">
              <QrCode className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900">No Active Sessions</h3>
            <p className="text-gray-500 mt-2">Create a new session to start tracking attendance.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sessions.map((session) => (
              <div key={session.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-bold text-lg text-gray-900">{session.name}</h3>
                    <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(session.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <span className={`px-2 py-1 text-xs rounded-full ${session.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                    {session.isActive ? 'Active' : 'Closed'}
                  </span>
                </div>
                
                <div className="flex justify-center py-6 bg-gray-50 rounded-lg mb-4">
                  <QRCodeSVG 
                    value={`${getBaseUrl()}/attendance/${session.qrToken}`} 
                    size={150} 
                  />
                </div>
                
                <div className="flex justify-between items-center text-sm text-gray-600">
                  <span className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    {session._count.records} Attendees
                  </span>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => handleDeleteSession(session.id)}
                      className="text-red-500 hover:text-red-700 p-1 hover:bg-red-50 rounded"
                      title="Delete Session"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <Link
                      href={`/dashboard/sessions/${session.id}`}
                      className="text-blue-600 hover:underline"
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Create Session Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-5">
              <h2 className="text-xl font-bold text-black">
                {createdSession ? "Session Created" : "New Session"}
              </h2>
              <button onClick={closeModal} className="text-black hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            {createdSession ? (
              <div className="space-y-5">
                <div>
                  <p className="font-semibold text-black text-lg">{createdSession.name}</p>
                  <p className="text-black text-sm mt-1">
                    Display this QR code in class for students to scan.
                  </p>
                </div>

                <div className="flex justify-center py-8 bg-white rounded-xl border-2 border-gray-200">
                  <QRCodeSVG value={createdAttendanceUrl} size={200} />
                </div>

                <div className="flex items-center gap-2">
                  <input
                    readOnly
                    value={createdAttendanceUrl}
                    className="flex-1 px-3 py-2.5 border-2 border-gray-200 rounded-lg text-sm text-black bg-gray-50 font-mono"
                  />
                  <button
                    type="button"
                    onClick={copyLink}
                    className="px-4 py-2.5 bg-black text-white rounded-lg hover:bg-gray-800 text-sm font-medium inline-flex items-center gap-2"
                  >
                    {copyOk ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    {copyOk ? "Copied" : "Copy"}
                  </button>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setCreatedSession(null);
                      setCopyOk(false);
                      setFormData({ name: "", latitude: "", longitude: "", radius: "30" });
                    }}
                    className="flex-1 py-2.5 border-2 border-gray-200 text-black font-medium rounded-lg hover:bg-gray-50"
                  >
                    Create Another
                  </button>
                  <button
                    type="button"
                    onClick={closeModal}
                    className="flex-1 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700"
                  >
                    Done
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleCreateSession} className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-black mb-1.5">Session Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Week 1: Introduction"
                    className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-lg text-black placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-black mb-1.5">Class Location</label>
                  <button
                    type="button"
                    onClick={getCurrentLocation}
                    className="w-full py-3 text-sm font-medium text-white bg-black rounded-lg hover:bg-gray-800 flex items-center justify-center gap-2"
                  >
                    <MapPin className="w-4 h-4" />
                    {formData.latitude ? "Location Set ✓" : "Get Current Location"}
                  </button>
                  {formData.latitude && (
                    <p className="text-xs text-black mt-2 font-mono bg-gray-100 px-2 py-1 rounded">
                      {formData.latitude}, {formData.longitude}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-black mb-1.5">
                    Check-in Radius: <span className="font-bold">{formData.radius}m</span>
                  </label>
                  <input
                    type="range"
                    min="10"
                    max="100"
                    step="5"
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                    value={formData.radius}
                    onChange={(e) => setFormData({...formData, radius: e.target.value})}
                  />
                  <div className="flex justify-between text-xs text-black mt-1">
                    <span>10m</span>
                    <span>100m</span>
                  </div>
                </div>

                <div className="flex gap-3 pt-3">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="flex-1 py-2.5 border-2 border-gray-200 text-black font-medium rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={!formData.latitude || !formData.name}
                    className="flex-1 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Create Session
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
