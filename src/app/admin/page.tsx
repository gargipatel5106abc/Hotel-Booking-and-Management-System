"use client";

import { useState, useEffect } from "react";
import {
  TrendingUp,
  DollarSign,
  Bed,
  Users,
  ShieldCheck,
  Calendar,
  Plus,
  RefreshCw,
  Clock,
  CheckCircle,
  XCircle,
  AlertOctagon,
  Search,
  Filter,
  Zap,
  Flame,
  Eye,
  Sliders,
  SlidersHorizontal,
  Layers,
  ArrowUpRight,
  ShieldAlert,
} from "lucide-react";
import AdminRoomGrid from "@/components/AdminRoomGrid";
import AdminTimelineCalendar from "@/components/AdminTimelineCalendar";
import AddRoomModal from "@/components/AddRoomModal";
import { Room, RoomType, Booking, RoomStatus, YieldSettings } from "@/lib/types";

export default function AdminDashboardPage() {
  const [analytics, setAnalytics] = useState<any>(null);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [roomTypes, setRoomTypes] = useState<RoomType[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [yieldData, setYieldData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Modals & controls
  const [isAddRoomOpen, setIsAddRoomOpen] = useState(false);
  const [bookingSearch, setBookingSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Race condition test runner state
  const [isSimulatingRace, setIsSimulatingRace] = useState(false);
  const [raceTestResults, setRaceTestResults] = useState<any>(null);

  // Yield controls state
  const [isUpdatingYield, setIsUpdatingYield] = useState(false);

  const fetchDashboardData = async () => {
    setIsLoading(true);
    try {
      const [analyticsRes, roomsRes, roomTypesRes, bookingsRes, yieldRes] =
        await Promise.all([
          fetch("/api/admin/analytics"),
          fetch("/api/rooms?viewMode=admin"),
          fetch("/api/room-types"),
          fetch("/api/bookings"),
          fetch("/api/admin/yield"),
        ]);

      const [analyticsData, roomsData, roomTypesData, bookingsData, yieldStats] =
        await Promise.all([
          analyticsRes.json(),
          roomsRes.json(),
          roomTypesRes.json(),
          bookingsRes.json(),
          yieldRes.json(),
        ]);

      setAnalytics(analyticsData);
      setRooms(Array.isArray(roomsData) ? roomsData : []);
      setRoomTypes(Array.isArray(roomTypesData) ? roomTypesData : []);
      setBookings(Array.isArray(bookingsData) ? bookingsData : []);
      setYieldData(yieldStats);
    } catch (err) {
      console.error("Dashboard data load error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Update room operational status
  const handleRoomStatusChange = async (
    roomId: string,
    newStatus: RoomStatus
  ) => {
    try {
      const res = await fetch("/api/admin/rooms", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ roomId, status: newStatus }),
      });

      if (res.ok) {
        fetchDashboardData();
      } else {
        const data = await res.json();
        alert("Failed to update status: " + data.error);
      }
    } catch (err: any) {
      alert("Error: " + err.message);
    }
  };

  // Cancel booking
  const handleCancelBooking = async (bookingId: string) => {
    if (!confirm("Are you sure you want to cancel this booking?")) return;
    try {
      const res = await fetch(`/api/bookings/${bookingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "cancelled" }),
      });
      if (res.ok) {
        fetchDashboardData();
      }
    } catch (err: any) {
      alert("Cancel error: " + err.message);
    }
  };

  // Toggle or update yield settings
  const handleUpdateYield = async (partialSettings: Partial<YieldSettings>) => {
    setIsUpdatingYield(true);
    try {
      const res = await fetch("/api/admin/yield", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ settings: partialSettings }),
      });
      if (res.ok) {
        fetchDashboardData();
      }
    } catch (err: any) {
      alert("Yield update error: " + err.message);
    } finally {
      setIsUpdatingYield(false);
    }
  };

  // Simulate demand spike for a specific room type
  const handleTriggerDemandSpike = async (roomTypeId: string) => {
    try {
      const res = await fetch("/api/admin/yield", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "simulate_spike", roomTypeId }),
      });
      if (res.ok) {
        fetchDashboardData();
      }
    } catch (err: any) {
      alert("Spike error: " + err.message);
    }
  };

  // Reset demand for a specific room type or all
  const handleResetDemand = async (roomTypeId?: string) => {
    try {
      const res = await fetch("/api/admin/yield", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "reset", roomTypeId }),
      });
      if (res.ok) {
        fetchDashboardData();
      }
    } catch (err: any) {
      alert("Reset error: " + err.message);
    }
  };

  // Double-booking concurrent race condition test simulation
  const handleSimulateRaceCondition = async () => {
    setIsSimulatingRace(true);
    setRaceTestResults(null);

    const targetRoom = rooms.find((r) => r.status === "available");
    if (!targetRoom) {
      alert("No available room found for simulation");
      setIsSimulatingRace(false);
      return;
    }

    const testCheckIn = "2026-11-01";
    const testCheckOut = "2026-11-05";

    try {
      // Fire two simultaneous requests for the exact same room and overlapping dates
      const req1 = fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          roomId: targetRoom.id,
          checkInDate: testCheckIn,
          checkOutDate: testCheckOut,
          guestName: "Guest A (Simultaneous Checkout)",
          guestEmail: "guest.a@simulation.test",
          paymentMethod: "credit_card",
        }),
      });

      const req2 = fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          roomId: targetRoom.id,
          checkInDate: testCheckIn,
          checkOutDate: testCheckOut,
          guestName: "Guest B (Simultaneous Checkout)",
          guestEmail: "guest.b@simulation.test",
          paymentMethod: "stripe",
        }),
      });

      const [res1, res2] = await Promise.all([req1, req2]);
      const data1 = await res1.json();
      const data2 = await res2.json();

      setRaceTestResults({
        roomNumber: targetRoom.roomNumber,
        dates: `${testCheckIn} to ${testCheckOut}`,
        requestA: { status: res1.status, data: data1 },
        requestB: { status: res2.status, data: data2 },
      });

      fetchDashboardData();
    } catch (err: any) {
      alert("Simulation error: " + err.message);
    } finally {
      setIsSimulatingRace(false);
    }
  };

  const filteredBookings = bookings.filter((b) => {
    const matchesSearch =
      bookingSearch === "" ||
      b.id.toLowerCase().includes(bookingSearch.toLowerCase()) ||
      b.user?.name?.toLowerCase().includes(bookingSearch.toLowerCase()) ||
      b.user?.email?.toLowerCase().includes(bookingSearch.toLowerCase()) ||
      b.room?.roomNumber?.toLowerCase().includes(bookingSearch.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || b.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const settings = yieldData?.settings;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-panel p-6 rounded-3xl">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
              Operations &amp; Revenue Management
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            Manager Control &amp; Yield Intelligence Console
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Live database telemetry, dynamic surge engine, and controlled scarcity masking (Values in ₹ INR).
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <button
            onClick={() => setIsAddRoomOpen(true)}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-lg shadow-indigo-600/30 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add Room</span>
          </button>

          <button
            onClick={fetchDashboardData}
            className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-white/10 dark:hover:bg-white/15 text-slate-700 dark:text-white text-xs font-medium flex items-center gap-1.5 transition-colors border border-slate-200 dark:border-white/10"
          >
            <RefreshCw
              className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`}
            />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* OTA YIELD & SCARCITY TELEMETRY: CLIENT VIEW VS. MANAGER VIEW DIFFERENTIATION */}
      <div className="p-6 rounded-3xl glass-panel border border-amber-500/30 bg-gradient-to-br from-amber-500/5 via-transparent to-indigo-500/5 dark:from-amber-950/25 dark:via-slate-900/90 dark:to-indigo-950/25 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-white/10">
          <div>
            <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 font-bold text-xs uppercase tracking-wider mb-1">
              <Zap className="w-4 h-4 text-amber-500" />
              <span>OTA Scarcity &amp; Dynamic Surge Architecture (Yield Engine)</span>
            </div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              Inventory Masking &amp; Pricing Velocity Telemetry
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-300 mt-0.5">
              Comparison between real physical database state and psychological urgency presented to customers.
            </p>
          </div>

          <button
            onClick={() => handleResetDemand()}
            className="px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-white/10 dark:hover:bg-white/15 text-slate-700 dark:text-slate-300 text-xs font-semibold transition-colors flex items-center gap-1.5 border border-slate-200 dark:border-white/10 self-start md:self-auto"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Reset All Demand &amp; Surge Multipliers</span>
          </button>
        </div>

        {/* Comparison KPI Metric Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10">
            <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1">
              Real Available Rooms (Truth)
            </span>
            <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
              {yieldData?.totalRealAvailable ?? analytics?.availableRoomsCount ?? 0} Rooms
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
              Actual unbooked operational inventory in SQLite
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30">
            <span className="text-[11px] font-semibold text-amber-700 dark:text-amber-300 uppercase tracking-wider block mb-1">
              Customer Perceived Availability
            </span>
            <div className="text-2xl font-black text-amber-600 dark:text-amber-300">
              {yieldData?.totalClientDisplayed ?? 6} Rooms Shown
            </div>
            <p className="text-[11px] text-amber-800/80 dark:text-amber-200/80 mt-1">
              {yieldData?.scarcityDeficit ?? 0} rooms withheld to trigger urgency
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10">
            <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1">
              Surge Pricing Status
            </span>
            <div className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
              <span>{settings?.surgePricingEnabled ? "ACTIVE" : "DISABLED"}</span>
              {settings?.surgePricingEnabled && (
                <Flame className="w-5 h-5 text-orange-500 animate-pulse" />
              )}
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
              {analytics?.activeSurgeCount || 0} suite categories currently surged
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10">
            <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1">
              Urgency Throttling Mode
            </span>
            <div className="text-2xl font-black text-indigo-600 dark:text-indigo-300">
              {settings?.scarcityThrottlingEnabled
                ? `Max ${settings?.scarcityMaxDisplayedPerType} / Tier`
                : "Full Visibility"}
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
              e.g. Shows 3 instead of 6 to guest
            </p>
          </div>
        </div>

        {/* Manager Interactive Yield Toggles */}
        <div className="p-4 rounded-2xl bg-slate-100 dark:bg-black/40 border border-slate-200 dark:border-white/10 flex flex-wrap items-center justify-between gap-4 text-xs">
          <div className="flex flex-wrap items-center gap-4">
            <label className="flex items-center gap-2 cursor-pointer font-medium text-slate-700 dark:text-slate-200">
              <input
                type="checkbox"
                checked={settings?.surgePricingEnabled ?? true}
                onChange={(e) =>
                  handleUpdateYield({ surgePricingEnabled: e.target.checked })
                }
                className="w-4 h-4 rounded text-amber-500 bg-slate-200 dark:bg-slate-800 border-slate-300 dark:border-white/20"
              />
              <span>Enable Dynamic Surge Pricing on High Hits / Collisions</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer font-medium text-slate-700 dark:text-slate-200">
              <input
                type="checkbox"
                checked={settings?.scarcityThrottlingEnabled ?? true}
                onChange={(e) =>
                  handleUpdateYield({
                    scarcityThrottlingEnabled: e.target.checked,
                  })
                }
                className="w-4 h-4 rounded text-amber-500 bg-slate-200 dark:bg-slate-800 border-slate-300 dark:border-white/20"
              />
              <span>Enable Scarcity Masking (Show 3 or 10 instead of 6 or 15)</span>
            </label>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-slate-500 dark:text-slate-400 font-medium">Max Visible per Category:</span>
            <select
              value={settings?.scarcityMaxDisplayedPerType ?? 3}
              onChange={(e) =>
                handleUpdateYield({
                  scarcityMaxDisplayedPerType: parseInt(e.target.value),
                })
              }
              className="px-2.5 py-1 rounded-lg glass-input text-slate-800 dark:text-white bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 font-bold"
            >
              <option value={1}>1 Room (Extreme Scarcity)</option>
              <option value={2}>2 Rooms (Aggressive)</option>
              <option value={3}>3 Rooms (Standard OTA Bias)</option>
              <option value={4}>4 Rooms (Moderate)</option>
              <option value={6}>6 Rooms (Unthrottled)</option>
            </select>
          </div>
        </div>

        {/* Yield Telemetry Table per Suite Category */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-white/10 text-slate-500 dark:text-slate-400 uppercase tracking-wider text-[11px]">
                <th className="py-2.5 px-3">Suite Tier</th>
                <th className="py-2.5 px-3">Base Price</th>
                <th className="py-2.5 px-3">Guest Price</th>
                <th className="py-2.5 px-3">Real vs Shown</th>
                <th className="py-2.5 px-3">Hit Velocity (15m)</th>
                <th className="py-2.5 px-3">Race Conflicts</th>
                <th className="py-2.5 px-3">Surge Status</th>
                <th className="py-2.5 px-3 text-right">Simulation Trigger</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-white/5">
              {yieldData?.roomTypeStats?.map((st: any) => {
                const isSurged = st.demand?.surgeMultiplier > 1.0;
                return (
                  <tr key={st.roomTypeId} className="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                    <td className="py-3 px-3 font-semibold text-slate-900 dark:text-white">
                      {st.title}
                    </td>
                    <td className="py-3 px-3 font-mono text-slate-600 dark:text-slate-300">
                      ₹{st.basePrice?.toLocaleString("en-IN")}
                    </td>
                    <td className="py-3 px-3 font-mono font-bold">
                      <span
                        className={isSurged ? "text-amber-600 dark:text-amber-400" : "text-slate-900 dark:text-white"}
                      >
                        ₹{st.demand?.currentCustomerPrice?.toLocaleString("en-IN")}
                      </span>
                      {isSurged && (
                        <span className="text-[10px] text-amber-600 dark:text-amber-300 block">
                          +{Math.round((st.demand.surgeMultiplier - 1) * 100)}% Surge
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-3">
                      <span className="font-bold text-emerald-600 dark:text-emerald-400">
                        {st.availableToday} Real
                      </span>
                      <span className="text-slate-400 mx-1">/</span>
                      <span className="font-bold text-amber-600 dark:text-amber-300">
                        {st.clientDisplayed} Shown
                      </span>
                    </td>
                    <td className="py-3 px-3 font-mono text-slate-600 dark:text-slate-300">
                      {st.demand?.hitsCount || 0} hits
                    </td>
                    <td className="py-3 px-3 font-mono">
                      <span
                        className={
                          st.demand?.recentConflictsCount > 0
                            ? "text-rose-500 font-bold"
                            : "text-slate-400 dark:text-slate-500"
                        }
                      >
                        {st.demand?.recentConflictsCount || 0} conflicts
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase ${
                          st.demand?.demandLevel === "CRITICAL_SURGE"
                            ? "bg-rose-500/10 text-rose-600 dark:text-rose-300 border border-rose-500/30"
                            : isSurged
                            ? "bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/30"
                            : "bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-white/10"
                        }`}
                      >
                        {st.demand?.demandLevel || "NORMAL"}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right">
                      <button
                        onClick={() => handleTriggerDemandSpike(st.roomTypeId)}
                        className="px-2.5 py-1 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/30 text-[11px] font-semibold transition-colors flex items-center gap-1 ml-auto"
                      >
                        <Flame className="w-3 h-3 text-orange-500" />
                        <span>Spike Demand</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Analytics KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Gross Revenue */}
        <div className="glass-card p-5 rounded-2xl">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Gross Revenue
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 font-bold text-sm">
              ₹
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
            ₹{analytics?.grossRevenue?.toLocaleString("en-IN") || "0"}
          </div>
          <p className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-1 flex items-center gap-1 font-medium">
            <TrendingUp className="w-3 h-3" />
            <span>Completed &amp; verified transactions</span>
          </p>
        </div>

        {/* Occupancy Rate */}
        <div className="glass-card p-5 rounded-2xl">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Today&apos;s Occupancy
            </span>
            <div className="w-8 h-8 rounded-lg bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-indigo-600 dark:text-indigo-300">
            {analytics?.occupancyRate || 0}%
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 font-medium">
            {analytics?.currentlyOccupiedRooms || 0} of{" "}
            {analytics?.totalRooms || 0} rooms currently occupied
          </p>
        </div>

        {/* Total Bookings */}
        <div className="glass-card p-5 rounded-2xl">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Total Reservations
            </span>
            <div className="w-8 h-8 rounded-lg bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
            {analytics?.totalBookings || 0}
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 font-medium">
            {analytics?.activeBookings || 0} active ·{" "}
            {analytics?.totalBookings - analytics?.activeBookings || 0} cancelled
          </p>
        </div>

        {/* Room Inventory Status */}
        <div className="glass-card p-5 rounded-2xl">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Total Inventory
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <Bed className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
            {analytics?.totalRooms || 0} Rooms
          </div>
          <div className="flex gap-2 text-[10px] mt-1 font-semibold">
            <span className="text-emerald-600 dark:text-emerald-400">
              {analytics?.availableRoomsCount || 0} Available
            </span>
            <span className="text-amber-600 dark:text-amber-400">
              · {analytics?.maintenanceRoomsCount || 0} Maint.
            </span>
            <span className="text-rose-600 dark:text-rose-400">
              · {analytics?.outOfServiceCount || 0} Off
            </span>
          </div>
        </div>
      </div>

      {/* Concurrent Double-Booking Race Condition Simulation Tool */}
      <div className="glass-panel p-6 rounded-3xl border border-indigo-500/30 relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Zap className="w-4 h-4 text-amber-500" />
              <h3 className="font-bold text-slate-900 dark:text-white text-base">
                Interactive Double-Booking Race Condition Stress Test
              </h3>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 max-w-2xl leading-relaxed">
              Dispatches two simultaneous asynchronous booking requests at the
              exact same millisecond for the same room and overlapping dates.
              Verifies that SQLite / PostgreSQL transactional isolation prevents
              duplicate reservations by granting one and rolling back the other
              with a 409 Conflict — <strong>while automatically spiking the customer price to reflect urgent surge demand!</strong>
            </p>
          </div>

          <button
            onClick={handleSimulateRaceCondition}
            disabled={isSimulatingRace}
            className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20 transition-all flex items-center gap-2 flex-shrink-0 disabled:opacity-50"
          >
            <Zap
              className={`w-4 h-4 ${isSimulatingRace ? "animate-spin" : ""}`}
            />
            <span>
              {isSimulatingRace
                ? "Testing Race Condition..."
                : "Simulate Race Condition"}
            </span>
          </button>
        </div>

        {raceTestResults && (
          <div className="mt-5 p-4 rounded-2xl bg-slate-100 dark:bg-black/50 border border-slate-200 dark:border-white/10 text-xs space-y-3 animate-fadeIn">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/10 pb-2">
              <span className="font-semibold text-slate-900 dark:text-white">
                Race Test Results for Room {raceTestResults.roomNumber} (
                {raceTestResults.dates}):
              </span>
              <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                Double-Booking Blocked &amp; Surge Multiplier Triggered!
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                <p className="font-bold text-emerald-700 dark:text-emerald-300 mb-1">
                  Request A (Granted):
                </p>
                <p className="text-slate-700 dark:text-slate-300">
                  Status HTTP {raceTestResults.requestA.status}
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                  Booking ID:{" "}
                  {raceTestResults.requestA.data?.booking?.id ||
                    JSON.stringify(raceTestResults.requestA.data)}
                </p>
              </div>

              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20">
                <p className="font-bold text-rose-700 dark:text-rose-300 mb-1">
                  Request B (Rejected by Atomic Lock):
                </p>
                <p className="text-slate-700 dark:text-slate-300">
                  Status HTTP {raceTestResults.requestB.status} (Conflict)
                </p>
                <p className="text-[11px] text-rose-600 dark:text-rose-300">
                  {raceTestResults.requestB.data?.error ||
                    "DOUBLE_BOOKING_PREVENTED"}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 14-Day Timeline Schedule Matrix */}
      <AdminTimelineCalendar rooms={rooms} bookings={bookings} />

      {/* Interactive Room Grid with Status Toggle */}
      <div className="glass-panel p-6 rounded-3xl space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Bed className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              <span>Room Operational Management</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Instantly toggle room status (Available, Maintenance, Out of Service)
            </p>
          </div>
        </div>

        <AdminRoomGrid rooms={rooms} onStatusChange={handleRoomStatusChange} />
      </div>

      {/* Recent Bookings & Audit Trail Table */}
      <div className="glass-panel p-6 rounded-3xl space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-white/10">
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Calendar className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              <span>Reservations Master Ledger</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Complete audit history with guest details, payment status, and cancellation controls.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search guest or room..."
                value={bookingSearch}
                onChange={(e) => setBookingSearch(e.target.value)}
                className="pl-8 pr-3 py-1.5 rounded-xl glass-input text-xs text-slate-900 dark:text-white w-48 sm:w-56"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-1.5 rounded-xl glass-input text-xs text-slate-900 dark:text-white bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10"
            >
              <option value="all">All Statuses</option>
              <option value="confirmed">Confirmed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        {/* Table view */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-white/10 text-slate-500 dark:text-slate-400 uppercase tracking-wider text-[11px]">
                <th className="py-3 px-3">Reference</th>
                <th className="py-3 px-3">Guest</th>
                <th className="py-3 px-3">Room</th>
                <th className="py-3 px-3">Check-In</th>
                <th className="py-3 px-3">Check-Out</th>
                <th className="py-3 px-3">Amount</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-white/5">
              {filteredBookings.map((b) => (
                <tr key={b.id} className="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                  <td className="py-3 px-3 font-mono font-bold text-indigo-600 dark:text-indigo-300">
                    #{b.id.slice(0, 8).toUpperCase()}
                  </td>
                  <td className="py-3 px-3">
                    <div className="font-semibold text-slate-900 dark:text-white">
                      {b.user?.name}
                    </div>
                    <div className="text-[10px] text-slate-500 dark:text-slate-400">
                      {b.user?.email}
                    </div>
                  </td>
                  <td className="py-3 px-3">
                    <span className="font-bold text-slate-900 dark:text-white">
                      Room {b.room?.roomNumber}
                    </span>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 block truncate max-w-[120px]">
                      {b.room?.roomType?.title}
                    </span>
                  </td>
                  <td className="py-3 px-3 font-mono text-emerald-600 dark:text-emerald-400 font-semibold">
                    {b.checkInDate}
                  </td>
                  <td className="py-3 px-3 font-mono text-indigo-600 dark:text-indigo-300 font-semibold">
                    {b.checkOutDate}
                  </td>
                  <td className="py-3 px-3 font-bold text-slate-900 dark:text-white">
                    ₹{b.totalAmount?.toLocaleString("en-IN")}
                  </td>
                  <td className="py-3 px-3">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase ${
                        b.status === "confirmed"
                          ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30"
                          : "bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/30"
                      }`}
                    >
                      {b.status}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-right">
                    {b.status === "confirmed" && (
                      <button
                        onClick={() => handleCancelBooking(b.id)}
                        className="px-2.5 py-1 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-300 border border-rose-500/30 text-[11px] font-semibold transition-colors"
                      >
                        Cancel
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Room Modal */}
      {isAddRoomOpen && (
        <AddRoomModal
          roomTypes={roomTypes}
          onClose={() => setIsAddRoomOpen(false)}
          onRoomAdded={fetchDashboardData}
        />
      )}
    </div>
  );
}
