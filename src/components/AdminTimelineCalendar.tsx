"use client";

import { useMemo } from "react";
import { format, addDays, parseISO, isWithinInterval } from "date-fns";
import { Room, Booking } from "@/lib/types";
import { Calendar, ChevronLeft, ChevronRight, Info } from "lucide-react";

interface AdminTimelineCalendarProps {
  rooms: Room[];
  bookings: Booking[];
}

export default function AdminTimelineCalendar({
  rooms,
  bookings,
}: AdminTimelineCalendarProps) {
  // Generate a 14-day timeline window starting from 2 days ago
  const days = useMemo(() => {
    const list = [];
    const today = new Date();
    const startDate = new Date(today);
    startDate.setDate(today.getDate() - 2);

    for (let i = 0; i < 14; i++) {
      const d = new Date(startDate);
      d.setDate(startDate.getDate() + i);
      list.push(d.toISOString().split("T")[0]);
    }
    return list;
  }, []);

  const todayStr = new Date().toISOString().split("T")[0];

  return (
    <div className="glass-panel rounded-2xl p-4 sm:p-6 border border-white/10 shadow-2xl overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-indigo-400" />
          <h3 className="font-bold text-white text-base">
            14-Day Room Occupancy &amp; Schedule Matrix
          </h3>
        </div>

        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-indigo-600/80 border border-indigo-400/50" />
            <span className="text-slate-300">Confirmed Booking</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-emerald-500/20 border border-emerald-500/40" />
            <span className="text-slate-300">Available</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-amber-500/30 border border-amber-500/50" />
            <span className="text-slate-300">Maintenance</span>
          </div>
        </div>
      </div>

      {/* Matrix Table */}
      <div className="overflow-x-auto pb-2">
        <table className="w-full border-collapse min-w-[850px] text-xs">
          <thead>
            <tr>
              <th className="sticky left-0 z-20 bg-slate-900/95 p-2.5 text-left text-slate-400 font-semibold border-b border-r border-white/10 w-28">
                Room
              </th>
              {days.map((dateStr) => {
                const isToday = dateStr === todayStr;
                const d = parseISO(dateStr);
                return (
                  <th
                    key={dateStr}
                    className={`p-2 text-center border-b border-white/10 font-medium ${
                      isToday
                        ? "bg-indigo-600/20 text-indigo-300 font-bold border-t-2 border-t-indigo-500"
                        : "text-slate-400"
                    }`}
                  >
                    <div>{format(d, "EEE")}</div>
                    <div className="text-[11px] text-slate-300 font-mono">
                      {format(d, "dd MMM")}
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {rooms.map((room) => (
              <tr key={room.id} className="hover:bg-white/5 transition-colors">
                {/* Room column */}
                <td className="sticky left-0 z-10 bg-slate-900/95 p-2 font-mono font-bold text-white border-b border-r border-white/10">
                  <div className="flex items-center justify-between">
                    <span>{room.roomNumber}</span>
                    <span className="text-[10px] text-slate-400 font-sans font-normal truncate max-w-[60px]">
                      {room.roomType?.title.split(" ")[0]}
                    </span>
                  </div>
                </td>

                {/* Day cells */}
                {days.map((dateStr) => {
                  const isToday = dateStr === todayStr;

                  if (room.status !== "available") {
                    return (
                      <td
                        key={dateStr}
                        className={`p-1 border-b border-white/5 text-center ${
                          isToday ? "bg-indigo-600/5" : ""
                        }`}
                      >
                        <div className="w-full h-8 rounded bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-[10px] text-amber-300">
                          {room.status === "maintenance" ? "Clean" : "Offline"}
                        </div>
                      </td>
                    );
                  }

                  // Find active booking for this date
                  // Booking spans checkInDate <= dateStr < checkOutDate
                  const activeBooking = bookings.find(
                    (b) =>
                      b.roomId === room.id &&
                      b.status === "confirmed" &&
                      dateStr >= b.checkInDate &&
                      dateStr < b.checkOutDate
                  );

                  return (
                    <td
                      key={dateStr}
                      className={`p-1 border-b border-white/5 text-center ${
                        isToday ? "bg-indigo-600/5" : ""
                      }`}
                    >
                      {activeBooking ? (
                        <div
                          title={`Booked by: ${
                            activeBooking.user?.name || "Guest"
                          } (${activeBooking.checkInDate} to ${
                            activeBooking.checkOutDate
                          })`}
                          className="w-full h-8 rounded bg-indigo-600/70 hover:bg-indigo-600 text-white border border-indigo-400/40 flex flex-col items-center justify-center text-[10px] cursor-pointer transition-all px-1"
                        >
                          <span className="truncate w-full font-semibold">
                            {activeBooking.user?.name?.split(" ")[0] || "Guest"}
                          </span>
                        </div>
                      ) : (
                        <div className="w-full h-8 rounded bg-emerald-500/5 hover:bg-emerald-500/10 border border-emerald-500/10 flex items-center justify-center text-[10px] text-emerald-400/70">
                          Free
                        </div>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

