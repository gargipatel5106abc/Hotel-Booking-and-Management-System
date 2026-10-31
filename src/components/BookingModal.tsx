"use client";

import { useState, useEffect } from "react";
import {
  X,
  CheckCircle2,
  Calendar,
  CreditCard,
  User,
  ShieldCheck,
  AlertCircle,
  Sparkles,
  Lock,
  ArrowRight,
  ArrowLeft,
  Clock,
  Flame,
  Zap,
} from "lucide-react";
import { Room, Booking } from "@/lib/types";
import { calculatePricing } from "@/lib/bookingLogic";
import ConfirmationTicket from "./ConfirmationTicket";

interface BookingModalProps {
  room: Room | null;
  checkIn: string;
  checkOut: string;
  onClose: () => void;
  onBookingSuccess: () => void;
}

export default function BookingModal({
  room,
  checkIn,
  checkOut,
  onClose,
  onBookingSuccess,
}: BookingModalProps) {
  if (!room) return null;

  const roomType = room.roomType!;
  const demand = room.demandInfo;
  const isSurged = demand && demand.surgeMultiplier > 1.0;
  const activePricePerNight = demand
    ? demand.currentCustomerPrice
    : roomType.basePrice;

  const pricing = calculatePricing(activePricePerNight, checkIn, checkOut);

  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [guestName, setGuestName] = useState("");
  const [guestEmail, setGuestEmail] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("credit_card");
  const [cardNumber, setCardNumber] = useState("4242 •••• •••• 4242");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [confirmedBooking, setConfirmedBooking] = useState<Booking | null>(null);

  // High Demand Countdown Timer (10:00 minutes lock)
  const [secondsRemaining, setSecondsRemaining] = useState(600);

  useEffect(() => {
    if (secondsRemaining <= 0) return;
    const interval = setInterval(() => {
      setSecondsRemaining((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, [secondsRemaining]);

  const formatTimer = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  const steps = [
    { num: 1, label: "Dates & Price" },
    { num: 2, label: "Guest Details" },
    { num: 3, label: "Payment & Lock" },
    { num: 4, label: "Confirmation" },
  ];

  const handleConfirmReservation = async () => {
    setIsSubmitting(true);
    setErrorMessage("");

    try {
      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          roomId: room.id,
          checkInDate: checkIn,
          checkOutDate: checkOut,
          guestName: guestName.trim() || "Valued Guest",
          guestEmail: guestEmail.trim() || "guest@auroraluxury.com",
          paymentMethod,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to process reservation");
      }

      setConfirmedBooking(data.booking);
      setStep(4);
      onBookingSuccess();
    } catch (err: any) {
      setErrorMessage(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 dark:bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="w-full max-w-2xl bg-white dark:bg-slate-900 border border-black/10 dark:border-white/10 rounded-3xl shadow-2xl overflow-hidden relative my-auto animate-fadeIn text-slate-900 dark:text-white transition-colors">
        {/* Close Button */}
        <button
          onClick={onClose}
          aria-label="Close modal"
          className="absolute top-4 right-4 z-10 p-2 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-white/10 dark:hover:bg-white/20 text-slate-700 dark:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Top Scarcity & Countdown Alert Ribbon */}
        <div className="bg-gradient-to-r from-indigo-50 via-slate-100 to-indigo-50 dark:from-indigo-950 dark:via-slate-950 dark:to-indigo-950 px-6 py-2.5 border-b border-black/5 dark:border-white/10 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-indigo-700 dark:text-amber-300 font-semibold">
            <Clock className="w-3.5 h-3.5 animate-pulse text-indigo-600 dark:text-amber-400" />
            <span>Rate Held:</span>
            <span className="font-mono bg-white dark:bg-black/60 px-2 py-0.5 rounded text-indigo-600 dark:text-white border border-indigo-200 dark:border-amber-500/30 font-bold">
              {formatTimer(secondsRemaining)}
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300 text-[11px] font-medium">
            <Flame className="w-3.5 h-3.5 text-amber-500" />
            <span>High demand: {demand?.activeViewersCount || 5} travelers viewing now</span>
          </div>
        </div>

        {/* Modal Top Progress Bar */}
        <div className="p-6 bg-slate-50/80 dark:bg-slate-950/80 border-b border-black/5 dark:border-white/10">
          <div className="flex items-center justify-between max-w-md mx-auto mb-2">
            {steps.map((s, idx) => (
              <div key={s.num} className="flex items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                    step > s.num
                      ? "bg-emerald-600 text-white"
                      : step === s.num
                      ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 scale-110"
                      : "bg-slate-200 dark:bg-white/10 text-slate-500 dark:text-slate-400"
                  }`}
                >
                  {step > s.num ? <CheckCircle2 className="w-4 h-4" /> : s.num}
                </div>
                {idx < steps.length - 1 && (
                  <div
                    className={`w-12 sm:w-20 h-0.5 mx-1 transition-all ${
                      step > s.num ? "bg-emerald-600" : "bg-slate-200 dark:bg-white/10"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
          <p className="text-center text-xs text-slate-500 dark:text-slate-400">
            Step {step} of 4:{" "}
            <span className="text-slate-900 dark:text-white font-semibold">
              {steps[step - 1].label}
            </span>
          </p>
        </div>

        {/* Error / Race Condition Notification Alert */}
        {errorMessage && (
          <div className="m-6 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-700 dark:text-rose-300 text-xs flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-rose-600 dark:text-rose-400 flex-shrink-0 mt-0.5" />
            <div className="space-y-1.5">
              <p className="font-bold text-sm text-rose-700 dark:text-rose-200">
                Reservation Conflict Notice:
              </p>
              <p className="leading-relaxed">{errorMessage}</p>

              {errorMessage.includes("DOUBLE_BOOKING_PREVENTED") && (
                <div className="mt-2.5 p-3 rounded-xl bg-white dark:bg-black/60 border border-amber-500/30 text-amber-800 dark:text-amber-200 text-[11px] space-y-1">
                  <p className="font-bold flex items-center gap-1.5 text-amber-700 dark:text-amber-300">
                    <Zap className="w-3.5 h-3.5 text-amber-600 dark:text-yellow-400" />
                    <span>Race Condition Collision Detected!</span>
                  </p>
                  <p>
                    Another guest checked out and locked room {room.roomNumber} just moments ago.
                    The database transaction rolled back this overlapping attempt to guarantee zero double-bookings.
                  </p>
                  <p className="text-emerald-700 dark:text-emerald-300 font-medium pt-1">
                    💡 Due to this simultaneous collision, demand for this category has surged. You can close this modal and choose an alternative suite before inventory is fully booked!
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Step 1: Summary & Dynamic Price Calculation in INR (₹) */}
        {step === 1 && (
          <div className="p-6 sm:p-8 space-y-6">
            <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-white/5 border border-black/5 dark:border-white/10">
              <div className="w-20 h-20 rounded-xl overflow-hidden bg-slate-200 dark:bg-slate-800 flex-shrink-0">
                <img
                  src={
                    roomType.imagesJson?.[0] ||
                    "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=600&q=80"
                  }
                  alt={roomType.title}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold uppercase tracking-wider">
                    Room {room.roomNumber}
                  </span>
                  {isSurged && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-800 dark:text-amber-300 border border-amber-500/40">
                      Surge Rate Active
                    </span>
                  )}
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  {roomType.title}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Capacity: up to {roomType.capacity} guests
                </p>
              </div>
            </div>

            {/* Dates Selection Display */}
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-white/5 border border-black/5 dark:border-white/5">
                <span className="text-slate-500 dark:text-slate-400 block mb-1">Check-in</span>
                <span className="text-slate-900 dark:text-white font-bold text-sm">{checkIn}</span>
              </div>
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-white/5 border border-black/5 dark:border-white/5">
                <span className="text-slate-500 dark:text-slate-400 block mb-1">Check-out</span>
                <span className="text-slate-900 dark:text-white font-bold text-sm">{checkOut}</span>
              </div>
            </div>

            {/* Price Calculation Breakdown in Rupees */}
            <div className="p-5 rounded-2xl bg-slate-50 dark:bg-black/40 border border-black/5 dark:border-white/10 space-y-3 text-xs sm:text-sm">
              {demand && (
                <div className="flex justify-between text-xs text-slate-400">
                  <span>Standard Tariff</span>
                  <span className="line-through">
                    ₹{demand.rackRateAnchorPrice.toLocaleString("en-IN")} / night
                  </span>
                </div>
              )}

              <div className="flex justify-between text-slate-700 dark:text-slate-300">
                <span>
                  ₹{pricing.pricePerNight.toLocaleString("en-IN")} × {pricing.nights} night
                  {pricing.nights > 1 ? "s" : ""}
                  {isSurged && (
                    <span className="text-[11px] text-amber-600 dark:text-amber-300 ml-1 font-semibold">
                      (Dynamic Rate)
                    </span>
                  )}
                </span>
                <span className="font-semibold text-slate-900 dark:text-white">
                  ₹{pricing.roomTotal.toLocaleString("en-IN")}
                </span>
              </div>
              <div className="flex justify-between text-slate-700 dark:text-slate-300">
                <span>State &amp; Luxury Tourism Tax (12% GST)</span>
                <span className="font-semibold text-slate-900 dark:text-white">
                  ₹{pricing.taxes.toLocaleString("en-IN")}
                </span>
              </div>
              <div className="flex justify-between text-slate-700 dark:text-slate-300">
                <span>Resort &amp; Concierge Amenity Fee</span>
                <span className="font-semibold text-slate-900 dark:text-white">
                  ₹{pricing.serviceFee.toLocaleString("en-IN")}
                </span>
              </div>
              <div className="pt-3 border-t border-black/10 dark:border-white/10 flex justify-between text-base font-bold text-slate-900 dark:text-white">
                <div>
                  <span>Total Amount Due</span>
                  <span className="block text-[10px] text-slate-500 dark:text-slate-400 font-normal">
                    Includes all luxury amenities &amp; VIP access
                  </span>
                </div>
                <span className="text-emerald-600 dark:text-emerald-400 text-xl font-black">
                  ₹{pricing.total.toLocaleString("en-IN")}
                </span>
              </div>
            </div>

            <button
              onClick={() => setStep(2)}
              className="w-full py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30"
            >
              <span>Continue to Guest Details</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Step 2: Guest Details */}
        {step === 2 && (
          <div className="p-6 sm:p-8 space-y-5">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
              Guest Contact &amp; Reservation Details
            </h3>

            <div className="space-y-4 text-xs sm:text-sm">
              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1.5">
                  Full Legal Name *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Aarav Sharma"
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl glass-input text-slate-900 dark:text-white text-sm"
                />
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1.5">
                  Email Address (for instant confirmation &amp; ticket QR) *
                </label>
                <input
                  type="email"
                  placeholder="e.g. aarav.sharma@gmail.com"
                  value={guestEmail}
                  onChange={(e) => setGuestEmail(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl glass-input text-slate-900 dark:text-white text-sm"
                />
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                onClick={() => setStep(1)}
                className="w-1/3 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-white/10 dark:hover:bg-white/15 text-slate-700 dark:text-white text-xs font-semibold flex items-center justify-center gap-1.5"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
              <button
                onClick={() => {
                  if (!guestName.trim() || !guestEmail.trim()) {
                    alert("Please provide guest name and email address.");
                    return;
                  }
                  setStep(3);
                }}
                className="w-2/3 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30"
              >
                <span>Continue to Payment</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Payment & Transaction Lock */}
        {step === 3 && (
          <div className="p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Payment Method</h3>
              <div className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400">
                <Lock className="w-3.5 h-3.5" />
                <span>256-bit SSL Encrypted</span>
              </div>
            </div>

            {/* Payment Method Selector */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { id: "credit_card", label: "Credit / Debit Card", icon: CreditCard },
                { id: "upi", label: "UPI / NetBanking", icon: Sparkles },
                { id: "stripe", label: "International Card", icon: Lock },
                { id: "crypto", label: "Crypto / Web3", icon: ShieldCheck },
              ].map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setPaymentMethod(m.id)}
                  className={`p-3 rounded-xl border text-center transition-all flex flex-col items-center gap-2 ${
                    paymentMethod === m.id
                      ? "bg-indigo-50 dark:bg-indigo-600/20 border-indigo-500 text-indigo-700 dark:text-white shadow-sm"
                      : "bg-slate-50 dark:bg-white/5 border-black/5 dark:border-white/5 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  <m.icon className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                  <span className="text-xs font-semibold">{m.label}</span>
                </button>
              ))}
            </div>

            {/* Demo Card Fields */}
            <div className="space-y-3 p-4 rounded-2xl bg-slate-50 dark:bg-black/40 border border-black/5 dark:border-white/10">
              <div>
                <label className="text-[11px] text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1 font-semibold">
                  Card / UPI Number
                </label>
                <input
                  type="text"
                  value={cardNumber}
                  onChange={(e) => setCardNumber(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg glass-input text-slate-900 dark:text-white text-xs font-mono"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1 font-semibold">
                    Valid Thru
                  </label>
                  <input
                    type="text"
                    defaultValue="12/28"
                    className="w-full px-3 py-2 rounded-lg glass-input text-slate-900 dark:text-white text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1 font-semibold">
                    CVV
                  </label>
                  <input
                    type="text"
                    defaultValue="982"
                    className="w-full px-3 py-2 rounded-lg glass-input text-slate-900 dark:text-white text-xs font-mono"
                  />
                </div>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/20 text-xs text-indigo-800 dark:text-indigo-300 flex items-start gap-2.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-emerald-700 dark:text-emerald-300">
                  Pessimistic Double-Booking Lock:
                </p>
                <p className="text-slate-600 dark:text-slate-300 text-[11px]">
                  When clicking &quot;Authorize &amp; Pay&quot;, an immediate database transaction lock prevents concurrent checkouts for room {room.roomNumber}.
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setStep(2)}
                className="w-1/3 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-white/10 dark:hover:bg-white/15 text-slate-700 dark:text-white text-xs font-semibold flex items-center justify-center gap-1.5"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>

              <button
                onClick={handleConfirmReservation}
                disabled={isSubmitting}
                className="w-2/3 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/30 active:scale-95 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <span>Processing Lock...</span>
                ) : (
                  <>
                    <Lock className="w-4 h-4" />
                    <span>Authorize &amp; Pay (₹{pricing.total.toLocaleString("en-IN")})</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Step 4: Digital Boarding Pass Ticket View */}
        {step === 4 && confirmedBooking && (
          <div className="p-6 sm:p-8">
            <ConfirmationTicket
              booking={{
                ...confirmedBooking,
                room,
                user: {
                  id: confirmedBooking.userId,
                  name: guestName || "Valued Guest",
                  email: guestEmail || "guest@auroraluxury.com",
                  role: "guest",
                  createdAt: new Date().toISOString(),
                },
              }}
              onClose={onClose}
            />
          </div>
        )}
      </div>
    </div>
  );
}
