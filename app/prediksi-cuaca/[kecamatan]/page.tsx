"use client";

import { useState, useRef, use } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import {
  allKecamatanNames,
  getHourlyWeather,
  getKecamatanWarning,
  HourlyWeather,
} from "@/data/prediksiCuacaData";
import { getWeatherIcon } from "@/data/dummyData";
import { HiOutlineCalendar, HiArrowTopRightOnSquare } from "react-icons/hi2";
import { HiChevronLeft, HiChevronRight } from "react-icons/hi";
import { WiDaySunny, WiCloud } from "react-icons/wi";

export default function KecamatanDetailPage({
  params,
}: {
  params: Promise<{ kecamatan: string }>;
}) {
  const resolvedParams = use(params);
  const kecamatanSlug = decodeURIComponent(resolvedParams.kecamatan);

  // Capitalize properly
  const kecamatanName =
    allKecamatanNames.find(
      (k) => k.toLowerCase() === kecamatanSlug.toLowerCase()
    ) || kecamatanSlug;

  // Date picker
  const todayStr = new Date().toISOString().split("T")[0];
  const [selectedDate, setSelectedDate] = useState(todayStr);

  // Get hourly weather data
  const hourlyData = getHourlyWeather(kecamatanName);
  const warningText = getKecamatanWarning(kecamatanName);

  // Carousel scroll
  const carouselRef = useRef<HTMLDivElement>(null);
  const scrollCarousel = (direction: "left" | "right") => {
    if (carouselRef.current) {
      const scrollAmount = 240;
      carouselRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  // Other kecamatan (exclude current)
  const otherKecamatan = allKecamatanNames.filter(
    (k) => k.toLowerCase() !== kecamatanName.toLowerCase()
  );

  return (
    <>
      <Navbar />
      <main className="flex-1">
        {/* Hero — matches homepage HeroSection: from-slate-50 to-white */}
        <section className="pt-28 pb-8 bg-gradient-to-b from-slate-50 to-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Title */}
            <div className="text-center mb-8">
              <h1 className="text-2xl md:text-3xl font-bold text-primary leading-tight">
                Prediksi Cuaca Kecamatan{" "}
                <span className="text-secondary">{kecamatanName}</span>
              </h1>
              <p className="text-slate-600 max-w-2xl mx-auto text-[15px] leading-relaxed mt-3">
                {warningText}
              </p>
            </div>

            {/* Weather Illustration — matches HeroSection accent card style */}
            <div className="relative bg-gradient-to-br from-accent to-accent-dark rounded-2xl p-10 sm:p-16 overflow-hidden max-w-3xl mx-auto">
              {/* Background decorations — same as HeroSection */}
              <div className="absolute top-4 right-4 opacity-20">
                <WiCloud className="text-primary text-[100px]" />
              </div>
              <div className="absolute bottom-2 left-8 opacity-15">
                <WiDaySunny className="text-yellow-500 text-[60px]" />
              </div>

              {/* Main weather icon — same style as HeroSection */}
              <div className="relative z-10 flex items-center justify-center">
                <div className="relative">
                  <WiDaySunny className="text-yellow-400 text-[80px] sm:text-[120px] animate-pulse" />
                  <WiCloud className="text-slate-300 text-[60px] sm:text-[80px] absolute -top-2 left-10 sm:left-14" />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Hourly Forecast — uses py-10 bg-surface same as WeatherTable section */}
        <section className="py-10 bg-surface">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-bold text-primary mb-6">
              Prediksi Cuaca Kecamatan {kecamatanName}
            </h2>

            {/* Date & Source Row */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6">
              <div className="flex items-center gap-3 text-sm">
                <div className="flex items-center gap-2">
                  <HiOutlineCalendar className="text-secondary text-lg" />
                  <span className="text-slate-600 font-medium">Tanggal:</span>
                </div>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="px-3 py-2 rounded-lg bg-blue-50 text-blue-700 border border-blue-200 text-sm font-medium cursor-pointer hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-secondary transition-colors"
                />
              </div>
              <span className="text-xs text-slate-400 font-medium">
                Sumber: BMKG
              </span>
            </div>

            {/* Carousel — inside rounded card like WeatherTable */}
            <div className="bg-white rounded-2xl shadow-sm border border-border p-6 overflow-hidden">
              <div className="relative">
                {/* Left Arrow */}
                <button
                  onClick={() => scrollCarousel("left")}
                  className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-white border border-border rounded-full flex items-center justify-center shadow-md hover:bg-slate-50 transition-colors"
                  aria-label="Scroll left"
                >
                  <HiChevronLeft className="text-primary text-xl" />
                </button>

                {/* Right Arrow */}
                <button
                  onClick={() => scrollCarousel("right")}
                  className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-white border border-border rounded-full flex items-center justify-center shadow-md hover:bg-slate-50 transition-colors"
                  aria-label="Scroll right"
                >
                  <HiChevronRight className="text-primary text-xl" />
                </button>

                {/* Cards Container */}
                <div
                  ref={carouselRef}
                  className="flex gap-4 overflow-x-auto hide-scrollbar px-12 py-2"
                >
                  {hourlyData.map((hour) => (
                    <HourlyCard key={hour.jam} data={hour} />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Kecamatan Lainnya — uses bg-white alternating with surface */}
        <section className="py-10 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-bold text-primary mb-6">
              Kecamatan Lainnya
            </h2>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
              {otherKecamatan.map((kec) => (
                <Link
                  key={kec}
                  href={`/prediksi-cuaca/${encodeURIComponent(kec.toLowerCase())}`}
                  className="flex items-center justify-between gap-2 bg-surface border border-border rounded-xl px-4 py-3 text-sm font-medium text-secondary hover:bg-accent/50 hover:border-secondary/30 transition-all duration-200 group"
                >
                  <span>{kec}</span>
                  <HiArrowTopRightOnSquare className="text-secondary/50 group-hover:text-secondary text-sm flex-shrink-0 transition-colors" />
                </Link>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

// Hourly Weather Card — matches WeatherTable cell styling
function HourlyCard({ data }: { data: HourlyWeather }) {
  const IconComp = getWeatherIcon(data.icon);
  return (
    <div className="flex-shrink-0 w-[140px] bg-surface border border-border rounded-2xl p-4 flex flex-col items-center gap-2 hover:bg-accent/30 hover:border-secondary/20 transition-all duration-200">
      <span className="text-sm font-bold text-primary">{data.jam} WIB</span>
      <IconComp className="text-secondary text-3xl" />
      <span className="text-xs text-slate-500 font-medium text-center leading-tight">
        {data.cuaca}
      </span>
    </div>
  );
}
