"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Loader2, MapPin, XCircle } from "lucide-react";
import Link from "next/link";

export default function AttendancePage({ params }: { params: { token: string } }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);

  useEffect(() => {
    // If not authenticated, redirect to login with callback URL
    if (status === "unauthenticated") {
      router.push(`/login?callbackUrl=/attendance/${params.token}`);
    }
  }, [status, params.token, router]);

  const getLocation = () => {
    setLoading(true);
    if (!navigator.geolocation) {
      setMessage({ type: 'error', text: 'Geolocation is not supported by your browser' });
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude
        });
        submitAttendance(position.coords.latitude, position.coords.longitude);
      },
      (error) => {
        console.error(error);
        setMessage({ type: 'error', text: 'Unable to retrieve your location. Please allow location access.' });
        setLoading(false);
      },
      { enableHighAccuracy: true }
    );
  };

  const submitAttendance = async (lat: number, lng: number) => {
    try {
      const res = await fetch("/api/attendance/mark", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          qrToken: params.token,
          latitude: lat,
          longitude: lng,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage({ type: 'success', text: 'Attendance marked successfully!' });
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to mark attendance' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'An unexpected error occurred' });
    } finally {
      setLoading(false);
    }
  };

  if (status === "loading") {
    return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin w-8 h-8 text-blue-600" /></div>;
  }

  if (!session) return null; // Will redirect

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">Mark Attendance</h1>
        
        {!message && !loading && (
          <div className="space-y-4">
            <p className="text-gray-600">
              Please confirm your location to mark your attendance for this class.
            </p>
            <button
              onClick={getLocation}
              className="w-full py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
            >
              <MapPin className="w-5 h-5" />
              I am here
            </button>
          </div>
        )}

        {loading && (
          <div className="py-8 flex flex-col items-center gap-3">
            <Loader2 className="animate-spin w-8 h-8 text-blue-600" />
            <p className="text-sm text-gray-500">Verifying location...</p>
          </div>
        )}

        {message && (
          <div className={`p-6 rounded-lg ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
            {message.type === 'success' ? (
              <CheckCircle2 className="w-12 h-12 mx-auto mb-2" />
            ) : (
              <XCircle className="w-12 h-12 mx-auto mb-2" />
            )}
            <p className="font-medium text-lg">{message.text}</p>
          </div>
        )}

        <Link href="/dashboard" className="block text-sm text-blue-600 hover:underline mt-4">
          Return to Dashboard
        </Link>
      </div>
    </div>
  );
}
