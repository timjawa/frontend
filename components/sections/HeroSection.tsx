"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { HiShieldCheck, HiMapPin, HiChevronLeft, HiChevronRight } from "react-icons/hi2";
import Image from "next/image";

interface PeringatanDiniProps {
  peringatanData?: any[];
}

const URGENCY_COLOR: Record<string, string> = {
  kritis: "#EF4444",
  tinggi: "#F97316",
  sedang: "#F59E0B",
  rendah: "#3B82F6",
};

const URGENCY_LABEL: Record<string, string> = {
  kritis: "Kritis",
  tinggi: "Tinggi",
  sedang: "Sedang",
  rendah: "Rendah",
};

export default function HeroSection({ peringatanData = [] }: PeringatanDiniProps) {
  const hasWarning = peringatanData.length > 0;
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);
  const autoPlayRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const scrollToSlide = useCallback((index: number) => {
    setActiveIndex(index);
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        left: index * scrollRef.current.clientWidth,
        behavior: "smooth",
      });
    }
  }, []);

  const startAutoPlay = useCallback(() => {
    if (autoPlayRef.current) clearInterval(autoPlayRef.current);
    if (peringatanData.length <= 1) return;
    autoPlayRef.current = setInterval(() => {
      setActiveIndex((prev) => {
        const next = (prev + 1) % peringatanData.length;
        if (scrollRef.current) {
          scrollRef.current.scrollTo({
            left: next * scrollRef.current.clientWidth,
            behavior: "smooth",
          });
        }
        return next;
      });
    }, 5000);
  }, [peringatanData.length]);

  useEffect(() => {
    startAutoPlay();
    return () => { if (autoPlayRef.current) clearInterval(autoPlayRef.current); };
  }, [startAutoPlay]);

  const handleScroll = useCallback(() => {
    if (!scrollRef.current) return;
    const { scrollLeft, clientWidth } = scrollRef.current;
    if (clientWidth > 0) {
      const idx = Math.round(scrollLeft / clientWidth);
      if (idx >= 0 && idx < peringatanData.length) setActiveIndex(idx);
    }
  }, [peringatanData.length]);

  const prev = () => scrollToSlide((activeIndex - 1 + peringatanData.length) % peringatanData.length);
  const next = () => scrollToSlide((activeIndex + 1) % peringatanData.length);

  return (
    <section className="pt-36 pb-8" style={{ backgroundColor: "#F3F8FF" }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-2 gap-5 items-stretch">

          {/* ── LEFT: Info Panel ── */}
          <div
            className="relative rounded-2xl overflow-hidden flex flex-col justify-between shadow-sm border border-slate-100"
            style={{
              backgroundColor: "#DFEAF6",
              minHeight: "300px",
            }}
          >
            {/* Shield watermarks at corners */}
            <Image
              src="/icons/shield.svg"
              alt=""
              width={140}
              height={140}
              className="absolute -top-6 -right-6 pointer-events-none select-none"
              aria-hidden="true"
            />
            <Image
              src="/icons/shield.svg"
              alt=""
              width={160}
              height={160}
              className="absolute -bottom-8 -left-8 pointer-events-none select-none"
              aria-hidden="true"
            />

            <div className="relative z-10 p-8 flex flex-col h-full justify-between">
              {/* Top section */}
              <div>
                {hasWarning ? (
                  <>
                    {/* Count display */}
                    <div className="flex items-end gap-3 mb-5">
                      <span
                        className="text-6xl font-black leading-none tracking-tighter"
                        style={{ color: "#3B82F6" }}
                      >
                        {peringatanData.length}
                      </span>
                      <div className="pb-1.5">
                        <p className="text-primary text-sm font-semibold leading-tight">Peringatan</p>
                        <p className="text-primary/60 text-xs">Aktif saat ini</p>
                      </div>
                    </div>

                    <h2 className="text-xl font-bold text-primary leading-snug mb-3">
                      Peringatan Dini<br />
                      <span className="text-primary/60 font-normal text-base">Kabupaten Jember</span>
                    </h2>

                    <p className="text-primary/70 text-sm leading-relaxed max-w-xs">
                      Tetap waspada. Pantau kondisi wilayah Anda dan ikuti arahan petugas BPBD.
                    </p>
                  </>
                ) : (
                  <>
                    <div className="mb-6">
                      <div>
                        <p className="text-primary text-sm font-semibold">Kondisi Aman</p>
                        <p className="text-primary/60 text-xs">Tidak ada peringatan aktif</p>
                      </div>
                    </div>

                    <h2 className="text-xl font-bold text-primary leading-snug mb-3">
                      Situasi Terkendali<br />
                      <span className="text-primary/60 font-normal text-base">Kabupaten Jember</span>
                    </h2>

                    <p className="text-primary/70 text-sm leading-relaxed max-w-xs">
                      Seluruh wilayah dalam kondisi aman. Tetap pantau informasi terkini dari BPBD Jember.
                    </p>
                  </>
                )}
              </div>

              {/* Bottom label */}
              <div className="mt-6 pt-5 border-t border-primary/10 flex items-center justify-between">
                <span className="text-primary/40 text-xs font-semibold tracking-wide uppercase">
                  BPBD Kabupaten Jember
                </span>
                <div className="flex items-center gap-1.5">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-60" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
                  </span>
                  <span className="text-red-500 font-medium text-xs">Live</span>
                </div>
              </div>
            </div>
          </div>

          {/* ── RIGHT: Warning Cards ── */}
          {hasWarning ? (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden flex flex-col" style={{ minHeight: "300px" }}>

              {/* Slide area */}
              <div className="flex-1 relative overflow-hidden">
                <div
                  ref={scrollRef}
                  onScroll={handleScroll}
                  className="flex h-full overflow-x-auto snap-x snap-mandatory scroll-smooth hide-scrollbar"
                >
                  {peringatanData.map((item: any) => {
                    const urgensi = item.tingkat_urgensi?.toLowerCase() || "rendah";
                    const color = URGENCY_COLOR[urgensi] || "#3B82F6";
                    const label = URGENCY_LABEL[urgensi] || "Rendah";
                    return (
                      <div key={item.id} className="w-full shrink-0 snap-center p-6 flex flex-col justify-between">
                        {/* Urgency tag row */}
                        <div className="flex items-center gap-2 mb-4">
                          <span className="text-xs font-bold text-slate-800 tracking-wide uppercase">
                            {item.kecamatan?.nama ? `Kecamatan ${item.kecamatan.nama}` : "Seluruh Wilayah"}
                          </span>
                        </div>

                        {/* Description */}
                        <p className="text-slate-700 text-[15px] leading-relaxed font-normal flex-1">
                          {item.deskripsi}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Footer navigation */}
              {peringatanData.length > 1 && (
                <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between">
                  {/* Dots */}
                  <div className="flex items-center gap-2">
                    {peringatanData.map((_, idx) => (
                      <button
                        key={idx}
                        onClick={() => scrollToSlide(idx)}
                        className={`h-2 rounded-full transition-all duration-500 ${
                          activeIndex === idx
                            ? 'w-6 bg-primary'
                          : 'w-2 bg-primary/20 hover:bg-primary/40'
                        }`}
                        aria-label={`Peringatan ${idx + 1}`}
                      />
                    ))}
                  </div>

                  {/* Counter */}
                  <span className="text-xs text-slate-400 font-medium">
                    {activeIndex + 1} / {peringatanData.length}
                  </span>
                </div>
              )}
            </div>
          ) : (
            /* ── Empty state ── */
            <div
              className="rounded-2xl border border-slate-100 bg-white flex flex-col items-center justify-center p-10 text-center shadow-sm"
              style={{ minHeight: "300px" }}
            >
              <h3 className="text-lg font-semibold text-slate-700 mb-2">Tidak Ada Peringatan</h3>
              <p className="text-sm text-slate-400 leading-relaxed max-w-xs">
                Seluruh wilayah Kabupaten Jember dalam kondisi aman dan terpantau normal.
              </p>
            </div>
          )}

        </div>
      </div>
    </section>
  );
}
