"use client";

import { useState } from "react";
import Image from "next/image";
import {
  Users,
  CheckCircle2,
  XCircle,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  DollarSign,
  AlertTriangle,
  Flame,
  Eye,
  TrendingUp,
  Zap,
  Crown,
  Award,
} from "lucide-react";
import { Room } from "@/lib/types";
import { calculateNights } from "@/lib/bookingLogic";

interface RoomCardProps {
  room: Room;
  checkIn: string;
  checkOut: string;
  onBook: (room: Room) => void;
}

export default function RoomCard({
  room,
  checkIn,
  checkOut,
  onBook,
}: RoomCardProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const roomType = room.roomType!;
  const images =
    roomType.imagesJson && roomType.imagesJson.length > 0
      ? roomType.imagesJson
      : [
          "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80",
        ];

  const demand = room.demandInfo;
  const isSurged = demand && demand.surgeMultiplier > 1.0;
  const activePricePerNight = demand
    ? demand.currentCustomerPrice
    : roomType.basePrice;

  const nights = calculateNights(checkIn, checkOut);
  const totalCustomerPrice = activePricePerNight * nights;
  const isAvailable = room.isAvailableForDates && room.status === "available";

  // Real-life classification
  const isAffordable = roomType.basePrice <= 12000;
  const isUltraLuxury = roomType.basePrice > 25000;

  const nextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    <div
      className={`glass-card rounded-3xl overflow-hidden flex flex-col group border relative transition-all duration-300 ${
        demand?.demandLevel === "CRITICAL_SURGE"
          ? "border-rose-500/50 shadow-rose-500/10"
          : isSurged && isAffordable
          ? "border-amber-500/50 shadow-amber-500/10"
          : "border-black/5 dark:border-white/10 hover:border-indigo-500/40"
      }`}
    >
      {/* High Demand / Race Condition Spike Warning Strip (believably shown on affordable rooms or when conflict occurs) */}
      {isSurged && isAvailable && (
        <div
          className={`px-3.5 py-1.5 text-[11px] font-bold flex items-center justify-between text-white ${
            demand?.demandLevel === "CRITICAL_SURGE"
              ? "bg-gradient-to-r from-rose-600 via-orange-600 to-amber-600"
              : "bg-gradient-to-r from-amber-600 via-orange-500 to-yellow-600"
          }`}
        >
          <div className="flex items-center gap-1.5">
            <Flame className="w-3.5 h-3.5 animate-bounce text-yellow-200" />
            <span className="uppercase tracking-wider">
              {demand?.demandLevel === "CRITICAL_SURGE"
                ? "⚡ High Demand Collision (+20%)"
                : "🔥 Popular Choice · Trending Now"}
            </span>
          </div>
          <div className="flex items-center gap-1 text-[10px] text-white/95 font-medium">
            <Eye className="w-3 h-3" />
            <span>{demand?.activeViewersCount || 6} viewing now</span>
          </div>
        </div>
      )}

      {/* Top Media Section */}
      <div className="relative h-56 sm:h-64 w-full overflow-hidden bg-slate-900">
        <img
          src={images[currentImageIndex]}
          alt={roomType.title}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/20 to-transparent" />

        {/* Image carousel arrows */}
        {images.length > 1 && (
          <div className="absolute inset-x-2 top-1/2 -translate-y-1/2 flex justify-between items-center opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={prevImage}
              aria-label="Previous photo"
              className="p-1.5 rounded-full bg-black/60 hover:bg-black/80 text-white backdrop-blur-sm transition-transform active:scale-95"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={nextImage}
              aria-label="Next photo"
              className="p-1.5 rounded-full bg-black/60 hover:bg-black/80 text-white backdrop-blur-sm transition-transform active:scale-95"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Top Badges */}
        <div className="absolute top-3 inset-x-3 flex items-center justify-between">
          <div className="px-3 py-1 rounded-full bg-slate-950/80 backdrop-blur-md border border-white/15 text-xs font-semibold text-white tracking-wider flex items-center gap-1.5 shadow-md">
            <span>Room {room.roomNumber}</span>
          </div>

          {/* Availability Status Badge */}
          {room.status === "maintenance" ? (
            <div className="px-3 py-1 rounded-full bg-amber-500/20 backdrop-blur-md border border-amber-500/40 text-[11px] font-semibold text-amber-300 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              <span>Maintenance</span>
            </div>
          ) : room.status === "out_of_service" ? (
            <div className="px-3 py-1 rounded-full bg-rose-500/20 backdrop-blur-md border border-rose-500/40 text-[11px] font-semibold text-rose-300 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-rose-400" />
              <span>Out of Service</span>
            </div>
          ) : isAvailable ? (
            <div className="px-3 py-1 rounded-full bg-emerald-500/20 backdrop-blur-md border border-emerald-500/40 text-[11px] font-semibold text-emerald-300 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 pulse-available" />
              <span>Available</span>
            </div>
          ) : (
            <div className="px-3 py-1 rounded-full bg-rose-500/20 backdrop-blur-md border border-rose-500/40 text-[11px] font-semibold text-rose-300 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-rose-400 pulse-occupied" />
              <span>Dates Reserved</span>
            </div>
          )}
        </div>

        {/* Capacity & Scarcity urgency overlay badge */}
        <div className="absolute bottom-3 inset-x-3 flex items-center justify-between">
          <span className="px-2.5 py-1 rounded-lg bg-black/70 backdrop-blur-sm border border-white/10 text-xs text-slate-200 flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5 text-indigo-400" />
            <span>Up to {roomType.capacity} Guests</span>
          </span>

          {/* Scarcity Badge: Shown realistically for cheapest/popular rooms */}
          {isAvailable && demand && isAffordable && (
            <span className="px-2.5 py-1 rounded-lg bg-amber-500/90 backdrop-blur-sm text-slate-950 font-bold text-[10px] tracking-tight flex items-center gap-1 shadow-lg animate-pulse">
              <Zap className="w-3 h-3 fill-slate-950" />
              <span>Only {demand.displayedScarcityCount} left!</span>
            </span>
          )}

          {/* Luxury Badge: For Ultra-Luxury suites */}
          {isAvailable && isUltraLuxury && (
            <span className="px-2.5 py-1 rounded-lg bg-indigo-600/90 backdrop-blur-sm text-white font-bold text-[10px] tracking-tight flex items-center gap-1 shadow-lg">
              <Crown className="w-3 h-3 text-amber-300" />
              <span>Signature Suite</span>
            </span>
          )}
        </div>
      </div>

      {/* Card Content */}
      <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-start justify-between gap-2 mb-2">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
              {roomType.title}
            </h3>
          </div>

          <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 mb-3.5 leading-relaxed">
            {roomType.description}
          </p>

          {/* Believable Category Cues */}
          {isAvailable && demand && (
            <div className="mb-3.5 p-2 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/20 text-[11px] text-indigo-700 dark:text-indigo-300 flex items-center gap-1.5 font-medium">
              {isUltraLuxury ? (
                <Crown className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
              ) : isAffordable ? (
                <Flame className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
              ) : (
                <Award className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
              )}
              <span className="truncate">{demand.scarcityMessage}</span>
            </div>
          )}

          {/* Amenities Pills */}
          <div className="flex flex-wrap gap-1.5 mb-4">
            {roomType.amenities.slice(0, 4).map((amenity, idx) => (
              <span
                key={idx}
                className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-white/5 border border-slate-200/80 dark:border-white/5 text-slate-700 dark:text-slate-300 font-medium"
              >
                {amenity}
              </span>
            ))}
            {roomType.amenities.length > 4 && (
              <span className="text-[11px] px-2 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-300 border border-indigo-100 dark:border-indigo-500/20 font-medium">
                +{roomType.amenities.length - 4} more
              </span>
            )}
          </div>
        </div>

        {/* Dynamic Price & Action Area in Indian Rupees (₹) */}
        <div className="pt-4 border-t border-slate-100 dark:border-white/10 flex items-end justify-between gap-3">
          <div>
            {/* Price Anchoring (Strikethrough Rack Rate) */}
            <div className="flex items-center gap-1.5">
              {demand && (
                <span className="text-xs text-slate-400 dark:text-slate-500 line-through">
                  ₹{demand.rackRateAnchorPrice.toLocaleString("en-IN")}
                </span>
              )}
              {isSurged && isAffordable && (
                <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/30">
                  +{Math.round((demand.surgeMultiplier - 1) * 100)}% Surge
                </span>
              )}
            </div>

            <div className="flex items-baseline gap-1">
              <span
                className={`text-2xl font-black ${
                  isSurged && isAffordable
                    ? "text-amber-600 dark:text-amber-300"
                    : "text-slate-900 dark:text-white"
                }`}
              >
                ₹{activePricePerNight.toLocaleString("en-IN")}
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400">/ night</span>
            </div>

            <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">
              ₹{totalCustomerPrice.toLocaleString("en-IN")} est. for {nights} night
              {nights > 1 ? "s" : ""}
            </p>
          </div>

          <button
            type="button"
            disabled={!isAvailable}
            onClick={() => onBook(room)}
            className={`px-4 py-2.5 rounded-xl font-semibold text-xs sm:text-sm transition-all flex items-center gap-1.5 shadow-md ${
              isAvailable
                ? isSurged && isAffordable
                  ? "bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-white font-bold shadow-orange-500/25 hover:scale-[1.02] active:scale-95"
                  : "bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/30 hover:scale-[1.02] active:scale-95"
                : "bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-500 cursor-not-allowed border border-transparent"
            }`}
          >
            {isAvailable ? (
              <>
                <Sparkles className="w-3.5 h-3.5" />
                <span>Reserve Room</span>
              </>
            ) : room.status !== "available" ? (
              <span>Unavailable</span>
            ) : (
              <>
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>Overlapping Dates</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
