import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  getDemandInfo,
  getYieldSettings,
  recordHit,
} from "@/lib/demandEngine";
import { Room } from "@/lib/types";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const checkIn = searchParams.get("checkIn");
    const checkOut = searchParams.get("checkOut");
    const roomTypeId = searchParams.get("roomTypeId");
    const guestCount = searchParams.get("guestCount")
      ? parseInt(searchParams.get("guestCount")!)
      : undefined;
    const onlyAvailable = searchParams.get("onlyAvailable") === "true";
    const viewMode = searchParams.get("viewMode") || "client"; // "client" vs "admin"
    const targetHitRoomType = searchParams.get("hitRoomType");

    // If client requested hit tracking on a room type
    if (targetHitRoomType && viewMode !== "admin") {
      recordHit(targetHitRoomType, false);
    }

    // Build filter
    const whereClause: any = {};
    if (roomTypeId && roomTypeId !== "all") {
      whereClause.roomTypeId = roomTypeId;
      if (viewMode !== "admin") {
        recordHit(roomTypeId, false);
      }
    }

    const rooms = await prisma.room.findMany({
      where: whereClause,
      include: {
        roomType: true,
        bookings: {
          where: {
            status: "confirmed",
          },
        },
      },
      orderBy: {
        roomNumber: "asc",
      },
    });

    const yieldSettings = getYieldSettings();

    // 1. Evaluate availability for each room based on date overlap
    const evaluatedRooms = rooms.map((room) => {
      let isAvailableForDates = room.status === "available";

      if (checkIn && checkOut && isAvailableForDates) {
        // Double-booking check:
        // Unavailable if (NewCheckIn < ExistingCheckOut) AND (NewCheckOut > ExistingCheckIn)
        const hasOverlap = room.bookings.some((b) => {
          return checkIn < b.checkOutDate && checkOut > b.checkInDate;
        });

        if (hasOverlap) {
          isAvailableForDates = false;
        }
      }

      // Filter by capacity if requested
      const capacityMatch = guestCount
        ? room.roomType.capacity >= guestCount
        : true;

      return {
        ...room,
        roomType: {
          ...room.roomType,
          amenities: JSON.parse(room.roomType.amenities || "[]"),
          imagesJson: JSON.parse(room.roomType.imagesJson || "[]"),
        },
        isAvailableForDates: isAvailableForDates && capacityMatch,
      };
    });

    // 2. Count real availability per room type
    const realAvailableCountByType: Record<string, number> = {};
    evaluatedRooms.forEach((r) => {
      if (r.isAvailableForDates && r.status === "available") {
        realAvailableCountByType[r.roomTypeId] =
          (realAvailableCountByType[r.roomTypeId] || 0) + 1;
      }
    });

    // 3. Attach dynamic pricing & demand data to all rooms
    const roomsWithDemand: Room[] = evaluatedRooms.map((r) => {
      const realAvailable = realAvailableCountByType[r.roomTypeId] || 0;
      const demand = getDemandInfo(
        r.roomTypeId,
        r.roomType.basePrice,
        realAvailable
      );

      return {
        ...r,
        status: r.status as any,
        demandInfo: demand,
      };
    });

    // 4. Client View vs Admin/Manager View differentiation
    if (viewMode === "admin") {
      // Admin sees entire inventory without artificial throttling
      const finalRooms = onlyAvailable
        ? roomsWithDemand.filter((r) => r.isAvailableForDates)
        : roomsWithDemand;

      return NextResponse.json(finalRooms);
    }

    // CLIENT VIEW: Apply Yield Management Scarcity Throttling
    // If the hotel has 15 rooms, show availability for only 10, or 3 in place of 6!
    let clientRooms: Room[] = [];

    if (yieldSettings.scarcityThrottlingEnabled) {
      const countIncludedPerType: Record<string, number> = {};

      roomsWithDemand.forEach((room) => {
        const isAvail = room.isAvailableForDates && room.status === "available";

        if (!isAvail) {
          // If already unavailable/occupied, include it so user sees "Reserved"
          clientRooms.push(room);
          return;
        }

        const currentCount = countIncludedPerType[room.roomTypeId] || 0;
        const maxToShow = yieldSettings.scarcityMaxDisplayedPerType; // e.g. 3

        if (currentCount < maxToShow) {
          countIncludedPerType[room.roomTypeId] = currentCount + 1;
          clientRooms.push(room);
        } else {
          // Omit from client list or convert to perceived "Sold Out"
          // By withholding, user only sees 3 rooms available instead of 6!
        }
      });
    } else {
      clientRooms = roomsWithDemand;
    }

    const finalClientRooms = onlyAvailable
      ? clientRooms.filter((r) => r.isAvailableForDates)
      : clientRooms;

    return NextResponse.json(finalClientRooms);
  } catch (error: any) {
    console.error("Fetch rooms error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { roomNumber, roomTypeId, status = "available" } = body;

    if (!roomNumber || !roomTypeId) {
      return NextResponse.json(
        { error: "roomNumber and roomTypeId are required" },
        { status: 400 }
      );
    }

    const existing = await prisma.room.findUnique({
      where: { roomNumber },
    });

    if (existing) {
      return NextResponse.json(
        { error: `Room number ${roomNumber} already exists` },
        { status: 409 }
      );
    }

    const room = await prisma.room.create({
      data: {
        roomNumber,
        roomTypeId,
        status,
      },
      include: {
        roomType: true,
      },
    });

    return NextResponse.json(room, { status: 201 });
  } catch (error: any) {
    console.error("Create room error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
