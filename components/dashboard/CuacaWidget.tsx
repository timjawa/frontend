"use client";
import React from "react";

interface CuacaItem {
  kecamatan: string;
  suhu: number;
  kelembapan: number;
  curah_hujan: number;
  kecepatan_angin: number;
  deskripsi: string;
  weather_code: number;
}

const cuacaData: CuacaItem[] = [
  { kecamatan: "Kaliwates", suhu: 29, kelembapan: 78, curah_hujan: 0, kecepatan_angin: 14, deskripsi: "Cerah Berawan", weather_code: 2 },
  { kecamatan: "Sumbersari", suhu: 28, kelembapan: 82, curah_hujan: 2.4, kecepatan_angin: 18, deskripsi: "Hujan Ringan", weather_code: 61 },
  { kecamatan: "Patrang", suhu: 27, kelembapan: 85, curah_hujan: 5.1, kecepatan_angin: 22, deskripsi: "Hujan Sedang", weather_code: 63 },
  { kecamatan: "Ambulu", suhu: 26, kelembapan: 91, curah_hujan: 12.8, kecepatan_angin: 35, deskripsi: "Hujan Lebat", weather_code: 65 },
  { kecamatan: "Tempurejo", suhu: 24, kelembapan: 95, curah_hujan: 28.4, kecepatan_angin: 48, deskripsi: "Badai Hujan", weather_code: 95 },
];

function weatherEmoji(code: number): string {
  if (code === 0) return "☀️";
  if (code <= 2) return "🌤️";
  if (code <= 3) return "☁️";
  if (code <= 50) return "🌫️";
  if (code <= 62) return "🌦️";
  if (code <= 67) return "🌧️";
  if (code <= 77) return "❄️";
  if (code <= 82) return "🌦️";
  return "⛈️";
}

function rainBarColor(mm: number): string {
  if (mm === 0) return "bg-green-400";
  if (mm < 5) return "bg-yellow-400";
  if (mm < 15) return "bg-orange-500";
  return "bg-red-500";
}

export default function CuacaWidget() {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white px-5 pt-5 pb-5 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6 sm:pt-6">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            Cuaca Realtime
          </h3>
          <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">
            Kondisi cuaca per kecamatan · 07 Mei 2026, 20:00 WIB
          </p>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-sky-100 px-3 py-1 text-xs font-medium text-sky-700 dark:bg-sky-500/15 dark:text-sky-400">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-sky-500" />
          Live
        </span>
      </div>

      <div className="overflow-x-auto custom-scrollbar">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-gray-100 dark:border-gray-800">
              {["Kecamatan", "Cuaca", "Suhu", "Kelembapan", "Curah Hujan", "Angin"].map((h) => (
                <th
                  key={h}
                  className="whitespace-nowrap pb-2.5 pr-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 first:pl-0"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
            {cuacaData.map((c) => {
              const maxRain = 30;
              const pct = Math.min((c.curah_hujan / maxRain) * 100, 100);
              return (
                <tr key={c.kecamatan} className="hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors">
                  <td className="py-3 pr-4 font-medium text-gray-800 dark:text-white/90 whitespace-nowrap">
                    {c.kecamatan}
                  </td>
                  <td className="py-3 pr-4 whitespace-nowrap">
                    <div className="flex items-center gap-1.5">
                      <span className="text-lg">{weatherEmoji(c.weather_code)}</span>
                      <span className="text-gray-600 dark:text-gray-400 text-xs">{c.deskripsi}</span>
                    </div>
                  </td>
                  <td className="py-3 pr-4 text-gray-700 dark:text-gray-300 whitespace-nowrap font-semibold">
                    {c.suhu}°C
                  </td>
                  <td className="py-3 pr-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 w-16 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-700">
                        <div
                          className="h-full rounded-full bg-blue-400"
                          style={{ width: `${c.kelembapan}%` }}
                        />
                      </div>
                      <span className="text-gray-600 dark:text-gray-400">{c.kelembapan}%</span>
                    </div>
                  </td>
                  <td className="py-3 pr-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 w-16 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-700">
                        <div
                          className={`h-full rounded-full ${rainBarColor(c.curah_hujan)}`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className="text-gray-600 dark:text-gray-400">{c.curah_hujan} mm</span>
                    </div>
                  </td>
                  <td className="py-3 whitespace-nowrap text-gray-600 dark:text-gray-400">
                    {c.kecepatan_angin} km/j
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
