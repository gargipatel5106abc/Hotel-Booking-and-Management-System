import { NextResponse } from "next/server";
import { runSeed } from "../../../../prisma/seed";

export async function POST() {
  try {
    await runSeed();
    return NextResponse.json({
      success: true,
      message: "Database seeded successfully with luxury rooms, bookings, and users!",
    });
  } catch (error: any) {
    console.error("Seed error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to seed database" },
      { status: 500 }
    );
  }
}

export async function GET() {
  return POST();
}

