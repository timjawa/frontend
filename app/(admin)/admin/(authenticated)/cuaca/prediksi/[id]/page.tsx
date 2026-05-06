import React from "react";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import AdminBadge from "@/components/admin/ui/AdminBadge";
import Link from "next/link";
import {
  HiOutlineArrowLeft,
  HiOutlineCloud,
  HiOutlineBeaker,
  HiOutlineBolt,
  HiOutlineSun,
  HiOutlineEye,
  HiOutlineArrowTrendingUp,
  HiOutlineCalendarDays,
} from "react-icons/hi2";

interface PrediksiDetailPageProps {
  params: { id: string };
}

export default function PrediksiDetailPage({ params }: PrediksiDetailPageProps) {
  // Mock data — kolom dari tabel perkiraan_cuaca + join kecamatan
  // UNIQUE: (kecamatan_id, waktu_lokal)
  // Berbeda dari realtime: ada waktu_lokal, arah_angin teks (bukan derajat),
  // tidak ada feels_like & tekanan_udara; ada cloud_cover & dibuat_pada
  const prediksi = {
    id: params.id,
    kecamatan: { nama: "Kalisat" },
    waktu_lokal: "2024-05-05 06:00:00",
    suhu: 21,
    kelembapan: 95,
    curah_hujan: 42.00,
    cloud_cover: 98,
    weather_code: 65,
    deskripsi_cuaca: "Hujan Deras",
    kecepatan_angin: 28.30,
    arah_angin: "W",         // teks, bukan derajat — beda dari realtime
    uv_index: 0,
    visibilitas: 2000,
    dibuat_pada: "2024-05-04 18:00:00",
  };

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

  // arah_angin pada perkiraan_cuaca sudah berupa label teks (N, NE, SW, dll.)
  const arahAnginLabel: Record<string, string> = {
    N: "Utara", NE: "Timur Laut", E: "Timur", SE: "Tenggara",
    S: "Selatan", SW: "Barat Daya", W: "Barat", NW: "Barat Laut",
  };

  function uvConfig(uv: number) {
    if (uv <= 2) return { label: "Rendah", variant: "success" as const, pct: 10, barColor: "bg-green-500", desc: "Aman untuk aktivitas luar ruangan." };
    if (uv <= 5) return { label: "Sedang", variant: "info" as const, pct: 40, barColor: "bg-blue-500", desc: "Gunakan tabir surya saat beraktivitas." };
    if (uv <= 7) return { label: "Tinggi", variant: "warning" as const, pct: 60, barColor: "bg-yellow-500", desc: "Kurangi paparan sinar matahari langsung." };
    if (uv <= 10) return { label: "Sangat Tinggi", variant: "danger" as const, pct: 80, barColor: "bg-orange-500", desc: "Hindari paparan di jam 10.00–16.00." };
    return { label: "Ekstrem", variant: "danger" as const, pct: 100, barColor: "bg-red-600", desc: "Tetap di dalam ruangan!" };
  }

  function curahHujanLabel(mm: number): { variant: "success" | "warning" | "danger" | "info"; label: string } {
    if (mm === 0) return { variant: "success", label: "Tidak Hujan" };
    if (mm < 5) return { variant: "info", label: "Ringan" };
    if (mm < 20) return { variant: "warning", label: "Sedang" };
    return { variant: "danger", label: "Lebat" };
  }

  const uv = uvConfig(prediksi.uv_index);
  const hujan = curahHujanLabel(prediksi.curah_hujan);
  const visKm = prediksi.visibilitas >= 1000
    ? `${(prediksi.visibilitas / 1000).toFixed(1)} km`
    : `${prediksi.visibilitas} m`;

  return (
    <div>
      {/* Page Header */}
      <div className="flex items-center justify-between mb-6">
        <PageBreadcrumb pageTitle="Detail Prediksi Cuaca" className="mb-0" />
        <div className="flex gap-3">
          <Link
            href="/admin/cuaca/prediksi"
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
          >
            <HiOutlineArrowLeft className="w-4 h-4" />
            Kembali
          </Link>
        </div>
      </div>

      {/* Stat Cards Row — 4 kartu ringkasan */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {/* Suhu */}
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-white/[0.03] flex items-center gap-4">
          <div className="p-3 rounded-xl bg-orange-50 dark:bg-orange-500/10 shrink-0">
            <HiOutlineSun className="w-6 h-6 text-orange-500" />
          </div>
          <div>
            <span className="block text-xs font-medium text-gray-500 mb-0.5">Suhu Prakiraan</span>
            <p className="text-xl font-bold text-gray-800 dark:text-white">{prediksi.suhu}°C</p>
            <p className="text-xs text-gray-400">Kelembapan {prediksi.kelembapan}%</p>
          </div>
        </div>

        {/* Curah Hujan */}
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-white/[0.03] flex items-center gap-4">
          <div className="p-3 rounded-xl bg-cyan-50 dark:bg-cyan-500/10 shrink-0">
            <HiOutlineCloud className="w-6 h-6 text-cyan-500" />
          </div>
          <div>
            <span className="block text-xs font-medium text-gray-500 mb-0.5">Curah Hujan</span>
            <p className="text-xl font-bold text-gray-800 dark:text-white">{prediksi.curah_hujan.toFixed(1)}</p>
            <p className="text-xs text-gray-400">mm</p>
          </div>
        </div>

        {/* Angin */}
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-white/[0.03] flex items-center gap-4">
          <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-500/10 shrink-0">
            <HiOutlineBeaker className="w-6 h-6 text-blue-500" />
          </div>
          <div>
            <span className="block text-xs font-medium text-gray-500 mb-0.5">Angin</span>
            <p className="text-xl font-bold text-gray-800 dark:text-white">{prediksi.kecepatan_angin} <span className="text-sm font-normal text-gray-400">km/j</span></p>
            <p className="text-xs text-gray-400">Arah: {prediksi.arah_angin}</p>
          </div>
        </div>

        {/* UV Index */}
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-white/[0.03] flex items-center gap-4">
          <div className="p-3 rounded-xl bg-yellow-50 dark:bg-yellow-500/10 shrink-0">
            <HiOutlineBolt className="w-6 h-6 text-yellow-500" />
          </div>
          <div>
            <span className="block text-xs font-medium text-gray-500 mb-0.5">UV Index</span>
            <p className="text-xl font-bold text-gray-800 dark:text-white">{prediksi.uv_index}</p>
            <p className="text-xs text-gray-400">{uv.label}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* ── Konten Utama — 2 kolom kiri ── */}
        <div className="lg:col-span-2 space-y-6">

          {/* Kondisi Prakiraan */}
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-white/[0.03]">
            <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-4 border-b border-gray-100 dark:border-gray-800 pb-3">
              Kondisi Cuaca Diprakirakan
            </h3>
            <div className="flex items-center gap-6 py-2">
              <span className="text-6xl leading-none">{weatherIcon(prediksi.weather_code)}</span>
              <div>
                <p className="text-4xl font-bold text-gray-800 dark:text-white">{prediksi.suhu}°C</p>
                <p className="text-base font-medium text-slate-500 mt-1">{prediksi.deskripsi_cuaca}</p>
                <div className="flex items-center gap-2 mt-2">
                  <AdminBadge variant={hujan.variant}>{hujan.label}</AdminBadge>
                  <span className="text-xs text-slate-400">Cuaca WMO: {prediksi.weather_code}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Detail Metrik */}
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-white/[0.03]">
            <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-4 border-b border-gray-100 dark:border-gray-800 pb-3 flex items-center gap-2">
              <HiOutlineArrowTrendingUp className="w-5 h-5 text-blue-500" />
              Detail Metrik
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

              {/* Kelembapan */}
              <div className="bg-gray-50 dark:bg-gray-800/40 rounded-xl border border-gray-100 dark:border-gray-700/50 p-4">
                <span className="block text-xs font-medium text-gray-500 mb-2 uppercase tracking-wider">Kelembapan</span>
                <p className="text-xl font-bold text-gray-800 dark:text-gray-200">{prediksi.kelembapan}%</p>
                <div className="w-full h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full mt-2 overflow-hidden">
                  <div className="h-full bg-blue-400 rounded-full" style={{ width: `${prediksi.kelembapan}%` }} />
                </div>
              </div>

              {/* Tutupan Awan */}
              <div className="bg-gray-50 dark:bg-gray-800/40 rounded-xl border border-gray-100 dark:border-gray-700/50 p-4">
                <span className="block text-xs font-medium text-gray-500 mb-2 uppercase tracking-wider">Tutupan Awan</span>
                <p className="text-xl font-bold text-gray-800 dark:text-gray-200">{prediksi.cloud_cover}%</p>
                <div className="w-full h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full mt-2 overflow-hidden">
                  <div className="h-full bg-slate-400 rounded-full" style={{ width: `${prediksi.cloud_cover}%` }} />
                </div>
              </div>

              {/* Kecepatan & Arah Angin */}
              <div className="bg-gray-50 dark:bg-gray-800/40 rounded-xl border border-gray-100 dark:border-gray-700/50 p-4">
                <span className="block text-xs font-medium text-gray-500 mb-2 uppercase tracking-wider">Kecepatan Angin</span>
                <p className="text-xl font-bold text-gray-800 dark:text-gray-200">
                  {prediksi.kecepatan_angin} <span className="text-sm font-normal text-gray-500">km/j</span>
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  Arah: {arahAnginLabel[prediksi.arah_angin] ?? prediksi.arah_angin} ({prediksi.arah_angin})
                </p>
              </div>

              {/* Curah Hujan */}
              <div className="bg-gray-50 dark:bg-gray-800/40 rounded-xl border border-gray-100 dark:border-gray-700/50 p-4">
                <span className="block text-xs font-medium text-gray-500 mb-2 uppercase tracking-wider">Curah Hujan</span>
                <p className="text-xl font-bold text-gray-800 dark:text-gray-200">
                  {prediksi.curah_hujan.toFixed(1)} <span className="text-sm font-normal text-gray-500">mm</span>
                </p>
                <AdminBadge variant={hujan.variant} className="mt-2">{hujan.label}</AdminBadge>
              </div>

              {/* Visibilitas */}
              <div className="bg-gray-50 dark:bg-gray-800/40 rounded-xl border border-gray-100 dark:border-gray-700/50 p-4">
                <span className="block text-xs font-medium text-gray-500 mb-2 uppercase tracking-wider">Visibilitas</span>
                <p className="text-xl font-bold text-gray-800 dark:text-gray-200">{visKm}</p>
                <p className="text-xs text-slate-400 mt-1">Jarak pandang</p>
              </div>

              {/* Waktu Prakiraan */}
              <div className="bg-gray-50 dark:bg-gray-800/40 rounded-xl border border-gray-100 dark:border-gray-700/50 p-4">
                <span className="block text-xs font-medium text-gray-500 mb-2 uppercase tracking-wider">Waktu Prakiraan</span>
                <p className="text-sm font-bold text-gray-800 dark:text-gray-200">{prediksi.waktu_lokal.split(" ")[0]}</p>
                <p className="text-xs text-slate-400 mt-0.5">{prediksi.waktu_lokal.split(" ")[1]} WIB</p>
              </div>

            </div>
          </div>
        </div>

        {/* ── Sidebar — 1 kolom kanan ── */}
        <div className="space-y-6">

          {/* Informasi Prakiraan */}
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-white/[0.03]">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 border-b border-gray-100 dark:border-gray-800 pb-3">
              Informasi Prakiraan
            </h3>
            <div className="space-y-4">
              <div>
                <span className="block text-xs font-medium text-gray-500 mb-1">Kecamatan</span>
                <span className="inline-flex px-2.5 py-1 rounded-md text-sm font-medium bg-blue-50 text-blue-700 border border-blue-100 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-300">
                  {prediksi.kecamatan.nama}
                </span>
              </div>
              <div>
                <span className="block text-xs font-medium text-gray-500 mb-1">Kondisi Cuaca</span>
                <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                  {weatherIcon(prediksi.weather_code)} {prediksi.deskripsi_cuaca}
                </p>
              </div>
              <div>
                <span className="block text-xs font-medium text-gray-500 mb-1">Kode WMO</span>
                <p className="text-sm font-mono bg-gray-50 dark:bg-gray-800/40 px-2 py-1.5 rounded-lg border border-gray-100 dark:border-gray-700/50 text-gray-600 dark:text-gray-400">
                  {prediksi.weather_code}
                </p>
              </div>
              <div className="flex items-center gap-2 pt-1">
                <HiOutlineCalendarDays className="w-4 h-4 text-gray-400 shrink-0" />
                <div>
                  <span className="block text-xs font-medium text-gray-500">Waktu Prakiraan</span>
                  <p className="text-sm text-gray-800 dark:text-gray-200">{prediksi.waktu_lokal}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <HiOutlineCalendarDays className="w-4 h-4 text-gray-400 shrink-0" />
                <div>
                  <span className="block text-xs font-medium text-gray-500">Data Dibuat</span>
                  <p className="text-sm text-gray-800 dark:text-gray-200">{prediksi.dibuat_pada}</p>
                </div>
              </div>
              <div>
                <span className="block text-xs font-medium text-gray-500 mb-1">ID Data</span>
                <p className="text-xs text-gray-600 dark:text-gray-400 break-all font-mono bg-gray-50 dark:bg-gray-800/40 px-2 py-1.5 rounded-lg border border-gray-100 dark:border-gray-700/50">
                  {prediksi.id}
                </p>
              </div>
            </div>
          </div>

          {/* UV Index Visual — identik dengan detail cuaca realtime */}
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-white/[0.03]">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 border-b border-gray-100 dark:border-gray-800 pb-3 flex items-center gap-2">
              <HiOutlineEye className="w-5 h-5 text-yellow-500" />
              Indeks UV
            </h3>

            <div className="mb-3 flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">Level UV</span>
              <AdminBadge variant={uv.variant}>{uv.label}</AdminBadge>
            </div>

            {/* Progress bar */}
            <div className="w-full h-2.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden mb-2">
              <div
                className={`h-full rounded-full transition-all duration-700 ${uv.barColor}`}
                style={{ width: `${uv.pct}%` }}
              />
            </div>
            <div className="flex justify-between text-xs text-gray-400 mb-5">
              <span>Rendah</span>
              <span>Sedang</span>
              <span>Tinggi</span>
              <span>Ekstrem</span>
            </div>

            <div className={`p-4 rounded-xl border text-sm leading-relaxed ${
              uv.variant === "success" ? "bg-green-50 border-green-100 text-green-700 dark:bg-green-500/10 dark:border-green-500/20 dark:text-green-300" :
              uv.variant === "info" ? "bg-blue-50 border-blue-100 text-blue-700 dark:bg-blue-500/10 dark:border-blue-500/20 dark:text-blue-300" :
              uv.variant === "warning" ? "bg-yellow-50 border-yellow-100 text-yellow-700 dark:bg-yellow-500/10 dark:border-yellow-500/20 dark:text-yellow-300" :
              "bg-red-50 border-red-100 text-red-700 dark:bg-red-500/10 dark:border-red-500/20 dark:text-red-300"
            }`}>
              {uv.desc}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
