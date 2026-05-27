"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import DatePicker from "@/components/ui/DatePicker";
import { fetchWeatherByDate, fetchWeatherForecast } from "@/services/weather";
import InfoBanner from "@/components/ui/InfoBanner";
import { WeatherIcon } from "@/utils/weatherIcons";
import { HiOutlineSearch, HiChevronDown } from "react-icons/hi";

// Helper: map cuaca description to icon key
const mapConditionToIcon = (description: string) => {
  const desc = description?.toLowerCase() || '';
  if (desc.includes('petir') || desc.includes('thunder')) return 'thunderstorm';
  if (desc.includes('hujan lebat') || desc.includes('heavy rain')) return 'rain';
  if (desc.includes('hujan') || desc.includes('rain')) return 'light-rain';
  if (desc.includes('cerah berawan') || desc.includes('partly')) return 'partly-cloudy';
  if (desc.includes('berawan') || desc.includes('cloud')) return 'cloudy';
  if (desc.includes('cerah') || desc.includes('clear') || desc.includes('sunny')) return 'sunny';
  if (desc.includes('kabut') || desc.includes('asap') || desc.includes('fog')) return 'cloudy';
  return 'partly-cloudy';
};

const parseWaktuLokal = (waktu: string) => {
  if (!waktu) return { date: '', hour: -1, timestamp: 0 };
  const d = new Date(waktu);
  if (isNaN(d.getTime())) {
    const str = String(waktu || '');
    const parts = str.includes('T') ? str.split('T') : str.split(' ');
    const date = parts[0] || '';
    const hour = parts[1] ? parseInt(parts[1].split(':')[0], 10) : -1;
    return { date, hour, timestamp: 0 };
  }
  const date = d.toLocaleDateString('en-CA');
  const hour = d.getHours();
  return { date, hour, timestamp: d.getTime() };
};

const formatJamIndonesia = (waktu: string) => {
  const d = new Date(waktu);
  if (isNaN(d.getTime())) return waktu;
  return d.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }).replace(/\./g, ":") + " WIB";
};

