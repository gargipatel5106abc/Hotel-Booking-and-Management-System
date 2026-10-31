import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createBookingWithTransaction } from "@/lib/bookingLogic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const roomId = searchParams.get("roomId");
    const email = searchParams.get("email");

    const where: any = {};
    if (userId) where.userId = userId;
    if (roomId) where.roomId = roomId;
    if (email) {
      const user = await prisma.user.findUnique({ where: { email } });
      if (user) {
        where.userId = user.id;
      } else {
        return NextResponse.json([]);
      }
    }

    const bookings = await prisma.booking.findMany({
      where,
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
        room: {
          include: {
            roomType: true,
          },
        },
        payments: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const formatted = bookings.map((b) => ({
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

    return NextResponse.json(formatted);
  } catch (error: any) {
    console.error("Fetch bookings error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      roomId,
      checkInDate,
      checkOutDate,
      guestName,
      guestEmail,
      userId,
      paymentMethod,
    } = body;

    if (!roomId || !checkInDate || !checkOutDate) {
      return NextResponse.json(
        { error: "roomId, checkInDate, and checkOutDate are required." },
        { status: 400 }
      );
    }

    const result = await createBookingWithTransaction({
      roomId,
      checkInDate,
      checkOutDate,
      guestName,
      guestEmail,
      userId,
      paymentMethod,
    });

    return NextResponse.json(
      {
        success: true,
        booking: result.booking,
        payment: result.payment,
        room: {
          ...result.room,
          roomType: {
            ...result.room.roomType,
            amenities: JSON.parse(result.room.roomType.amenities || "[]"),
            imagesJson: JSON.parse(result.room.roomType.imagesJson || "[]"),
          },
        },
        pricing: result.pricing,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Booking error:", error);
    const message = error.message || "Failed to create booking";
    const status = message.includes("DOUBLE_BOOKING_PREVENTED") ? 409 : 400;
    return NextResponse.json(
      {
        error: message,
        isDoubleBookingError: message.includes("DOUBLE_BOOKING_PREVENTED"),
      },
      { status }
    );
  }
}

