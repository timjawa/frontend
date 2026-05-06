"use client";

import React, { useState } from "react";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import AdminBadge from "@/components/admin/ui/AdminBadge";
import PrediksiTableAction from "./PrediksiTableAction";
import {
  HiMagnifyingGlass,
  HiArrowPath,
  HiOutlineCloud,
  HiOutlineCalendarDays,
  HiOutlineBeaker,
  HiOutlineSun,
} from "react-icons/hi2";

// ─── Mock data — tabel perkiraan_cuaca + join kecamatan ───────────────────────
// Kolom: id, kecamatan_id→nama, waktu_lokal, suhu, kelembapan, curah_hujan,
//        cloud_cover, weather_code, deskripsi_cuaca, kecepatan_angin,
//        arah_angin, uv_index, visibilitas, dibuat_pada
// UNIQUE constraint: (kecamatan_id, waktu_lokal)
const prediksiData = [
  {
    id: "p1",
    kecamatan: { nama: "Gumukmas" },
    waktu_lokal: "2024-05-05 06:00",
    suhu: 24,
    kelembapan: 90,
    curah_hujan: 15.50,
    cloud_cover: 85,
    weather_code: 63,
    deskripsi_cuaca: "Hujan Sedang",
    kecepatan_angin: 22.10,
    arah_angin: "SW",
    uv_index: 1,
    visibilitas: 5000,
    dibuat_pada: "2024-05-04 18:00",
  },
  {
    id: "p2",
    kecamatan: { nama: "Gumukmas" },
    waktu_lokal: "2024-05-05 12:00",
    suhu: 28,
    kelembapan: 78,
    curah_hujan: 2.00,
    cloud_cover: 55,
    weather_code: 3,
    deskripsi_cuaca: "Berawan",
    kecepatan_angin: 15.00,
    arah_angin: "S",
    uv_index: 6,
    visibilitas: 12000,
    dibuat_pada: "2024-05-04 18:00",
  },
  {
    id: "p3",
    kecamatan: { nama: "Ambulu" },
    waktu_lokal: "2024-05-05 06:00",
    suhu: 26,
    kelembapan: 82,
    curah_hujan: 5.00,
    cloud_cover: 70,
    weather_code: 51,
    deskripsi_cuaca: "Gerimis",
    kecepatan_angin: 10.50,
    arah_angin: "SE",
    uv_index: 2,
    visibilitas: 8000,
    dibuat_pada: "2024-05-04 18:00",
  },
  {
    id: "p4",
    kecamatan: { nama: "Kalisat" },
    waktu_lokal: "2024-05-05 06:00",
    suhu: 21,
    kelembapan: 95,
    curah_hujan: 42.00,
    cloud_cover: 98,
    weather_code: 65,
    deskripsi_cuaca: "Hujan Deras",
    kecepatan_angin: 28.30,
    arah_angin: "W",
    uv_index: 0,
    visibilitas: 2000,
    dibuat_pada: "2024-05-04 18:00",
  },
  {
    id: "p5",
    kecamatan: { nama: "Jenggawah" },
    waktu_lokal: "2024-05-05 12:00",
    suhu: 31,
    kelembapan: 68,
    curah_hujan: 0.00,
    cloud_cover: 15,
    weather_code: 1,
    deskripsi_cuaca: "Cerah Berawan",
    kecepatan_angin: 9.00,
    arah_angin: "NE",
    uv_index: 8,
    visibilitas: 18000,
    dibuat_pada: "2024-05-04 18:00",
  },
  {
    id: "p6",
    kecamatan: { nama: "Arjasa" },
    waktu_lokal: "2024-05-05 18:00",
    suhu: 19,
    kelembapan: 88,
    curah_hujan: 8.50,
    cloud_cover: 80,
    weather_code: 61,
    deskripsi_cuaca: "Hujan Ringan",
    kecepatan_angin: 12.00,
    arah_angin: "N",
    uv_index: 0,
    visibilitas: 7000,
    dibuat_pada: "2024-05-04 18:00",
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

function curahHujanBadge(mm: number): { variant: "success" | "warning" | "danger" | "info"; label: string } {
  if (mm === 0) return { variant: "success", label: "Tidak Hujan" };
  if (mm < 5) return { variant: "info", label: "Ringan" };
  if (mm < 20) return { variant: "warning", label: "Sedang" };
  return { variant: "danger", label: "Lebat" };
}

export default function PrediksiCuacaPage() {
  const [search, setSearch] = useState("");
  const [filterKecamatan, setFilterKecamatan] = useState("all");

  const kecamatanList = Array.from(new Set(prediksiData.map((d) => d.kecamatan.nama)));

  const filtered = prediksiData.filter((d) => {
    const matchSearch =
      d.kecamatan.nama.toLowerCase().includes(search.toLowerCase()) ||
      d.deskripsi_cuaca.toLowerCase().includes(search.toLowerCase());
    const matchKec = filterKecamatan === "all" || d.kecamatan.nama === filterKecamatan;
    return matchSearch && matchKec;
  });

  // Stat summary
  const totalPrediksi = prediksiData.length;
  const maxCurahHujan = Math.max(...prediksiData.map((d) => d.curah_hujan));
  const avgSuhu = (prediksiData.reduce((s, d) => s + d.suhu, 0) / prediksiData.length).toFixed(1);
  const maxUV = Math.max(...prediksiData.map((d) => d.uv_index));

  return (
    <div>
      <PageBreadcrumb pageTitle="Prediksi Cuaca" />

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-white/[0.03] flex items-center gap-4">
          <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-500/10 shrink-0">
            <HiOutlineCalendarDays className="w-5 h-5 text-blue-500" />
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-0.5">Total Prakiraan</p>
            <p className="text-2xl font-bold text-gray-800 dark:text-white">{totalPrediksi}</p>
          </div>
        </div>
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-white/[0.03] flex items-center gap-4">
          <div className="p-3 rounded-xl bg-cyan-50 dark:bg-cyan-500/10 shrink-0">
            <HiOutlineCloud className="w-5 h-5 text-cyan-500" />
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-0.5">Curah Hujan Maks.</p>
            <p className="text-2xl font-bold text-gray-800 dark:text-white">
              {maxCurahHujan.toFixed(1)} <span className="text-sm font-normal text-gray-400">mm</span>
            </p>
          </div>
        </div>
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-white/[0.03] flex items-center gap-4">
          <div className="p-3 rounded-xl bg-orange-50 dark:bg-orange-500/10 shrink-0">
            <HiOutlineBeaker className="w-5 h-5 text-orange-500" />
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-0.5">Rata-rata Suhu</p>
            <p className="text-2xl font-bold text-gray-800 dark:text-white">{avgSuhu}°C</p>
          </div>
        </div>
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-white/[0.03] flex items-center gap-4">
          <div className="p-3 rounded-xl bg-yellow-50 dark:bg-yellow-500/10 shrink-0">
            <HiOutlineSun className="w-5 h-5 text-yellow-500" />
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-0.5">UV Index Tertinggi</p>
            <p className="text-2xl font-bold text-gray-800 dark:text-white">{maxUV}</p>
          </div>
        </div>
      </div>

      {/* Table Card */}
      <div className="min-h-screen rounded-2xl border border-gray-200 bg-white px-5 py-3 dark:border-gray-800 dark:bg-white/[0.03] xl:px-10 xl:py-8">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl ring-1 ring-slate-100 shadow-sm overflow-hidden">

          {/* Header Bar */}
          <div className="px-6 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-100">
            <div>
              <h3 className="text-base font-bold text-[#1B2E4B]">Data Prediksi Cuaca</h3>
              <p className="text-xs text-slate-400 mt-0.5">Prakiraan cuaca per kecamatan berdasarkan waktu lokal</p>
            </div>
            <div className="flex items-center gap-2.5 flex-wrap">
              {/* Filter kecamatan */}
              <select
                value={filterKecamatan}
                onChange={(e) => setFilterKecamatan(e.target.value)}
                className="py-2 px-3 text-sm rounded-lg bg-slate-50 border border-slate-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none transition-all text-slate-600"
              >
                <option value="all">Semua Kecamatan</option>
                {kecamatanList.map((k) => (
                  <option key={k} value={k}>{k}</option>
                ))}
              </select>
              {/* Search */}
              <div className="relative">
                <HiMagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Cari kecamatan / kondisi..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9 pr-4 py-2 text-sm rounded-lg bg-slate-50 border border-slate-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 focus:bg-white outline-none transition-all w-52"
                />
              </div>
              <button className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 active:scale-95 transition-all shadow-sm shadow-blue-200 whitespace-nowrap">
                <HiArrowPath className="w-4 h-4" />
                Refresh
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
                  <th className="px-6 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-400">Waktu Prakiraan</th>
                  <th className="px-6 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-400">Kondisi</th>
                  <th className="px-6 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-400">Suhu</th>
                  <th className="px-6 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-400">Kelembapan</th>
                  <th className="px-6 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-400">Curah Hujan</th>
                  <th className="px-6 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-400">Angin</th>
                  <th className="px-6 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-400 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="px-6 py-12 text-center text-slate-400">
                      <HiOutlineCloud className="w-10 h-10 mx-auto mb-2 text-slate-300" />
                      <p>Tidak ada data prakiraan ditemukan.</p>
                    </td>
                  </tr>
                ) : (
                  filtered.map((row, index) => {
                    const hujan = curahHujanBadge(row.curah_hujan);
                    return (
                      <tr key={row.id} className="hover:bg-blue-50/40 transition-colors">
                        {/* No */}
                        <td className="px-6 py-4 text-center text-slate-500 font-medium">{index + 1}</td>

                        {/* Kecamatan */}
                        <td className="px-6 py-4 font-semibold text-[#1B2E4B] dark:text-white">
                          {row.kecamatan.nama}
                        </td>

                        {/* Waktu Prakiraan */}
                        <td className="px-6 py-4">
                          <p className="text-sm font-medium text-gray-800 dark:text-gray-200 whitespace-nowrap">
                            {row.waktu_lokal.split(" ")[0]}
                          </p>
                          <p className="text-xs text-slate-400">{row.waktu_lokal.split(" ")[1]} WIB</p>
                        </td>

                        {/* Kondisi */}
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <span className="text-xl leading-none">{weatherIcon(row.weather_code)}</span>
                            <span className="text-sm text-slate-600 dark:text-slate-400">{row.deskripsi_cuaca}</span>
                          </div>
                        </td>

                        {/* Suhu */}
                        <td className="px-6 py-4">
                          <p className="font-bold text-gray-800 dark:text-white">{row.suhu}°C</p>
                        </td>

                        {/* Kelembapan */}
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">{row.kelembapan}%</span>
                            <div className="w-14 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                              <div className="h-full bg-blue-400 rounded-full" style={{ width: `${row.kelembapan}%` }} />
                            </div>
                          </div>
                        </td>

                        {/* Curah Hujan */}
                        <td className="px-6 py-4">
                          <div className="flex flex-col gap-1">
                            <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                              {row.curah_hujan.toFixed(1)} <span className="text-xs font-normal text-gray-400">mm</span>
                            </span>
                            <AdminBadge variant={hujan.variant}>{hujan.label}</AdminBadge>
                          </div>
                        </td>

                        {/* Angin */}
                        <td className="px-6 py-4">
                          <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                            {row.kecepatan_angin} <span className="text-xs font-normal text-gray-400">km/j</span>
                          </p>
                          <p className="text-xs text-slate-400">{row.arah_angin}</p>
                        </td>

                        {/* Aksi */}
                        <td className="px-6 py-4 text-right">
                          <PrediksiTableAction id={row.id} />
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="px-6 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-t border-slate-100 bg-slate-50/50">
            <p className="text-sm text-slate-500">
              Menampilkan <span className="font-semibold text-slate-700">1–{filtered.length}</span> dari{" "}
              <span className="font-semibold text-slate-700">{prediksiData.length}</span> prakiraan
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
