"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import {
  Hotel,
  ShieldCheck,
  CalendarCheck,
  Sparkles,
  Database,
  RefreshCw,
  Sun,
  Moon,
  Coins,
} from "lucide-react";

export default function Navbar() {
  const pathname = usePathname();
  const isAdminPage = pathname.startsWith("/admin");
  const [isSeeding, setIsSeeding] = useState(false);
  const [seedMessage, setSeedMessage] = useState("");
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [mounted, setMounted] = useState(false);

  // Initialize theme from localStorage or default to dark
  useEffect(() => {
    setMounted(true);
    const stored = localStorage.getItem("theme") as "dark" | "light" | null;
    const initialTheme = stored || "dark";
    setTheme(initialTheme);
    if (initialTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
    localStorage.setItem("theme", nextTheme);
    if (nextTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  const handleSeedDatabase = async () => {
    if (
      !confirm(
        "Reset database with fresh Indian Rupee (₹) seed dataset (18 rooms, 12 bookings)?"
      )
    ) {
      return;
    }
    setIsSeeding(true);
    setSeedMessage("");
    try {
      const res = await fetch("/api/seed", { method: "POST" });
      const data = await res.json();
      if (res.ok) {
        setSeedMessage("Database re-seeded successfully with ₹ INR pricing!");
        setTimeout(() => {
          window.location.reload();
        }, 800);
      } else {
        alert("Seed failed: " + (data.error || "Unknown error"));
      }
    } catch (err: any) {
      alert("Seed failed: " + err.message);
    } finally {
      setIsSeeding(false);
    }
  };

  return (
    <header className="sticky top-0 z-50 glass-panel border-b border-black/5 dark:border-white/10 px-4 lg:px-8 py-3.5 transition-all">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-emerald-400 p-0.5 shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-transform">
            <div className="w-full h-full bg-white dark:bg-slate-950 rounded-[10px] flex items-center justify-center">
              <Hotel className="w-5 h-5 text-indigo-600 dark:text-indigo-400 group-hover:text-emerald-500 transition-colors" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold tracking-wider text-base lg:text-lg bg-gradient-to-r from-indigo-600 via-slate-800 to-slate-900 dark:from-white dark:via-slate-100 dark:to-slate-400 bg-clip-text text-transparent">
                AURORA GRAND
              </span>
              <span className="text-[10px] font-semibold uppercase tracking-widest px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30">
                5★ RESORT
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 hidden sm:block">
              Luxury Hospitality &amp; Yield Management System
            </p>
          </div>
        </Link>

        {/* Navigation Tabs & Theme Switcher */}
        <nav className="flex items-center gap-1.5 sm:gap-2.5">
          {/* Currency Pill */}
          <div className="hidden sm:flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-white/5 border border-black/5 dark:border-white/10 text-xs font-bold text-slate-700 dark:text-slate-300">
            <span className="text-emerald-600 dark:text-emerald-400">₹</span>
            <span>INR</span>
          </div>

          {/* Theme Toggle (Light / Dark) */}
          {mounted && (
            <button
              onClick={toggleTheme}
              title={theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
              aria-label="Toggle theme"
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-white/10 dark:hover:bg-white/15 text-slate-700 dark:text-slate-200 border border-black/5 dark:border-white/10 transition-transform active:scale-95"
            >
              {theme === "dark" ? (
                <Sun className="w-4 h-4 text-amber-400 animate-spin-slow" />
              ) : (
                <Moon className="w-4 h-4 text-indigo-600" />
              )}
            </button>
          )}

          <Link
            href="/"
            className={`px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-2 ${
              !isAdminPage
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/25"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5"
            }`}
          >
            <CalendarCheck className="w-4 h-4" />
            <span>Guest Portal</span>
          </Link>

          <Link
            href="/admin"
            className={`px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-2 ${
              isAdminPage
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/25"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5"
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Admin Dashboard</span>
          </Link>

          {/* Quick Seed Button */}
          <button
            onClick={handleSeedDatabase}
            disabled={isSeeding}
            title="Reset & populate SQLite database with 18 rooms in ₹ INR"
            className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800/80 dark:hover:bg-slate-700/80 border border-black/5 dark:border-white/10 transition-colors ml-1"
          >
            <RefreshCw
              className={`w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 ${
                isSeeding ? "animate-spin" : ""
              }`}
            />
            <span>{isSeeding ? "Seeding..." : "Reset ₹ DB"}</span>
          </button>
        </nav>
      </div>

      {seedMessage && (
        <div className="max-w-7xl mx-auto mt-2 text-center text-xs text-emerald-700 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 py-1 rounded-xl">
          {seedMessage}
        </div>
      )}
    </header>
  );
}
