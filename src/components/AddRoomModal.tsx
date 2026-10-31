"use client";

import { useState } from "react";
import { X, Plus, Bed, ShieldCheck } from "lucide-react";
import { RoomType, RoomStatus } from "@/lib/types";

interface AddRoomModalProps {
  roomTypes: RoomType[];
  onClose: () => void;
  onRoomAdded: () => void;
}

export default function AddRoomModal({
  roomTypes,
  onClose,
  onRoomAdded,
}: AddRoomModalProps) {
  const [roomNumber, setRoomNumber] = useState("");
  const [roomTypeId, setRoomTypeId] = useState(roomTypes[0]?.id || "");
  const [status, setStatus] = useState<RoomStatus>("available");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!roomNumber.trim() || !roomTypeId) {
      setError("Please provide a room number and select a suite type.");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      const res = await fetch("/api/rooms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          roomNumber: roomNumber.trim(),
          roomTypeId,
          status,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to create room");
      }

      onRoomAdded();
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="w-full max-w-md bg-slate-900 border border-white/10 rounded-3xl p-6 shadow-2xl relative text-white">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
            <Plus className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-lg text-white">Add New Hotel Room</h3>
            <p className="text-xs text-slate-400">Register new room into inventory</p>
          </div>
        </div>

        {error && (
          <div className="p-3 mb-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs sm:text-sm">
          <div>
            <label className="block text-slate-300 font-semibold mb-1.5">
              Room Number / Identifier *
            </label>
            <input
              type="text"
              placeholder="e.g. 105, 502, PH-03"
              value={roomNumber}
              onChange={(e) => setRoomNumber(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl glass-input text-white text-sm"
              required
            />
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1.5">
              Room Category / Type *
            </label>
            <select
              value={roomTypeId}
              onChange={(e) => setRoomTypeId(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl glass-input text-white text-sm bg-slate-900"
            >
              {roomTypes.map((rt) => (
                <option key={rt.id} value={rt.id} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">
                  {rt.title} (₹{rt.basePrice.toLocaleString("en-IN")}/night · {rt.capacity} guests)
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1.5">
              Initial Operational Status
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as RoomStatus)}
              className="w-full px-3.5 py-2.5 rounded-xl glass-input text-white text-sm bg-slate-900"
            >
              <option value="available" className="bg-slate-900">Available for Booking</option>
              <option value="maintenance" className="bg-slate-900">Maintenance / Cleaning</option>
              <option value="out_of_service" className="bg-slate-900">Out of Service</option>
            </select>
          </div>

          <div className="pt-3 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="w-1/3 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-semibold text-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-2/3 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-lg shadow-indigo-600/30 transition-all disabled:opacity-50"
            >
              {isSubmitting ? "Saving..." : "Create Room"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

