"use client";

import Link from "next/link";


export default function Footer() {
  return (
    <footer className="bg-[#1f2a56] text-white">
      {/* Top bar: Logo + Social Icons */}
      <div className="bg-[#1f2a56] border-b-2 border-white">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 flex items-center justify-center">
              <img src="/logo.svg" alt="Logo" className="w-full h-full object-contain" />
            </div>
            <span className="font-bold text-lg tracking-wide uppercase">
              Jember Siaga
            </span>
          </Link>

        </div>
      </div>

      {/* Main Content: 3 Columns */}
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {/* Akses Cepat */}
          <div>
            <h4 className="font-semibold text-sm mb-4 text-white">
              Akses Cepat
            </h4>
            <div className="grid grid-cols-2 gap-x-4 gap-y-2.5">
              {/* Kolom kiri */}
              <ul className="space-y-2.5">
                {[
                  { name: "Beranda", href: "/" },
                  { name: "Prediksi Cuaca", href: "/prediksi-cuaca" },
                  { name: "Prediksi Banjir", href: "/prediksi-banjir" },
                  { name: "Peta Bencana", href: "/peta" },
                ].map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="text-white/60 hover:text-white text-sm transition-colors duration-200"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
              {/* Kolom kanan */}
              <ul className="space-y-2.5">
                {[
                  { name: "Pengaduan Bencana", href: "/pengaduan-bencana" },
                  { name: "Berita", href: "/berita" },
                  { name: "FAQ", href: "/faq" },
                ].map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="text-white/60 hover:text-white text-sm transition-colors duration-200"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Alamat */}
          <div className="md:pl-8">
            <h4 className="font-semibold text-sm mb-4 text-white">
              Alamat
            </h4>
            <p className="text-white/60 text-sm leading-relaxed">
              Jl. Mastrip No.164, Lingkungan Panji,<br />
              Tegalgede, Kec. Sumbersari,<br />
              Kabupaten Jember, Jawa Timur 68121
            </p>
          </div>

          {/* Laman Terkait */}
          <div className="md:pl-8">
            <h4 className="font-semibold text-sm mb-4 text-white">
              Laman terkait
            </h4>
            <ul className="space-y-2.5">
              {[
                { name: "Pantau Banjir Jakarta", href: "https://pantaubanjir.jakarta.go.id" },
                { name: "BMKG", href: "https://www.bmkg.go.id" },
                { name: "BPBD", href: "https://bpbd.jemberkab.go.id" },
              ].map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-white/60 hover:text-white text-sm transition-colors duration-200"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Copyright */}
      <div className="border-t-2 border-white bg-white">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-4">
          <p className="text-center text-sm font-bold text-black/80">
            Hak cipta © 2026 Anything.
          </p>
        </div>
      </div>
    </footer>
  );
}
