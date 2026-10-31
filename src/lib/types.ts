export type UserRole = "admin" | "guest";
export type RoomStatus = "available" | "maintenance" | "out_of_service" | (string & {});
export type BookingStatus = "confirmed" | "cancelled" | (string & {});
export type PaymentStatus = "completed" | "pending" | "refunded" | (string & {});
export type PaymentMethod = "credit_card" | "paypal" | "stripe" | "crypto" | (string & {});
export type DemandLevel = "NORMAL" | "MODERATE" | "HIGH_DEMAND" | "CRITICAL_SURGE";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt: string | Date;
}

export interface RoomType {
  id: string;
  title: string;
  description: string;
  basePrice: number;
  capacity: number;
  amenities: string[]; // parsed from JSON
  imagesJson: string[]; // parsed from JSON
  demandInfo?: RoomDemandInfo;
}

export interface RoomDemandInfo {
  roomTypeId: string;
  hitsCount: number;
  recentConflictsCount: number;
  surgeMultiplier: number;
  currentCustomerPrice: number;
  originalBasePrice: number;
  rackRateAnchorPrice: number;
  demandLevel: DemandLevel;
  activeViewersCount: number;
  lastSurgeReason?: string;
  isHighDemand: boolean;
  actualAvailableCount: number;
  displayedScarcityCount: number;
  scarcityMessage: string;
}

export interface YieldSettings {
  surgePricingEnabled: boolean;
  scarcityThrottlingEnabled: boolean;
  scarcityMaxDisplayedPerType: number;
  socialProofEnabled: boolean;
  urgencyBannerEnabled: boolean;
  baseSurgeIncrement: number;
  raceConditionSurgeBoost: number;
}

export interface Room {
  id: string;
  roomNumber: string;
  roomTypeId: string;
  roomType?: RoomType;
  status: RoomStatus;
  bookings?: any[];
  isAvailableForDates?: boolean;
  demandInfo?: RoomDemandInfo;
}

export interface Booking {
  id: string;
  userId: string;
  user?: User;
  roomId: string;
  room?: Room;
  checkInDate: string; // YYYY-MM-DD
  checkOutDate: string; // YYYY-MM-DD
  totalAmount: number;
  status: BookingStatus;
  createdAt: string | Date;
  payments?: Payment[];
}

export interface Payment {
  id: string;
  bookingId: string;
  amount: number;
  paymentStatus: PaymentStatus;
  paymentMethod: PaymentMethod;
  transactionDate: string | Date;
}

export interface AvailabilityQuery {
  checkInDate: string;
  checkOutDate: string;
  roomTypeId?: string;
  guestCount?: number;
}

export interface AnalyticsSummary {
  totalBookings: number;
  activeBookings: number;
  grossRevenue: number;
  occupancyRate: number; // percentage (0 - 100)
  totalRooms: number;
  availableRoomsCount: number;
  maintenanceRoomsCount: number;
  recentBookings: Booking[];
  revenueByRoomType: { roomType: string; revenue: number; bookingsCount: number }[];
  yieldSettings?: YieldSettings;
  roomTypeDemands?: Record<string, RoomDemandInfo>;
}
