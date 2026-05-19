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
  const [selectedMarkerId, setSelectedMarkerId] = useState<string | null>(null);
  const [panToCoord, setPanToCoord] = useState<[number, number] | null>(null);

  // States untuk collapse/expand sidebar cards
  const [isLaporanOpen, setIsLaporanOpen] = useState(false);
  const [isKecamatanOpen, setIsKecamatanOpen] = useState(false);
  const [isPosOpen, setIsPosOpen] = useState(false);

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

      <main className="flex-grow pt-[88px] pb-16">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 mt-6">
          {/* Header Bencana */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white tracking-tight">
                PETA PEMETAAN BENCANA
              </h1>
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
                Visualisasi data titik bencana terverifikasi, wilayah kecamatan rawan, dan lokasi pos pengungsian aktif.
              </p>
            </div>
            
            <button
              onClick={handleRefresh}
              className="self-start md:self-auto inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-gray-700 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-850 active:scale-95 transition-all shadow-sm shrink-0"
            >
              <HiOutlineArrowPath className={`w-4 h-4 text-gray-500 ${loading || loadingKecamatan ? "animate-spin" : ""}`} />
              Refresh Peta
            </button>
          </div>

          {/* Grid Layout Peta & Sidebar */}
          <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 items-start">
            
            {/* KIRI: Peta Visual Utama (3 Kolom) */}
            <div className="xl:col-span-3 bg-white dark:bg-gray-900 rounded-3xl border border-gray-150 dark:border-gray-800 shadow-sm overflow-hidden flex flex-col min-h-[550px] md:min-h-[650px]">
              
              {/* Top Header Map */}
              <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-500/10">
                    <HiOutlineMapPin className="w-5 h-5 text-blue-500" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-gray-850 dark:text-white leading-tight">
                      Peta Interaktif Kabupaten Jember
                    </h3>
                    <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-0.5">
                      {markers.length} penanda aktif terpetakan di wilayah Jember
                    </p>
                  </div>
                </div>
              </div>

              {/* Legenda Layer */}
              <div className="px-5 py-2.5 border-b border-gray-100 dark:border-gray-800 flex flex-wrap items-center gap-x-4 gap-y-1.5 bg-gray-50/50 dark:bg-white/[0.01]">
                <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Legenda Layer:</span>
                
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-600 shrink-0 shadow-sm shadow-red-500/20" />
                  <span className="text-[11px] font-medium text-gray-500 dark:text-gray-400">Bahaya Kritis</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-orange-500 shrink-0 shadow-sm shadow-orange-500/20" />
                  <span className="text-[11px] font-medium text-gray-500 dark:text-gray-400">Bahaya Tinggi</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-yellow-400 shrink-0 shadow-sm shadow-yellow-500/20" />
                  <span className="text-[11px] font-medium text-gray-500 dark:text-gray-400">Bahaya Sedang</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-500 shrink-0 shadow-sm shadow-blue-500/20" />
                  <span className="text-[11px] font-medium text-gray-500 dark:text-gray-400">Aman / Rendah</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-purple-500 shrink-0 shadow-sm shadow-purple-500/20" />
                  <span className="text-[11px] font-medium text-gray-500 dark:text-gray-400">Pos Pengungsian</span>
                </div>
              </div>

              {/* Map Canvas */}
              <div className="flex-grow relative h-[500px] md:h-[550px] z-0 overflow-hidden">
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
              </div>
            </div>

            {/* KANAN: Tiga Dropdown Sidebar (1 Kolom) */}
            <div className="xl:col-span-1 space-y-4">
              
              {/* CARD 1: LAPORAN WARGA (Diverifikasi) */}
              <div className="rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-white/[0.03] overflow-hidden flex flex-col">
                <div
                  onClick={() => setIsLaporanOpen(!isLaporanOpen)}
                  className="px-5 py-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between bg-gray-50/30 dark:bg-transparent shrink-0 cursor-pointer select-none hover:bg-gray-100/30 dark:hover:bg-white/[0.01] transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <HiOutlineExclamationTriangle className="w-4 h-4 text-orange-500 shrink-0" />
                    <span className="text-sm font-bold text-gray-800 dark:text-white">Laporan Warga</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-orange-100 text-orange-700 dark:bg-orange-950/40 dark:text-orange-400 shrink-0">
                      {laporanList.length} aktif
                    </span>
                  </div>
                  {isLaporanOpen ? <HiChevronUp className="w-4 h-4 text-gray-500" /> : <HiChevronDown className="w-4 h-4 text-gray-500" />}
                </div>

                {isLaporanOpen && (
                  <div className="p-3 space-y-2.5 max-h-[300px] overflow-y-auto transition-all">
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
                            className={`p-3 rounded-xl border transition-all cursor-pointer border-l-4 border-l-orange-500 ${
                              isSelected
                                ? "border-orange-500 bg-orange-50/10 dark:bg-orange-950/10 shadow-sm"
                                : "border-gray-200 dark:border-gray-700/50 bg-white dark:bg-white/[0.02] hover:border-orange-300 hover:bg-orange-50/5"
                            }`}
                          >
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-xs font-bold text-gray-800 dark:text-gray-200 leading-tight">
                                {l.label || "Laporan Bencana"}
                              </span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <span className="inline-flex items-center gap-1 text-[8px] font-mono text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-950/20 px-1.5 py-0.5 rounded border border-orange-100 dark:border-orange-850/30">
                                Lat: {l.latitude.toFixed(5)}
                              </span>
                              <span className="inline-flex items-center gap-1 text-[8px] font-mono text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-950/20 px-1.5 py-0.5 rounded border border-orange-100 dark:border-orange-850/30">
                                Lng: {l.longitude.toFixed(5)}
                              </span>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                )}
              </div>

              {/* CARD 2: KECAMATAN RAWAN */}
              <div className="rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-white/[0.03] overflow-hidden flex flex-col">
                <div
                  onClick={() => setIsKecamatanOpen(!isKecamatanOpen)}
                  className="px-5 py-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between bg-gray-50/30 dark:bg-transparent shrink-0 cursor-pointer select-none hover:bg-gray-100/30 dark:hover:bg-white/[0.01] transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <HiOutlineShieldExclamation className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span className="text-sm font-bold text-gray-800 dark:text-white">Kecamatan Rawan</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 shrink-0">
                      {kecamatans.length} daerah
                    </span>
                  </div>
                  {isKecamatanOpen ? <HiChevronUp className="w-4 h-4 text-gray-500" /> : <HiChevronDown className="w-4 h-4 text-gray-500" />}
                </div>

                {isKecamatanOpen && (
                  <div className="p-3 flex flex-col gap-2.5 max-h-[350px] overflow-hidden transition-all">
                    {/* Search Kecamatan */}
                    <div className="relative shrink-0">
                      <HiMagnifyingGlass className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Cari kecamatan..."
                        value={kecamatanSearch}
                        onChange={(e) => setKecamatanSearch(e.target.value)}
                        className="w-full rounded-lg border border-gray-200 bg-white pl-8 pr-3 py-1.5 text-xs text-gray-900 shadow-sm outline-none transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:border-gray-700 dark:bg-gray-900/65 dark:text-gray-100"
                      />
                    </div>

                    {/* Scrollable list */}
                    <div className="flex-grow overflow-y-auto space-y-2 pr-0.5">
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
                              className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
                                isSelected
                                  ? "border-blue-500 bg-blue-50/10 dark:bg-blue-950/20 shadow-sm"
                                  : "border-gray-200 dark:border-gray-700/50 bg-white dark:bg-white/[0.02] hover:border-blue-300 hover:bg-blue-50/5"
                              }`}
                            >
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-xs font-bold text-gray-800 dark:text-gray-200 leading-none">
                                  {k.nama}
                                </span>
                              </div>
                              {hasCoords && (
                                <div className="flex items-center gap-1.5 mt-1">
                                  <span className="inline-flex items-center gap-1 text-[8px] font-mono text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/20 px-1.5 py-0.5 rounded border border-blue-100 dark:border-blue-800/30">
                                    Lat: {lat.toFixed(5)}
                                  </span>
                                  <span className="inline-flex items-center gap-1 text-[8px] font-mono text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/20 px-1.5 py-0.5 rounded border border-blue-100 dark:border-blue-800/30">
                                    Lng: {lng.toFixed(5)}
                                  </span>
                                </div>
                              )}
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* CARD 3: POS PENGUNGSIAN */}
              <div className="rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-white/[0.03] overflow-hidden flex flex-col">
                <div
                  onClick={() => setIsPosOpen(!isPosOpen)}
                  className="px-5 py-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between bg-gray-50/30 dark:bg-transparent shrink-0 cursor-pointer select-none hover:bg-gray-100/30 dark:hover:bg-white/[0.01] transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <HiOutlineHome className="w-4 h-4 text-purple-500 shrink-0" />
                    <span className="text-sm font-bold text-gray-800 dark:text-white">Pos Pengungsian</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 dark:bg-purple-950/40 dark:text-purple-400 shrink-0">
                      {posPengungsianList.length} pos
                    </span>
                  </div>
                  {isPosOpen ? <HiChevronUp className="w-4 h-4 text-gray-500" /> : <HiChevronDown className="w-4 h-4 text-gray-500" />}
                </div>

                {isPosOpen && (
                  <div className="p-3 space-y-2.5 max-h-[300px] overflow-y-auto transition-all">
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
                        const status = (p.status || "standby").toLowerCase();
                        let badgeColor = "bg-blue-50 text-blue-700 border-blue-100 dark:bg-blue-950/20 dark:text-blue-400 dark:border-blue-900/40";
                        if (status === "aktif") {
                          badgeColor = "bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/40";
                        } else if (status === "penuh") {
                          badgeColor = "bg-red-50 text-red-700 border-red-100 dark:bg-red-950/20 dark:text-red-400 dark:border-red-900/40";
                        }

                        return (
                          <div
                            key={p.id}
                            onClick={() => {
                              setSelectedMarkerId(p.id);
                              setPanToCoord(null);
                            }}
                            className={`p-3 rounded-xl border transition-all cursor-pointer border-l-4 border-l-purple-500 ${
                              isSelected
                                ? "border-purple-500 bg-purple-50/10 dark:bg-purple-950/10 shadow-sm"
                                : "border-gray-200 dark:border-gray-700/50 bg-white dark:bg-white/[0.02] hover:border-purple-300 hover:bg-purple-50/5"
                            }`}
                          >
                            <div className="flex items-start justify-between gap-2 mb-1">
                              <span className="text-xs font-bold text-gray-800 dark:text-gray-200 leading-tight">
                                {p.label || "Pos Pengungsian"}
                              </span>
                              <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded-full border shrink-0 ${badgeColor}`}>
                                {status.toUpperCase()}
                              </span>
                            </div>
                            
                            {(p.kapasitas !== undefined || p.terisi !== undefined) && (
                              <p className="text-[10px] text-gray-500 dark:text-gray-400 mb-1.5">
                                Terisi: <span className="font-bold">{p.terisi ?? 0}</span> / {p.kapasitas ?? 0} Jiwa
                              </p>
                            )}

                            <div className="flex items-center gap-1.5">
                              <span className="inline-flex items-center gap-1 text-[8px] font-mono text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/20 px-1.5 py-0.5 rounded border border-purple-100 dark:border-purple-850/30">
                                Lat: {p.latitude.toFixed(5)}
                              </span>
                              <span className="inline-flex items-center gap-1 text-[8px] font-mono text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/20 px-1.5 py-0.5 rounded border border-purple-100 dark:border-purple-850/30">
                                Lng: {p.longitude.toFixed(5)}
                              </span>
                            </div>
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