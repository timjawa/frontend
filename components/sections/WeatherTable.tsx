"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { WeatherIcon } from "@/utils/weatherIcons";
import { HiArrowTopRightOnSquare } from "react-icons/hi2";

const tabs = ["Hari Ini", "Besok", "Lusa"];
const timeLabels = [
  { key: "pagi",     label: "Pagi",      range: [5, 9] },
  { key: "siang",    label: "Siang",     range: [9, 14] },
  { key: "sore",     label: "Sore",      range: [14, 18] },
  { key: "malam",    label: "Malam",     range: [18, 24] },
];

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
  const str = String(waktu || '');
  const parts = str.includes('T') ? str.split('T') : str.split(' ');
  return { date: parts[0] || '', hour: parts[1] ? parseInt(parts[1].split(':')[0], 10) : -1 };
};


export default function WeatherTable({ data = {} }: { data?: Record<string, any[]> }) {
  const [activeTab, setActiveTab] = useState(0);

  // Mengambil data kecamatan dari props dan mengurutkan secara alfabetis
  const kecamatanList = useMemo(() => {
    return Object.keys(data || {}).sort((a, b) => a.localeCompare(b));
  }, [data]);

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
                    ? "bg-primary text-white shadow-md"
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
                <tr className="bg-primary text-white">
                  <th className="text-left px-5 py-3.5 text-sm font-semibold sticky left-0 bg-primary z-10 min-w-[140px]">
                    Kecamatan
                  </th>
                  {timeLabels.map((t) => (
                    <th
                      key={t.key}
                      className="text-center px-4 py-3.5 text-sm font-semibold min-w-[130px]"
                    >
                      <div>{t.label}</div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {kecamatanList.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-10 text-slate-500">
                      Belum ada data perkiraan cuaca.
                    </td>
                  </tr>
                ) : (
                  kecamatanList.map((kecamatanName, idx) => {
                    // Ambil array ramalan untuk kecamatan ini
                    const forecasts = data[kecamatanName] || [];
                    
                    // Filter berdasarkan tab (0: hari ini, 1: besok, dst)
                    const targetDate = new Date();
                    targetDate.setDate(targetDate.getDate() + activeTab);
                    const targetDateString = targetDate.toISOString().split('T')[0];
                    
                    return (
                      <tr
                        key={kecamatanName}
                        className={`border-b border-border/50 hover:bg-accent/30 transition-colors ${
                          idx % 2 === 0 ? "bg-white" : "bg-slate-50/50"
                        }`}
                      >
                        <td className="px-5 py-4 font-semibold text-primary text-sm sticky left-0 bg-inherit z-10">
                          <Link
                            href={`/prediksi-cuaca/${encodeURIComponent(kecamatanName.toLowerCase())}`}
                            className="inline-flex items-center gap-1.5 hover:text-secondary transition-colors group"
                          >
                            <span className="group-hover:underline underline-offset-2">
                              {kecamatanName}
                            </span>
                            <HiArrowTopRightOnSquare className="text-primary/40 group-hover:text-secondary text-xs flex-shrink-0 transition-colors" />
                          </Link>
                        </td>
                        {timeLabels.map((t) => {
                          const [minHour, maxHour] = t.range;
                          const midHour = Math.floor((minHour + maxHour) / 2);
                          const candidates = forecasts.filter((f: { waktu_lokal: string }) => {
                            const { date, hour } = parseWaktuLokal(f.waktu_lokal);
                            return date === targetDateString && hour >= minHour && hour < maxHour;
                          });
                          const matchingForecast = candidates.sort((a: { waktu_lokal: string }, b: { waktu_lokal: string }) =>
                            Math.abs(parseWaktuLokal(a.waktu_lokal).hour - midHour) -
                            Math.abs(parseWaktuLokal(b.waktu_lokal).hour - midHour)
                          )[0];

                          const suhu = matchingForecast ? Math.round(matchingForecast.suhu) + '°C' : '--';
                          const cuacaDesc = matchingForecast ? matchingForecast.deskripsi_cuaca : '-';
                          const iconName = mapConditionToIcon(cuacaDesc);

                          return (
                            <td
                              key={t.key}
                              className="px-4 py-4 text-center"
                            >
                              <div className="flex flex-col items-center gap-1">
                                <WeatherIcon type={iconName} size={32} />
                                <span className="font-bold text-primary text-sm">
                                  {suhu}
                                </span>
                                <span className="text-xs text-slate-500 leading-tight capitalize">
                                  {cuacaDesc}
                                </span>
                              </div>
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
