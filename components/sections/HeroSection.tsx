"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { HiShieldCheck, HiBellAlert, HiMapPin, HiClock } from "react-icons/hi2";
import { WiDaySunny, WiCloud } from "react-icons/wi";

interface PeringatanDiniProps {
  peringatanData?: any[];
}

const getUrgensiConfig = (urgensi: string) => {
  switch (urgensi?.toLowerCase()) {
    case 'kritis':
      return {
        label: 'Kritis',
        dot: 'bg-red-500',
        badgeBg: 'bg-red-500/10',
        badgeText: 'text-red-600',
        badgeBorder: 'border-red-500/20',
        accentColor: '#EF4444',
      };
    case 'tinggi':
      return {
        label: 'Tinggi',
        dot: 'bg-orange-500',
        badgeBg: 'bg-orange-500/10',
        badgeText: 'text-orange-600',
        badgeBorder: 'border-orange-500/20',
        accentColor: '#F97316',
      };
    case 'sedang':
      return {
        label: 'Sedang',
        dot: 'bg-amber-500',
        badgeBg: 'bg-amber-500/10',
        badgeText: 'text-amber-600',
        badgeBorder: 'border-amber-500/20',
        accentColor: '#F59E0B',
      };
    case 'rendah':
    default:
      return {
        label: 'Rendah',
        dot: 'bg-blue-500',
        badgeBg: 'bg-blue-500/10',
        badgeText: 'text-blue-600',
        badgeBorder: 'border-blue-500/20',
        accentColor: '#3B82F6',
      };
  }
};

