"use client";

import React, { useState, useEffect } from "react";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import AdminBadge from "@/components/admin/ui/AdminBadge";
import Link from "next/link";
import Image from "next/image";
import {
  HiOutlineArrowLeft,
  HiOutlineCloud,
  HiOutlineBeaker,
  HiOutlineBolt,
  HiOutlineSun,
  HiOutlineEye,
  HiOutlineArrowTrendingUp,
} from "react-icons/hi2";
import { fetchRealtimeWeather } from "@/services/weather";

function getBmkgCode(weatherCode?: number): number {
  if (!weatherCode) return 1;
  if (weatherCode === 800) return 0;
  if (weatherCode === 801) return 1;
  if (weatherCode === 802 || weatherCode === 803) return 3;
  if (weatherCode === 804) return 4;
  if (weatherCode === 701 || weatherCode === 721 || weatherCode === 741) return 5;
  if ((weatherCode >= 300 && weatherCode <= 321) || weatherCode === 500 || weatherCode === 520) return 60;
  if (weatherCode === 501 || weatherCode === 521) return 61;
  if (weatherCode === 502 || weatherCode === 503 || weatherCode === 504) return 63;
  if (weatherCode >= 200 && weatherCode <= 232) return 95;
  return 1;
}

const bmkgCodeToIcon: Record<number, string> = {
  0:  "cerah.svg",
  1:  "cerah-berawan.svg",
  3:  "berawan.svg",
  4:  "berawan.svg",
  5:  "berawan.svg",
  60: "hujan-ringan.svg",
  61: "hujan-sedang.svg",
  63: "hujan-lebat.svg",
  95: "hujan-petir.svg",
};

const bmkgCodeToDesc: Record<number, string> = {
  0:  "Cerah",
  1:  "Cerah Berawan",
  3:  "Berawan",
  4:  "Berawan",
  5:  "Udara Kabur",
  60: "Hujan Ringan",
  61: "Hujan Sedang",
  63: "Hujan Lebat",
  95: "Hujan Petir",
};

function weatherIcon(weatherCode?: number) {
  const bmkgCode = getBmkgCode(weatherCode);
  const iconFile = bmkgCodeToIcon[bmkgCode] ?? "cerah-berawan.svg";
  return (
    <Image
      src={`/icons/${iconFile}`}
      alt="Cuaca"
      width={64}
      height={64}
      className="w-16 h-16 object-contain"
    />
  );
}

function arahAnginLabel(deg: number) {
  if (deg == null) return "-";
  const dirs = ["Utara", "Timur Laut", "Timur", "Tenggara", "Selatan", "Barat Daya", "Barat", "Barat Laut"];
  return dirs[Math.round(deg / 45) % 8];
}

function uvConfig(uv: number) {
  if (uv == null) return { label: "Tidak ada data", variant: "info" as const, bar: "w-0", barColor: "bg-gray-300", desc: "-" };
  if (uv <= 2) return { label: "Rendah", variant: "success" as const, bar: "w-1/5", barColor: "bg-green-500", desc: "Aman untuk aktivitas luar ruangan." };
  if (uv <= 5) return { label: "Sedang", variant: "info" as const, bar: "w-2/5", barColor: "bg-blue-500", desc: "Gunakan tabir surya saat beraktivitas." };
  if (uv <= 7) return { label: "Tinggi", variant: "warning" as const, bar: "w-3/5", barColor: "bg-yellow-500", desc: "Kurangi paparan sinar matahari langsung." };
  if (uv <= 10) return { label: "Sangat Tinggi", variant: "danger" as const, bar: "w-4/5", barColor: "bg-orange-500", desc: "Hindari paparan di jam 10.00–16.00." };
  return { label: "Ekstrem", variant: "danger" as const, bar: "w-full", barColor: "bg-red-600", desc: "Tetap di dalam ruangan!" };
}

function LoadingSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="flex items-center justify-between mb-6">
        <div className="h-8 w-48 bg-slate-200 dark:bg-gray-800 rounded-lg" />
        <div className="h-10 w-24 bg-slate-200 dark:bg-gray-800 rounded-lg" />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-white/[0.03] flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-slate-200 dark:bg-gray-800 shrink-0" />
            <div className="space-y-2 w-full">
              <div className="h-3 w-1/3 bg-slate-200 dark:bg-gray-800 rounded" />
              <div className="h-5 w-2/3 bg-slate-200 dark:bg-gray-800 rounded" />
              <div className="h-3 w-1/2 bg-slate-200 dark:bg-gray-800 rounded" />
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-white/[0.03] space-y-4">
            <div className="h-5 w-1/4 bg-slate-200 dark:bg-gray-800 rounded" />
            <div className="flex items-center gap-6 py-2">
              <div className="w-16 h-16 rounded-full bg-slate-200 dark:bg-gray-800" />
              <div className="space-y-2 w-1/2">
                <div className="h-8 w-1/3 bg-slate-200 dark:bg-gray-800 rounded" />
                <div className="h-4 w-1/2 bg-slate-200 dark:bg-gray-800 rounded" />
                <div className="h-3 w-2/3 bg-slate-200 dark:bg-gray-800 rounded" />
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-white/[0.03] space-y-4">
            <div className="h-5 w-1/4 bg-slate-200 dark:bg-gray-800 rounded" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="bg-gray-50 dark:bg-gray-800/40 rounded-xl border border-gray-100 dark:border-gray-700/50 p-4 space-y-2">
                  <div className="h-3 w-1/4 bg-slate-200 dark:bg-gray-800 rounded" />
                  <div className="h-6 w-1/2 bg-slate-200 dark:bg-gray-800 rounded" />
                  <div className="h-1.5 w-full bg-slate-200 dark:bg-gray-800 rounded-full mt-2" />
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-white/[0.03] space-y-4">
            <div className="h-5 w-1/3 bg-slate-200 dark:bg-gray-800 rounded" />
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="space-y-1">
                <div className="h-3 w-1/4 bg-slate-200 dark:bg-gray-800 rounded" />
                <div className="h-5 w-2/3 bg-slate-200 dark:bg-gray-800 rounded" />
              </div>
            ))}
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-white/[0.03] space-y-4">
            <div className="h-5 w-1/3 bg-slate-200 dark:bg-gray-800 rounded" />
            <div className="flex justify-between">
              <div className="h-4 w-1/4 bg-slate-200 dark:bg-gray-800 rounded" />
              <div className="h-4 w-1/4 bg-slate-200 dark:bg-gray-800 rounded" />
            </div>
            <div className="h-3 w-full bg-slate-200 dark:bg-gray-800 rounded-full" />
            <div className="h-16 w-full bg-slate-200 dark:bg-gray-800 rounded-xl" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CuacaDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = React.use(params);
  const { id } = resolvedParams;
  
  const [cuaca, setCuaca] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const res = await fetchRealtimeWeather();
        if (res && res.data) {
          const found = res.data.find((d: any) => d.id === id);
          setCuaca(found || null);
        }
      } catch (error) {
        console.error("Gagal mengambil data cuaca:", error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [id]);

  if (loading) {
    return <LoadingSkeleton />;
  }

  if (!cuaca) {
    return <div className="p-10 text-center text-slate-500">Data cuaca tidak ditemukan.</div>;
  }

  const showCurahHujan = cuaca.curah_hujan !== null && cuaca.curah_hujan !== undefined && Number(cuaca.curah_hujan) > 0;
  const showUV = cuaca.uv_index !== null && cuaca.uv_index !== undefined && Number(cuaca.uv_index) > 0;

  const uv = uvConfig(cuaca.uv_index);
  const visKm = cuaca.visibilitas >= 1000
    ? `${(cuaca.visibilitas / 1000).toFixed(0)} km`
    : `${cuaca.visibilitas ?? 0} m`;

  const deskripsiCuaca = bmkgCodeToDesc[getBmkgCode(cuaca.weather_code)] ?? cuaca.deskripsi ?? "-";

  let fetchedAtFormatted = "-";
  if (cuaca.fetched_at) {
    const dateObj = new Date(cuaca.fetched_at);
    fetchedAtFormatted = `${dateObj.toLocaleDateString("id-ID", { day: "2-digit", month: "long", year: "numeric" })} ${dateObj.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }).replace(".", ":")} WIB`;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <PageBreadcrumb pageTitle="Detail Cuaca Realtime" className="mb-0" />
        <div className="flex gap-3">
          <Link
            href="/admin/cuaca/realtime"
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 dark:bg-gray-950 dark:border-gray-800 dark:text-gray-400 dark:hover:bg-gray-900 dark:hover:text-white transition-colors"
          >
            <HiOutlineArrowLeft className="w-4 h-4" />
            Kembali
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-white/[0.03] flex items-center gap-4">
          <div className="p-3 rounded-xl bg-orange-50 dark:bg-orange-500/10 shrink-0">
            <HiOutlineSun className="w-6 h-6 text-orange-500" />
          </div>
          <div>
            <span className="block text-xs font-medium text-gray-500 mb-0.5">Suhu</span>
            <p className="text-xl font-bold text-gray-800 dark:text-white">{cuaca.suhu ?? "-"}°C</p>
            <p className="text-xs text-gray-400">Terasa {cuaca.feels_like ?? "-"}°C</p>
          </div>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-white/[0.03] flex items-center gap-4">
          <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-500/10 shrink-0">
            <HiOutlineBeaker className="w-6 h-6 text-blue-500" />
          </div>
          <div>
            <span className="block text-xs font-medium text-gray-500 mb-0.5">Kelembapan</span>
            <p className="text-xl font-bold text-gray-800 dark:text-white">{cuaca.kelembapan ?? "-"}%</p>
            <p className="text-xs text-gray-400">Relatif Humidity</p>
          </div>
        </div>

        {showCurahHujan ? (
          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-white/[0.03] flex items-center gap-4">
            <div className="p-3 rounded-xl bg-cyan-50 dark:bg-cyan-500/10 shrink-0">
              <HiOutlineCloud className="w-6 h-6 text-cyan-500" />
            </div>
            <div>
              <span className="block text-xs font-medium text-gray-500 mb-0.5">Curah Hujan</span>
              <p className="text-xl font-bold text-gray-800 dark:text-white">{Number(cuaca.curah_hujan).toFixed(1)}</p>
              <p className="text-xs text-gray-400">mm/jam</p>
            </div>
          </div>
        ) : (
          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-white/[0.03] flex items-center gap-4">
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-500/10 shrink-0">
              <HiOutlineCloud className="w-6 h-6 text-slate-500" />
            </div>
            <div>
              <span className="block text-xs font-medium text-gray-500 mb-0.5">Tutupan Awan</span>
              <p className="text-xl font-bold text-gray-800 dark:text-white">{cuaca.cloud_cover ?? "0"}%</p>
              <p className="text-xs text-gray-400">Cloud Cover</p>
            </div>
          </div>
        )}

        {showUV ? (
          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-white/[0.03] flex items-center gap-4">
            <div className="p-3 rounded-xl bg-yellow-50 dark:bg-yellow-500/10 shrink-0">
              <HiOutlineBolt className="w-6 h-6 text-yellow-500" />
            </div>
            <div>
              <span className="block text-xs font-medium text-gray-500 mb-0.5">UV Index</span>
              <p className="text-xl font-bold text-gray-800 dark:text-white">{Number(cuaca.uv_index).toFixed(1)}</p>
              <p className="text-xs text-gray-400">{uv.label}</p>
            </div>
          </div>
        ) : (
          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-white/[0.03] flex items-center gap-4">
            <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-500/10 shrink-0">
              <HiOutlineArrowTrendingUp className="w-6 h-6 text-blue-500" />
            </div>
            <div>
              <span className="block text-xs font-medium text-gray-500 mb-0.5">Kecepatan Angin</span>
              <p className="text-xl font-bold text-gray-800 dark:text-white">{cuaca.kecepatan_angin ?? "-"} m/s</p>
              <p className="text-xs text-gray-400">Arah: {arahAnginLabel(cuaca.arah_angin)}</p>
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-white/[0.03]">
            <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-4 border-b border-gray-100 dark:border-gray-800 pb-3">
              Kondisi Cuaca Saat Ini
            </h3>
            <div className="flex items-center gap-6 py-2">
              <span className="text-6xl flex-shrink-0">{weatherIcon(cuaca.weather_code)}</span>
              <div>
                <p className="text-4xl font-bold text-gray-800 dark:text-white">{cuaca.suhu ?? "-"}°C</p>
                <p className="text-base font-medium text-slate-500 mt-1 capitalize">{deskripsiCuaca}</p>
                <p className="text-sm text-slate-400 mt-0.5">Terasa seperti {cuaca.feels_like ?? "-"}°C</p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-white/[0.03]">
            <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-4 border-b border-gray-100 dark:border-gray-800 pb-3 flex items-center gap-2">
              <HiOutlineArrowTrendingUp className="w-5 h-5 text-blue-500" />
              Detail Metrik
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-gray-50 dark:bg-gray-800/40 rounded-xl border border-gray-100 dark:border-gray-700/50 p-4">
                <span className="block text-xs font-medium text-gray-500 mb-2 uppercase tracking-wider">Kelembapan</span>
                <p className="text-xl font-bold text-gray-800 dark:text-gray-200">{cuaca.kelembapan ?? "0"}%</p>
                <div className="w-full h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full mt-2 overflow-hidden">
                  <div className="h-full bg-blue-400 rounded-full" style={{ width: `${cuaca.kelembapan ?? 0}%` }} />
                </div>
              </div>
              <div className="bg-gray-50 dark:bg-gray-800/40 rounded-xl border border-gray-100 dark:border-gray-700/50 p-4">
                <span className="block text-xs font-medium text-gray-500 mb-2 uppercase tracking-wider">Tutupan Awan</span>
                <p className="text-xl font-bold text-gray-800 dark:text-gray-200">{cuaca.cloud_cover ?? "0"}%</p>
                <div className="w-full h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full mt-2 overflow-hidden">
                  <div className="h-full bg-slate-400 rounded-full" style={{ width: `${cuaca.cloud_cover ?? 0}%` }} />
                </div>
              </div>
              <div className="bg-gray-50 dark:bg-gray-800/40 rounded-xl border border-gray-100 dark:border-gray-700/50 p-4">
                <span className="block text-xs font-medium text-gray-500 mb-2 uppercase tracking-wider">Kecepatan Angin</span>
                <p className="text-xl font-bold text-gray-800 dark:text-gray-200">
                  {cuaca.kecepatan_angin ?? "-"} <span className="text-sm font-normal text-gray-500">m/s</span>
                </p>
                <p className="text-xs text-slate-400 mt-1">Arah: {arahAnginLabel(cuaca.arah_angin)} ({cuaca.arah_angin ?? 0}°)</p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-800/40 rounded-xl border border-gray-100 dark:border-gray-700/50 p-4">
                <span className="block text-xs font-medium text-gray-500 mb-2 uppercase tracking-wider">Tekanan Udara</span>
                <p className="text-xl font-bold text-gray-800 dark:text-gray-200">
                  {cuaca.tekanan_udara ?? "-"} <span className="text-sm font-normal text-gray-500">hPa</span>
                </p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-800/40 rounded-xl border border-gray-100 dark:border-gray-700/50 p-4">
                <span className="block text-xs font-medium text-gray-500 mb-2 uppercase tracking-wider">Visibilitas</span>
                <p className="text-xl font-bold text-gray-800 dark:text-gray-200">{visKm}</p>
                <p className="text-xs text-slate-400 mt-1">Jarak pandang</p>
              </div>
              {showCurahHujan && (
                <div className="bg-gray-50 dark:bg-gray-800/40 rounded-xl border border-gray-100 dark:border-gray-700/50 p-4">
                  <span className="block text-xs font-medium text-gray-500 mb-2 uppercase tracking-wider">Curah Hujan</span>
                  <p className="text-xl font-bold text-gray-800 dark:text-gray-200">
                    {Number(cuaca.curah_hujan).toFixed(1)} <span className="text-sm font-normal text-gray-500">mm/jam</span>
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

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
                  {cuaca.kecamatan?.nama ?? "-"}
                </span>
              </div>
              <div>
                <span className="block text-xs font-medium text-gray-500 mb-1">Kondisi</span>
                <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-2 capitalize">
                  {weatherIcon(cuaca.weather_code)} {deskripsiCuaca}
                </p>
              </div>
              <div>
                <span className="block text-xs font-medium text-gray-500 mb-1">Kode Cuaca</span>
                <p className="text-sm font-mono bg-gray-50 dark:bg-gray-800/40 px-2 py-1.5 rounded-lg border border-gray-100 dark:border-gray-700/50 text-gray-600 dark:text-gray-400">
                  {cuaca.weather_code ?? "-"}
                </p>
              </div>
              <div>
                <span className="block text-xs font-medium text-gray-500 mb-1">Terakhir Diperbarui</span>
                <p className="text-sm text-gray-800 dark:text-gray-200">{fetchedAtFormatted}</p>
              </div>
              <div>
                <span className="block text-xs font-medium text-gray-500 mb-1">ID Data</span>
                <p className="text-xs text-gray-600 dark:text-gray-400 break-all font-mono bg-gray-50 dark:bg-gray-800/40 px-2 py-1.5 rounded-lg border border-gray-100 dark:border-gray-700/50">
                  {cuaca.id}
                </p>
              </div>
            </div>
          </div>

          {/* UV Index Visual */}
          {showUV && (
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
          )}

        </div>
      </div>
    </div>
  );
}
