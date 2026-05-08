"use client";

import { useRef, useState, useEffect } from "react";
import Image from "next/image";
import { WeatherIcon } from "@/utils/weatherIcons";
import { HiChevronLeft, HiChevronRight } from "react-icons/hi2";

// Helper function to map openweather icon/description to our local icons
const mapConditionToIcon = (description: string) => {
  const desc = description?.toLowerCase() || '';
  if (desc.includes('hujan') || desc.includes('rain')) return 'rain';
  if (desc.includes('petir') || desc.includes('thunder')) return 'thunderstorm';
  if (desc.includes('berawan') || desc.includes('cloud')) return 'cloudy';
  if (desc.includes('cerah') || desc.includes('clear')) return 'sunny';
  return 'partly-cloudy';
};

// Format time as HH.MM
const formatTime = (dateStr?: string) => {
  if (!dateStr) {
    const now = new Date();
    return `${String(now.getHours()).padStart(2, '0')}.${String(now.getMinutes()).padStart(2, '0')}`;
  }
  try {
    const d = new Date(dateStr);
    return `${String(d.getHours()).padStart(2, '0')}.${String(d.getMinutes()).padStart(2, '0')}`;
  } catch {
    return '--:--';
  }
};

export default function WeatherCards({ data = [] }: { data?: any[] }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  // Jika data dari backend kosong, fallback sementara
  const displayData = data && data.length > 0 ? data : [];

  const checkScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 10);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 10);
  };

  useEffect(() => {
    checkScroll();
    const el = scrollRef.current;
    if (el) {
      el.addEventListener("scroll", checkScroll);
      return () => el.removeEventListener("scroll", checkScroll);
    }
  }, [displayData]);

  const scroll = (direction: "left" | "right") => {
    const el = scrollRef.current;
    if (!el) return;
    const scrollAmount = 260;
    el.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
  };

  if (displayData.length === 0) return null;

  return (
    <section className="py-8" style={{ backgroundColor: '#F3F8FF' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-primary">Cuaca Hari Ini</h2>
          <div className="flex gap-2">
            <button
              onClick={() => scroll("left")}
              disabled={!canScrollLeft}
              className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 ${
                canScrollLeft
                  ? "bg-primary text-white hover:bg-primary-light shadow-md hover:shadow-lg"
                  : "bg-slate-100 text-slate-300 cursor-not-allowed"
              }`}
              aria-label="Geser kiri"
            >
              <HiChevronLeft size={20} />
            </button>
            <button
              onClick={() => scroll("right")}
              disabled={!canScrollRight}
              className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 ${
                canScrollRight
                  ? "bg-primary text-white hover:bg-primary-light shadow-md hover:shadow-lg"
                  : "bg-slate-100 text-slate-300 cursor-not-allowed"
              }`}
              aria-label="Geser kanan"
            >
              <HiChevronRight size={20} />
            </button>
          </div>
        </div>

        <div
          ref={scrollRef}
          className="flex gap-4 overflow-x-auto hide-scrollbar pb-2"
        >
          {displayData.map((loc) => {
            const iconName = mapConditionToIcon(loc.deskripsi || '');
            const time = formatTime(loc.updated_at || loc.created_at);
            
            return (
              <div
                key={loc.id}
                className="flex-shrink-0 w-[220px] relative overflow-hidden rounded-2xl p-5 cursor-pointer group hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
                style={{ backgroundColor: '#DFEAF6' }}
              >
                {/* Shield watermarks at corners */}
                <Image
                  src="/icons/shield.svg"
                  alt=""
                  width={90}
                  height={90}
                  className="absolute -top-4 -right-4 pointer-events-none select-none"
                  aria-hidden="true"
                />
                <Image
                  src="/icons/shield.svg"
                  alt=""
                  width={110}
                  height={110}
                  className="absolute -bottom-5 -left-5 pointer-events-none select-none"
                  aria-hidden="true"
                />

                {/* Top row: location name + time */}
                <div className="flex justify-between items-start mb-8 relative z-10">
                  <h3 className="font-semibold text-primary text-sm leading-tight max-w-[130px]">
                    {loc.kecamatan?.nama || 'Unknown'}
                  </h3>
                  <span className="text-xs text-slate-500 font-medium whitespace-nowrap">
                    {time}
                  </span>
                </div>

                {/* Center: weather icon */}
                <div className="flex justify-center mb-8 relative z-10">
                  <div className="group-hover:scale-110 transition-transform duration-300">
                    <WeatherIcon type={iconName} size={80} />
                  </div>
                </div>

                {/* Bottom: condition text */}
                <p className="text-center text-sm text-primary font-medium relative z-10 capitalize">
                  {loc.deskripsi || 'Tidak diketahui'}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
