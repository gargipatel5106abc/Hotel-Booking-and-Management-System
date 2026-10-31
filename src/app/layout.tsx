import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import AmbientDoodles from "@/components/AmbientDoodles";
import "./globals.css";

export const metadata: Metadata = {
  title: "Aurora Grand Luxury Hotel & Resort | Booking & Management System",
  description:
    "Production-ready luxury hotel reservation platform with atomic anti-double-booking locks, interactive guest suite catalog, Indian Rupee (₹) pricing, and comprehensive admin yield analytics.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                const storedTheme = localStorage.getItem('theme');
                if (storedTheme === 'light') {
                  document.documentElement.classList.remove('dark');
                } else {
                  document.documentElement.classList.add('dark');
                }
              } catch (_) {}
            `,
          }}
        />
      </head>
      <body className="min-h-screen flex flex-col antialiased selection:bg-indigo-500 selection:text-white relative transition-colors duration-300">
        <AmbientDoodles />
        <div className="relative z-10 flex-1 flex flex-col">
          <Navbar />
          <main className="flex-1">{children}</main>
          <footer className="glass-panel border-t border-black/5 dark:border-white/10 py-8 px-4 text-center text-xs text-slate-500 mt-16">
            <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span className="text-slate-600 dark:text-slate-400 font-medium">
                  Aurora Grand Hotel Booking Engine
                </span>
                <span className="text-slate-400 dark:text-slate-600">·</span>
                <span className="text-slate-500">
                  Atomic Overlap Guard &amp; Realistic Yield Scarcity
                </span>
              </div>
              <p className="text-slate-500">
                © {new Date().getFullYear()} Aurora Grand Hotels &amp; Resorts. All prices in INR (₹).
              </p>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
