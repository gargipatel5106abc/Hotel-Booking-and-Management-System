import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getDemandInfo } from "@/lib/demandEngine";

export async function GET() {
  try {
    const roomTypes = await prisma.roomType.findMany({
      include: {
        rooms: true,
      },
    });

    const formatted = roomTypes.map((rt) => {
      const availableRoomsCount = rt.rooms.filter(
        (r) => r.status === "available"
      ).length;
      const demand = getDemandInfo(rt.id, rt.basePrice, availableRoomsCount);

      return {
        ...rt,
        amenities: JSON.parse(rt.amenities || "[]"),
        imagesJson: JSON.parse(rt.imagesJson || "[]"),
        demandInfo: demand,
      };
    });

    return NextResponse.json(formatted);
  } catch (error: any) {
    console.error("Fetch room-types error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
