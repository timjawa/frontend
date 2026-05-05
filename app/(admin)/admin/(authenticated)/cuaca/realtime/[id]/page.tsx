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
} from "react-icons/hi2";

interface CuacaDetailPageProps {
  params: { id: string };
}

export default function CuacaDetailPage({ params }: CuacaDetailPageProps) {
  // Mock data — kolom dari tabel cuaca_realtime + join kecamatan
  const cuaca = {
    id: params.id,
    kecamatan: { nama: "Gumukmas" },
    suhu: 28.5,
    feels_like: 31.2,
    kelembapan: 85,
    curah_hujan: 12.50,
    cloud_cover: 75,
    kecepatan_angin: 18.40,
    arah_angin: 225,
    weather_code: 61,
    deskripsi: "Hujan Ringan",
    uv_index: 3.50,
    visibilitas: 8000,
    tekanan_udara: 1010,
    fetched_at: "2024-05-04 14:00:00",
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

  function arahAnginLabel(deg: number) {
    const dirs = ["Utara", "Timur Laut", "Timur", "Tenggara", "Selatan", "Barat Daya", "Barat", "Barat Laut"];
    return dirs[Math.round(deg / 45) % 8];
  }

  function uvConfig(uv: number) {
    if (uv <= 2) return { label: "Rendah", variant: "success" as const, bar: "w-1/5", barColor: "bg-green-500", desc: "Aman untuk aktivitas luar ruangan." };
    if (uv <= 5) return { label: "Sedang", variant: "info" as const, bar: "w-2/5", barColor: "bg-blue-500", desc: "Gunakan tabir surya saat beraktivitas." };
    if (uv <= 7) return { label: "Tinggi", variant: "warning" as const, bar: "w-3/5", barColor: "bg-yellow-500", desc: "Kurangi paparan sinar matahari langsung." };
    if (uv <= 10) return { label: "Sangat Tinggi", variant: "danger" as const, bar: "w-4/5", barColor: "bg-orange-500", desc: "Hindari paparan di jam 10.00–16.00." };
    return { label: "Ekstrem", variant: "danger" as const, bar: "w-full", barColor: "bg-red-600", desc: "Tetap di dalam ruangan!" };
  }

  const uv = uvConfig(cuaca.uv_index);
  const visKm = cuaca.visibilitas >= 1000
    ? `${(cuaca.visibilitas / 1000).toFixed(0)} km`
    : `${cuaca.visibilitas} m`;

  return (
    <div>
      {/* Page Header — sama persis dengan kecamatan */}
      <div className="flex items-center justify-between mb-6">
        <PageBreadcrumb pageTitle="Detail Cuaca Realtime" />
        <div className="flex gap-3">
          <Link
            href="/admin/cuaca/realtime"
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
            <span className="block text-xs font-medium text-gray-500 mb-0.5">Suhu</span>
            <p className="text-xl font-bold text-gray-800 dark:text-white">{cuaca.suhu}°C</p>
            <p className="text-xs text-gray-400">Terasa {cuaca.feels_like}°C</p>
          </div>
        </div>

        {/* Kelembapan */}
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-white/[0.03] flex items-center gap-4">
          <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-500/10 shrink-0">
            <HiOutlineBeaker className="w-6 h-6 text-blue-500" />
          </div>
          <div>
            <span className="block text-xs font-medium text-gray-500 mb-0.5">Kelembapan</span>
            <p className="text-xl font-bold text-gray-800 dark:text-white">{cuaca.kelembapan}%</p>
            <p className="text-xs text-gray-400">Relatif Humidity</p>
          </div>
        </div>

        {/* Curah Hujan */}
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-white/[0.03] flex items-center gap-4">
          <div className="p-3 rounded-xl bg-cyan-50 dark:bg-cyan-500/10 shrink-0">
            <HiOutlineCloud className="w-6 h-6 text-cyan-500" />
          </div>
          <div>
            <span className="block text-xs font-medium text-gray-500 mb-0.5">Curah Hujan</span>
            <p className="text-xl font-bold text-gray-800 dark:text-white">{cuaca.curah_hujan.toFixed(1)}</p>
            <p className="text-xs text-gray-400">mm/jam</p>
          </div>
        </div>

        {/* UV Index */}
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-white/[0.03] flex items-center gap-4">
          <div className="p-3 rounded-xl bg-yellow-50 dark:bg-yellow-500/10 shrink-0">
            <HiOutlineBolt className="w-6 h-6 text-yellow-500" />
          </div>
          <div>
            <span className="block text-xs font-medium text-gray-500 mb-0.5">UV Index</span>
            <p className="text-xl font-bold text-gray-800 dark:text-white">{cuaca.uv_index.toFixed(1)}</p>
            <p className="text-xs text-gray-400">{uv.label}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Konten Utama — 2 kolom kiri */}
        <div className="lg:col-span-2 space-y-6">

          {/* Kondisi Utama */}
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-white/[0.03]">
            <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-4 border-b border-gray-100 dark:border-gray-800 pb-3">
              Kondisi Cuaca Saat Ini
            </h3>
            <div className="flex items-center gap-6 py-2">
              <span className="text-6xl leading-none">{weatherIcon(cuaca.weather_code)}</span>
              <div>
                <p className="text-4xl font-bold text-gray-800 dark:text-white">{cuaca.suhu}°C</p>
                <p className="text-base font-medium text-slate-500 mt-1">{cuaca.deskripsi}</p>
                <p className="text-sm text-slate-400 mt-0.5">Terasa seperti {cuaca.feels_like}°C</p>
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
                <p className="text-xl font-bold text-gray-800 dark:text-gray-200">{cuaca.kelembapan}%</p>
                <div className="w-full h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full mt-2 overflow-hidden">
                  <div className="h-full bg-blue-400 rounded-full" style={{ width: `${cuaca.kelembapan}%` }} />
                </div>
              </div>

              {/* Tutupan Awan */}
              <div className="bg-gray-50 dark:bg-gray-800/40 rounded-xl border border-gray-100 dark:border-gray-700/50 p-4">
                <span className="block text-xs font-medium text-gray-500 mb-2 uppercase tracking-wider">Tutupan Awan</span>
                <p className="text-xl font-bold text-gray-800 dark:text-gray-200">{cuaca.cloud_cover}%</p>
                <div className="w-full h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full mt-2 overflow-hidden">
                  <div className="h-full bg-slate-400 rounded-full" style={{ width: `${cuaca.cloud_cover}%` }} />
                </div>
              </div>

              {/* Kecepatan Angin */}
              <div className="bg-gray-50 dark:bg-gray-800/40 rounded-xl border border-gray-100 dark:border-gray-700/50 p-4">
                <span className="block text-xs font-medium text-gray-500 mb-2 uppercase tracking-wider">Kecepatan Angin</span>
                <p className="text-xl font-bold text-gray-800 dark:text-gray-200">
                  {cuaca.kecepatan_angin} <span className="text-sm font-normal text-gray-500">km/j</span>
                </p>
                <p className="text-xs text-slate-400 mt-1">Arah: {arahAnginLabel(cuaca.arah_angin)} ({cuaca.arah_angin}°)</p>
              </div>

              {/* Tekanan Udara */}
              <div className="bg-gray-50 dark:bg-gray-800/40 rounded-xl border border-gray-100 dark:border-gray-700/50 p-4">
                <span className="block text-xs font-medium text-gray-500 mb-2 uppercase tracking-wider">Tekanan Udara</span>
                <p className="text-xl font-bold text-gray-800 dark:text-gray-200">
                  {cuaca.tekanan_udara} <span className="text-sm font-normal text-gray-500">hPa</span>
                </p>
              </div>

              {/* Visibilitas */}
              <div className="bg-gray-50 dark:bg-gray-800/40 rounded-xl border border-gray-100 dark:border-gray-700/50 p-4">
                <span className="block text-xs font-medium text-gray-500 mb-2 uppercase tracking-wider">Visibilitas</span>
                <p className="text-xl font-bold text-gray-800 dark:text-gray-200">{visKm}</p>
                <p className="text-xs text-slate-400 mt-1">Jarak pandang</p>
              </div>

              {/* Curah Hujan */}
              <div className="bg-gray-50 dark:bg-gray-800/40 rounded-xl border border-gray-100 dark:border-gray-700/50 p-4">
                <span className="block text-xs font-medium text-gray-500 mb-2 uppercase tracking-wider">Curah Hujan</span>
                <p className="text-xl font-bold text-gray-800 dark:text-gray-200">
                  {cuaca.curah_hujan.toFixed(1)} <span className="text-sm font-normal text-gray-500">mm/jam</span>
                </p>
              </div>

            </div>
          </div>
        </div>

        {/* Sidebar — 1 kolom kanan */}
        <div className="space-y-6">

          {/* Informasi Cuaca */}
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-white/[0.03]">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 border-b border-gray-100 dark:border-gray-800 pb-3">
              Informasi Cuaca
            </h3>
            <div className="space-y-4">
              <div>
                <span className="block text-xs font-medium text-gray-500 mb-1">Kecamatan</span>
                <span className="inline-flex px-2.5 py-1 rounded-md text-sm font-medium bg-blue-50 text-blue-700 border border-blue-100 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-300">
                  {cuaca.kecamatan.nama}
                </span>
              </div>
              <div>
                <span className="block text-xs font-medium text-gray-500 mb-1">Kondisi</span>
                <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                  {weatherIcon(cuaca.weather_code)} {cuaca.deskripsi}
                </p>
              </div>
              <div>
                <span className="block text-xs font-medium text-gray-500 mb-1">Kode Cuaca (WMO)</span>
                <p className="text-sm font-mono bg-gray-50 dark:bg-gray-800/40 px-2 py-1.5 rounded-lg border border-gray-100 dark:border-gray-700/50 text-gray-600 dark:text-gray-400">
                  {cuaca.weather_code}
                </p>
              </div>
              <div>
                <span className="block text-xs font-medium text-gray-500 mb-1">Terakhir Diperbarui</span>
                <p className="text-sm text-gray-800 dark:text-gray-200">{cuaca.fetched_at}</p>
              </div>
              <div>
                <span className="block text-xs font-medium text-gray-500 mb-1">ID Data</span>
                <p className="text-xs text-gray-600 dark:text-gray-400 break-all font-mono bg-gray-50 dark:bg-gray-800/40 px-2 py-1.5 rounded-lg border border-gray-100 dark:border-gray-700/50">
                  {cuaca.id}
                </p>
              </div>
            </div>
          </div>

          {/* UV Index Visual — seperti "Tingkat Kerawanan" di kecamatan */}
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
              <div className={`h-full rounded-full transition-all duration-700 ${uv.barColor} ${uv.bar}`} />
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
