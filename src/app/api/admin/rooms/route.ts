import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { roomId, status } = body;

    if (!roomId || !status) {
      return NextResponse.json(
        { error: "roomId and status are required." },
        { status: 400 }
      );
    }

    if (!["available", "maintenance", "out_of_service"].includes(status)) {
      return NextResponse.json(
        { error: "Invalid room status." },
        { status: 400 }
      );
    }

    const updated = await prisma.room.update({
      where: { id: roomId },
      data: { status },
      include: {
        roomType: true,
      },
    });

    return NextResponse.json(updated);
  } catch (error: any) {
    console.error("Update room status error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

