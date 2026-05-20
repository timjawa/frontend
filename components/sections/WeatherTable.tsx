"use client";

import { useState, useMemo, useEffect, useDeferredValue } from "react";
import Link from "next/link";
import { WeatherIcon } from "@/utils/weatherIcons";
import { HiArrowTopRightOnSquare } from "react-icons/hi2";

const tabs = ["Hari Ini", "Besok", "Lusa"];

const mapConditionToIcon = (description: string) => {
  const desc = description?.toLowerCase() || '';
  if (desc.includes('petir') || desc.includes('thunder')) return 'thunderstorm';
  if (desc.includes('hujan lebat')) return 'rain';
  if (desc.includes('hujan') || desc.includes('rain')) return 'light-rain';
  if (desc.includes('cerah berawan') || desc.includes('partly')) return 'partly-cloudy';
  if (desc.includes('berawan') || desc.includes('cloud')) return 'cloudy';
  if (desc.includes('cerah') || desc.includes('clear') || desc.includes('sunny')) return 'sunny';
  if (desc.includes('kabut') || desc.includes('asap')) return 'cloudy';
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

export default function WeatherTable() {
  const [data, setData] = useState<Record<string, any[]>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(0);
  const deferredActiveTab = useDeferredValue(activeTab);

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        const { fetchWeatherForecast } = await import("@/services/weather");
        const res = await fetchWeatherForecast();
        setData(res?.data || {});
      } catch (error) {
        console.error("Gagal memuat forecast cuaca", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  // Mengambil data kecamatan dari props dan mengurutkan secara alfabetis
  const kecamatanList = useMemo(() => {
    return Object.keys(data || {}).sort((a, b) => a.localeCompare(b));
  }, [data]);

  // Determine target date string based on active tab
  const targetDateString = useMemo(() => {
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + deferredActiveTab);
    return targetDate.toLocaleDateString('en-CA'); // YYYY-MM-DD
  }, [deferredActiveTab]);

  // Get unique times for the target date dynamically from data
  const uniqueTimes = useMemo(() => {
    const timesMap = new Map<number, string>();
    Object.values(data || {}).forEach(forecasts => {
      forecasts.forEach((f: any) => {
        const { date, timestamp } = parseWaktuLokal(f.waktu_lokal);
        if (date === targetDateString) {
          timesMap.set(timestamp, f.waktu_lokal);
        }
      });
    });
    const sortedTimestamps = Array.from(timesMap.keys()).sort((a, b) => a - b);
    return sortedTimestamps.map(ts => timesMap.get(ts) as string);
  }, [data, targetDateString]);

  const isPending = activeTab !== deferredActiveTab;
  const showSkeleton = isLoading || isPending;

  return (
    <section className="py-10" style={{ backgroundColor: '#F3F8FF' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-2xl font-bold text-primary mb-6">
          Prediksi Cuaca
        </h2>

        {/* Tabs & Source */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6">
          <div className="flex gap-2">
            {tabs.map((tab, i) => (
              <button
                key={tab}
                onClick={() => setActiveTab(i)}
                className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
                  activeTab === i
                    ? "bg-[#1f2a56] text-white shadow-md"
                    : "bg-white text-slate-600 hover:bg-slate-100 border border-border"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
          <span className="text-sm text-slate-500 font-medium">Sumber: BMKG</span>
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-[#1f2a56] text-white">
                  <th className="text-left px-5 py-3.5 text-sm font-semibold sticky left-0 bg-[#1f2a56] z-10 min-w-[140px]">
                    Kecamatan
                  </th>
                  {uniqueTimes.length === 0 && (
                     <th className="text-center px-4 py-3.5 text-sm font-semibold">Data Jam</th>
                  )}
                  {uniqueTimes.map((waktu) => (
                    <th
                      key={waktu}
                      className="text-center px-4 py-3.5 text-sm font-semibold min-w-[130px]"
                    >
                      <div>{formatJamIndonesia(waktu)}</div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {showSkeleton ? (
                  Array.from({ length: 5 }).map((_, idx) => (
                    <tr key={`skeleton-${idx}`} className={`border-b border-border/50 ${idx % 2 === 0 ? "bg-white" : "bg-slate-50/50"} animate-pulse`}>
                      <td className="px-5 py-4 sticky left-0 bg-inherit z-10">
                        <div className="h-6 bg-slate-200 rounded w-32"></div>
                      </td>
                      {uniqueTimes.length === 0 && (
                        <td className="text-center py-4">
                          <div className="h-6 bg-slate-200 rounded w-8 mx-auto"></div>
                        </td>
                      )}
                      {uniqueTimes.map((waktu, wIdx) => (
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
                ) : kecamatanList.length === 0 ? (
                  <tr>
                    <td colSpan={uniqueTimes.length + 1} className="text-center py-10 text-slate-500">
                      Belum ada data perkiraan cuaca.
                    </td>
                  </tr>
                ) : (
                  kecamatanList.map((kecamatanName, idx) => {
                    const forecasts = data[kecamatanName] || [];
                    
                    return (
                      <tr
                        key={kecamatanName}
                        className={`border-b border-border/50 hover:bg-accent/30 transition-colors ${
                          idx % 2 === 0 ? "bg-white" : "bg-slate-50/50"
                        }`}
                      >
                        <td className="px-5 py-4 sticky left-0 bg-inherit z-10">
                          <Link
                            href={`/prediksi-cuaca/${encodeURIComponent(kecamatanName.toLowerCase())}`}
                            className="inline-flex items-center group"
                          >
                            <span className="text-lg font-bold text-blue-600 hover:text-blue-700 transition-colors group-hover:underline underline-offset-2">
                              {kecamatanName}
                            </span>
                          </Link>
                        </td>
                        {uniqueTimes.length === 0 && (
                          <td className="text-center py-4 text-slate-400">--</td>
                        )}
                        {uniqueTimes.map((waktu) => {
                          const matchingForecast = forecasts.find((f: any) => f.waktu_lokal === waktu);

                          const suhu = matchingForecast ? Math.round(matchingForecast.suhu) + '°C' : '--';
                          const cuacaDesc = matchingForecast ? matchingForecast.deskripsi_cuaca : '-';
                          const iconName = matchingForecast ? mapConditionToIcon(cuacaDesc) : 'partly-cloudy';

                          return (
                            <td
                              key={waktu}
                              className="px-4 py-4 text-center"
                            >
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
      </div>
    </section>
  );
}
