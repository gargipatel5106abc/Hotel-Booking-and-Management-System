import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  getDemandInfo,
  getYieldSettings,
  updateYieldSettings,
  simulateDemandSpike,
  resetDemand,
} from "@/lib/demandEngine";

export async function GET() {
  try {
    const settings = getYieldSettings();
    const roomTypes = await prisma.roomType.findMany({
      include: {
        rooms: {
          include: {
            bookings: {
              where: { status: "confirmed" },
            },
          },
        },
      },
    });

    const today = new Date().toISOString().split("T")[0];

    // Compute real availability vs. client displayed availability
    let totalRealOperational = 0;
    let totalRealAvailable = 0;
    let totalClientDisplayed = 0;

    const roomTypeStats = roomTypes.map((rt) => {
      const totalInType = rt.rooms.length;
      const operationalInType = rt.rooms.filter(
        (r) => r.status === "available"
      ).length;

      // Unbooked today
      const availableToday = rt.rooms.filter((r) => {
        if (r.status !== "available") return false;
        return !r.bookings.some(
          (b) => b.checkInDate <= today && b.checkOutDate > today
        );
      }).length;

      totalRealOperational += operationalInType;
      totalRealAvailable += availableToday;

      // Scarcity throttle
      const clientDisplayed = settings.scarcityThrottlingEnabled
        ? Math.min(availableToday, settings.scarcityMaxDisplayedPerType)
        : availableToday;

      totalClientDisplayed += clientDisplayed;

      const demand = getDemandInfo(rt.id, rt.basePrice, availableToday);

      return {
        roomTypeId: rt.id,
        title: rt.title,
        basePrice: rt.basePrice,
        totalInType,
        operationalInType,
        availableToday,
        clientDisplayed,
        demand,
      };
    });

    return NextResponse.json({
      settings,
      totalRealOperational,
      totalRealAvailable,
      totalClientDisplayed,
      scarcityDeficit: totalRealAvailable - totalClientDisplayed,
      roomTypeStats,
    });
  } catch (error: any) {
    console.error("Fetch yield stats error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, roomTypeId, settings } = body;

    if (action === "simulate_spike") {
      simulateDemandSpike(roomTypeId, 7, true);
      return NextResponse.json({
        success: true,
        message: "Simulated 7 customer hits and 1 race condition collision!",
      });
    }

    if (action === "reset") {
      resetDemand(roomTypeId);
      return NextResponse.json({
        success: true,
        message: roomTypeId
          ? "Reset demand for room type"
          : "Reset all room demand and surge metrics to baseline 1.0x",
      });
    }

    if (settings) {
      const updated = updateYieldSettings(settings);
      return NextResponse.json({
        success: true,
        settings: updated,
      });
    }

    return NextResponse.json(
      { error: "Invalid yield action or settings payload" },
      { status: 400 }
    );
  } catch (error: any) {
    console.error("Update yield error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

