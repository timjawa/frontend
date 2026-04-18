"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { navLinks } from "@/data/dummyData";
import { HiMenu, HiX } from "react-icons/hi";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState("");
  const [currentDate, setCurrentDate] = useState("");

  // Format tanggal & jam
  useEffect(() => {
    const updateDateTime = () => {
      const now = new Date();

      setCurrentTime(
        now.toLocaleTimeString("id-ID", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: false,
        }).replace(/:/g, " : ")
      );

      setCurrentDate(
        now
          .toLocaleDateString("id-ID", {
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric",
          })
          .toUpperCase()
      );
    };

    updateDateTime();
    const interval = setInterval(updateDateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="fixed top-0 left-0 right-0 z-50">

      {/* TOP BAR */}
      <div className="bg-[#f8f9fa] text-xs shadow-sm">
        <div className="max-w-7xl mx-auto px-6 flex justify-between items-center h-10">
          <span className="tracking-[0.05em] font-semibold text-slate-500">
            {currentDate}
          </span>
          <span className="tracking-wide font-medium text-slate-500">
            WAKTU INDONESIA BARAT{" "}
            <span className="font-bold ml-3 text-[#1f2a56]">
              {currentTime}
            </span>
          </span>
        </div>
      </div>

      {/* NAVBAR */}
      <nav className="bg-[#1f2a56]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between h-[72px]">

            {/* LOGO */}
            <Link href="/" className="flex items-center gap-4">
              <div className="relative w-11 h-12 flex items-center justify-center">
                <img 
                  src="/logo.png" 
                  alt="Logo Jember" 
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    const parent = e.currentTarget.parentElement;
                    if (parent) {
                      const fallback = parent.querySelector('.fallback-logo');
                      if (fallback) {
                        (fallback as HTMLElement).style.display = 'flex';
                      }
                    }
                  }}
                />
                <div className="fallback-logo hidden w-10 h-10 bg-white/10 rounded-full items-center justify-center border border-white/20">
                  <div className="text-white text-xl font-bold">J</div>
                </div>
              </div>
              <span className="text-white font-[700] text-[17px] tracking-wide">
                JEMBER SIAGA
              </span>
            </Link>

            {/* DESKTOP MENU */}
            <div className="hidden lg:flex items-center gap-7">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  className="text-white/90 text-[14px] font-[500] hover:text-white transition-colors duration-200"
                >
                  {link.name}
                </Link>
              ))}
            </div>

            {/* MOBILE BUTTON */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="lg:hidden text-white"
            >
              {isOpen ? <HiX size={26} /> : <HiMenu size={26} />}
            </button>
          </div>
        </div>

        {/* MOBILE MENU */}
        <div
          className={`lg:hidden bg-[#1f2a56] px-6 transition-all duration-300 ${
            isOpen ? "max-h-96 py-4" : "max-h-0 overflow-hidden"
          }`}
        >
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              onClick={() => setIsOpen(false)}
              className="block text-white py-2 text-sm"
            >
              {link.name}
            </Link>
          ))}
        </div>
      </nav>
    </header>
  );
}