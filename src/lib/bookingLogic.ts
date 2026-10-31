import { prisma } from "./prisma";
import { getDemandInfo, recordHit } from "./demandEngine";

/**
 * Double-Booking Prevention Rule:
 * A room is unavailable if (NewCheckIn < ExistingCheckOut) AND (NewCheckOut > ExistingCheckIn)
 * for any active booking (status == 'confirmed').
 */
export function hasDateOverlap(
  newCheckIn: string,
  newCheckOut: string,
  existingCheckIn: string,
  existingCheckOut: string
): boolean {
  return newCheckIn < existingCheckOut && newCheckOut > existingCheckIn;
}

export function calculateNights(checkIn: string, checkOut: string): number {
  const inDate = new Date(checkIn);
  const outDate = new Date(checkOut);
  const diffTime = outDate.getTime() - inDate.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays > 0 ? diffDays : 1;
}

export function calculatePricing(
  pricePerNight: number,
  checkIn: string,
  checkOut: string,
  taxRatePercent = 12,
  serviceFee = 499
) {
  const nights = calculateNights(checkIn, checkOut);
  const roomTotal = pricePerNight * nights;
  const taxes = Math.round((roomTotal * taxRatePercent) / 100);
  const total = roomTotal + taxes + serviceFee;

  return {
    nights,
    pricePerNight,
    roomTotal,
    taxes,
    serviceFee,
    total,
  };
}

export interface CreateBookingInput {
  userId?: string;
  guestName?: string;
  guestEmail?: string;
  roomId: string;
  checkInDate: string; // YYYY-MM-DD
  checkOutDate: string; // YYYY-MM-DD
  paymentMethod?: string;
}

/**
 * Atomic Transactional Booking Creator with Pessimistic Overlap Guard
 * and Dynamic Demand Surge Spike on Race Condition
 */
export async function createBookingWithTransaction(input: CreateBookingInput) {
  const {
    roomId,
    checkInDate,
    checkOutDate,
    userId: providedUserId,
    guestName = "Guest Visitor",
    guestEmail = "guest@example.com",
    paymentMethod = "credit_card",
  } = input;

  if (checkInDate >= checkOutDate) {
    throw new Error("Check-out date must be after check-in date.");
  }

  // Record an active booking checkout attempt hit
  const roomRecord = await prisma.room.findUnique({
    where: { id: roomId },
    select: { roomTypeId: true, roomNumber: true },
  });
  if (roomRecord) {
    recordHit(roomRecord.roomTypeId, false);
  }

  // Execute in an atomic interactive database transaction
  const result = await prisma.$transaction(async (tx) => {
    // 1. Verify Room exists and is physically operational
    const room = await tx.room.findUnique({
      where: { id: roomId },
      include: { roomType: true },
    });

    if (!room) {
      throw new Error(`Room with ID ${roomId} does not exist.`);
    }

    if (room.status !== "available") {
      throw new Error(
        `Room ${room.roomNumber} is currently under ${room.status.replace("_", " ")} and cannot be booked.`
      );
    }

    // 2. Critical Double-Booking Guard:
    // Check for any conflicting active booking with overlapping date range:
    // (NewCheckIn < ExistingCheckOut) AND (NewCheckOut > ExistingCheckIn)
    const conflictingBookings = await tx.booking.findMany({
      where: {
        roomId: roomId,
        status: "confirmed",
        AND: [
          { checkInDate: { lt: checkOutDate } },
          { checkOutDate: { gt: checkInDate } },
        ],
      },
    });

    if (conflictingBookings.length > 0) {
      const conflict = conflictingBookings[0];
      // Immediately trigger dynamic surge spike due to race condition!
      recordHit(room.roomTypeId, true);

      throw new Error(
        `DOUBLE_BOOKING_PREVENTED: Room ${room.roomNumber} is already booked from ${conflict.checkInDate} to ${conflict.checkOutDate}. High demand surge triggered.`
      );
    }

    // 3. Resolve User (create or find)
    let finalUserId = providedUserId;
    if (!finalUserId) {
      let user = await tx.user.findUnique({
        where: { email: guestEmail },
      });
      if (!user) {
        user = await tx.user.create({
          data: {
            name: guestName,
            email: guestEmail,
            passwordHash: "$2a$10$demoHashedPasswordPlaceholder",
            role: "guest",
          },
        });
      }
      finalUserId = user.id;
    }

    // 4. Calculate total amount using dynamic surge rate
    const demand = getDemandInfo(room.roomTypeId, room.roomType.basePrice);
    const pricing = calculatePricing(
      demand.currentCustomerPrice,
      checkInDate,
      checkOutDate
    );

    // 5. Create Booking Record
    const booking = await tx.booking.create({
      data: {
        userId: finalUserId,
        roomId: room.id,
        checkInDate,
        checkOutDate,
        totalAmount: pricing.total,
        status: "confirmed",
      },
    });

    // 6. Create Associated Payment Record
    const payment = await tx.payment.create({
      data: {
        bookingId: booking.id,
        amount: pricing.total,
        paymentStatus: "completed",
        paymentMethod: paymentMethod,
      },
    });

    return {
      booking,
      payment,
      room,
      pricing,
      demand,
    };
  });

  return result;
}
