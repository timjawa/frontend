"use client";

import React, { useState, useRef, useEffect } from "react";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import AdminBadge from "@/components/admin/ui/AdminBadge";
import Link from "next/link";
import { HiMagnifyingGlass, HiArrowPath } from "react-icons/hi2";
import { HiOutlineCloud } from "react-icons/hi2";
import CuacaTableAction from "./CuacaTableAction";

const cuacaData = [
  {
    id: "c1",
    kecamatan: { id: "k1", nama: "Gumukmas" },
    suhu: 28.5,
    feels_like: 31.2,
    kelembapan: 85,
    curah_hujan: 12.50,
    cloud_cover: 75,
    weather_code: 61,
    deskripsi: "Hujan Ringan",
    fetched_at: "2024-05-04 14:00:00",
  },
  {
    id: "c2",
    kecamatan: { id: "k2", nama: "Ambulu" },
    suhu: 30.1,
    feels_like: 33.5,
    kelembapan: 78,
    curah_hujan: 0.00,
    cloud_cover: 30,
    weather_code: 2,
    deskripsi: "Berawan Sebagian",
    fetched_at: "2024-05-04 14:00:00",
  },
  {
    id: "c3",
    kecamatan: { id: "k3", nama: "Kalisat" },
    suhu: 24.3,
    feels_like: 26.1,
    kelembapan: 92,
    curah_hujan: 35.80,
    cloud_cover: 95,
    weather_code: 65,
    deskripsi: "Hujan Deras",
    fetched_at: "2024-05-04 14:00:00",
  },
  {
    id: "c4",
    kecamatan: { id: "k4", nama: "Arjasa" },
    suhu: 22.8,
    feels_like: 24.0,
    kelembapan: 88,
    curah_hujan: 8.20,
    cloud_cover: 80,
    weather_code: 51,
    deskripsi: "Gerimis",
    fetched_at: "2024-05-04 14:00:00",
  },
  {
    id: "c5",
    kecamatan: { id: "k5", nama: "Jenggawah" },
    suhu: 32.0,
    feels_like: 35.8,
    kelembapan: 65,
    curah_hujan: 0.00,
    cloud_cover: 10,
    weather_code: 0,
    deskripsi: "Cerah",
    fetched_at: "2024-05-04 14:00:00",
  },
];

function weatherIcon(code: number) {
  if (code === 0) return "☀️";
  if (code <= 2) return "⛅";
  if (code <= 3) return "☁️";
  if (code <= 49) return "🌫️";
  if (code <= 57) return "🌦️";
  if (code <= 67) return "🌧️";
  if (code <= 77) return "🌨️";
  if (code <= 82) return "🌧️";
  return "⛈️";
}

