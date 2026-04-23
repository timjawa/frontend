"use client";

import { useRef, useState, useEffect } from "react";
import { weatherLocations, getWeatherIcon } from "@/data/dummyData";
import { HiChevronLeft, HiChevronRight } from "react-icons/hi2";

export default function WeatherCards() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

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
  }, []);

  const scroll = (direction: "left" | "right") => {
    const el = scrollRef.current;
    if (!el) return;
    const scrollAmount = 260;
    el.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
  };

  return (
    <section className="py-8 bg-white">
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
          {weatherLocations.map((loc) => {
            const IconComp = getWeatherIcon(loc.icon);
            return (
              <div
                key={loc.id}
                className="flex-shrink-0 w-[200px] bg-gradient-to-br from-accent to-white border border-border rounded-2xl p-5 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group cursor-pointer"
              >
                <div className="text-center">
                  <div className="w-14 h-14 mx-auto bg-white rounded-xl flex items-center justify-center shadow-sm mb-3 group-hover:shadow-md transition-shadow">
                    <IconComp className="text-secondary text-3xl" />
                  </div>
                  <h3 className="font-semibold text-primary text-sm mb-1">
                    {loc.name}
                  </h3>
                  <p className="text-2xl font-bold text-primary mb-1">
                    {loc.temp}
                  </p>
                  <p className="text-xs text-slate-500">{loc.condition}</p>
                  <div className="mt-3 flex items-center justify-center gap-1 text-xs text-slate-400">
                    <span>💧</span>
                    <span>{loc.humidity}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
