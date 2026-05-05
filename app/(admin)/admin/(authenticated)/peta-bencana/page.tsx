"use client";

import React, { useState } from "react";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import AdminBadge from "@/components/admin/ui/AdminBadge";
import {
  HiOutlineMapPin,
  HiOutlineEye,
  HiOutlineEyeSlash,
  HiOutlineExclamationTriangle,
  HiOutlineHome,
  HiOutlineShieldExclamation,
  HiOutlineFlag,
  HiChevronDown,
  HiChevronUp,
  HiOutlineArrowPath,
} from "react-icons/hi2";

const petaLayers = [
  { id: "l1", nama_layer: "Zona Rawan Bencana", tipe: "zona_rawan", is_visible: true, urutan: 1, color: "text-red-500", bg: "bg-red-50 dark:bg-red-500/10", dot: "bg-red-500" },
  { id: "l2", nama_layer: "Titik Banjir Aktif", tipe: "titik_banjir", is_visible: true, urutan: 2, color: "text-blue-500", bg: "bg-blue-50 dark:bg-blue-500/10", dot: "bg-blue-500" },
  { id: "l3", nama_layer: "Pos Pengungsian", tipe: "pos_pengungsian", is_visible: true, urutan: 3, color: "text-green-500", bg: "bg-green-50 dark:bg-green-500/10", dot: "bg-green-500" },
  { id: "l4", nama_layer: "Jalur Evakuasi", tipe: "jalur_evakuasi", is_visible: false, urutan: 4, color: "text-yellow-500", bg: "bg-yellow-50 dark:bg-yellow-500/10", dot: "bg-yellow-400" },
  { id: "l5", nama_layer: "Pos Pemantauan", tipe: "pos_pemantauan", is_visible: false, urutan: 5, color: "text-purple-500", bg: "bg-purple-50 dark:bg-purple-500/10", dot: "bg-purple-500" },
];

const posPengungsian = [
  { id: "p1", nama: "Gedung Serbaguna Gumukmas", kecamatan: "Gumukmas", kapasitas: 500, terisi: 320, status: "aktif" as const },
  { id: "p2", nama: "SDN 1 Ambulu", kecamatan: "Ambulu", kapasitas: 300, terisi: 0, status: "standby" as const },
  { id: "p3", nama: "Balai Desa Kalisat", kecamatan: "Kalisat", kapasitas: 200, terisi: 200, status: "penuh" as const },
  { id: "p4", nama: "GOR Jember", kecamatan: "Jember", kapasitas: 1000, terisi: 0, status: "standby" as const },
];

const peringatanAktif = [
  { id: "wd1", kecamatan: "Gumukmas", deskripsi: "Potensi banjir akibat curah hujan tinggi di hulu sungai", tingkat_urgensi: "tinggi" as const, berlaku_hingga: "2024-05-05 06:00" },
  { id: "wd2", kecamatan: "Kalisat", deskripsi: "Longsor di jalur utama, akses jalan terganggu", tingkat_urgensi: "kritis" as const, berlaku_hingga: "2024-05-05 12:00" },
  { id: "wd3", kecamatan: "Ambulu", deskripsi: "Gelombang pasang, warga pesisir diminta waspada", tingkat_urgensi: "sedang" as const, berlaku_hingga: "2024-05-05 18:00" },
];

const kecamatanRawan = [
  { nama: "Gumukmas", level_rawan: "tinggi" as const },
  { nama: "Ambulu", level_rawan: "sedang" as const },
  { nama: "Kalisat", level_rawan: "tinggi" as const },
  { nama: "Arjasa", level_rawan: "rendah" as const },
  { nama: "Jenggawah", level_rawan: "sedang" as const },
];

const statusPosBadge = {
  standby: { variant: "info" as const, label: "Standby" },
  aktif: { variant: "success" as const, label: "Aktif" },
  penuh: { variant: "danger" as const, label: "Penuh" },
  tutup: { variant: "default" as const, label: "Tutup" },
};