export default function HeroSection({ peringatanData = [] }: PeringatanDiniProps) {
  const hasWarning = peringatanData.length > 0;
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);
  const autoPlayRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const userInteractedRef = useRef(false);

  const scrollToSlide = useCallback((index: number) => {
    setActiveIndex(index);
    if (scrollRef.current) {
      const cardWidth = scrollRef.current.clientWidth;
      scrollRef.current.scrollTo({
        left: index * cardWidth,
        behavior: 'smooth',
      });
    }
  }, []);

  // Start/restart auto-play
  const startAutoPlay = useCallback(() => {
    if (autoPlayRef.current) clearInterval(autoPlayRef.current);
    if (peringatanData.length <= 1) return;

    autoPlayRef.current = setInterval(() => {
      setActiveIndex((prev) => {
        const next = (prev + 1) % peringatanData.length;
        if (scrollRef.current) {
          const cardWidth = scrollRef.current.clientWidth;
          scrollRef.current.scrollTo({ left: next * cardWidth, behavior: 'smooth' });
        }
        return next;
      });
    }, 5000);
  }, [peringatanData.length]);

  useEffect(() => {
    startAutoPlay();
    return () => {
      if (autoPlayRef.current) clearInterval(autoPlayRef.current);
    };
  }, [startAutoPlay]);

  // Sync active dot on manual scroll
  const handleScroll = useCallback(() => {
    if (!scrollRef.current) return;
    const { scrollLeft, clientWidth } = scrollRef.current;
    if (clientWidth > 0) {
      const idx = Math.round(scrollLeft / clientWidth);
      if (idx >= 0 && idx < peringatanData.length) {
        setActiveIndex(idx);
      }
    }
  }, [peringatanData.length]);

  // Pause auto-play on user interaction, resume after delay
  const pauseAutoPlay = useCallback(() => {
    userInteractedRef.current = true;
    if (autoPlayRef.current) clearInterval(autoPlayRef.current);
    const timeout = setTimeout(() => {
      userInteractedRef.current = false;
      startAutoPlay();
    }, 4000);
    return () => clearTimeout(timeout);
  }, [startAutoPlay]);

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });
    } catch {
      return '-';
    }
  };

  return (
    <section className="pt-36 pb-8" style={{ backgroundColor: '#F3F8FF' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-2 gap-6 items-stretch">

          {/* ═══════════ LEFT SIDE: Status Card ═══════════ */}
          {hasWarning ? (
            <div
              className="relative rounded-2xl p-8 overflow-hidden text-white shadow-lg min-h-[320px] flex flex-col justify-between"
              style={{
                background: 'linear-gradient(135deg, #1B2E4B 0%, #2A4365 40%, #1e3a5f 100%)',
              }}
            >
              {/* Decorative circles */}
              <div
                className="absolute -top-16 -right-16 w-48 h-48 rounded-full opacity-10"
                style={{ background: 'radial-gradient(circle, #EF4444 0%, transparent 70%)' }}
              />
              <div
                className="absolute -bottom-12 -left-12 w-40 h-40 rounded-full opacity-8"
                style={{ background: 'radial-gradient(circle, #3B82F6 0%, transparent 70%)' }}
              />

              <div className="relative z-10 flex-1 flex flex-col justify-center">
                {/* Badge */}
                <div className="mb-5">
                  <span className="inline-flex items-center gap-2 bg-red-500/20 border border-red-400/30 px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider text-red-200">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-red-400" />
                    </span>
                    Peringatan Aktif
                  </span>
                </div>

                {/* Title */}
                <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight mb-3 leading-tight">
                  Peringatan Dini
                  <br />
                  <span className="text-secondary-light">Kebencanaan</span>
                </h2>

                {/* Description */}
                <p className="text-white/70 leading-relaxed text-sm max-w-sm">
                  Tetap waspada terhadap potensi bencana di wilayah Anda. Pantau informasi peringatan dini secara berkala.
                </p>
              </div>

              {/* Bottom stat */}
              <div className="relative z-10 mt-4 flex items-center gap-3">
                <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/10 px-4 py-2 rounded-xl">
                  <HiBellAlert className="text-red-300 text-lg" />
                  <span className="text-sm font-bold">{peringatanData.length}</span>
                  <span className="text-xs text-white/70">peringatan aktif</span>
                </div>
              </div>
            </div>
          ) : (
            <div
              className="relative rounded-2xl p-8 overflow-hidden text-white shadow-lg min-h-[320px] flex flex-col justify-between"
              style={{
                background: 'linear-gradient(135deg, #1B2E4B 0%, #2A4365 40%, #1e3a5f 100%)',
              }}
            >
              {/* Decorative circles */}
              <div
                className="absolute -top-16 -right-16 w-48 h-48 rounded-full opacity-10"
                style={{ background: 'radial-gradient(circle, #10B981 0%, transparent 70%)' }}
              />
              <div
                className="absolute -bottom-10 -left-10 w-36 h-36 rounded-full opacity-8"
                style={{ background: 'radial-gradient(circle, #3B82F6 0%, transparent 70%)' }}
              />

              {/* Weather decoration */}
              <div className="absolute top-6 right-6 opacity-10">
                <WiCloud className="text-[90px] text-white" />
              </div>
              <div className="absolute bottom-4 right-20 opacity-8">
                <WiDaySunny className="text-[50px] text-yellow-300" />
              </div>

              <div className="relative z-10 flex-1 flex flex-col justify-center">
                {/* Badge */}
                <div className="mb-5">
                  <span className="inline-flex items-center gap-2 bg-emerald-500/20 border border-emerald-400/30 px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider text-emerald-200">
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    Semua Wilayah Aman
                  </span>
                </div>

                {/* Title */}
                <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight mb-3 leading-tight">
                  Kondisi Aman
                  <br />
                  <span className="text-secondary-light">Kabupaten Jember</span>
                </h2>

                {/* Description */}
                <p className="text-white/70 leading-relaxed text-sm max-w-sm">
                  Saat ini tidak ada peringatan dini yang aktif. Kondisi cuaca dan keamanan terpantau aman dan terkendali.
                </p>
              </div>

              {/* Bottom stat */}
              <div className="relative z-10 mt-4 flex items-center gap-3">
                <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/10 px-4 py-2 rounded-xl">
                  <HiShieldCheck className="text-emerald-300 text-lg" />
                  <span className="text-sm font-bold text-emerald-200">Status Aman</span>
                </div>
              </div>
            </div>
          )}

          {/* ═══════════ RIGHT SIDE: Carousel Card ═══════════ */}
          {hasWarning ? (
            <div
              className="relative rounded-2xl overflow-hidden shadow-sm min-h-[320px] flex flex-col"
              style={{ backgroundColor: '#DFEAF6' }}
            >
              {/* Card Header */}
              <div className="px-6 pt-5 pb-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                    <HiBellAlert className="text-primary text-sm" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-primary">Daftar Peringatan</h3>
                    <p className="text-[11px] text-slate-500">Geser untuk melihat semua</p>
                  </div>
                </div>
                {peringatanData.length > 1 && (
                  <span className="text-xs font-semibold text-primary/60 bg-white/60 px-2.5 py-1 rounded-full">
                    {activeIndex + 1} / {peringatanData.length}
                  </span>
                )}
              </div>

              {/* Carousel Area */}
              <div className="flex-1 px-4 pb-2 min-h-0">
                <div
                  ref={scrollRef}
                  onScroll={handleScroll}
                  onTouchStart={pauseAutoPlay}
                  onMouseDown={pauseAutoPlay}
                  className="flex gap-4 overflow-x-auto snap-x snap-mandatory scroll-smooth h-full hide-scrollbar"
                >
                  {peringatanData.map((item: any) => {
                    const config = getUrgensiConfig(item.tingkat_urgensi);
                    return (
                      <div
                        key={item.id}
                        className="w-full shrink-0 snap-center"
                      >
                        <div className="bg-white rounded-xl p-5 h-full flex flex-col justify-between shadow-sm border border-white/80">
                          {/* Top: Badge + Date */}
                          <div>
                            <div className="flex items-center justify-between mb-4">
                              <span
                                className={`inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider border ${config.badgeBg} ${config.badgeText} ${config.badgeBorder}`}
                              >
                                <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
                                {config.label}
                              </span>
                              <span className="flex items-center gap-1 text-[11px] text-slate-400 font-medium">
                                <HiClock className="text-xs" />
                                {formatDate(item.created_at)}
                              </span>
                            </div>

                            {/* Description */}
                            <p className="text-sm text-primary font-medium leading-relaxed line-clamp-4">
                              {item.deskripsi}
                            </p>
                          </div>

                          {/* Bottom: Location */}
                          <div className="flex items-center gap-2 mt-4 pt-3 border-t border-slate-100">
                            <div className="w-6 h-6 rounded-md bg-secondary/10 flex items-center justify-center">
                              <HiMapPin className="text-secondary text-xs" />
                            </div>
                            <span className="text-xs font-semibold text-slate-600">
                              Kec. {item.kecamatan?.nama || 'Seluruh Wilayah'}
                            </span>
                            {/* Accent line */}
                            <div
                              className="ml-auto w-8 h-1 rounded-full opacity-60"
                              style={{ backgroundColor: config.accentColor }}
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Dot Indicators */}
              {peringatanData.length > 1 && (
                <div className="flex justify-center gap-1.5 pb-4 pt-1">
                  {peringatanData.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        pauseAutoPlay();
                        scrollToSlide(idx);
                      }}
                      className={`h-2 rounded-full transition-all duration-300 ${
                        activeIndex === idx
                          ? 'w-6 bg-secondary'
                          : 'w-2 bg-primary/20 hover:bg-primary/40'
                      }`}
                      aria-label={`Peringatan ${idx + 1}`}
                    />
                  ))}
                </div>
              )}
            </div>
          ) : (
            /* ── Empty State (Blue themed) ── */
            <div
              className="relative rounded-2xl overflow-hidden shadow-sm min-h-[320px] flex flex-col items-center justify-center p-8 text-center"
              style={{ backgroundColor: '#DFEAF6' }}
            >
              {/* Decorative */}
              <div className="absolute top-4 right-4 opacity-10">
                <WiCloud className="text-[80px] text-primary" />
              </div>
              <div className="absolute bottom-4 left-4 opacity-8">
                <WiDaySunny className="text-[50px] text-secondary" />
              </div>

              <div className="relative z-10">
                <div className="w-16 h-16 rounded-2xl bg-white/80 border border-white flex items-center justify-center mb-5 mx-auto shadow-sm">
                  <HiShieldCheck className="text-secondary text-3xl" />
                </div>
                <h3 className="text-lg font-bold text-primary mb-2">
                  Tidak Ada Peringatan
                </h3>
                <p className="text-sm text-slate-500 max-w-xs leading-relaxed">
                  Seluruh wilayah Kabupaten Jember dalam kondisi aman. Tidak ada informasi peringatan dini kebencanaan saat ini.
                </p>
              </div>
            </div>
          )}

        </div>
      </div>
    </section>
  );
}
