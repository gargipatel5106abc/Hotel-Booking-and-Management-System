import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const booking = await prisma.booking.findUnique({
      where: { id: params.id },
      include: {
        user: true,
        room: {
          include: {
            roomType: true,
          },
        },
        payments: true,
      },
    });

    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    const formatted = {
      ...booking,
      room: {
        ...booking.room,
        roomType: {
          ...booking.room.roomType,
          amenities: JSON.parse(booking.room.roomType.amenities || "[]"),
          imagesJson: JSON.parse(booking.room.roomType.imagesJson || "[]"),
        },
      },
    };

    return NextResponse.json(formatted);
  } catch (error: any) {
    console.error("Get booking error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { status } = body;

    if (!status || !["confirmed", "cancelled"].includes(status)) {
      return NextResponse.json(
        { error: "Valid status ('confirmed' or 'cancelled') is required." },
        { status: 400 }
      );
    }

    const updated = await prisma.booking.update({
      where: { id: params.id },
      data: { status },
      include: {
        room: {
          include: {
            roomType: true,
          },
        },
        payments: true,
      },
    });

    // If cancelled, update payment status to refunded if completed
    if (status === "cancelled") {
      await prisma.payment.updateMany({
        where: { bookingId: params.id },
        data: { paymentStatus: "refunded" },
      });
    }

    return NextResponse.json(updated);
  } catch (error: any) {
    console.error("Update booking error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

