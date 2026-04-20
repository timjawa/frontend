"use client";

import dynamic from "next/dynamic";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

// ⚠️ WAJIB pakai dynamic import + ssr: false
// Leaflet error kalau dirender di server karena
// butuh objek 'window' yang hanya ada di browser
const MapView = dynamic(
  () => import("@/components/MapView"),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center w-full h-[100vh] bg-gray-50">
        <div className="text-primary font-medium flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          Memuat peta...
        </div>
      </div>
    ),
  }
);

export default function PetaPage() {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Navbar />

      {/* Konten Utama */}
      <main className="flex-grow pt-[88px] flex flex-col">
        
        {/* Container Peta Layar Penuh namun Menyisakan Scroll untuk Footer */}
        <div className="relative w-full h-[75vh] md:h-[80vh] min-h-[600px] z-0">
          {/* Obyek Peta */}
          <MapView />

          {/* Card Keterangan Peta (Legend) */}
          <div className="absolute top-4 right-4 z-[1000] bg-white/95 backdrop-blur-md rounded-xl shadow-[0_10px_25px_-5px_rgba(0,0,0,0.2)] p-5 w-72 md:w-80 border border-gray-200">
            <h3 className="font-bold text-gray-800 mb-4 border-b pb-3 flex items-center gap-2.5">
              <span className="text-2xl">⚠️</span> 
              <span className="tracking-tight text-primary-dark">Peringatan Dini Cuaca</span>
            </h3>
            
            <div className="space-y-4">
              <div className="flex items-start gap-3.5">
                <div className="w-7 h-2.5 mt-1.5 bg-red-500 rounded-full flex-shrink-0 shadow-sm border border-red-600/20"></div>
                <div>
                  <p className="font-bold text-red-600 leading-tight">Terjadi Bencana (Bahaya)</p>
                  <p className="text-xs text-gray-500 mt-1 leading-relaxed">Jalan terdampak bencana parah, tidak bisa dilewati</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3.5">
                <div className="w-7 h-2.5 mt-1.5 bg-amber-500 rounded-full flex-shrink-0 shadow-sm border border-amber-600/20"></div>
                <div>
                  <p className="font-bold text-amber-600 leading-tight">Waspada (Beresiko)</p>
                  <p className="text-xs text-gray-500 mt-1 leading-relaxed">Ada risiko / peringatan dini, harap sangat berhati-hati</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3.5">
                <div className="w-7 h-2.5 mt-1.5 bg-green-500 rounded-full flex-shrink-0 shadow-sm border border-green-600/20"></div>
                <div>
                  <p className="font-bold text-green-600 leading-tight">Aman Terkendali</p>
                  <p className="text-xs text-gray-500 mt-1 leading-relaxed">Jalan dalam kondisi normal, dapat dilewati lancar</p>
                </div>
              </div>
            </div>

            <div className="mt-5 pt-3.5 border-t border-gray-100 bg-gray-50/50 -mx-5 -mb-5 p-4 rounded-b-xl flex flex-col gap-2">
               <p className="text-xs text-center text-gray-500 font-medium">Klik marker bulat atau garis untuk rincian.</p>
               <p className="text-[10px] text-center text-gray-400 italic">Gunakan tombol (+/-) untuk Zoom peta.</p>
            </div>
          </div>
        </div>
      </main>

      {/* Komponen Footer Otentik */}
      <Footer />
    </div>
  );
}