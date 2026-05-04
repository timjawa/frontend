"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import DatePicker from "@/components/ui/DatePicker";
import { timeSlots, KecamatanPrediction, WeatherSlot } from "@/data/prediksiCuacaData";
import { WeatherIcon } from "@/utils/weatherIcons";
import { HiOutlineSearch } from "react-icons/hi";
import { HiInformationCircle } from "react-icons/hi2";
import { WiHumidity, WiStrongWind, WiThermometer, WiCloud, WiDaySunny } from "react-icons/wi";
import { fetchWeatherForecast } from "@/services/weather";

// Helper: map cuaca description to icon key
const mapConditionToIcon = (description: string) => {
  const desc = description?.toLowerCase() || '';
  if (desc.includes('petir') || desc.includes('thunder')) return 'thunderstorm';
  if (desc.includes('hujan lebat') || desc.includes('heavy rain')) return 'rain';
  if (desc.includes('hujan') || desc.includes('rain')) return 'light-rain';
  if (desc.includes('berawan') || desc.includes('cloud')) return 'cloudy';
  if (desc.includes('cerah berawan') || desc.includes('partly')) return 'partly-cloudy';
  if (desc.includes('cerah') || desc.includes('clear') || desc.includes('sunny')) return 'sunny';
  if (desc.includes('kabut') || desc.includes('asap') || desc.includes('fog')) return 'cloudy';
  return 'partly-cloudy';
};

// Helper: parse "2026-05-01 06:00:00" → { date: "2026-05-01", hour: 6 }
const parseWaktuLokal = (waktu: string) => {
  const str = String(waktu || '');
  const parts = str.includes('T') ? str.split('T') : str.split(' ');
  const date = parts[0] || '';
  const hour = parts[1] ? parseInt(parts[1].split(':')[0], 10) : -1;
  return { date, hour };
};

