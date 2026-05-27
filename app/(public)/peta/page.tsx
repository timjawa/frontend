"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import dynamic from "next/dynamic";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import api from "@/lib/api";
import type { PetaMarker } from "@/components/maps/MapView";
import {
  HiOutlineMapPin,
  HiOutlineExclamationTriangle,
  HiOutlineHome,
  HiOutlineShieldExclamation,
  HiChevronDown,
  HiChevronUp,
  HiMagnifyingGlass,
  HiOutlineArrowPath
} from "react-icons/hi2";

// ⚠️ WAJIB pakai dynamic import + ssr: false untuk Leaflet di Next.js SSR
const MapView = dynamic<{
  markers: PetaMarker[];
  selectedMarkerId?: string | null;
  panToCoord?: [number, number] | null;
  onMapClick?: () => void;
  onMarkerClick?: (id: string) => void;
}>(
  () => import("@/components/maps/MapView"),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full bg-gray-100 dark:bg-gray-950 animate-pulse flex items-center justify-center relative overflow-hidden min-h-[500px]">
        {/* Grid Peta Palsu */}
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: 'linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)',
          backgroundSize: '50px 50px'
        }}></div>
        <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm px-6 py-3 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm z-10">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 bg-blue-500 rounded-full animate-ping" />
            <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">Memuat modul peta...</span>
          </div>
        </div>
      </div>
    ),
  }
);

