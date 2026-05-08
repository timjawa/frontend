"use client";
import React from "react";

interface AktivitasItem {
  id: string;
  icon: string;
  iconBg: string;
  title: string;
  sub: string;
  waktu: string;
}

const aktivitasList: AktivitasItem[] = [
  {
    id: "1",
    icon: "📋",
    iconBg: "bg-blue-100 dark:bg-blue-500/15",
    title: "Laporan baru masuk",
    sub: "Banjir di Kec. Ambulu — Siti Rahayu",
    waktu: "5 menit lalu",
  },
  {
    id: "2",
    icon: "✅",
    iconBg: "bg-green-100 dark:bg-green-500/15",
    title: "Laporan diverifikasi",
    sub: "Tanah Longsor Kec. Silo — diverifikasi oleh Admin",
    waktu: "22 menit lalu",
  },
  {
    id: "3",
    icon: "🔔",
    iconBg: "bg-red-100 dark:bg-red-500/15",
    title: "Peringatan dini diterbitkan",
    sub: "Level Kritis — Kec. Tempurejo oleh BPBD",
    waktu: "1 jam lalu",
  },
  {
    id: "4",
    icon: "👤",
    iconBg: "bg-violet-100 dark:bg-violet-500/15",
    title: "Pengguna baru terdaftar",
    sub: "Ahmad Fauzi bergabung sebagai masyarakat",
    waktu: "2 jam lalu",
  },
  {
    id: "5",
    icon: "📰",
    iconBg: "bg-amber-100 dark:bg-amber-500/15",
    title: "Berita dipublikasikan",
    sub: "\"Waspada Musim Hujan 2026\" — Admin BPBD",
    waktu: "3 jam lalu",
  },
  {
    id: "6",
    icon: "🏕️",
    iconBg: "bg-teal-100 dark:bg-teal-500/15",
    title: "Pos pengungsian diaktifkan",
    sub: "GOR Ambulu — kapasitas 500 orang",
    waktu: "4 jam lalu",
  },
];

export default function AktivitasTerbaru() {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white px-5 pt-5 pb-4 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6 sm:pt-6">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            Aktivitas Terbaru
          </h3>
          <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">
            Log sistem hari ini
          </p>
        </div>
      </div>

      <ol className="relative border-l border-gray-200 dark:border-gray-700 space-y-5 ml-2">
        {aktivitasList.map((item) => (
          <li key={item.id} className="ml-5">
            {/* Timeline dot */}
            <span
              className={`absolute -left-3.5 flex h-7 w-7 items-center justify-center rounded-full text-base ring-4 ring-white dark:ring-gray-900 ${item.iconBg}`}
            >
              {item.icon}
            </span>

            <div className="rounded-xl border border-gray-100 bg-gray-50 p-3 dark:border-gray-800 dark:bg-white/[0.02]">
              <p className="text-sm font-semibold text-gray-800 dark:text-white/90">
                {item.title}
              </p>
              <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400 line-clamp-1">
                {item.sub}
              </p>
              <time className="mt-1.5 block text-xs text-gray-400 dark:text-gray-500">
                {item.waktu}
              </time>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
