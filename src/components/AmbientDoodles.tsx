"use client";

import React from "react";

export default function AmbientDoodles() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0" aria-hidden="true">
      {/* Ambient gradient orbs */}
      <div className="absolute top-12 left-[10%] w-72 h-72 rounded-full bg-indigo-500/10 dark:bg-indigo-500/15 blur-3xl animate-float-slow" />
      <div className="absolute top-[45%] right-[5%] w-80 h-80 rounded-full bg-emerald-500/10 dark:bg-emerald-500/10 blur-3xl animate-float-reverse" />
      <div className="absolute bottom-20 left-[25%] w-96 h-96 rounded-full bg-amber-500/10 dark:bg-amber-500/10 blur-3xl animate-float-slow" />

      {/* Floating Doodle 1: Luxury Hotel Key with Tassel */}
      <div className="absolute top-28 right-[12%] opacity-20 dark:opacity-25 animate-float-slow text-indigo-500 dark:text-indigo-400 hidden md:block">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="7.5" cy="15.5" r="5.5" />
          <path d="m21 2-9.6 9.6" />
          <path d="m15.5 7.5 3 3" />
          <path d="M18 5l2 2" />
        </svg>
      </div>

      {/* Floating Doodle 2: Twinkling Four-Point Star */}
      <div className="absolute top-44 left-[6%] opacity-25 dark:opacity-30 animate-twinkle text-amber-500 dark:text-amber-400">
        <svg width="36" height="36" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 0L14.5 9.5L24 12L14.5 14.5L12 24L9.5 14.5L0 12L9.5 9.5L12 0Z" />
        </svg>
      </div>

      {/* Floating Doodle 3: Luxury Concierge Bell */}
      <div className="absolute top-[52%] left-[4%] opacity-20 dark:opacity-25 animate-float-reverse text-emerald-600 dark:text-emerald-400 hidden lg:block">
        <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
          <path d="M12 2v2" />
        </svg>
      </div>

      {/* Floating Doodle 4: Cocktail / Evening Lounge Glass */}
      <div className="absolute top-[65%] right-[8%] opacity-20 dark:opacity-25 animate-float-slow text-indigo-500 dark:text-indigo-400 hidden md:block">
        <svg width="42" height="42" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="m8 22 4-11 4 11" />
          <path d="M19 3H5l7 8 7-8Z" />
          <path d="M12 11v11" />
        </svg>
      </div>

      {/* Floating Doodle 5: Small Twinkling Stars */}
      <div className="absolute bottom-32 right-[28%] opacity-30 dark:opacity-35 animate-twinkle text-emerald-500 dark:text-emerald-400">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 0L13.8 8.2L22 10L13.8 11.8L12 20L10.2 11.8L2 10L10.2 8.2L12 0Z" />
        </svg>
      </div>

      <div className="absolute top-[35%] left-[28%] opacity-20 dark:opacity-25 animate-float-slow text-indigo-400">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 0L13.8 8.2L22 10L13.8 11.8L12 20L10.2 11.8L2 10L10.2 8.2L12 0Z" />
        </svg>
      </div>

      {/* Subtle Contour Wave Curve */}
      <div className="absolute bottom-0 inset-x-0 h-48 opacity-10 dark:opacity-15 pointer-events-none">
        <svg className="w-full h-full" viewBox="0 0 1440 200" fill="none" preserveAspectRatio="none">
          <path
            d="M0,64L80,85.3C160,107,320,149,480,149.3C640,149,800,107,960,96C1120,85,1280,107,1360,117.3L1440,128L1440,200L1360,200C1280,200,1120,200,960,200C800,200,640,200,480,200C320,200,160,200,80,200L0,200Z"
            fill="currentColor"
            className="text-indigo-500/20"
          />
        </svg>
      </div>
    </div>
  );
}

