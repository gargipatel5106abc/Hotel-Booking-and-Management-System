"use client";

import { useState } from "react";
import {
  Calendar,
  Users,
  Search,
  Filter,
  Sparkles,
  ShieldAlert,
  Clock,
} from "lucide-react";
import { RoomType } from "@/lib/types";

interface SearchFilterProps {
  checkIn: string;
  checkOut: string;
  guestCount: number;
  selectedCategory: string;
  onlyAvailable: boolean;
  roomTypes: RoomType[];
  onCheckInChange: (val: string) => void;
  onCheckOutChange: (val: string) => void;
  onGuestCountChange: (val: number) => void;
  onCategoryChange: (val: string) => void;
  onOnlyAvailableChange: (val: boolean) => void;
  onSearch: () => void;
}

export default function SearchFilter({
  checkIn,
  checkOut,
  guestCount,
  selectedCategory,
  onlyAvailable,
  roomTypes,
  onCheckInChange,
  onCheckOutChange,
  onGuestCountChange,
  onCategoryChange,
  onOnlyAvailableChange,
  onSearch,
}: SearchFilterProps) {
  const [showLogicInfo, setShowLogicInfo] = useState(false);

  // Quick preset helper
  const setQuickRange = (startOffsetDays: number, durationDays: number) => {
    const today = new Date();
    const start = new Date(today);
    start.setDate(today.getDate() + startOffsetDays);

    const end = new Date(start);
    end.setDate(start.getDate() + durationDays);

    onCheckInChange(start.toISOString().split("T")[0]);
    onCheckOutChange(end.toISOString().split("T")[0]);
  };

  return (
    <div className="w-full glass-panel rounded-3xl p-5 sm:p-7 shadow-xl border border-black/5 dark:border-white/10 relative overflow-hidden transition-colors">
      {/* Decorative ambient glows */}
      <div className="absolute -top-24 -right-24 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header bar of filter */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5 sm:mb-6">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white tracking-wide">
            Live Availability &amp; Overlap-Protected Search
          </h2>
        </div>

        {/* Quick Date Presets */}
        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-500 dark:text-slate-400 hidden sm:inline">Presets:</span>
          <button
            type="button"
            onClick={() => setQuickRange(0, 2)}
            className="px-2.5 py-1 rounded-lg bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 text-slate-700 dark:text-slate-300 border border-black/5 dark:border-white/5 transition-colors font-medium"
          >
            Next 2 Days
          </button>
          <button
            type="button"
            onClick={() => setQuickRange(4, 3)}
            className="px-2.5 py-1 rounded-lg bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 text-slate-700 dark:text-slate-300 border border-black/5 dark:border-white/5 transition-colors font-medium"
          >
            Upcoming Weekend
          </button>
          <button
            type="button"
            onClick={() => setShowLogicInfo(!showLogicInfo)}
            className="px-2.5 py-1 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-600 dark:text-indigo-300 border border-indigo-500/20 transition-colors flex items-center gap-1 font-medium"
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Logic Info</span>
          </button>
        </div>
      </div>

      {/* Formula Explanation Banner */}
      {showLogicInfo && (
        <div className="mb-5 p-4 rounded-2xl bg-slate-100 dark:bg-slate-900/90 border border-indigo-500/20 dark:border-indigo-500/30 text-xs text-slate-700 dark:text-slate-300 animate-fadeIn">
          <div className="flex items-start gap-2.5">
            <ShieldAlert className="w-4 h-4 text-indigo-600 dark:text-indigo-400 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-semibold text-indigo-600 dark:text-indigo-300 mb-0.5">
                Atomic Overlap Engine Rule:
              </p>
              <code className="text-[11px] text-emerald-700 dark:text-emerald-400 bg-black/5 dark:bg-black/40 px-2 py-0.5 rounded font-mono block my-1">
                (NewCheckIn &lt; ExistingCheckOut) AND (NewCheckOut &gt; ExistingCheckIn)
              </code>
              <p className="text-slate-500 dark:text-slate-400 text-[11px]">
                Rooms reserved during overlapping active dates are automatically filtered out or marked unavailable to prevent race condition double-bookings.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Form Controls Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Check-in Date */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
            <span>Check-in Date</span>
          </label>
          <input
            type="date"
            value={checkIn}
            onChange={(e) => onCheckInChange(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl glass-input text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        {/* Check-out Date */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
            <span>Check-out Date</span>
          </label>
          <input
            type="date"
            value={checkOut}
            min={checkIn}
            onChange={(e) => onCheckOutChange(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl glass-input text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        {/* Guest Count */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>Guests &amp; Party Size</span>
          </label>
          <select
            value={guestCount}
            onChange={(e) => onGuestCountChange(Number(e.target.value))}
            className="w-full px-3.5 py-2.5 rounded-xl glass-input text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-slate-900"
          >
            <option value={1} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">1 Guest (Solo / Executive)</option>
            <option value={2} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">2 Guests (Couple / Deluxe)</option>
            <option value={3} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">3 Guests (Villa / Trio)</option>
            <option value={4} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">4 Guests (Presidential Suite)</option>
            <option value={5} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">5 Guests (Family Suite)</option>
            <option value={6} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">6+ Guests (Grand Group)</option>
          </select>
        </div>

        {/* Room Category */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
            <span>Room Category</span>
          </label>
          <select
            value={selectedCategory}
            onChange={(e) => onCategoryChange(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl glass-input text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-slate-900"
          >
            <option value="all" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">All Categories</option>
            {roomTypes.map((rt) => (
              <option key={rt.id} value={rt.id} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">
                {rt.title} (₹{rt.basePrice.toLocaleString("en-IN")}/night)
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Bottom filter options & Submit action */}
      <div className="mt-5 pt-4 border-t border-black/5 dark:border-white/5 flex flex-wrap items-center justify-between gap-3">
        <label className="flex items-center gap-2 cursor-pointer text-xs sm:text-sm text-slate-600 dark:text-slate-300 select-none">
          <input
            type="checkbox"
            checked={onlyAvailable}
            onChange={(e) => onOnlyAvailableChange(e.target.checked)}
            className="w-4 h-4 rounded text-indigo-600 bg-white dark:bg-slate-800 border-slate-300 dark:border-white/20 focus:ring-indigo-500"
          />
          <span>Show only instantly available rooms for these dates</span>
        </label>

        <button
          type="button"
          onClick={onSearch}
          className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-emerald-500 hover:from-indigo-500 hover:to-emerald-400 text-white font-semibold text-sm shadow-lg shadow-indigo-600/25 transition-all flex items-center gap-2 active:scale-95"
        >
          <Search className="w-4 h-4" />
          <span>Check Live Availability</span>
        </button>
      </div>
    </div>
  );
}
