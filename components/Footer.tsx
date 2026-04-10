import Link from "next/link";
import { navLinks } from "@/data/dummyData";
import { WiDayCloudyGusts } from "react-icons/wi";
import {
  HiOutlineMapPin,
  HiOutlineEnvelope,
  HiOutlinePhone,
} from "react-icons/hi2";
import { FaFacebook, FaInstagram, FaTwitter, FaYoutube } from "react-icons/fa";

export default function Footer() {
  return (
    <footer className="bg-primary text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="lg:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 bg-white/15 rounded-lg flex items-center justify-center">
                <WiDayCloudyGusts className="text-white text-xl" />
              </div>
              <span className="font-bold text-lg">
                JEMBER <span className="text-secondary-light">SIAGA</span>
              </span>
            </Link>
            <p className="text-white/60 text-sm leading-relaxed mb-4">
              Sistem informasi cuaca dan kebencanaan terpadu untuk wilayah
              Kabupaten Jember. Memberikan informasi real-time untuk
              kesiapsiagaan bencana.
            </p>
            <div className="flex gap-3">
              {[
                { icon: FaFacebook, href: "#" },
                { icon: FaInstagram, href: "#" },
                { icon: FaTwitter, href: "#" },
                { icon: FaYoutube, href: "#" },
              ].map((social, i) => (
                <a
                  key={i}
                  href={social.href}
                  className="w-9 h-9 bg-white/10 hover:bg-secondary rounded-lg flex items-center justify-center transition-all duration-200"
                  aria-label="Social media"
                >
                  <social.icon className="text-sm" />
                </a>
              ))}
            </div>
          </div>

          {/* Navigation */}
          <div>
            <h4 className="font-semibold text-sm mb-4 text-white/90">
              Navigasi
            </h4>
            <ul className="space-y-2.5">
              {navLinks.map((link) => (
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

          {/* Layanan */}
          <div>
            <h4 className="font-semibold text-sm mb-4 text-white/90">
              Layanan
            </h4>
            <ul className="space-y-2.5">
              {[
                "Prakiraan Cuaca",
                "Peringatan Dini",
                "Lapor Bencana",
                "Peta Rawan Bencana",
                "Data Historis",
              ].map((item) => (
                <li key={item}>
                  <Link
                    href="#"
                    className="text-white/50 hover:text-white text-sm transition-colors"
                  >
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold text-sm mb-4 text-white/90">Kontak</h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-3 text-sm text-white/50">
                <HiOutlineMapPin className="text-secondary-light mt-0.5 flex-shrink-0" />
                <span>Jl. Sumatera No. 1, Kabupaten Jember, Jawa Timur</span>
              </li>
              <li className="flex items-center gap-3 text-sm text-white/50">
                <HiOutlinePhone className="text-secondary-light flex-shrink-0" />
                <span>(0331) 123456</span>
              </li>
              <li className="flex items-center gap-3 text-sm text-white/50">
                <HiOutlineEnvelope className="text-secondary-light flex-shrink-0" />
                <span>info@jembersiaga.go.id</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Copyright */}
      <div className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-2 text-xs text-white/40">
            <p>© 2026 Jember Siaga. Seluruh hak cipta dilindungi.</p>
            <p>
              Didukung oleh{" "}
              <span className="text-white/60">BPBD Kabupaten Jember</span>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
