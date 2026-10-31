import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getDemandInfo, getYieldSettings } from "@/lib/demandEngine";

export async function GET() {
  try {
    const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
    const settings = getYieldSettings();

    const [
      totalBookings,
      activeBookings,
      allCompletedPayments,
      rooms,
      roomTypes,
      recentBookings,
    ] = await Promise.all([
      prisma.booking.count(),
      prisma.booking.count({ where: { status: "confirmed" } }),
      prisma.payment.findMany({
        where: { paymentStatus: "completed" },
        select: { amount: true },
      }),
      prisma.room.findMany({
        include: {
          roomType: true,
          bookings: {
            where: { status: "confirmed" },
          },
        },
      }),
      prisma.roomType.findMany({
        include: {
          rooms: {
            include: {
              bookings: {
                where: { status: "confirmed" },
                include: { payments: true },
              },
            },
          },
        },
      }),
      prisma.booking.findMany({
        take: 10,
        orderBy: { createdAt: "desc" },
        include: {
          user: true,
          room: {
            include: { roomType: true },
          },
          payments: true,
        },
      }),
    ]);

    const grossRevenue = allCompletedPayments.reduce(
      (sum, p) => sum + p.amount,
      0
    );

    // Calculate room statuses
    const totalRooms = rooms.length;
    const availableRoomsCount = rooms.filter((r) => r.status === "available").length;
    const maintenanceRoomsCount = rooms.filter((r) => r.status === "maintenance").length;
    const outOfServiceCount = rooms.filter((r) => r.status === "out_of_service").length;

    // Occupancy today: Rooms with an active confirmed booking spanning today
    const currentlyOccupiedRooms = rooms.filter((r) => {
      return r.bookings.some((b) => b.checkInDate <= today && b.checkOutDate > today);
    }).length;

    const occupancyRate =
      totalRooms > 0
        ? Math.round((currentlyOccupiedRooms / totalRooms) * 100)
        : 0;

    // Real available today vs Client-displayed scarcity count
    let totalRealAvailableToday = 0;
    let totalClientDisplayedToday = 0;
    let activeSurgeCount = 0;

    const roomTypeStats = roomTypes.map((rt) => {
      let typeRev = 0;
      let typeBookings = 0;
      rt.rooms.forEach((r) => {
        typeBookings += r.bookings.length;
        r.bookings.forEach((b) => {
          b.payments.forEach((p) => {
            if (p.paymentStatus === "completed") {
              typeRev += p.amount;
            }
          });
        });
      });

      const availableToday = rt.rooms.filter((r) => {
        if (r.status !== "available") return false;
        return !r.bookings.some(
          (b) => b.checkInDate <= today && b.checkOutDate > today
        );
      }).length;

      totalRealAvailableToday += availableToday;

      const clientDisplayed = settings.scarcityThrottlingEnabled
        ? Math.min(availableToday, settings.scarcityMaxDisplayedPerType)
        : availableToday;

      totalClientDisplayedToday += clientDisplayed;

      const demand = getDemandInfo(rt.id, rt.basePrice, availableToday);
      if (demand.isHighDemand) {
        activeSurgeCount++;
      }

      return {
        roomTypeId: rt.id,
        roomType: rt.title,
        basePrice: rt.basePrice,
        customerPrice: demand.currentCustomerPrice,
        revenue: typeRev,
        bookingsCount: typeBookings,
        availableToday,
        clientDisplayed,
        demand,
      };
    });

    const formattedRecentBookings = recentBookings.map((b) => ({
      ...b,
      room: {
        ...b.room,
        roomType: {
          ...b.room.roomType,
          amenities: JSON.parse(b.room.roomType.amenities || "[]"),
          imagesJson: JSON.parse(b.room.roomType.imagesJson || "[]"),
        },
      },
    }));

    return NextResponse.json({
      totalBookings,
      activeBookings,
      grossRevenue,
      occupancyRate,
      currentlyOccupiedRooms,
      totalRooms,
      availableRoomsCount,
      maintenanceRoomsCount,
      outOfServiceCount,
      revenueByRoomType: roomTypeStats,
      recentBookings: formattedRecentBookings,
      currentDate: today,
      // Yield & Scarcity metrics
      yieldSettings: settings,
      totalRealAvailableToday,
      totalClientDisplayedToday,
      activeSurgeCount,
      scarcityThrottledCount: totalRealAvailableToday - totalClientDisplayedToday,
    });
  } catch (error: any) {
    console.error("Analytics error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