const urgensiConfig = {
  rendah: { variant: "success" as const, label: "Rendah" },
  sedang: { variant: "warning" as const, label: "Sedang" },
  tinggi: { variant: "danger" as const, label: "Tinggi" },
  kritis: { variant: "danger" as const, label: "KRITIS" },
};

export default function PetaBencanaPage() {
  const [layers, setLayers] = useState(petaLayers);
  const [openSection, setOpenSection] = useState<string | null>("layers");

  const toggleLayer = (id: string) => {
    setLayers((prev) => prev.map((l) => (l.id === id ? { ...l, is_visible: !l.is_visible } : l)));
  };

  const toggleSection = (key: string) => {
    setOpenSection((prev) => (prev === key ? null : key));
  };

  const activeLayers = layers.filter((l) => l.is_visible).length;
  const embedUrl = `https://maps.google.com/maps?q=-8.1845,113.6681&z=11&output=embed`;

  return (
    <div>
      <PageBreadcrumb pageTitle="Peta Bencana" />

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-white/[0.03] flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-red-50 dark:bg-red-500/10 shrink-0">
            <HiOutlineExclamationTriangle className="w-5 h-5 text-red-500" />
          </div>
          <div>
            <p className="text-xs text-gray-500">Peringatan Aktif</p>
            <p className="text-xl font-bold text-gray-800 dark:text-white">{peringatanAktif.length}</p>
          </div>
        </div>
        <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-white/[0.03] flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-green-50 dark:bg-green-500/10 shrink-0">
            <HiOutlineHome className="w-5 h-5 text-green-500" />
          </div>
          <div>
            <p className="text-xs text-gray-500">Pos Pengungsian</p>
            <p className="text-xl font-bold text-gray-800 dark:text-white">{posPengungsian.length}</p>
          </div>
        </div>
        <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-white/[0.03] flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-orange-50 dark:bg-orange-500/10 shrink-0">
            <HiOutlineShieldExclamation className="w-5 h-5 text-orange-500" />
          </div>
          <div>
            <p className="text-xs text-gray-500">Kecamatan Rawan Tinggi</p>
            <p className="text-xl font-bold text-gray-800 dark:text-white">
              {kecamatanRawan.filter((k) => k.level_rawan === "tinggi").length}
            </p>
          </div>
        </div>
        <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-white/[0.03] flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-purple-50 dark:bg-purple-500/10 shrink-0">
            <HiOutlineFlag className="w-5 h-5 text-purple-500" />
          </div>
          <div>
            <p className="text-xs text-gray-500">Layer Aktif</p>
            <p className="text-xl font-bold text-gray-800 dark:text-white">{activeLayers} / {layers.length}</p>
          </div>
        </div>
      </div>

      {/* Main: Peta kiri, Kontrol kanan */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">

        {/* ─── KIRI: Peta ─────────────────────────────────────────────────── */}
        <div className="xl:col-span-3 order-1">
          <div className="rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-white/[0.03] overflow-hidden flex flex-col min-h-[620px] h-full">

            {/* Map Header */}
            <div className="px-5 py-3.5 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <HiOutlineMapPin className="w-5 h-5 text-blue-500" />
                <div>
                  <h3 className="text-sm font-bold text-gray-800 dark:text-white">Peta Bencana Kabupaten Jember</h3>
                  <p className="text-xs text-gray-400">Layer aktif: {activeLayers} dari {layers.length}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="hidden sm:flex items-center gap-3 mr-3">
                  {layers.filter((l) => l.is_visible).map((l) => (
                    <div key={l.id} className="flex items-center gap-1.5">
                      <span className={`w-2 h-2 rounded-full ${l.dot}`} />
                      <span className="text-xs text-gray-500">{l.nama_layer.split(" ")[0]}</span>
                    </div>
                  ))}
                </div>
                <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-600 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors">
                  <HiOutlineArrowPath className="w-3.5 h-3.5" />
                  Refresh
                </button>
              </div>
            </div>

            {/* Map Embed */}
            <div className="relative flex-1">
              <iframe
                title="Peta Bencana Jember"
                src={embedUrl}
                width="100%"
                height="100%"
                className="border-0 min-h-[540px]"
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
              {/* Legenda overlay */}
              <div className="absolute bottom-4 left-4 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 shadow-lg p-3 min-w-[160px]">
                <p className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-2">Legenda</p>
                <div className="space-y-1.5 mb-3">
                  {layers.map((l) => (
                    <div key={l.id} className={`flex items-center gap-2 ${!l.is_visible ? "opacity-30" : ""}`}>
                      <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${l.dot}`} />
                      <span className="text-xs text-gray-600 dark:text-gray-400">{l.nama_layer}</span>
                    </div>
                  ))}
                </div>
                <div className="pt-2 border-t border-gray-100 dark:border-gray-800 space-y-1.5">
                  <p className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Zona Rawan</p>
                  <div className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-sm bg-red-400 shrink-0" /><span className="text-xs text-gray-600 dark:text-gray-400">Tinggi</span></div>
                  <div className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-sm bg-yellow-400 shrink-0" /><span className="text-xs text-gray-600 dark:text-gray-400">Sedang</span></div>
                  <div className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-sm bg-green-400 shrink-0" /><span className="text-xs text-gray-600 dark:text-gray-400">Rendah</span></div>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* ─── KANAN: Kontrol ─────────────────────────────────────────────── */}
        <div className="xl:col-span-1 space-y-4 order-2">

          {/* Kontrol Layer */}
          <div className="rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-white/[0.03] overflow-hidden">
            <button onClick={() => toggleSection("layers")} className="w-full px-5 py-4 flex items-center justify-between border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
              <div className="flex items-center gap-2">
                <HiOutlineMapPin className="w-4 h-4 text-blue-500" />
                <span className="text-sm font-bold text-gray-800 dark:text-white">Kontrol Layer</span>
              </div>
              {openSection === "layers" ? <HiChevronUp className="w-4 h-4 text-gray-400" /> : <HiChevronDown className="w-4 h-4 text-gray-400" />}
            </button>
            {openSection === "layers" && (
              <div className="p-4 space-y-2">
                {[...layers].sort((a, b) => a.urutan - b.urutan).map((layer) => (
                  <div key={layer.id} className={`flex items-center justify-between p-3 rounded-xl border transition-colors ${layer.is_visible ? `${layer.bg} border-transparent` : "bg-gray-50 dark:bg-gray-800/40 border-gray-100 dark:border-gray-700/50"}`}>
                    <div className="flex items-center gap-2.5">
                      <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${layer.is_visible ? layer.dot : "bg-gray-300 dark:bg-gray-600"}`} />
                      <span className={`text-sm font-medium ${layer.is_visible ? "text-gray-800 dark:text-gray-200" : "text-gray-400 dark:text-gray-500"}`}>{layer.nama_layer}</span>
                    </div>
                    <button onClick={() => toggleLayer(layer.id)} className={`p-1 rounded-lg transition-colors ${layer.is_visible ? layer.color : "text-gray-300 dark:text-gray-600"}`}>
                      {layer.is_visible ? <HiOutlineEye className="w-4 h-4" /> : <HiOutlineEyeSlash className="w-4 h-4" />}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Peringatan Aktif */}
          <div className="rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-white/[0.03] overflow-hidden">
            <button onClick={() => toggleSection("peringatan")} className="w-full px-5 py-4 flex items-center justify-between border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
              <div className="flex items-center gap-2">
                <HiOutlineExclamationTriangle className="w-4 h-4 text-red-500" />
                <span className="text-sm font-bold text-gray-800 dark:text-white">Peringatan Aktif</span>
                <span className="ml-1 text-xs font-semibold text-white bg-red-500 px-1.5 py-0.5 rounded-full">{peringatanAktif.length}</span>
              </div>
              {openSection === "peringatan" ? <HiChevronUp className="w-4 h-4 text-gray-400" /> : <HiChevronDown className="w-4 h-4 text-gray-400" />}
            </button>
            {openSection === "peringatan" && (
              <div className="p-4 space-y-3">
                {peringatanAktif.map((w) => {
                  const cfg = urgensiConfig[w.tingkat_urgensi];
                  return (
                    <div key={w.id} className="p-3 bg-gray-50 dark:bg-gray-800/40 rounded-xl border border-gray-100 dark:border-gray-700/50">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">{w.kecamatan}</span>
                        <AdminBadge variant={cfg.variant}>{cfg.label}</AdminBadge>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">{w.deskripsi}</p>
                      <p className="text-xs text-gray-400 mt-1.5">Berlaku hingga: {w.berlaku_hingga}</p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Pos Pengungsian */}
          <div className="rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-white/[0.03] overflow-hidden">
            <button onClick={() => toggleSection("pos")} className="w-full px-5 py-4 flex items-center justify-between border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
              <div className="flex items-center gap-2">
                <HiOutlineHome className="w-4 h-4 text-green-500" />
                <span className="text-sm font-bold text-gray-800 dark:text-white">Pos Pengungsian</span>
              </div>
              {openSection === "pos" ? <HiChevronUp className="w-4 h-4 text-gray-400" /> : <HiChevronDown className="w-4 h-4 text-gray-400" />}
            </button>
            {openSection === "pos" && (
              <div className="p-4 space-y-3">
                {posPengungsian.map((pos) => {
                  const pct = Math.round((pos.terisi / pos.kapasitas) * 100);
                  const cfg = statusPosBadge[pos.status];
                  return (
                    <div key={pos.id} className="p-3 bg-gray-50 dark:bg-gray-800/40 rounded-xl border border-gray-100 dark:border-gray-700/50">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-semibold text-gray-800 dark:text-gray-200 truncate max-w-[120px]">{pos.nama}</span>
                        <AdminBadge variant={cfg.variant}>{cfg.label}</AdminBadge>
                      </div>
                      <p className="text-xs text-gray-500 mb-2">{pos.kecamatan}</p>
                      <div className="w-full h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full transition-all ${pct >= 100 ? "bg-red-500" : pct >= 75 ? "bg-yellow-500" : "bg-green-500"}`} style={{ width: `${Math.min(pct, 100)}%` }} />
                      </div>
                      <p className="text-xs text-gray-400 mt-1">{pos.terisi} / {pos.kapasitas} jiwa ({pct}%)</p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Level Rawan */}
          <div className="rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-white/[0.03] overflow-hidden">
            <button onClick={() => toggleSection("rawan")} className="w-full px-5 py-4 flex items-center justify-between border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
              <div className="flex items-center gap-2">
                <HiOutlineShieldExclamation className="w-4 h-4 text-orange-500" />
                <span className="text-sm font-bold text-gray-800 dark:text-white">Level Rawan</span>
              </div>
              {openSection === "rawan" ? <HiChevronUp className="w-4 h-4 text-gray-400" /> : <HiChevronDown className="w-4 h-4 text-gray-400" />}
            </button>
            {openSection === "rawan" && (
              <div className="p-4 space-y-2">
                {kecamatanRawan.map((k) => (
                  <div key={k.nama} className="flex items-center justify-between py-1.5">
                    <span className="text-sm text-gray-700 dark:text-gray-300">{k.nama}</span>
                    <AdminBadge variant={k.level_rawan === "tinggi" ? "danger" : k.level_rawan === "sedang" ? "warning" : "success"} dot>
                      {k.level_rawan.charAt(0).toUpperCase() + k.level_rawan.slice(1)}
                    </AdminBadge>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
