import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;

    const classSession = await prisma.classSession.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        createdAt: true,
        isActive: true,
        qrToken: true,
      },
    });

    if (!classSession) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const students = await prisma.user.findMany({
      where: { role: "STUDENT" },
      select: { id: true, name: true, email: true, studentId: true },
      orderBy: { name: "asc" },
    });

    const records = await prisma.attendanceRecord.findMany({
      where: { sessionId: id },
      select: {
        userId: true,
        timestamp: true,
        status: true,
      },
      orderBy: { timestamp: "asc" },
    });

    const presentSet = new Set(records.map((r) => r.userId));

    const present = students
      .filter((s) => presentSet.has(s.id))
      .map((s) => {
        const rec = records.find((r) => r.userId === s.id);
        return { ...s, timestamp: rec?.timestamp ?? null, status: rec?.status ?? null };
      });

    const missing = students.filter((s) => !presentSet.has(s.id));

    return NextResponse.json({
      session: classSession,
      totals: {
        students: students.length,
        present: present.length,
        missing: missing.length,
      },
      present,
      missing,
    });
  } catch (error) {
    console.error("Error fetching attendance:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

