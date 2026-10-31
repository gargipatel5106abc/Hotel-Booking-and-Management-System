"use client";

import { useState } from "react";
import {
  Bed,
  CheckCircle,
  Wrench,
  AlertOctagon,
  Users,
  Sparkles,
} from "lucide-react";
import { Room, RoomStatus } from "@/lib/types";

interface AdminRoomGridProps {
  rooms: Room[];
  onStatusChange: (roomId: string, newStatus: RoomStatus) => void;
}

export default function AdminRoomGrid({
  rooms,
  onStatusChange,
}: AdminRoomGridProps) {
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const handleToggle = async (roomId: string, status: RoomStatus) => {
    setUpdatingId(roomId);
    await onStatusChange(roomId, status);
    setUpdatingId(null);
  };

  const statusColors: Record<RoomStatus, { badge: string; dot: string; label: string }> = {
    available: {
      badge: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
      dot: "bg-emerald-400 pulse-available",
      label: "Available",
    },
    maintenance: {
      badge: "bg-amber-500/10 text-amber-400 border-amber-500/30",
      dot: "bg-amber-400",
      label: "Maintenance / Cleaning",
    },
    out_of_service: {
      badge: "bg-rose-500/10 text-rose-400 border-rose-500/30",
      dot: "bg-rose-400",
      label: "Out of Service",
    },
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {rooms.map((room) => {
        const conf = statusColors[room.status] || statusColors.available;
        const isUpdating = updatingId === room.id;

        return (
          <div
            key={room.id}
            className="glass-card p-4 rounded-2xl border border-white/10 flex flex-col justify-between transition-all"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center font-bold text-sm text-indigo-300">
                    {room.roomNumber}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white line-clamp-1">
                      {room.roomType?.title}
                    </h4>
                    <span className="text-[10px] text-slate-400">
                      Capacity: {room.roomType?.capacity} guests
                    </span>
                  </div>
                </div>

                <div className={`px-2 py-0.5 rounded-full border text-[10px] font-semibold flex items-center gap-1.5 ${conf.badge}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${conf.dot}`} />
                  <span>{conf.label}</span>
                </div>
              </div>

              <div className="text-xs text-slate-500 dark:text-slate-400 mb-3 flex items-center justify-between">
                <span>Base Tariff:</span>
                <span className="font-semibold text-slate-900 dark:text-white">
                  ₹{room.roomType?.basePrice?.toLocaleString("en-IN")} / night
                </span>
              </div>
            </div>

            {/* Admin Status Switcher Controls */}
            <div className="pt-3 border-t border-white/5">
              <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">
                Set Physical Room Status:
              </label>
              <div className="grid grid-cols-3 gap-1.5 text-[11px]">
                <button
                  type="button"
                  disabled={isUpdating || room.status === "available"}
                  onClick={() => handleToggle(room.id, "available")}
                  className={`py-1.5 px-2 rounded-lg font-medium transition-all text-center ${
                    room.status === "available"
                      ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/30"
                      : "bg-white/5 text-slate-400 hover:text-white hover:bg-white/10"
                  }`}
                >
                  Active
                </button>

                <button
                  type="button"
                  disabled={isUpdating || room.status === "maintenance"}
                  onClick={() => handleToggle(room.id, "maintenance")}
                  className={`py-1.5 px-2 rounded-lg font-medium transition-all text-center ${
                    room.status === "maintenance"
                      ? "bg-amber-600 text-white shadow-md shadow-amber-600/30"
                      : "bg-white/5 text-slate-400 hover:text-white hover:bg-white/10"
                  }`}
                >
                  Clean
                </button>

                <button
                  type="button"
                  disabled={isUpdating || room.status === "out_of_service"}
                  onClick={() => handleToggle(room.id, "out_of_service")}
                  className={`py-1.5 px-2 rounded-lg font-medium transition-all text-center ${
                    room.status === "out_of_service"
                      ? "bg-rose-600 text-white shadow-md shadow-rose-600/30"
                      : "bg-white/5 text-slate-400 hover:text-white hover:bg-white/10"
                  }`}
                >
                  Offline
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

