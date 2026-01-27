import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371e3; // metres
  const φ1 = lat1 * Math.PI/180;
  const φ2 = lat2 * Math.PI/180;
  const Δφ = (lat2-lat1) * Math.PI/180;
  const Δλ = (lon2-lon1) * Math.PI/180;

  const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
          Math.cos(φ1) * Math.cos(φ2) *
          Math.sin(Δλ/2) * Math.sin(Δλ/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

  return R * c;
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { qrToken, latitude, longitude } = await req.json();

    const classSession = await prisma.classSession.findFirst({
      where: { qrToken, isActive: true },
    });

    if (!classSession) {
      return NextResponse.json({ error: "Invalid or expired session" }, { status: 404 });
    }

    // Verify Geolocation
    const distance = calculateDistance(
      classSession.latitude,
      classSession.longitude,
      latitude,
      longitude
    );

    if (distance > classSession.radius) {
      return NextResponse.json(
        { error: `You are too far from the class location (${Math.round(distance)}m away)` },
        { status: 400 }
      );
    }

    // Check existing attendance
    const existingRecord = await prisma.attendanceRecord.findUnique({
      where: {
        userId_sessionId: {
          userId: session.user.id,
          sessionId: classSession.id,
        },
      },
    });

    if (existingRecord) {
      return NextResponse.json({ message: "Attendance already marked" });
    }

    await prisma.attendanceRecord.create({
      data: {
        userId: session.user.id,
        sessionId: classSession.id,
        status: "PRESENT",
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Attendance error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
