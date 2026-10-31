"use client";

import { useState, useEffect } from "react";
import {
  Sparkles,
  ShieldCheck,
  CalendarCheck,
  Search,
  Filter,
  CheckCircle,
  AlertTriangle,
  QrCode,
  Ticket,
  ChevronRight,
  Info,
  ExternalLink,
  Flame,
  Zap,
  TrendingUp,
  Eye,
  Clock,
  MapPin,
  Compass,
} from "lucide-react";
import SearchFilter from "@/components/SearchFilter";
import RoomCard from "@/components/RoomCard";
import BookingModal from "@/components/BookingModal";
import ConfirmationTicket from "@/components/ConfirmationTicket";
import { Room, RoomType, Booking } from "@/lib/types";

export default function GuestPortalPage() {
  const today = new Date().toISOString().split("T")[0];
  const nextTwoDays = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000)
    .toISOString()
    .split("T")[0];

  const [checkIn, setCheckIn] = useState(today);
  const [checkOut, setCheckOut] = useState(nextTwoDays);
  const [guestCount, setGuestCount] = useState(2);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [onlyAvailable, setOnlyAvailable] = useState(false);

  const [rooms, setRooms] = useState<Room[]>([]);
  const [roomTypes, setRoomTypes] = useState<RoomType[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [selectedRoomToBook, setSelectedRoomToBook] = useState<Room | null>(null);

  // My Bookings lookup state
  const [lookupEmail, setLookupEmail] = useState("sophia.chen@techcorp.io");
  const [myBookings, setMyBookings] = useState<Booking[]>([]);
  const [isSearchingBookings, setIsSearchingBookings] = useState(false);
  const [activeTicketBooking, setActiveTicketBooking] = useState<Booking | null>(null);

  // Rotating Social Proof Notifications (realistic OTA cues)
  const socialProofMessages = [
    { text: "Aarav from Mumbai booked Urban Minimalist Studio Loft", time: "2m ago" },
    { text: "Priya from Bengaluru reserved Deluxe Ocean Suite", time: "5m ago" },
    { text: "14 guests are currently browsing Aurora Grand suites", time: "Live" },
    { text: "Dr. Sophia from San Francisco booked Presidential Penthouse", time: "9m ago" },
    { text: "Kabir from New Delhi reserved Botanical Garden Villa", time: "14m ago" },
  ];
  const [currentSocialProofIndex, setCurrentSocialProofIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSocialProofIndex((prev) => (prev + 1) % socialProofMessages.length);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  // Fetch Room Types
  const fetchRoomTypes = async () => {
    try {
      const res = await fetch("/api/room-types");
      const data = await res.json();
      if (Array.isArray(data)) {
        setRoomTypes(data);
      }
    } catch (err) {
      console.error("Error fetching room types:", err);
    }
  };

  // Fetch Rooms with Overlap Logic & Yield Scarcity
  const fetchRooms = async (hitTypeId?: string) => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        checkIn,
        checkOut,
        roomTypeId: selectedCategory,
        guestCount: guestCount.toString(),
        onlyAvailable: onlyAvailable ? "true" : "false",
        viewMode: "client", // Triggers client-side scarcity throttling
      });

      if (hitTypeId) {
        params.append("hitRoomType", hitTypeId);
      }

      const res = await fetch(`/api/rooms?${params.toString()}`);
      const data = await res.json();
      if (Array.isArray(data)) {
        setRooms(data);
      }
    } catch (err) {
      console.error("Error fetching rooms:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Lookup Guest Bookings
  const handleLookupBookings = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!lookupEmail.trim()) return;

    setIsSearchingBookings(true);
    try {
      const res = await fetch(`/api/bookings?email=${encodeURIComponent(lookupEmail.trim())}`);
      const data = await res.json();
      if (Array.isArray(data)) {
        setMyBookings(data);
      }
    } catch (err) {
      console.error("Error searching bookings:", err);
    } finally {
      setIsSearchingBookings(false);
    }
  };

  // Cancel Booking
  const handleCancelBooking = async (bookingId: string) => {
    if (!confirm("Are you sure you want to cancel this booking?")) return;

    try {
      const res = await fetch(`/api/bookings/${bookingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "cancelled" }),
      });

      if (res.ok) {
        alert("Booking cancelled successfully.");
        handleLookupBookings();
        fetchRooms();
      } else {
        const data = await res.json();
        alert("Error: " + data.error);
      }
    } catch (err: any) {
      alert("Error: " + err.message);
    }
  };

  useEffect(() => {
    fetchRoomTypes();
  }, []);

  useEffect(() => {
    fetchRooms();
  }, [checkIn, checkOut, selectedCategory, guestCount, onlyAvailable]);

  // Initial lookup of demo guest bookings
  useEffect(() => {
    handleLookupBookings();
  }, []);

  const anyRoomSurged = rooms.some((r) => r.demandInfo?.isHighDemand);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10 relative">
      {/* Floating OTA Social Proof Toast */}
      <div className="fixed bottom-5 right-5 z-40 max-w-sm hidden sm:flex items-center gap-3 p-3.5 rounded-2xl glass-panel border border-black/10 dark:border-indigo-500/30 shadow-2xl text-xs text-slate-800 dark:text-white animate-fadeIn">
        <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-500 flex items-center justify-center flex-shrink-0 text-white font-bold">
          <Flame className="w-4 h-4 fill-white" />
        </div>
        <div className="space-y-0.5">
          <p className="font-semibold line-clamp-1">
            {socialProofMessages[currentSocialProofIndex].text}
          </p>
          <span className="text-[10px] text-amber-600 dark:text-amber-300 font-mono font-medium">
            {socialProofMessages[currentSocialProofIndex].time}
          </span>
        </div>
      </div>

      {/* Believable Demand & Urgency Notice Ribbon */}
      <div className="p-3.5 sm:p-4 rounded-2xl bg-gradient-to-r from-amber-500/10 via-indigo-500/10 to-emerald-500/10 border border-amber-500/20 dark:border-amber-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2.5">
          <span className="p-1.5 rounded-xl bg-amber-500/20 text-amber-700 dark:text-amber-400">
            <Zap className="w-4 h-4" />
          </span>
          <div>
            <span className="font-bold text-amber-800 dark:text-amber-300 text-sm block sm:inline mr-2">
              Popular Travel Dates!
            </span>
            <span className="text-slate-700 dark:text-slate-300">
              Entry studio &amp; ocean suites are experiencing high demand for your selected window.
            </span>
          </div>
        </div>

        {anyRoomSurged && (
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/15 border border-rose-500/30 text-rose-700 dark:text-rose-300 font-bold text-[11px] self-start sm:self-auto">
            <Flame className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400 animate-pulse" />
            <span>High Demand Surge Active</span>
          </div>
        )}
      </div>

      {/* Hero Section */}
      <div className="relative rounded-3xl overflow-hidden p-8 sm:p-12 lg:p-16 border border-black/5 dark:border-white/10 glass-panel shadow-2xl">
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-900/10 via-slate-900/5 to-slate-900/10 dark:from-indigo-900/60 dark:via-slate-900/80 dark:to-slate-950/90 -z-10" />
        <div className="max-w-3xl space-y-5">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/20 text-indigo-700 dark:text-indigo-300 text-xs font-semibold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
            <span>Grand Opening Season · Guaranteed Zero Overlap · Prices in ₹ INR</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
            Curated Sanctuary,{" "}
            <span className="bg-gradient-to-r from-indigo-600 via-emerald-600 to-teal-500 dark:from-indigo-400 dark:via-emerald-300 dark:to-teal-200 bg-clip-text text-transparent">
              Dynamic Rates.
            </span>
          </h1>

          <p className="text-slate-600 dark:text-slate-300 text-sm sm:text-base max-w-2xl leading-relaxed">
            Experience world-class oceanfront suites, private botanical villas, and presidential penthouses.
            Protected by pessimistic database transaction locks with real-time dynamic demand yield optimization.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <div className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300 bg-black/5 dark:bg-white/5 px-3 py-1.5 rounded-xl border border-black/5 dark:border-white/5">
              <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>Atomic Transaction Locks</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300 bg-black/5 dark:bg-white/5 px-3 py-1.5 rounded-xl border border-black/5 dark:border-white/5">
              <QrCode className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <span>Instant QR Boarding Passes</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300 bg-black/5 dark:bg-white/5 px-3 py-1.5 rounded-xl border border-black/5 dark:border-white/5">
              <Flame className="w-4 h-4 text-amber-500" />
              <span>Demand-Weighted Tariffs</span>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Search & Filter Component */}
      <SearchFilter
        checkIn={checkIn}
        checkOut={checkOut}
        guestCount={guestCount}
        selectedCategory={selectedCategory}
        onlyAvailable={onlyAvailable}
        roomTypes={roomTypes}
        onCheckInChange={setCheckIn}
        onCheckOutChange={setCheckOut}
        onGuestCountChange={setGuestCount}
        onCategoryChange={setSelectedCategory}
        onOnlyAvailableChange={setOnlyAvailable}
        onSearch={() => fetchRooms(selectedCategory !== "all" ? selectedCategory : undefined)}
      />

      {/* Room Catalog Section */}
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2.5">
              <span>Available Suites &amp; Accommodations</span>
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-indigo-50 dark:bg-amber-500/20 text-indigo-700 dark:text-amber-300 border border-indigo-200 dark:border-amber-500/30">
                {rooms.filter((r) => r.isAvailableForDates && r.status === "available").length} Suites Released
              </span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Live status computed for stay window: <span className="text-emerald-600 dark:text-emerald-400 font-mono font-semibold">{checkIn}</span> to <span className="text-indigo-600 dark:text-indigo-400 font-mono font-semibold">{checkOut}</span>
            </p>
          </div>

          <div className="flex items-center gap-3 text-xs font-medium">
            <span className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-300">
              <span className="w-2 h-2 rounded-full bg-emerald-500 pulse-available" />
              <span>{rooms.filter((r) => r.isAvailableForDates && r.status === "available").length} Available</span>
            </span>
            <span className="flex items-center gap-1.5 text-rose-700 dark:text-rose-300">
              <span className="w-2 h-2 rounded-full bg-rose-500" />
              <span>{rooms.filter((r) => !r.isAvailableForDates || r.status !== "available").length} Reserved for Dates</span>
            </span>
          </div>
        </div>

        {/* Loading / Empty / Grid states */}
        {isLoading ? (
          <div className="py-20 text-center glass-panel rounded-3xl">
            <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-sm text-slate-500 dark:text-slate-400">Verifying live inventory, demand surge &amp; date overlaps...</p>
          </div>
        ) : rooms.length === 0 ? (
          <div className="py-16 text-center glass-panel rounded-3xl p-8">
            <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">No rooms matched your criteria</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto mt-1 mb-4">
              Try adjusting your guest count, removing the &quot;Available Only&quot; filter, or selecting different check-in dates.
            </p>
            <button
              onClick={() => {
                setSelectedCategory("all");
                setOnlyAvailable(false);
              }}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white transition-colors"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {rooms.map((room) => (
              <RoomCard
                key={room.id}
                room={room}
                checkIn={checkIn}
                checkOut={checkOut}
                onBook={(r) => {
                  fetchRooms(r.roomTypeId); // Record hit!
                  setSelectedRoomToBook(r);
                }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Guest Reservations & Digital Tickets Portal */}
      <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-black/5 dark:border-white/10 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-black/5 dark:border-white/10">
          <div>
            <div className="flex items-center gap-2">
              <Ticket className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">My Reservations &amp; QR Vouchers</h3>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Lookup existing reservations to view confirmation vouchers in ₹ INR, QR check-in passes, or manage cancellations.
            </p>
          </div>

          {/* Quick Lookup Form */}
          <form onSubmit={handleLookupBookings} className="flex gap-2">
            <input
              type="email"
              value={lookupEmail}
              onChange={(e) => setLookupEmail(e.target.value)}
              placeholder="Enter guest email..."
              className="px-3.5 py-2 rounded-xl glass-input text-xs sm:text-sm text-slate-900 dark:text-white w-56 sm:w-64"
            />
            <button
              type="submit"
              disabled={isSearchingBookings}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white transition-colors flex items-center gap-1.5"
            >
              <Search className="w-3.5 h-3.5" />
              <span>{isSearchingBookings ? "Searching..." : "Lookup"}</span>
            </button>
          </form>
        </div>

        {/* Existing Bookings List */}
        {myBookings.length === 0 ? (
          <div className="text-center py-8 text-xs text-slate-500 dark:text-slate-400">
            No bookings found for {lookupEmail}. Try booking a suite above or search with another email (e.g. <code className="text-indigo-600 dark:text-indigo-400">aarav.sharma@gmail.com</code>).
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {myBookings.map((b) => (
              <div
                key={b.id}
                className="p-4 rounded-2xl bg-slate-50 dark:bg-white/5 border border-black/5 dark:border-white/10 flex flex-col justify-between space-y-3"
              >
                <div>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-mono text-indigo-600 dark:text-indigo-400 font-bold">
                      #{b.id.slice(0, 8).toUpperCase()}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase ${
                        b.status === "confirmed"
                          ? "bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30"
                          : "bg-rose-500/20 text-rose-700 dark:text-rose-400 border border-rose-500/30"
                      }`}
                    >
                      {b.status}
                    </span>
                  </div>

                  <h4 className="font-bold text-slate-900 dark:text-white text-sm">
                    {b.room?.roomType?.title || "Suite"} · Room {b.room?.roomNumber}
                  </h4>

                  <div className="text-xs text-slate-500 dark:text-slate-400 mt-2 space-y-1">
                    <div>
                      <span>Dates: </span>
                      <span className="text-slate-900 dark:text-white font-medium">
                        {b.checkInDate} → {b.checkOutDate}
                      </span>
                    </div>
                    <div>
                      <span>Total Paid: </span>
                      <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                        ₹{b.totalAmount.toLocaleString("en-IN")}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-black/5 dark:border-white/5 flex gap-2">
                  <button
                    onClick={() => setActiveTicketBooking(b)}
                    className="flex-1 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-600/30 dark:hover:bg-indigo-600/50 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-500/30 text-xs font-semibold transition-colors flex items-center justify-center gap-1.5"
                  >
                    <QrCode className="w-3.5 h-3.5" />
                    <span>View Pass &amp; QR</span>
                  </button>

                  {b.status === "confirmed" && (
                    <button
                      onClick={() => handleCancelBooking(b.id)}
                      className="px-3 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 dark:bg-rose-500/20 dark:hover:bg-rose-500/30 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-500/30 text-xs font-semibold transition-colors"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Booking Reservation Modal */}
      {selectedRoomToBook && (
        <BookingModal
          room={selectedRoomToBook}
          checkIn={checkIn}
          checkOut={checkOut}
          onClose={() => setSelectedRoomToBook(null)}
          onBookingSuccess={() => {
            fetchRooms();
            handleLookupBookings();
          }}
        />
      )}

      {/* Standalone Digital Boarding Pass Modal */}
      {activeTicketBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-2xl relative">
            <ConfirmationTicket
              booking={activeTicketBooking}
              onClose={() => setActiveTicketBooking(null)}
            />
          </div>
        </div>
      )}
    </div>
  );
}