export default function CuacaRealtimePage() {
  const [search, setSearch] = useState("");

  const filtered = cuacaData.filter((d) =>
    d.kecamatan.nama.toLowerCase().includes(search.toLowerCase()) ||
    d.deskripsi.toLowerCase().includes(search.toLowerCase())
  );

  const avgSuhu = (cuacaData.reduce((s, d) => s + d.suhu, 0) / cuacaData.length).toFixed(1);
  const maxCurahHujan = Math.max(...cuacaData.map((d) => d.curah_hujan));
  const avgKelembapan = Math.round(cuacaData.reduce((s, d) => s + d.kelembapan, 0) / cuacaData.length);
  const updateTime = cuacaData[0]?.fetched_at ?? "-";

  return (
    <div>
      <PageBreadcrumb pageTitle="Cuaca Realtime" />

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-white/[0.03]">
          <p className="text-xs font-medium text-gray-500 mb-1">Rata-rata Suhu</p>
          <p className="text-2xl font-bold text-gray-800 dark:text-white">{avgSuhu}°C</p>
          <p className="text-xs text-gray-400 mt-1">Seluruh kecamatan</p>
        </div>
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-white/[0.03]">
          <p className="text-xs font-medium text-gray-500 mb-1">Rata-rata Kelembapan</p>
          <p className="text-2xl font-bold text-gray-800 dark:text-white">{avgKelembapan}%</p>
          <p className="text-xs text-gray-400 mt-1">Rata-rata RH</p>
        </div>
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-white/[0.03]">
          <p className="text-xs font-medium text-gray-500 mb-1">Curah Hujan Tertinggi</p>
          <p className="text-2xl font-bold text-gray-800 dark:text-white">
            {maxCurahHujan.toFixed(1)}{" "}
            <span className="text-sm font-normal text-gray-500">mm/jam</span>
          </p>
          <p className="text-xs text-gray-400 mt-1">Maks semua pos</p>
        </div>
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-white/[0.03]">
          <p className="text-xs font-medium text-gray-500 mb-1">Terakhir Diperbarui</p>
          <p className="text-sm font-bold text-gray-800 dark:text-white leading-tight">
            {updateTime.split(" ")[0]}
          </p>
          <p className="text-xs text-gray-400 mt-0.5">{updateTime.split(" ")[1]} WIB</p>
        </div>
      </div>

      {/* Table Card */}
      <div className="min-h-screen rounded-2xl border border-gray-200 bg-white px-5 py-3 dark:border-gray-800 dark:bg-white/[0.03] xl:px-10 xl:py-8">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl ring-1 ring-slate-100 shadow-sm overflow-hidden">

          {/* Header Bar */}
          <div className="px-6 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-100">
            <div>
              <h3 className="text-base font-bold text-[#1B2E4B]">Data Cuaca Realtime</h3>
              <p className="text-xs text-slate-400 mt-0.5">Data cuaca terkini per kecamatan dari API eksternal</p>
            </div>
            <div className="flex items-center gap-2.5">
              <div className="relative">
                <HiMagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Cari kecamatan..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9 pr-4 py-2 text-sm rounded-lg bg-slate-50 border border-slate-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 focus:bg-white outline-none transition-all w-48"
                />
              </div>
              <button className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 active:scale-95 transition-all shadow-sm shadow-blue-200 dark:shadow-none whitespace-nowrap">
                <HiArrowPath className="w-4 h-4" />
                Refresh Data
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="bg-slate-50/80">
                  <th className="px-6 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-400 w-12 text-center">No</th>
                  <th className="px-6 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-400">Kecamatan</th>
                  <th className="px-6 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-400">Kondisi</th>
                  <th className="px-6 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-400">Suhu</th>
                  <th className="px-6 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-400">Kelembapan</th>
                  <th className="px-6 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-400">Diperbarui</th>
                  <th className="px-6 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-400 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-slate-400">
                      <HiOutlineCloud className="w-10 h-10 mx-auto mb-2 text-slate-300" />
                      <p>Tidak ada data cuaca ditemukan.</p>
                    </td>
                  </tr>
                ) : (
                  filtered.map((row, index) => (
                    <tr key={row.id} className="hover:bg-blue-50/40 transition-colors">
                      <td className="px-6 py-4 text-center text-slate-500 font-medium">{index + 1}</td>
                      <td className="px-6 py-4 font-semibold text-[#1B2E4B] dark:text-white">{row.kecamatan.nama}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className="text-xl leading-none">{weatherIcon(row.weather_code)}</span>
                          <span className="text-sm text-slate-600 dark:text-slate-400">{row.deskripsi}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-bold text-gray-800 dark:text-white">{row.suhu}°C</p>
                        <p className="text-xs text-slate-400">Terasa {row.feels_like}°C</p>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-gray-700 dark:text-gray-300">{row.kelembapan}%</span>
                          <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                            <div className="h-full bg-blue-400 rounded-full" style={{ width: `${row.kelembapan}%` }} />
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-slate-500 text-sm">{row.fetched_at}</td>
                      <td className="px-6 py-4 text-right">
                        <CuacaTableAction id={row.id} />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="px-6 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-t border-slate-100 bg-slate-50/50">
            <p className="text-sm text-slate-500">
              Menampilkan <span className="font-semibold text-slate-700">1–{filtered.length}</span> dari{" "}
              <span className="font-semibold text-slate-700">{cuacaData.length}</span> data
            </p>
            <div className="flex items-center gap-1.5">
              <button className="px-3 py-1.5 rounded-lg text-sm font-medium border border-slate-200 text-slate-400 bg-white cursor-not-allowed opacity-50" disabled>
                ← Sebelumnya
              </button>
              <button className="w-9 h-9 rounded-lg text-sm font-semibold bg-[#1B2E4B] text-white shadow-md shadow-[#1B2E4B]/20">1</button>
              <button className="px-3 py-1.5 rounded-lg text-sm font-medium border border-slate-200 text-slate-700 bg-white hover:bg-slate-50 transition-colors">
                Selanjutnya →
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
