"use client";

import Link from "next/link";
import { WiDayCloudyGusts } from "react-icons/wi";
import { HiOutlineGlobeAlt, HiOutlineEnvelope, HiOutlinePhone } from "react-icons/hi2";
import { FaFacebook, FaInstagram, FaYoutube } from "react-icons/fa";

export default function Footer() {
  return (
    <footer className="bg-primary text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10">
          {/* Brand */}
          <div>
            <Link href="/" className="flex items-center gap-2.5 mb-4">
              <div className="w-9 h-9 flex items-center justify-center">
                <img src="/logo.svg" alt="Logo" className="w-full h-full object-contain" />
              </div>
              <span className="font-bold text-lg">
                Jember <span className="text-secondary-light">Siaga</span>
              </span>
            </Link>
            <p className="text-white/60 text-sm leading-relaxed mb-5 max-w-sm">
              Platform pusat informasi dan koordinasi penanggulangan bencana
              Kabupaten Jember. Kami berkomitmen untuk memberikan data akurat
              demi keselamatan seluruh warga.
            </p>
            <div className="flex gap-3">
              {[
                { icon: HiOutlineGlobeAlt, href: "#" },
                { icon: HiOutlineEnvelope, href: "#" },
                { icon: HiOutlinePhone, href: "#" },
              ].map((social, i) => (
                <a
                  key={i}
                  href={social.href}
                  className="w-9 h-9 bg-white/10 hover:bg-secondary rounded-lg flex items-center justify-center transition-all duration-200"
                  aria-label="Social media"
                >
                  <social.icon className="text-base" />
                </a>
              ))}
            </div>
          </div>

          {/* Navigasi Cepat */}
          <div>
            <h4 className="font-semibold text-sm mb-4 text-white/90">
              Navigasi Cepat
            </h4>
            <ul className="space-y-2.5">
              {[
                { name: "Beranda", href: "/" },
                { name: "Prediksi Cuaca", href: "/prediksi-cuaca" },
                { name: "Prediksi Banjir", href: "/prediksi-banjir" },
                { name: "Berita", href: "/berita" },
              ].map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-white/50 hover:text-white text-sm transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Dukungan */}
          <div>
            <h4 className="font-semibold text-sm mb-4 text-white/90">
              Dukungan
            </h4>
            <ul className="space-y-2.5">
              {[
                { name: "Peta Bencana", href: "/peta-bencana" },
                { name: "Pengaduan Bencana", href: "/pengaduan-bencana" },
                { name: "FAQ", href: "/faq" },
              ].map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-white/50 hover:text-white text-sm transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Copyright */}
      <div className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-2 text-xs text-white/40">
            <p>© 2024 Jember Siaga. Seluruh Hak Cipta Dilindungi.</p>
            <button
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-secondary flex items-center justify-center transition-all"
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              aria-label="Back to top"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M7 11V3M7 3L3 7M7 3l4 4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
