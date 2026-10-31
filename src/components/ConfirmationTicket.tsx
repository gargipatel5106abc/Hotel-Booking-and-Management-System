"use client";

import { useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import {
  CheckCircle2,
  Calendar,
  Clock,
  ShieldCheck,
  Copy,
  Printer,
  Sparkles,
  MapPin,
  CreditCard,
} from "lucide-react";
import { Booking, Room } from "@/lib/types";

interface ConfirmationTicketProps {
  booking: Booking;
  onClose?: () => void;
}

export default function ConfirmationTicket({
  booking,
  onClose,
}: ConfirmationTicketProps) {
  const [copied, setCopied] = useState(false);
  const room = booking.room;
  const roomType = room?.roomType;

  const copyReference = () => {
    navigator.clipboard.writeText(booking.id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  const qrValue = JSON.stringify({
    bookingId: booking.id,
    room: room?.roomNumber,
    checkIn: booking.checkInDate,
    checkOut: booking.checkOutDate,
    verified: true,
  });

  return (
    <div className="w-full max-w-2xl mx-auto bg-slate-900 border border-indigo-500/30 rounded-3xl overflow-hidden shadow-2xl relative text-white">
      {/* Top Header Banner */}
      <div className="bg-gradient-to-r from-indigo-700 via-indigo-600 to-emerald-600 px-6 sm:px-8 py-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center">
            <CheckCircle2 className="w-6 h-6 text-white" />
          </div>
          <div>
            <span className="text-[11px] font-bold tracking-widest uppercase text-emerald-200">
              Verified & Locked
            </span>
            <h3 className="text-lg sm:text-xl font-extrabold text-white">
              Official Booking Confirmation
            </h3>
          </div>
        </div>

        <div className="text-right">
          <span className="text-xs text-indigo-100 font-mono block">Reference</span>
          <span className="font-mono text-xs sm:text-sm font-bold bg-black/30 px-2 py-0.5 rounded border border-white/10">
            #{booking.id.slice(0, 10).toUpperCase()}
          </span>
        </div>
      </div>

      {/* Ticket Body */}
      <div className="p-6 sm:p-8 space-y-6">
        {/* Hotel & Room Row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/10">
          <div>
            <div className="flex items-center gap-2 text-indigo-400 text-xs font-semibold mb-1">
              <MapPin className="w-3.5 h-3.5" />
              <span>AURORA GRAND RESORT & SPA · LUXURY WING</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white">
              {roomType?.title || "Luxury Suite"}
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Room Number:{" "}
              <span className="text-white font-bold text-sm bg-white/10 px-2 py-0.5 rounded ml-1">
                {room?.roomNumber}
              </span>
            </p>
          </div>

          <div className="flex items-center gap-3 bg-white/5 p-3 rounded-2xl border border-white/10">
            <div className="bg-white p-2 rounded-xl">
              <QRCodeSVG value={qrValue} size={64} level="M" />
            </div>
            <div className="text-xs space-y-0.5">
              <div className="flex items-center gap-1 text-emerald-400 font-semibold">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Anti-Double Booking</span>
              </div>
              <p className="text-slate-400 text-[10px]">Pessimistic lock cleared</p>
              <p className="text-slate-400 text-[10px]">Instant check-in ready</p>
            </div>
          </div>
        </div>

        {/* Schedule Matrix */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pb-6 border-b border-white/10">
          <div className="bg-white/5 p-4 rounded-xl border border-white/5">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
              Check-In Date
            </span>
            <div className="text-base sm:text-lg font-bold text-emerald-400">
              {booking.checkInDate}
            </div>
            <span className="text-[11px] text-slate-400 flex items-center gap-1 mt-1">
              <Clock className="w-3 h-3" /> From 3:00 PM
            </span>
          </div>

          <div className="bg-white/5 p-4 rounded-xl border border-white/5">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
              Check-Out Date
            </span>
            <div className="text-base sm:text-lg font-bold text-indigo-300">
              {booking.checkOutDate}
            </div>
            <span className="text-[11px] text-slate-400 flex items-center gap-1 mt-1">
              <Clock className="w-3 h-3" /> Until 11:00 AM
            </span>
          </div>

          <div className="col-span-2 sm:col-span-1 bg-white/5 p-4 rounded-xl border border-white/5">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
              Total Paid
            </span>
            <div className="text-base sm:text-lg font-bold text-white">
              ₹{booking.totalAmount.toLocaleString("en-IN")}
            </div>
            <span className="text-[11px] text-emerald-400 flex items-center gap-1 mt-1">
              <CreditCard className="w-3 h-3" /> Completed
            </span>
          </div>
        </div>

        {/* Guest Details */}
        <div className="flex flex-wrap items-center justify-between text-xs text-slate-400 gap-2">
          <div>
            <span>Guest Name: </span>
            <span className="text-white font-medium">
              {booking.user?.name || "Registered Guest"}
            </span>
            {booking.user?.email && (
              <span className="text-slate-400 ml-1">({booking.user.email})</span>
            )}
          </div>
          <div>
            <span>Status: </span>
            <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-semibold uppercase text-[10px]">
              {booking.status}
            </span>
          </div>
        </div>
      </div>

      {/* Ticket Footer Action Bar */}
      <div className="bg-slate-950 px-6 sm:px-8 py-4 border-t border-white/10 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <button
            onClick={copyReference}
            className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-xs text-slate-300 border border-white/10 flex items-center gap-1.5 transition-colors"
          >
            <Copy className="w-3.5 h-3.5" />
            <span>{copied ? "Copied!" : "Copy Reference ID"}</span>
          </button>
          <button
            onClick={handlePrint}
            className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-xs text-slate-300 border border-white/10 flex items-center gap-1.5 transition-colors"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Ticket</span>
          </button>
        </div>

        {onClose && (
          <button
            onClick={onClose}
            className="px-5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white transition-colors"
          >
            Done
          </button>
        )}
      </div>
    </div>
  );
}

