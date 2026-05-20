"use client";

import { useRef, useState, useEffect, useMemo } from "react";
import Image from "next/image";
import { WeatherIcon } from "@/utils/weatherIcons";
import { HiChevronLeft, HiChevronRight } from "react-icons/hi2";
import { WeatherCardsSkeleton } from "@/components/ui/WeatherSkeletons";

// Map OpenWeather ID → BMKG code
const getBmkgCode = (weatherCode?: number): number => {
  if (!weatherCode) return 1; // default: Cerah Berawan
  if (weatherCode === 800) return 0; // Cerah
  if (weatherCode === 801) return 1; // Cerah Berawan
  if (weatherCode === 802 || weatherCode === 803) return 3; // Berawan
  if (weatherCode === 804) return 4; // Berawan Tebal
  if (weatherCode === 701 || weatherCode === 721 || weatherCode === 741)
    return 5; // Udara Kabur
  if (
    (weatherCode >= 300 && weatherCode <= 321) ||
    weatherCode === 500 ||
    weatherCode === 520
  )
    return 60; // Hujan Ringan
  if (weatherCode === 501 || weatherCode === 521) return 61; // Hujan Sedang
  if (weatherCode === 502 || weatherCode === 503 || weatherCode === 504)
    return 63; // Hujan Lebat
  if (weatherCode >= 200 && weatherCode <= 232) return 95; // Hujan Petir
  return 1; // fallback
};

// Map BMKG code → local icon key
const bmkgCodeToIcon = (bmkgCode: number): string => {
  switch (bmkgCode) {
    case 0:
      return "sunny"; // cerah.svg
    case 1:
      return "partly-cloudy"; // cerah-berawan.svg
    case 3:
      return "cloudy"; // berawan.svg
    case 4:
      return "cloudy"; // berawan.svg (tebal)
    case 5:
      return "cloudy"; // berawan.svg (kabur)
    case 60:
      return "light-rain"; // hujan-ringan.svg
    case 61:
      return "rain"; // hujan-sedang.svg
    case 63:
      return "rain"; // hujan-lebat.svg
    case 95:
      return "thunderstorm"; // hujan-petir.svg
    default:
      return "partly-cloudy";
  }
};

// Map BMKG code → deskripsi Indonesia
const bmkgCodeToDesc: Record<number, string> = {
  0: "Cerah",
  1: "Cerah Berawan",
  3: "Berawan",
  4: "Berawan",
  5: "Udara Kabur",
  60: "Hujan Ringan",
  61: "Hujan Sedang",
  63: "Hujan Lebat",
  95: "Hujan Petir",
};

// Format time as HH.MM
const formatTime = (dateStr?: string) => {
  if (!dateStr) {
    const now = new Date();
    return `${String(now.getHours()).padStart(2, "0")}.${String(now.getMinutes()).padStart(2, "0")}`;
  }
  try {
    const d = new Date(dateStr);
    return `${String(d.getHours()).padStart(2, "0")}.${String(d.getMinutes()).padStart(2, "0")}`;
  } catch {
    return "--:--";
  }
};

export default function WeatherCards() {
  const [data, setData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        // We need to import fetchRealtimeWeather, so we'll do it at the top
        const { fetchRealtimeWeather } = await import("@/services/weather");
        const res = await fetchRealtimeWeather();
        setData(res?.data || []);
      } catch (error) {
        console.error("Gagal memuat realtime cuaca", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  // Jika data dari backend kosong, fallback sementara
  const displayData = useMemo(() => {
    if (!data || data.length === 0) return [];
    return [...data].sort((a, b) =>
      (a.kecamatan?.nama || "").localeCompare(b.kecamatan?.nama || ""),
    );
  }, [data]);

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

  if (isLoading) {
    // Import skeleton dynamically or assume it's imported (we'll just use inline require or import at top)
    // Actually, we can just return a skeleton here. We'll import it at the top of the file in another chunk.
    return <WeatherCardsSkeleton />;
  }

  if (displayData.length === 0) return null;

  return (
    <section className="py-8" style={{ backgroundColor: "#F3F8FF" }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-primary">Cuaca Hari Ini</h2>
          <div className="flex gap-2">
            <button
              onClick={() => scroll("left")}
              disabled={!canScrollLeft}
              className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 ${
                canScrollLeft
                  ? "bg-[#1f2a56] text-white hover:bg-[#2c3a75] shadow-md hover:shadow-lg"
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
                  ? "bg-[#1f2a56] text-white hover:bg-[#2c3a75] shadow-md hover:shadow-lg"
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
          className="flex gap-4 overflow-x-auto hide-scrollbar py-4"
        >
          {displayData.map((loc) => {
            const bmkgCode = getBmkgCode(loc.weather_code);
            const iconName = bmkgCodeToIcon(bmkgCode);
            const deskripsi =
              bmkgCodeToDesc[bmkgCode] ?? loc.deskripsi ?? "Tidak diketahui";
            const time = formatTime(loc.fetched_at || loc.updated_at || loc.created_at);

            return (
              <div
                key={loc.id}
                className="flex-shrink-0 w-[220px] relative overflow-hidden rounded-2xl p-5 cursor-pointer group hover:shadow-md hover:-translate-y-1 transition-all duration-300"
                style={{ backgroundColor: "#DFEAF6" }}
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
                    {loc.kecamatan?.nama || "Unknown"}
                  </h3>
                  <span className="text-xs text-slate-500 font-medium whitespace-nowrap">
                    {time}
                  </span>
                </div>

                {/* Center: weather icon */}
                <div className="flex justify-center mb-8 relative z-10">
                  <div className="group-hover:scale-110 transition-transform duration-300">
                    <WeatherIcon type={iconName} size={90} />
                  </div>
                </div>

                {/* Bottom: condition text */}
                <p className="text-center text-sm text-primary font-medium relative z-10 capitalize">
                  {deskripsi}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
