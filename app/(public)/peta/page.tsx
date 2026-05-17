"use client";

import { useState, useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import api from "@/lib/api";
import { HiOutlineMapPin, HiOutlineExclamationTriangle } from "react-icons/hi2";
import type { PetaMarker } from "@/components/maps/MapView";

// ⚠️ WAJIB pakai dynamic import + ssr: false
const MapView = dynamic<{
  selectedMarkerId?: string | null;
  onMapClick?: () => void;
  onMarkerClick?: (id: string) => void;
  markers: PetaMarker[];
}>(
  () => import("@/components/maps/MapView"),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full bg-gray-100 animate-pulse flex items-center justify-center relative overflow-hidden">
        {/* Efek Grid Peta Palsu - Lebih Tipis */}
        <div className="absolute inset-0 opacity-[0.03]" style={{ 
          backgroundImage: 'linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)',
          backgroundSize: '50px 50px' 
        }}></div>
        
        <div className="bg-white/50 backdrop-blur-sm px-8 py-4 rounded-3xl border border-white/50 shadow-sm z-10">
          <div className="h-4 bg-gray-200 rounded-full w-48 mx-auto"></div>
        </div>

        {/* Skeleton UI Controls */}
        <div className="absolute top-6 left-6 flex flex-col gap-3">
          <div className="w-12 h-12 bg-gray-200/50 rounded-2xl"></div>
          <div className="w-12 h-12 bg-gray-200/50 rounded-2xl"></div>
        </div>
      </div>
    ),
  }
);