export default function PetaPage() {
  const [markers, setMarkers] = useState<PetaMarker[]>([]);
  const [kecamatans, setKecamatans] = useState<any[]>([]);

  const [loading, setLoading] = useState(true);
  const [loadingKecamatan, setLoadingKecamatan] = useState(true);

  const [kecamatanSearch, setKecamatanSearch] = useState("");
  // State selected marker & pan
  const [selectedMarkerId, setSelectedMarkerId] = useState<string | null>(null);
  const [panToCoord, setPanToCoord] = useState<[number, number] | null>(null);

  // State accordion sidebar
  const [openCard, setOpenCard] = useState<"laporan" | "kecamatan" | "pos" | null>("laporan");

  // Fetch seluruh data peta bencana
  const fetchMapData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get("/api/peta-marker");
      setMarkers(res.data?.data || []);
    } catch (err) {
      console.error("Gagal mengambil data marker peta:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch data kecamatan
  const fetchKecamatanData = useCallback(async () => {
    setLoadingKecamatan(true);
    try {
      const res = await api.get("/api/kecamatan", { params: { all: true } });
      setKecamatans(res.data?.data || []);
    } catch (err) {
      console.error("Gagal mengambil data kecamatan:", err);
    } finally {
      setLoadingKecamatan(false);
    }
  }, []);

  useEffect(() => {
    fetchMapData();
    fetchKecamatanData();
  }, [fetchMapData, fetchKecamatanData]);

  // Handler untuk refresh data keseluruhan
  const handleRefresh = async () => {
    await Promise.all([fetchMapData(), fetchKecamatanData()]);
  };

  // Membagi markers berdasarkan source dari API PetaMarkerController
  const laporanList = useMemo(() => {
    return markers.filter((m) => m.source === "laporan");
  }, [markers]);

  const posPengungsianList = useMemo(() => {
    return markers.filter((m) => m.source === "pos_pengungsian");
  }, [markers]);

  // Pencarian Kecamatan
  const filteredKecamatans = useMemo(() => {
    return kecamatans.filter((k) =>
      k.nama.toLowerCase().includes(kecamatanSearch.toLowerCase())
    );
  }, [kecamatans, kecamatanSearch]);

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-950">
      <Navbar />

      <main className="flex-grow pt-[112px] flex flex-col">
        <div className="w-full flex-1 flex flex-col">
          {/* Grid Layout Peta & Sidebar */}
          <div className="grid grid-cols-1 xl:grid-cols-4 gap-0 items-stretch flex-1 h-[calc(100vh-112px)] min-h-[750px]">

            {/* KIRI: Peta Visual Utama (3 Kolom) */}
            <div className="xl:col-span-3 flex flex-col h-full overflow-hidden">

              {/* Map Canvas */}
              <div className="flex-grow relative h-full z-0 overflow-hidden">
                <MapView
                  markers={markers}
                  selectedMarkerId={selectedMarkerId}
                  panToCoord={panToCoord}
                  onMarkerClick={(id) => setSelectedMarkerId(id)}
                  onMapClick={() => {
                    setSelectedMarkerId(null);
                    setPanToCoord(null);
                  }}
                />

                {/* Floating Legenda Layer di Kanan Atas */}
                <div className="absolute right-4 top-4 z-[400] bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm p-3.5 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-lg flex flex-col gap-3">
                  <span className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-center border-b border-gray-200 dark:border-gray-700 pb-2">
                    Legenda
                  </span>

                  <div className="flex items-center gap-2.5">
                    <span className="w-3 h-3 rounded-full bg-red-600 shrink-0 shadow-sm shadow-red-500/20" />
                    <span className="text-xs font-medium text-gray-700 dark:text-gray-300">Bahaya Kritis</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <span className="w-3 h-3 rounded-full bg-orange-500 shrink-0 shadow-sm shadow-orange-500/20" />
                    <span className="text-xs font-medium text-gray-700 dark:text-gray-300">Bahaya Tinggi</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <span className="w-3 h-3 rounded-full bg-yellow-400 shrink-0 shadow-sm shadow-yellow-500/20" />
                    <span className="text-xs font-medium text-gray-700 dark:text-gray-300">Bahaya Sedang</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <span className="w-3 h-3 rounded-full bg-blue-500 shrink-0 shadow-sm shadow-blue-500/20" />
                    <span className="text-xs font-medium text-gray-700 dark:text-gray-300">Aman / Rendah</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <HiOutlineHome className="w-4 h-4 text-purple-500 shrink-0" />
                    <span className="text-xs font-medium text-gray-700 dark:text-gray-300">Pos Pengungsian</span>
                  </div>
                </div>
              </div>
            </div>

            {/* KANAN: Tiga Dropdown Sidebar (1 Kolom) */}
            <div className="xl:col-span-1 flex flex-col gap-4 p-4 h-full overflow-hidden z-10 border-l border-gray-200 dark:border-gray-800">

              {/* SECTION 1: LAPORAN WARGA (Diverifikasi) */}
              <div className="bg-white dark:bg-gray-950 rounded-2xl border border-gray-150 dark:border-gray-800 shadow-sm flex flex-col transition-all duration-300 overflow-hidden flex-none">
                <div
                  onClick={() => setOpenCard(openCard === "laporan" ? null : "laporan")}
                  className="p-5 flex items-center gap-4 cursor-pointer hover:bg-gray-50/50 dark:hover:bg-gray-900/50 transition-colors shrink-0"
                >
                  <div className="w-14 h-14 rounded-2xl bg-orange-50 dark:bg-orange-500/10 flex items-center justify-center shrink-0">
                    <HiOutlineExclamationTriangle className="w-6 h-6 text-orange-500" />
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-medium text-gray-600 dark:text-gray-400 leading-snug mb-1.5">Lokasi Bencana</div>
                    <div className="text-[28px] font-bold text-gray-900 dark:text-white leading-none tracking-tight">{laporanList.length}</div>
                  </div>
                  <div className="shrink-0 pl-1">
                    {openCard === "laporan" ? <HiChevronUp className="w-5 h-5 text-gray-400" /> : <HiChevronDown className="w-5 h-5 text-gray-400" />}
                  </div>
                </div>

                {openCard === "laporan" && (
                  <div className="px-4 pb-4 space-y-2 max-h-[350px] overflow-y-auto border-t border-gray-50 dark:border-gray-800/50 pt-3">
                    <p className="text-[10px] text-gray-400 dark:text-gray-500 italic px-1">
                      Klik laporan untuk memfokuskan lokasi bencana di peta.
                    </p>

                    {loading ? (
                      <div className="space-y-2.5">
                        {Array.from({ length: 2 }).map((_, idx) => (
                          <div key={idx} className="p-3 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-white/[0.02] animate-pulse space-y-2">
                            <div className="h-3 bg-gray-250 dark:bg-gray-800 rounded w-24" />
                            <div className="h-3 bg-gray-250 dark:bg-gray-800 rounded w-32" />
                          </div>
                        ))}
                      </div>
                    ) : laporanList.length === 0 ? (
                      <p className="text-center text-xs text-gray-400 dark:text-gray-555 py-6">Belum ada laporan terverifikasi.</p>
                    ) : (
                      laporanList.map((l) => {
                        const isSelected = selectedMarkerId === l.id;
                        return (
                          <div
                            key={l.id}
                            onClick={() => {
                              setSelectedMarkerId(l.id);
                              setPanToCoord(null);
                            }}
                            className={`p-3 rounded-xl border transition-all cursor-pointer ${isSelected
                                ? "border-orange-500 bg-orange-50/10 dark:bg-orange-950/10 shadow-sm"
                                : "border-gray-200 dark:border-gray-700/50 bg-white dark:bg-white/[0.02] hover:border-orange-300 hover:bg-orange-50/5"
                              }`}
                          >
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-xs font-bold text-gray-800 dark:text-gray-200 leading-tight">
                                {l.label || "Laporan Bencana"}
                              </span>
                            </div>

                          </div>
                        );
                      })
                    )}
                  </div>
                )}
              </div>

              {/* SECTION 2: KECAMATAN RAWAN */}
              <div className="bg-white dark:bg-gray-950 rounded-2xl border border-gray-150 dark:border-gray-800 shadow-sm flex flex-col transition-all duration-300 overflow-hidden flex-none">
                <div
                  onClick={() => setOpenCard(openCard === "kecamatan" ? null : "kecamatan")}
                  className="p-5 flex items-center gap-4 cursor-pointer hover:bg-gray-50/50 dark:hover:bg-gray-900/50 transition-colors shrink-0"
                >
                  <div className="w-14 h-14 rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center shrink-0">
                    <HiOutlineShieldExclamation className="w-6 h-6 text-emerald-500" />
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-medium text-gray-600 dark:text-gray-400 leading-snug mb-1.5">Kecamatan</div>
                    <div className="text-[28px] font-bold text-gray-900 dark:text-white leading-none tracking-tight">{kecamatans.length}</div>
                  </div>
                  <div className="shrink-0 pl-1">
                    {openCard === "kecamatan" ? <HiChevronUp className="w-5 h-5 text-gray-400" /> : <HiChevronDown className="w-5 h-5 text-gray-400" />}
                  </div>
                </div>

                {openCard === "kecamatan" && (
                  <div className="px-4 pb-4 flex flex-col gap-3 max-h-[350px] border-t border-gray-50 dark:border-gray-800/50 pt-3">
                    {/* Search Kecamatan */}
                    <div className="relative shrink-0">
                      <HiMagnifyingGlass className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Cari kecamatan..."
                        value={kecamatanSearch}
                        onChange={(e) => setKecamatanSearch(e.target.value)}
                        className="w-full rounded-lg border border-gray-200 bg-gray-50 pl-8 pr-3 py-1.5 text-xs text-gray-900 shadow-sm outline-none transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:border-gray-700 dark:bg-gray-900/65 dark:text-gray-100"
                      />
                    </div>

                    {/* Scrollable list */}
                    <div className="flex-grow overflow-y-auto space-y-2 pr-1">
                      {loadingKecamatan ? (
                        <div className="space-y-2">
                          {Array.from({ length: 3 }).map((_, idx) => (
                            <div key={idx} className="p-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-white/[0.02] animate-pulse space-y-2">
                              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-24" />
                              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-28" />
                            </div>
                          ))}
                        </div>
                      ) : filteredKecamatans.length === 0 ? (
                        <p className="text-center text-xs text-gray-400 dark:text-gray-550 py-4">Kecamatan tidak ditemukan.</p>
                      ) : (
                        filteredKecamatans.map((k) => {
                          const lat = Number(k.latitude);
                          const lng = Number(k.longitude);
                          const hasCoords = Number.isFinite(lat) && Number.isFinite(lng);
                          const isSelected = panToCoord && hasCoords && panToCoord[0] === lat && panToCoord[1] === lng;

                          return (
                            <div
                              key={k.id}
                              onClick={() => {
                                if (hasCoords) {
                                  setPanToCoord([lat, lng]);
                                  setSelectedMarkerId(null);
                                }
                              }}
                              className={`p-2.5 rounded-xl border transition-all cursor-pointer ${isSelected
                                  ? "border-blue-500 bg-blue-50/10 dark:bg-blue-950/20 shadow-sm"
                                  : "border-gray-200 dark:border-gray-700/50 bg-white dark:bg-white/[0.02] hover:border-blue-300 hover:bg-blue-50/5"
                                }`}
                            >
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-xs font-bold text-gray-800 dark:text-gray-200 leading-none">
                                  {k.nama}
                                </span>
                              </div>

                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* SECTION 3: POS PENGUNGSIAN */}
              <div className="bg-white dark:bg-gray-950 rounded-2xl border border-gray-150 dark:border-gray-800 shadow-sm flex flex-col transition-all duration-300 overflow-hidden flex-none">
                <div
                  onClick={() => setOpenCard(openCard === "pos" ? null : "pos")}
                  className="p-5 flex items-center gap-4 cursor-pointer hover:bg-gray-50/50 dark:hover:bg-gray-900/50 transition-colors shrink-0"
                >
                  <div className="w-14 h-14 rounded-2xl bg-purple-50 dark:bg-purple-500/10 flex items-center justify-center shrink-0">
                    <HiOutlineHome className="w-6 h-6 text-purple-500" />
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-medium text-gray-600 dark:text-gray-400 leading-snug mb-1.5">Pos Pengungsian</div>
                    <div className="text-[28px] font-bold text-gray-900 dark:text-white leading-none tracking-tight">{posPengungsianList.length}</div>
                  </div>
                  <div className="shrink-0 pl-1">
                    {openCard === "pos" ? <HiChevronUp className="w-5 h-5 text-gray-400" /> : <HiChevronDown className="w-5 h-5 text-gray-400" />}
                  </div>
                </div>

                {openCard === "pos" && (
                  <div className="px-4 pb-4 space-y-2 max-h-[350px] overflow-y-auto border-t border-gray-50 dark:border-gray-800/50 pt-3">
                    <p className="text-[10px] text-gray-400 dark:text-gray-500 italic px-1">
                      Klik pos untuk memfokuskan lokasi pengungsian di peta.
                    </p>

                    {loading ? (
                      <div className="space-y-2.5">
                        {Array.from({ length: 2 }).map((_, idx) => (
                          <div key={idx} className="p-3 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-white/[0.02] animate-pulse space-y-2">
                            <div className="h-3 bg-gray-250 dark:bg-gray-800 rounded w-24" />
                            <div className="h-3 bg-gray-250 dark:bg-gray-800 rounded w-32" />
                          </div>
                        ))}
                      </div>
                    ) : posPengungsianList.length === 0 ? (
                      <p className="text-center text-xs text-gray-400 dark:text-gray-550 py-6">Belum ada pos pengungsian aktif.</p>
                    ) : (
                      posPengungsianList.map((p) => {
                        const isSelected = selectedMarkerId === p.id;
                        return (
                          <div
                            key={p.id}
                            onClick={() => {
                              setSelectedMarkerId(p.id);
                              setPanToCoord(null);
                            }}
                            className={`p-3 rounded-xl border transition-all cursor-pointer ${isSelected
                                ? "border-purple-500 bg-purple-50/10 dark:bg-purple-950/10 shadow-sm"
                                : "border-gray-200 dark:border-gray-700/50 bg-white dark:bg-white/[0.02] hover:border-purple-300 hover:bg-purple-50/5"
                              }`}
                          >
                            <div className="flex items-start justify-between gap-2 mb-1">
                              <span className="text-xs font-bold text-gray-800 dark:text-gray-200 leading-tight">
                                {p.label || "Pos Pengungsian"}
                              </span>
                            </div>

                            {(p.kapasitas !== undefined || p.terisi !== undefined) && (
                              <p className="text-[10px] text-gray-500 dark:text-gray-400 mb-0">
                                Terisi: <span className="font-bold">{p.terisi ?? 0}</span> / {p.kapasitas ?? 0} Jiwa
                              </p>
                            )}
                          </div>
                        );
                      })
                    )}
                  </div>
                )}
              </div>

            </div>

          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}