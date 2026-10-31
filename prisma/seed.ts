import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function runSeed() {
  console.log("🌱 Starting database seeding with Indian Rupee (₹) luxury pricing...");

  // Clear existing records in reverse dependency order
  await prisma.payment.deleteMany();
  await prisma.booking.deleteMany();
  await prisma.room.deleteMany();
  await prisma.roomType.deleteMany();
  await prisma.user.deleteMany();

  // 1. Seed Users
  const admin = await prisma.user.create({
    data: {
      name: "Elena Rostova (General Manager)",
      email: "admin@auroraluxury.com",
      passwordHash: "$2a$10$wE99J9demoHashAdminPass12345",
      role: "admin",
    },
  });

  const guest1 = await prisma.user.create({
    data: {
      name: "Dr. Sophia Chen",
      email: "sophia.chen@techcorp.io",
      passwordHash: "$2a$10$wE99J9demoHashGuestPass12345",
      role: "guest",
    },
  });

  const guest2 = await prisma.user.create({
    data: {
      name: "Aarav Sharma",
      email: "aarav.sharma@gmail.com",
      passwordHash: "$2a$10$wE99J9demoHashGuestPass12345",
      role: "guest",
    },
  });

  const guest3 = await prisma.user.create({
    data: {
      name: "Marcus Vance",
      email: "marcus.vance@lifestyle.org",
      passwordHash: "$2a$10$wE99J9demoHashGuestPass12345",
      role: "guest",
    },
  });

  const guest4 = await prisma.user.create({
    data: {
      name: "Priya Malhotra",
      email: "priya.m@traveler.in",
      passwordHash: "$2a$10$wE99J9demoHashGuestPass12345",
      role: "guest",
    },
  });

  console.log("✅ Seeded Users");

  // 2. Seed Room Types with realistic INR pricing
  // Most affordable/high-velocity entry suite: Studio Loft (₹6,499)
  const studioLoft = await prisma.roomType.create({
    data: {
      title: "Urban Minimalist Studio Loft",
      description:
        "Engineered for modern travelers and executives. High-speed gigabit Wi-Fi, ergonomic Herman Miller workstation, and bespoke gourmet kitchenette.",
      basePrice: 6499,
      capacity: 2,
      amenities: JSON.stringify([
        "Ergonomic Workstation",
        "High-Speed Fiber Wi-Fi",
        "Queen Memory Foam Bed",
        "Gourmet Kitchenette",
        "Soundproof Acoustic Paneling",
        "Smart Climate Control",
      ]),
      imagesJson: JSON.stringify([
        "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=1200&q=80",
      ]),
    },
  });

  // Popular mid-tier: Alpine Timber Chalet (₹10,999)
  const alpineChalet = await prisma.roomType.create({
    data: {
      title: "Alpine Timber & Stone Chalet",
      description:
        "Warm rustic luxury meets modern comfort. Handcrafted cedar beams, wood-burning hearth, heated slate flooring, and serene forest views.",
      basePrice: 10999,
      capacity: 2,
      amenities: JSON.stringify([
        "Wood-Burning Fireplace",
        "Heated Slate Flooring",
        "Cedar Hot Tub on Private Patio",
        "King Featherbed",
        "Artisan Wool Blankets",
        "Panoramic Nature Views",
      ]),
      imagesJson: JSON.stringify([
        "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1200&q=80",
      ]),
    },
  });

  // Flagship signature tier: Deluxe Ocean View Suite (₹14,999)
  const deluxeOcean = await prisma.roomType.create({
    data: {
      title: "Deluxe Ocean View Suite",
      description:
        "Indulge in panoramic coastal vistas, custom Italian marble bath, private sunset balcony, and premium Egyptian cotton bedding.",
      basePrice: 14999,
      capacity: 2,
      amenities: JSON.stringify([
        "Panoramic Ocean View",
        "King Pillowtop Bed",
        "Private Balcony",
        "Marble Bathroom & Jacuzzi",
        "Nespresso Coffee Bar",
        "High-Speed Wi-Fi 6",
        "65-inch 4K OLED Smart TV",
        "24/7 Room Service",
      ]),
      imagesJson: JSON.stringify([
        "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=1200&q=80",
      ]),
    },
  });

  // Villa tier: Serene Botanical Garden Villa (₹21,500)
  const gardenVilla = await prisma.roomType.create({
    data: {
      title: "Serene Botanical Garden Villa",
      description:
        "Secluded sanctuary nestled in lush tropical flora with private open-air sun deck, cascading water feature, and artisanal tea lounge.",
      basePrice: 21500,
      capacity: 3,
      amenities: JSON.stringify([
        "Private Botanical Garden",
        "Sunken Lounge with Water Feature",
        "King Bed + Daybed",
        "Outdoor Rain Shower",
        "Yoga & Meditation Deck",
        "Artisanal Coffee & Tea Bar",
        "Bluetooth Sound & Smart Lighting",
      ]),
      imagesJson: JSON.stringify([
        "https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1540541338287-41700207dee6?auto=format&fit=crop&w=1200&q=80",
      ]),
    },
  });

  // Family tier: Grand Horizon Family Suite (₹26,500)
  const familySuite = await prisma.roomType.create({
    data: {
      title: "Grand Horizon Family Suite",
      description:
        "Spacious multi-bedroom suite crafted for families and groups. Connecting rooms, kid-friendly entertainment lounge, and full dining table.",
      basePrice: 26500,
      capacity: 6,
      amenities: JSON.stringify([
        "2 King Beds + 2 Twin Beds",
        "2 Luxurious Full Bathrooms",
        "PlayStation 5 Entertainment Center",
        "Family Dining Area (Seats 6)",
        "Washer & Dryer in Suite",
        "Baby Gear & Crib Available",
        "Direct Beach Access",
      ]),
      imagesJson: JSON.stringify([
        "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=1200&q=80",
      ]),
    },
  });

  // Apex luxury: Skyline Presidential Penthouse (₹48,000)
  const penthouse = await prisma.roomType.create({
    data: {
      title: "Skyline Presidential Penthouse",
      description:
        "The apex of luxury living. Features a private rooftop heated plunge pool, dedicated 24/7 butler, wine cellar, and 360-degree skyline views.",
      basePrice: 48000,
      capacity: 4,
      amenities: JSON.stringify([
        "Private Rooftop Heated Pool",
        "Dedicated 24/7 Butler Service",
        "Dual Master Suites (King Beds)",
        "Private Wine Cellar & Bar",
        "Floor-to-Ceiling Skyline Views",
        "Sonos Spatial Sound System",
        "Spa Sauna & Rainfall Shower",
        "Complimentary Chauffeur Airport Transfer",
      ]),
      imagesJson: JSON.stringify([
        "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1591088398332-8a7791972843?auto=format&fit=crop&w=1200&q=80",
      ]),
    },
  });

  console.log("✅ Seeded Room Types with Rupee rates");

  // 3. Seed Rooms (18 Rooms)
  const roomData = [
    // Deluxe Ocean Suites (4 rooms)
    { roomNumber: "101", roomTypeId: deluxeOcean.id, status: "available" },
    { roomNumber: "102", roomTypeId: deluxeOcean.id, status: "available" },
    { roomNumber: "103", roomTypeId: deluxeOcean.id, status: "maintenance" },
    { roomNumber: "104", roomTypeId: deluxeOcean.id, status: "available" },
    // Presidential Penthouses (2 rooms)
    { roomNumber: "PH-01", roomTypeId: penthouse.id, status: "available" },
    { roomNumber: "PH-02", roomTypeId: penthouse.id, status: "available" },
    // Botanical Garden Villas (3 rooms)
    { roomNumber: "VIL-01", roomTypeId: gardenVilla.id, status: "available" },
    { roomNumber: "VIL-02", roomTypeId: gardenVilla.id, status: "available" },
    { roomNumber: "VIL-03", roomTypeId: gardenVilla.id, status: "available" },
    // Studio Lofts (4 rooms - cheapest/popular)
    { roomNumber: "201", roomTypeId: studioLoft.id, status: "available" },
    { roomNumber: "202", roomTypeId: studioLoft.id, status: "available" },
    { roomNumber: "203", roomTypeId: studioLoft.id, status: "out_of_service" },
    { roomNumber: "204", roomTypeId: studioLoft.id, status: "available" },
    // Family Suites (3 rooms)
    { roomNumber: "301", roomTypeId: familySuite.id, status: "available" },
    { roomNumber: "302", roomTypeId: familySuite.id, status: "available" },
    { roomNumber: "303", roomTypeId: familySuite.id, status: "available" },
    // Alpine Chalets (2 rooms)
    { roomNumber: "CH-1", roomTypeId: alpineChalet.id, status: "available" },
    { roomNumber: "CH-2", roomTypeId: alpineChalet.id, status: "available" },
  ];

  const createdRooms: Record<string, string> = {};
  for (const r of roomData) {
    const created = await prisma.room.create({
      data: r,
    });
    createdRooms[r.roomNumber] = created.id;
  }

  console.log("✅ Seeded 18 Rooms");

  // 4. Seed Bookings & Payments in Indian Rupees (₹)
  const bookingsData = [
    {
      userId: guest1.id,
      roomId: createdRooms["101"],
      checkInDate: "2026-10-01",
      checkOutDate: "2026-10-05",
      totalAmount: 67695,
      status: "confirmed",
      paymentMethod: "credit_card",
    },
    {
      userId: guest2.id,
      roomId: createdRooms["PH-01"],
      checkInDate: "2026-10-03",
      checkOutDate: "2026-10-08",
      totalAmount: 269299,
      status: "confirmed",
      paymentMethod: "stripe",
    },
    {
      userId: guest3.id,
      roomId: createdRooms["VIL-01"],
      checkInDate: "2026-10-04",
      checkOutDate: "2026-10-09",
      totalAmount: 120899,
      status: "confirmed",
      paymentMethod: "paypal",
    },
    {
      userId: guest4.id,
      roomId: createdRooms["201"],
      checkInDate: "2026-10-05",
      checkOutDate: "2026-10-07",
      totalAmount: 15057,
      status: "confirmed",
      paymentMethod: "credit_card",
    },
    {
      userId: guest1.id,
      roomId: createdRooms["301"],
      checkInDate: "2026-10-08",
      checkOutDate: "2026-10-12",
      totalAmount: 119219,
      status: "confirmed",
      paymentMethod: "credit_card",
    },
    {
      userId: guest2.id,
      roomId: createdRooms["CH-1"],
      checkInDate: "2026-10-10",
      checkOutDate: "2026-10-15",
      totalAmount: 62093,
      status: "confirmed",
      paymentMethod: "crypto",
    },
    {
      userId: guest3.id,
      roomId: createdRooms["102"],
      checkInDate: "2026-10-12",
      checkOutDate: "2026-10-16",
      totalAmount: 67695,
      status: "confirmed",
      paymentMethod: "credit_card",
    },
    {
      userId: guest4.id,
      roomId: createdRooms["PH-02"],
      checkInDate: "2026-10-15",
      checkOutDate: "2026-10-20",
      totalAmount: 269299,
      status: "confirmed",
      paymentMethod: "stripe",
    },
    {
      userId: guest1.id,
      roomId: createdRooms["VIL-02"],
      checkInDate: "2026-10-18",
      checkOutDate: "2026-10-22",
      totalAmount: 96819,
      status: "confirmed",
      paymentMethod: "paypal",
    },
    {
      userId: guest2.id,
      roomId: createdRooms["202"],
      checkInDate: "2026-10-20",
      checkOutDate: "2026-10-25",
      totalAmount: 36893,
      status: "confirmed",
      paymentMethod: "credit_card",
    },
    {
      userId: guest3.id,
      roomId: createdRooms["104"],
      checkInDate: "2026-10-22",
      checkOutDate: "2026-10-26",
      totalAmount: 67695,
      status: "confirmed",
      paymentMethod: "credit_card",
    },
    {
      userId: guest4.id,
      roomId: createdRooms["CH-2"],
      checkInDate: "2026-09-20",
      checkOutDate: "2026-09-25",
      totalAmount: 62093,
      status: "confirmed",
      paymentMethod: "credit_card",
    },
  ];

  for (const b of bookingsData) {
    const booking = await prisma.booking.create({
      data: {
        userId: b.userId,
        roomId: b.roomId,
        checkInDate: b.checkInDate,
        checkOutDate: b.checkOutDate,
        totalAmount: b.totalAmount,
        status: b.status,
      },
    });

    await prisma.payment.create({
      data: {
        bookingId: booking.id,
        amount: b.totalAmount,
        paymentStatus: "completed",
        paymentMethod: b.paymentMethod,
      },
    });
  }

  console.log("✅ Seeded 12 Bookings with Completed Payments in INR (₹)");
  console.log("✨ Seeding completed successfully!");
}

if (require.main === module) {
  runSeed()
    .catch((e) => {
      console.error("❌ Seeding failed:", e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
