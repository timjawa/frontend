"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import api from "@/lib/api";
import type { PetaMarker } from "@/components/maps/MapView";

// ⚠️ WAJIB pakai dynamic import + ssr: false
const MapView = dynamic<{
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
  const [markers, setMarkers] = useState<PetaMarker[]>([]);
  const [loading, setLoading] = useState(true);

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

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Navbar />

      {/* Konten Utama */}
      <main className="flex-grow pt-[88px] flex flex-col relative">
        
        {/* Container Peta Layar Penuh namun Menyisakan Scroll untuk Footer */}
        <div className="relative w-full h-[75vh] md:h-[80vh] min-h-[600px] z-0 overflow-hidden">
          {/* Obyek Peta - Hanya dirender jika data marker sudah SIAP */}
          {!loading ? (
            <MapView 
              markers={markers} // Kirim data markers yang sudah di-fetch secara instan
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

          {/* Card Keterangan Peta (Legend) - Kembali ke Kanan Atas */}
          <div className="absolute top-6 right-6 z-[1000] bg-white/95 backdrop-blur-md rounded-2xl shadow-[0_10px_25px_-5px_rgba(0,0,0,0.15)] p-5 w-72 md:w-80 border border-gray-200/60 transition-all">
            <h3 className="font-bold text-gray-800 mb-4 border-b border-gray-100 pb-3 flex items-center gap-2.5">
              <span className="text-xl">⚠️</span> 
              <span className="tracking-tight text-primary-dark font-bold text-sm md:text-base">Keterangan Peta Bencana</span>
            </h3>
            
            <div className="space-y-3.5">
              <div className="flex items-start gap-3">
                <div className="w-3.5 h-3.5 mt-0.5 bg-red-600 rounded-full shrink-0 shadow-sm shadow-red-500/20 border border-red-700/10"></div>
                <div>
                  <p className="text-xs font-bold text-gray-700 leading-tight">Bahaya Kritis</p>
                  <p className="text-[10px] text-gray-405 mt-0.5 leading-relaxed">Terjadi bencana parah, akses terputus / sangat berbahaya.</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="w-3.5 h-3.5 mt-0.5 bg-orange-500 rounded-full shrink-0 shadow-sm shadow-orange-500/20 border border-orange-700/10"></div>
                <div>
                  <p className="text-xs font-bold text-gray-700 leading-tight">Bahaya Tinggi</p>
                  <p className="text-[10px] text-gray-405 mt-0.5 leading-relaxed">Tingkat bahaya tinggi, harap selalu waspada dan hati-hati.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-3.5 h-3.5 mt-0.5 bg-yellow-400 rounded-full shrink-0 shadow-sm shadow-yellow-500/20 border border-yellow-700/10"></div>
                <div>
                  <p className="text-xs font-bold text-gray-700 leading-tight">Bahaya Sedang</p>
                  <p className="text-[10px] text-gray-405 mt-0.5 leading-relaxed">Kondisi waspada, perlu dipantau secara berkala.</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="w-3.5 h-3.5 mt-0.5 bg-blue-500 rounded-full shrink-0 shadow-sm shadow-blue-500/20 border border-blue-700/10"></div>
                <div>
                  <p className="text-xs font-bold text-gray-700 leading-tight">Aman / Rendah</p>
                  <p className="text-[10px] text-gray-405 mt-0.5 leading-relaxed">Informasi umum atau wilayah dengan potensi kerawanan rendah.</p>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-gray-100 flex flex-col gap-1.5">
               <p className="text-[10px] text-center text-gray-450 leading-normal">Klik penanda/garis di peta untuk info detail.</p>
               <p className="text-[9px] text-center text-gray-400 italic">Gunakan tombol (+/-) untuk mengatur Zoom.</p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}