import Link from "next/link";
import { ArrowRight, CheckCircle2, QrCode, MapPin } from "lucide-react";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-gray-50 text-gray-900">
      {/* Navbar */}
      <header className="px-6 py-4 flex items-center justify-between bg-white shadow-sm">
        <div className="flex items-center gap-2 font-bold text-xl text-blue-600">
          <QrCode className="w-6 h-6" />
          <span>AttendanceApp</span>
        </div>
        <div className="flex gap-4">
          <Link
            href="/login"
            className="text-sm font-medium hover:text-blue-600 transition-colors"
          >
            Login
          </Link>
          <Link
            href="/register"
            className="text-sm font-medium bg-blue-600 text-white px-4 py-2 rounded-full hover:bg-blue-700 transition-colors"
          >
            Get Started
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center text-center px-4 py-20">
        <div className="max-w-3xl space-y-6">
          <h1 className="text-5xl font-extrabold tracking-tight sm:text-6xl text-gray-900">
            Attendance Tracking <br />
            <span className="text-blue-600">Made Simple</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Secure, location-based attendance verification for classes. 
            Students scan a QR code, we verify the location, and you're done.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
            <Link
              href="/login"
              className="px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-lg hover:bg-blue-700 hover:shadow-xl transition-all flex items-center justify-center gap-2"
            >
              Log In
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/register"
              className="px-8 py-3 bg-white text-gray-700 border border-gray-200 font-semibold rounded-lg shadow-sm hover:bg-gray-50 hover:border-gray-300 transition-all"
            >
              Student Registration
            </Link>
          </div>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-8 mt-24 max-w-5xl w-full px-4 text-left">
          <FeatureCard 
            icon={<QrCode className="w-8 h-8 text-blue-500" />}
            title="QR Scanning"
            description="Quickly scan the dynamic QR code displayed in class to mark your presence."
          />
          <FeatureCard 
            icon={<MapPin className="w-8 h-8 text-green-500" />}
            title="Location Verified"
            description="We use geolocation to ensure students are physically present in the classroom."
          />
          <FeatureCard 
            icon={<CheckCircle2 className="w-8 h-8 text-purple-500" />}
            title="Instant Records"
            description="Real-time updates for students and comprehensive reports for instructors."
          />
        </div>
      </main>

      {/* Footer */}
      <footer className="py-6 text-center text-gray-500 text-sm border-t border-gray-200">
        &copy; {new Date().getFullYear()} AttendanceApp. Built for HCI Spring 2026.
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <div className="p-6 bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
      <div className="mb-4">{icon}</div>
      <h3 className="text-lg font-bold mb-2 text-gray-900">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  )
}