export default function PrediksiCuacaPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTimeSlot, setActiveTimeSlot] = useState<string | null>(null);
  const [rawData, setRawData] = useState<Record<string, any[]>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [dataSource, setDataSource] = useState<string>("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Date picker state — defaults to today (local date, not UTC)
  const getLocalDateStr = (offsetDays = 0) => {
    const d = new Date();
    d.setDate(d.getDate() + offsetDays);
    return d.toLocaleDateString('en-CA'); // YYYY-MM-DD local
  };
  const todayStr = getLocalDateStr(0);
  const [selectedDate, setSelectedDate] = useState(todayStr);

  // Date limits: 7 days back, 3 days forward (local dates)
  const minDate = getLocalDateStr(-7);
  const maxDate = getLocalDateStr(3);

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);

        if (selectedDate >= todayStr) {
          // For today/future: use same endpoint as WeatherTable, filter client-side by local date
          const res = await fetchWeatherForecast();
          const allData: Record<string, any[]> = res?.data || {};

          // Filter each kecamatan's forecasts to only include entries matching the selected LOCAL date
          const filtered: Record<string, any[]> = {};
          for (const [kecamatan, forecasts] of Object.entries(allData)) {
            const matching = forecasts.filter((f: any) => {
              const { date } = parseWaktuLokal(f.waktu_lokal);
              return date === selectedDate;
            });
            if (matching.length > 0) {
              filtered[kecamatan] = matching;
            }
          }

          setRawData(filtered);
          setDataSource("forecast");
        } else {
          // For past dates: use by-date endpoint (historical data)
          const res = await fetchWeatherByDate(selectedDate);
          setRawData(res?.data || {});
          setDataSource(res?.source || "");
        }

        setActiveTimeSlot(null);
      } catch (error) {
        console.error("Gagal memuat data cuaca:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [selectedDate, todayStr]);

  // Extract unique times from already-filtered data
  const uniqueTimes = useMemo(() => {
    const timesMap = new Map<number, string>();
    Object.values(rawData).forEach(forecasts => {
      forecasts.forEach((f: any) => {
        const { timestamp } = parseWaktuLokal(f.waktu_lokal);
        if (timestamp > 0) {
          timesMap.set(timestamp, f.waktu_lokal);
        }
      });
    });
    const sortedTimestamps = Array.from(timesMap.keys()).sort((a, b) => a - b);
    return sortedTimestamps.map(ts => timesMap.get(ts) as string);
  }, [rawData]);

  const selectedSlotLabel = useMemo(() => {
    if (!activeTimeSlot) return "Semua Jam";
    return formatJamIndonesia(activeTimeSlot);
  }, [activeTimeSlot]);

  // All kecamatan list sorted alphabetically
  const kecamatanList = useMemo(() => {
    return Object.keys(rawData).sort((a, b) => a.localeCompare(b));
  }, [rawData]);

  // Filter predictions based on search
  const filteredKecamatanList = useMemo(() => {
    if (!searchQuery.trim()) return kecamatanList;
    const q = searchQuery.toLowerCase().trim();
    return kecamatanList.filter((k) => k.toLowerCase().includes(q));
  }, [searchQuery, kecamatanList]);

  // Determine which time slots to show
  const visibleTimes = activeTimeSlot
    ? uniqueTimes.filter((t) => t === activeTimeSlot)
    : uniqueTimes;

  return (
    <>
      <Navbar />
      <main className="flex-1 bg-[#F3F8FF]">
        {/* Hero */}
        <section className="pt-36 pb-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="relative p-8 sm:p-10">
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
                    {searchQuery ? (
                      <button
                        onClick={() => setSearchQuery("")}
                        className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                      >
                        ✕
                      </button>
                    ) : (
                      <HiChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 text-xl pointer-events-none" />
                    )}
                  </div>
                  {searchQuery && !isLoading && (
                    <p className="mt-2 text-xs text-slate-500">
                      {filteredKecamatanList.length} kecamatan ditemukan
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Filter Bar */}
        <section className="py-3">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <DatePicker
                id="date-picker"
                value={selectedDate}
                onChange={(val) => setSelectedDate(val)}
                minDate={minDate}
                maxDate={maxDate}
                disableDarkMode={true}
              />
              <div className="flex items-center gap-4 flex-wrap">
                <span className="text-sm text-slate-500 font-medium">Sumber: BMKG</span>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-slate-500 font-medium">Jam:</span>
                  <div className="relative">
                    <button
                      onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                      type="button"
                      className="flex items-center justify-between gap-3 px-4 py-2.5 rounded-lg text-sm font-semibold bg-white text-slate-700 border border-border shadow-sm hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200 min-w-[140px]"
                    >
                      <span>{selectedSlotLabel}</span>
                      <HiChevronDown className={`w-4 h-4 text-slate-500 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {isDropdownOpen && (
                      <>
                        <div 
                          className="fixed inset-0 z-40" 
                          onClick={() => setIsDropdownOpen(false)}
                        />
                        <div className="absolute right-0 mt-1.5 w-44 rounded-xl bg-white border border-border shadow-lg py-1.5 z-50 animate-in fade-in slide-in-from-top-1 duration-100 origin-top-right">
                          <button
                            onClick={() => {
                              setActiveTimeSlot(null);
                              setIsDropdownOpen(false);
                            }}
                            className={`w-full text-left px-4 py-2 text-sm transition-colors hover:bg-slate-50 ${
                              activeTimeSlot === null ? "text-primary font-semibold bg-primary/5" : "text-slate-700"
                            }`}
                          >
                            Semua Jam
                          </button>
                          {uniqueTimes.map((waktu) => (
                            <button
                              key={waktu}
                              onClick={() => {
                                setActiveTimeSlot(waktu);
                                setIsDropdownOpen(false);
                              }}
                              className={`w-full text-left px-4 py-2 text-sm transition-colors hover:bg-slate-50 ${
                                activeTimeSlot === waktu ? "text-primary font-semibold bg-primary/5" : "text-slate-700"
                              }`}
                            >
                              {formatJamIndonesia(waktu)}
                            </button>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Weather Table */}
        <section className="py-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-white rounded-2xl shadow-sm border border-border overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full" id="weather-prediction-table">
                  <thead>
                    <tr className="bg-primary text-white">
                      <th className="text-left px-5 py-3.5 text-sm font-semibold sticky left-0 bg-primary z-10 min-w-[160px]">
                        Kecamatan
                      </th>
                      {visibleTimes.length === 0 && (
                        <th className="text-center px-4 py-3.5 text-sm font-semibold">Data Jam</th>
                      )}
                      {visibleTimes.map((waktu) => (
                        <th key={waktu} className="text-center px-4 py-3.5 text-sm font-semibold min-w-[160px]">
                          {formatJamIndonesia(waktu)}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {isLoading ? (
                      Array.from({ length: 5 }).map((_, idx) => (
                        <tr key={`skeleton-${idx}`} className={`border-b border-border/50 ${idx % 2 === 0 ? "bg-white" : "bg-slate-50"} animate-pulse`}>
                          <td className={`px-5 py-4 sticky left-0 z-10 ${idx % 2 === 0 ? "bg-white" : "bg-slate-50"}`}>
                            <div className="h-6 bg-slate-200 rounded w-32"></div>
                          </td>
                          {visibleTimes.length === 0 && (
                            <td className="text-center py-4">
                              <div className="h-6 bg-slate-200 rounded w-8 mx-auto"></div>
                            </td>
                          )}
                          {visibleTimes.map((waktu, wIdx) => (
                            <td key={`skeleton-td-${wIdx}`} className="px-4 py-4 text-center">
                              <div className="flex flex-col items-center gap-2">
                                <div className="w-8 h-8 bg-slate-200 rounded-full"></div>
                                <div className="h-4 bg-slate-200 rounded w-10"></div>
                                <div className="h-3 bg-slate-200 rounded w-16"></div>
                              </div>
                            </td>
                          ))}
                        </tr>
                      ))
                    ) : filteredKecamatanList.length === 0 ? (
                      <tr>
                        <td colSpan={visibleTimes.length + 1 || 2} className="text-center py-16 text-slate-400">
                          Tidak ada data yang ditemukan.
                        </td>
                      </tr>
                    ) : (
                      filteredKecamatanList.map((kecamatanName, idx) => {
                        const forecasts = rawData[kecamatanName] || [];
                        return (
                          <tr
                            key={kecamatanName}
                            className={`group border-b border-border/50 transition-colors ${
                              idx % 2 === 0 ? "bg-white" : "bg-slate-50"
                            } hover:bg-slate-100`}
                          >
                            <td className={`px-5 py-4 sticky left-0 z-10 transition-colors ${
                              idx % 2 === 0 ? "bg-white" : "bg-slate-50"
                            } group-hover:bg-slate-100`}>
                              <Link
                                href={`/prediksi-cuaca/${encodeURIComponent(kecamatanName.toLowerCase())}`}
                                className="flex items-center group"
                              >
                                <span className="text-lg font-bold text-blue-600 group-hover:text-blue-700 transition-colors group-hover:underline underline-offset-2">
                                  {kecamatanName}
                                </span>
                              </Link>
                            </td>
                            {visibleTimes.length === 0 && (
                              <td className="text-center py-4 text-slate-400">--</td>
                            )}
                            {visibleTimes.map((waktu) => {
                              const matchingForecast = forecasts.find((f: any) => f.waktu_lokal === waktu);
                              
                              const suhu = matchingForecast ? Math.round(matchingForecast.suhu) + '°C' : '--';
                              const cuacaDesc = matchingForecast ? matchingForecast.deskripsi_cuaca : '-';
                              const iconName = matchingForecast ? mapConditionToIcon(cuacaDesc) : 'partly-cloudy';

                              return (
                                <td key={waktu} className="px-4 py-4 text-center">
                                  {matchingForecast ? (
                                    <div className="flex flex-col items-center gap-1">
                                      <WeatherIcon type={iconName} size={32} />
                                      <span className="font-bold text-primary text-sm">
                                        {suhu}
                                      </span>
                                      <span className="text-xs text-slate-500 leading-tight capitalize">
                                        {cuacaDesc}
                                      </span>
                                    </div>
                                  ) : (
                                    <div className="flex flex-col items-center justify-center h-full text-slate-400">
                                      <span className="text-lg">--</span>
                                    </div>
                                  )}
                                </td>
                              );
                            })}
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {!isLoading && (
              <div className="mt-3 text-xs text-slate-400 text-right">
                Menampilkan {filteredKecamatanList.length} dari {kecamatanList.length} kecamatan
              </div>
            )}
          </div>
        </section>

        <InfoBanner />
      </main>
      <Footer />
    </>
  );
}