export default function PetaPage() {
  const [selectedMarkerId, setSelectedMarkerId] = useState<string | null>(null);
  const [markers, setMarkers] = useState<PetaMarker[]>([]);
  const [loading, setLoading] = useState(true);
  const [visibleCount, setVisibleCount] = useState(10); // Mulai tampilkan 10 laporan
  const itemRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  useEffect(() => {
    const fetchMarkers = async () => {
      try {
        const res = await api.get("/api/peta-marker");
        setMarkers(res.data?.data || []);
      } catch (err) {
        console.error("Gagal mengambil data marker:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchMarkers();
  }, []);

  // Auto-scroll saat selectedMarkerId berubah
  useEffect(() => {
    if (selectedMarkerId && itemRefs.current[selectedMarkerId]) {
      itemRefs.current[selectedMarkerId]?.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
      });
    }
  }, [selectedMarkerId]);

  const displayedMarkers = markers.slice(0, visibleCount);

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Navbar />

      {/* Konten Utama */}
      <main className="flex-grow pt-[88px] flex flex-col relative">
        
        {/* Container Peta */}
        <div className="relative w-full h-[75vh] md:h-[80vh] min-h-[600px] z-0 overflow-hidden">
          {/* Obyek Peta - Hanya dirender jika data marker sudah SIAP */}
          {!loading ? (
            <MapView 
              selectedMarkerId={selectedMarkerId} 
              markers={markers} // Kirim data markers yang sudah di-fetch
              onMapClick={() => setSelectedMarkerId(null)} 
              onMarkerClick={(id) => setSelectedMarkerId(id)}
            />
          ) : (
            // Tampilkan Skeleton Peta jika data marker belum ada
            <div className="w-full h-full bg-gray-100 animate-pulse flex items-center justify-center relative overflow-hidden">
              <div className="absolute inset-0 opacity-[0.03]" style={{ 
                backgroundImage: 'linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)',
                backgroundSize: '50px 50px' 
              }}></div>
              <div className="bg-white/50 backdrop-blur-sm px-8 py-4 rounded-3xl border border-white/50 shadow-sm z-10">
                <div className="h-4 bg-gray-200 rounded-full w-48 mx-auto"></div>
              </div>
              <div className="absolute top-6 left-6 flex flex-col gap-3">
                <div className="w-12 h-12 bg-gray-200/50 rounded-2xl"></div>
                <div className="w-12 h-12 bg-gray-200/50 rounded-2xl"></div>
              </div>
            </div>
          )}

          {/* List Laporan Terverifikasi (Floating Sidebar) */}
          <div className="absolute top-6 left-6 z-[1000] hidden lg:block w-80 max-h-[85%] overflow-hidden flex flex-col">
            <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border border-gray-200/50 flex flex-col h-full overflow-hidden">
              <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-white/50">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-red-50 rounded-lg">
                    <HiOutlineExclamationTriangle className="w-5 h-5 text-red-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-800 text-sm">Laporan Terverifikasi</h3>
                    <p className="text-[10px] text-gray-500">{markers.length} titik aktif</p>
                  </div>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-2 space-y-2 custom-scrollbar">
                {loading ? (
                  // Skeleton Loading
                  Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="w-full p-3 rounded-xl border border-gray-100 bg-white flex items-start gap-3 animate-pulse">
                      <div className="w-10 h-10 bg-gray-100 rounded-lg shrink-0"></div>
                      <div className="flex-1 space-y-2 py-1">
                        <div className="h-3 bg-gray-100 rounded w-3/4"></div>
                        <div className="h-2 bg-gray-100 rounded w-1/2"></div>
                        <div className="h-2 bg-gray-100 rounded w-1/4"></div>
                      </div>
                    </div>
                  ))
                ) : markers.length === 0 ? (
                  <div className="py-10 text-center px-4">
                    <p className="text-xs text-gray-400">Belum ada laporan bencana aktif saat ini.</p>
                  </div>
                ) : (
                  <>
                    {displayedMarkers.map((m) => (
                      <button
                        key={m.id}
                        ref={(el) => { itemRefs.current[m.id] = el; }}
                        onClick={() => setSelectedMarkerId(selectedMarkerId === m.id ? null : m.id)}
                        className={`w-full text-left p-3 rounded-xl border transition-all flex items-start gap-3 group ${
                          selectedMarkerId === m.id 
                            ? "bg-primary/5 border-primary shadow-sm" 
                            : "bg-white border-gray-100 hover:border-primary/30 hover:bg-gray-50"
                        }`}
                      >
                        <div className={`p-2 rounded-lg shrink-0 transition-colors ${
                          selectedMarkerId === m.id ? "bg-primary text-white" : "bg-gray-100 text-gray-400 group-hover:bg-primary/10 group-hover:text-primary"
                        }`}>
                          <HiOutlineMapPin className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <p className={`text-xs font-bold truncate ${selectedMarkerId === m.id ? "text-primary" : "text-gray-700"}`}>
                            {m.label || m.kategori}
                          </p>
                          <p className="text-[10px] text-gray-500 mt-0.5">{m.kategori}</p>
                          <div className="flex items-center gap-2 mt-1.5">
                            <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase ${
                              m.tingkat_bahaya === 'kritis' ? 'bg-red-100 text-red-600' :
                              m.tingkat_bahaya === 'tinggi' ? 'bg-orange-100 text-orange-600' :
                              m.tingkat_bahaya === 'sedang' ? 'bg-yellow-100 text-yellow-600' :
                              'bg-blue-100 text-blue-600'
                            }`}>
                              {m.tingkat_bahaya}
                            </span>
                          </div>
                        </div>
                      </button>
                    ))}

                    {/* Tombol Muat Lebih Banyak */}
                    {visibleCount < markers.length && (
                      <button
                        onClick={() => setVisibleCount(prev => prev + 10)}
                        className="w-full py-3 text-[11px] font-bold text-primary hover:bg-primary/5 rounded-xl transition-all border border-dashed border-primary/20 mt-2 mb-2"
                      >
                        Muat Lebih Banyak (+10)
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Card Keterangan Peta (Legend) - Diperkecil & Pindah ke Kanan Bawah */}
          <div className="absolute bottom-6 right-6 z-[1000] bg-white/90 backdrop-blur-md rounded-2xl shadow-xl p-4 w-64 md:w-72 border border-gray-200/50 transition-all hover:bg-white">
            <h3 className="font-bold text-gray-800 mb-3 border-b border-gray-100 pb-2 flex items-center gap-2">
              <span className="w-2 h-4 bg-primary rounded-full"></span>
              <span className="text-sm tracking-tight">Keterangan Peta</span>
            </h3>
            
            <div className="space-y-2.5">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-red-600 rounded-full shadow-sm"></div>
                <div>
                  <p className="text-xs font-bold text-gray-700 leading-none">Bahaya Kritis</p>
                  <p className="text-[10px] text-gray-400 mt-0.5">Jalur lumpuh / bahaya tinggi</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-orange-500 rounded-full shadow-sm"></div>
                <div>
                  <p className="text-xs font-bold text-gray-700 leading-none">Waspada / Tinggi</p>
                  <p className="text-[10px] text-gray-400 mt-0.5">Risiko tinggi, harap hati-hati</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-yellow-400 rounded-full shadow-sm"></div>
                <div>
                  <p className="text-xs font-bold text-gray-700 leading-none">Sedang</p>
                  <p className="text-[10px] text-gray-400 mt-0.5">Kondisi perlu pemantauan</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-blue-500 rounded-full shadow-sm"></div>
                <div>
                  <p className="text-xs font-bold text-gray-700 leading-none">Info Umum / Rendah</p>
                  <p className="text-[10px] text-gray-400 mt-0.5">Informasi wilayah / jalur aman</p>
                </div>
              </div>
            </div>

            <div className="mt-3 pt-2.5 border-t border-gray-50 flex flex-col gap-1">
               <p className="text-[10px] text-center text-gray-400">Klik marker atau garis untuk detail rincian.</p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}