export default function PrediksiCuacaPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTimeSlot, setActiveTimeSlot] = useState<string | null>(null);
  const [allKecamatanPredictions, setAllKecamatanPredictions] = useState<KecamatanPrediction[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Date picker state — defaults to today
  const todayStr = new Date().toISOString().split("T")[0];
  const [selectedDate, setSelectedDate] = useState(todayStr);

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        const res = await fetchWeatherForecast();
        const data = res?.data || {};

        // Map backend data to the frontend structure
        const mappedData: KecamatanPrediction[] = Object.keys(data).map(kecamatan => {
          const forecasts = data[kecamatan] || [];

          // Find the best forecast for a given date & hour range
          const getSlotData = (hourRange: number[]): WeatherSlot => {
            const [minHour, maxHour] = hourRange;

            const candidates = forecasts.filter((f: { waktu_lokal: string }) => {
              const { date, hour } = parseWaktuLokal(f.waktu_lokal);
              return date === selectedDate && hour >= minHour && hour < maxHour;
            });

            // Pick the one closest to the midpoint of the range
            const midHour = Math.floor((minHour + maxHour) / 2);
            const match = candidates.sort((a: { waktu_lokal: string }, b: { waktu_lokal: string }) => {
              return Math.abs(parseWaktuLokal(a.waktu_lokal).hour - midHour) -
                     Math.abs(parseWaktuLokal(b.waktu_lokal).hour - midHour);
            })[0];

            if (match) {
              return {
                suhu: Math.round(match.suhu) + '°C',
                kelembapan: (match.kelembapan || 0) + '%',
                angin: (match.kecepatan_angin || 0) + ' m/s',
                cuaca: match.deskripsi_cuaca || 'Tidak diketahui',
                icon: mapConditionToIcon(match.deskripsi_cuaca)
              };
            }
            return { suhu: '--', kelembapan: '--', angin: '--', cuaca: '-', icon: 'partly-cloudy' };
          };

          return {
            kecamatan,
            slot1: getSlotData([5, 9]),    // Pagi 05:00–09:00
            slot2: getSlotData([9, 14]),   // Siang 09:00–14:00
            slot3: getSlotData([14, 18]),  // Sore 14:00–18:00
            slot4: getSlotData([18, 24]),  // Malam 18:00–24:00
            slot5: getSlotData([0, 5]),    // Dini Hari 00:00–05:00
          };
        });

        setAllKecamatanPredictions(mappedData);
      } catch (error) {
        console.error("Gagal memuat data cuaca:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [selectedDate]);


  // Format the selected date in Indonesian
  const formattedDate = new Date(selectedDate + "T00:00:00").toLocaleDateString(
    "id-ID",
    {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    }
  );

  // Filter predictions based on search — realtime
  const filteredPredictions = useMemo(() => {
    if (!searchQuery.trim()) return allKecamatanPredictions;
    const q = searchQuery.toLowerCase().trim();
    return allKecamatanPredictions.filter((p) =>
      p.kecamatan.toLowerCase().includes(q)
    );
  }, [searchQuery, allKecamatanPredictions]);

  // Determine which time slots to show
  const visibleSlots = activeTimeSlot
    ? timeSlots.filter((s) => s.key === activeTimeSlot)
    : timeSlots;

  return (
    <>
      <Navbar />
      <main className="flex-1">
        {/* Hero */}
        <section className="pt-36 pb-8 bg-gradient-to-b from-slate-50 to-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="relative bg-gradient-to-br from-accent to-accent-dark rounded-2xl p-8 sm:p-10 overflow-hidden">
              <div className="absolute top-4 right-4 opacity-20">
                <WiCloud className="text-primary text-[100px]" />
              </div>
              <div className="absolute bottom-2 left-8 opacity-15">
                <WiDaySunny className="text-yellow-500 text-[60px]" />
              </div>

              <div className="relative z-10 text-center">
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-primary mb-3 tracking-tight">
                  Prediksi Cuaca Jember
                </h1>
                <p className="text-slate-600 max-w-2xl mx-auto text-sm sm:text-[15px] leading-relaxed">
                  Prakiraan cuaca untuk seluruh kecamatan di Kabupaten Jember.
                  Data diperbarui secara berkala untuk membantu kesiapsiagaan
                  masyarakat dalam menghadapi perubahan cuaca.
                </p>

                <div className="mt-6 max-w-xl mx-auto">
                  <div className="relative flex items-center">
                    <HiOutlineSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-xl pointer-events-none" />
                    <input
                      type="text"
                      placeholder="Cari kecamatan..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-12 pr-14 py-3.5 rounded-xl bg-white text-slate-700 placeholder:text-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-secondary border border-border shadow-sm transition-all duration-200"
                    />
                    {searchQuery && (
                      <button
                        onClick={() => setSearchQuery("")}
                        className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                  {searchQuery && !isLoading && (
                    <p className="mt-2 text-xs text-slate-500">
                      {filteredPredictions.length} kecamatan ditemukan
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Filter Bar */}
        <section className="py-3 bg-white/95 backdrop-blur-md border-b border-border sticky top-[7rem] z-30 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <DatePicker
                id="date-picker"
                value={selectedDate}
                onChange={(val) => setSelectedDate(val)}
              />

              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-xs text-slate-500 mr-1 font-medium">Jam:</span>
                <button
                  onClick={() => setActiveTimeSlot(null)}
                  className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
                    activeTimeSlot === null
                      ? "bg-primary text-white shadow-md"
                      : "bg-white text-slate-600 hover:bg-slate-100 border border-border"
                  }`}
                >
                  Semua
                </button>
                {timeSlots.map((slot) => (
                  <button
                    key={slot.key}
                    onClick={() => setActiveTimeSlot(activeTimeSlot === slot.key ? null : slot.key)}
                    className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
                      activeTimeSlot === slot.key
                        ? "bg-primary text-white shadow-md"
                        : "bg-white text-slate-600 hover:bg-slate-100 border border-border"
                    }`}
                  >
                    {slot.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Weather Table */}
        <section className="py-10 bg-surface">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-white rounded-2xl shadow-sm border border-border overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full" id="weather-prediction-table">
                  <thead>
                    <tr className="bg-primary text-white">
                      <th className="text-left px-5 py-3.5 text-sm font-semibold sticky left-0 bg-primary z-10 min-w-[160px]">
                        Kecamatan
                      </th>
                      {visibleSlots.map((slot) => (
                        <th key={slot.key} className="text-center px-4 py-3.5 text-sm font-semibold min-w-[160px]">
                          {slot.label}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {isLoading ? (
                      <tr>
                        <td colSpan={visibleSlots.length + 1} className="text-center py-16 text-slate-400">
                          Memuat data prakiraan cuaca...
                        </td>
                      </tr>
                    ) : filteredPredictions.length === 0 ? (
                      <tr>
                        <td colSpan={visibleSlots.length + 1} className="text-center py-16 text-slate-400">
                          Tidak ada data yang ditemukan.
                        </td>
                      </tr>
                    ) : (
                      filteredPredictions.map((row, idx) => (
                        <tr
                          key={row.kecamatan}
                          className={`border-b border-border/50 hover:bg-accent/30 transition-colors ${
                            idx % 2 === 0 ? "bg-white" : "bg-slate-50/50"
                          }`}
                        >
                          <td className="px-5 py-4 sticky left-0 bg-inherit z-10">
                            <Link
                              href={`/prediksi-cuaca/${encodeURIComponent(row.kecamatan.toLowerCase())}`}
                              className="flex items-center gap-2 group"
                            >
                              <span className="font-semibold text-primary text-sm group-hover:text-secondary transition-colors">
                                {row.kecamatan}
                              </span>
                              <span className="text-secondary text-xs">✓</span>
                            </Link>
                          </td>
                          {visibleSlots.map((slot) => {
                            const data = row[slot.key as keyof KecamatanPrediction] as WeatherSlot;
                            return (
                              <td key={slot.key} className="px-4 py-4 text-center">
                                <WeatherCell data={data} iconType={data.icon} />
                              </td>
                            );
                          })}
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {!isLoading && (
              <div className="mt-3 text-xs text-slate-400 text-right">
                Menampilkan {filteredPredictions.length} dari {allKecamatanPredictions.length} kecamatan
              </div>
            )}
          </div>
        </section>

        <section className="py-3 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-gradient-to-r from-secondary to-primary rounded-xl px-5 py-4 flex items-start gap-3 shadow-md">
              <div className="flex-shrink-0 mt-0.5">
                <HiInformationCircle className="text-white text-xl" />
              </div>
              <p className="text-white text-sm leading-relaxed">
                <span className="font-semibold">Perhatian Dari Cuaca:</span>{" "}
                Data prakiraan cuaca ini bersumber dari BMKG dan diperbaharui
                secara berkala. Prakiraan cuaca bersifat prediksi dan dapat
                berubah sewaktu-waktu. Selalu pantau perkembangan cuaca terkini
                untuk keselamatan Anda.
              </p>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

function WeatherCell({
  data,
  iconType,
}: {
  data: WeatherSlot;
  iconType: string;
}) {
  return (
    <div className="flex flex-col items-center gap-1">
      <WeatherIcon type={iconType} size={32} />
      <span className="font-bold text-primary text-sm capitalize line-clamp-1" title={data.cuaca}>{data.cuaca}</span>
      <div className="flex flex-col gap-0.5 text-[11px] text-slate-500">
        <div className="flex items-center gap-1 justify-center">
          <WiThermometer className="text-red-400 text-sm" />
          <span>{data.suhu}</span>
        </div>
        <div className="flex items-center gap-1 justify-center">
          <WiHumidity className="text-blue-400 text-sm" />
          <span>{data.kelembapan}</span>
        </div>
        <div className="flex items-center gap-1 justify-center">
          <WiStrongWind className="text-slate-400 text-sm" />
          <span>{data.angin}</span>
        </div>
      </div>
    </div>
  );
}
