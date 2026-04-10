"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { navLinks } from "@/data/dummyData";
import { HiMenu, HiX } from "react-icons/hi";
import { WiDayCloudyGusts } from "react-icons/wi";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-primary/95 backdrop-blur-md shadow-lg"
          : "bg-primary"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-9 h-9 bg-white/15 rounded-lg flex items-center justify-center group-hover:bg-white/25 transition-colors">
              <WiDayCloudyGusts className="text-white text-xl" />
            </div>
            <span className="text-white font-bold text-lg tracking-tight">
              JEMBER <span className="text-secondary-light">SIAGA</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className="text-white/80 hover:text-white hover:bg-white/10 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200"
              >
                {link.name}
              </Link>
            ))}
          </div>

          {/* Auth Buttons */}
          <div className="hidden md:flex items-center gap-2">
            <Link
              href="/login"
              className="text-white/80 hover:text-white px-4 py-2 text-sm font-medium transition-colors"
            >
              Masuk
            </Link>
            <Link
              href="/daftar"
              className="bg-secondary hover:bg-secondary-light text-white px-5 py-2 rounded-lg text-sm font-semibold transition-all duration-200 shadow-md hover:shadow-lg"
            >
              Daftar
            </Link>
          </div>

          {/* Mobile Toggle */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden text-white p-2 rounded-lg hover:bg-white/10 transition-colors"
            aria-label="Toggle menu"
          >
            {isOpen ? <HiX size={24} /> : <HiMenu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        className={`md:hidden overflow-hidden transition-all duration-300 ${
          isOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="px-4 pb-4 space-y-1 bg-primary-dark/50 backdrop-blur-md">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              className="block text-white/80 hover:text-white hover:bg-white/10 px-4 py-3 rounded-lg text-sm font-medium transition-all"
              onClick={() => setIsOpen(false)}
            >
              {link.name}
            </Link>
          ))}
          <div className="pt-3 border-t border-white/10 flex gap-2">
            <Link
              href="/login"
              className="flex-1 text-center text-white/80 hover:text-white py-2.5 rounded-lg text-sm font-medium border border-white/20 transition-colors"
            >
              Masuk
            </Link>
            <Link
              href="/daftar"
              className="flex-1 text-center bg-secondary hover:bg-secondary-light text-white py-2.5 rounded-lg text-sm font-semibold transition-colors"
            >
              Daftar
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
