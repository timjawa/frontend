"use client";

import React, { useState, useEffect } from "react";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import AdminBadge from "@/components/admin/ui/AdminBadge";
import Link from "next/link";
import Image from "next/image";
import { useParams, useSearchParams } from "next/navigation";
import {
  HiOutlineArrowLeft,
  HiOutlineCloud,
  HiOutlineBeaker,
  HiOutlineSun,
  HiOutlineCalendarDays,
  HiArrowPath,
  HiOutlineMapPin,
  HiOutlineArrowTrendingUp,
} from "react-icons/hi2";

import { fetchWeatherForecast } from "@/services/weather";

function weatherIcon(code: number) {
  let iconFile = "berawan.svg";
  if (code === 0) iconFile = "cerah.svg";
  else if (code <= 2) iconFile = "cerah-berawan.svg";
  else if (code <= 3) iconFile = "berawan.svg";
  else if (code <= 49) iconFile = "berawan.svg";
  else if (code <= 57) iconFile = "hujan-ringan.svg";
  else if (code <= 67) iconFile = "hujan-sedang.svg";
  else if (code <= 77) iconFile = "hujan-lebat.svg";
  else if (code <= 82) iconFile = "hujan-lebat.svg";
  else iconFile = "hujan-petir.svg";
  return <Image src={`/icons/${iconFile}`} alt="Cuaca" width={32} height={32} className="w-8 h-8 object-contain" />;
}

function curahHujanLabel(mm: number): { variant: "success" | "warning" | "danger" | "info"; label: string } {
  if (mm === 0) return { variant: "success", label: "Tidak Hujan" };
  if (mm < 5) return { variant: "info", label: "Ringan" };
  if (mm < 20) return { variant: "warning", label: "Sedang" };
  return { variant: "danger", label: "Lebat" };
}

const arahAnginLabel: Record<string, string> = {
  N: "Utara", NE: "Timur Laut", E: "Timur", SE: "Tenggara",
  S: "Selatan", SW: "Barat Daya", W: "Barat", NW: "Barat Laut",
};

export default function PrediksiDetailPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const id = params.id as string;
  const filterDate = searchParams.get("date"); // YYYY-MM-DD

  const [loading, setLoading] = useState(true);
  const [kecamatanName, setKecamatanName] = useState("");
  const [predictions, setPredictions] = useState<any[]>([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const res = await fetchWeatherForecast();
        if (res && res.data) {
          const flat: any[] = [];
          let foundName = "";
          for (const key in res.data) {
            for (const item of res.data[key]) {
              const kId = item.kecamatan?.id || item.kecamatan_id;
              if (kId === id) {
                // If a date is provided in the query string, filter by that date
                if (filterDate && item.waktu_lokal) {
                  const d = new Date(item.waktu_lokal);
                  const itemDateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
                  if (itemDateStr === filterDate) {
                    flat.push(item);
                  }
                } else {
                  flat.push(item);
                }
                if (!foundName) foundName = item.kecamatan?.nama || key;
              }
            }
          }
          flat.sort((a, b) => new Date(a.waktu_lokal).getTime() - new Date(b.waktu_lokal).getTime());
          setPredictions(flat);
          setKecamatanName(foundName || "Kecamatan Tidak Diketahui");
        }
      } catch (error) {
        console.error("Gagal memuat detail prediksi:", error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [id, filterDate]);

  if (loading) {
    return (
      <div>
        {/* Page Header Skeleton */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div className="space-y-2 flex-1">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3 animate-pulse" />
            <div className="h-4 bg-gray-100 dark:bg-gray-800 rounded w-1/4 animate-pulse" />
          </div>
          <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-24 animate-pulse" />
        </div>

        {/* Stat Cards Skeleton */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="animate-pulse rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-white/[0.03] flex items-center gap-4">
              <div className="p-3 rounded-xl bg-gray-100 dark:bg-gray-800 w-12 h-12 shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded w-1/2" />
                <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
              </div>
            </div>
          ))}
        </div>

        {/* Main Content Skeleton */}
        <div className="rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-white/[0.03] overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 bg-slate-50/50 dark:bg-gray-800/50">
            <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-1/4 animate-pulse" />
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="bg-slate-50 dark:bg-gray-800 border-b border-slate-100 dark:border-gray-700">
                  <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-gray-400">Waktu</th>
                  <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-gray-400">Kondisi</th>
                  <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-gray-400">Suhu / Lembap</th>
                  <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-gray-400">Hujan / Awan</th>
                  <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-gray-400">Angin</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-gray-800">
                {[...Array(5)].map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-6 py-4">
                      <div className="space-y-2">
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20" />
                        <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded w-12" />
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-full" />
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24" />
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-2">
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-12" />
                        <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded w-16" />
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-2">
                        <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-16" />
                        <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded w-12" />
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-2">
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-16" />
                        <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded w-10" />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  if (predictions.length === 0) {
    return (
      <div>
        <div className="flex items-center justify-between mb-6">
          <PageBreadcrumb pageTitle="Detail Prediksi Cuaca" className="mb-0" />
          <Link href="/admin/cuaca/prediksi" className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
            <HiOutlineArrowLeft className="w-4 h-4" />
            Kembali
          </Link>
        </div>
        <div className="rounded-2xl border border-gray-200 bg-white p-12 text-center shadow-sm dark:border-gray-800 dark:bg-white/[0.03]">
          <HiOutlineMapPin className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Data Tidak Ditemukan</h3>
          <p className="text-slate-500 mt-1">Tidak ada data prediksi cuaca untuk kriteria ini.</p>
        </div>
      </div>
    );
  }

  // Summary stats
  const maxSuhu = Math.max(...predictions.map(p => p.suhu || 0));
  const minSuhu = Math.min(...predictions.map(p => p.suhu || 0));
  const totalHujan = predictions.reduce((acc, curr) => acc + (parseFloat(curr.curah_hujan) || 0), 0);
  const avgKelembapan = (predictions.reduce((acc, curr) => acc + (curr.kelembapan || 0), 0) / predictions.length).toFixed(0);
  const maxAngin = Math.max(...predictions.map(p => parseFloat(p.kecepatan_angin) || 0));

  let dateDisplay = "";
  if (filterDate) {
    const d = new Date(filterDate);
    dateDisplay = d.toLocaleDateString("id-ID", { weekday: "long", day: "2-digit", month: "long", year: "numeric" });
  }

  return (
    <div>
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <PageBreadcrumb pageTitle={`Prediksi: Kecamatan ${kecamatanName}`} className="mb-0" />
          {dateDisplay && <p className="text-sm text-slate-500 mt-1">{dateDisplay}</p>}
        </div>
        <Link
          href="/admin/cuaca/prediksi"
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors dark:bg-gray-800 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-700 w-fit"
        >
          <HiOutlineArrowLeft className="w-4 h-4" />
          Kembali
        </Link>
      </div>

      {/* Stat Cards Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {/* Suhu Maks */}
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-white/[0.03] flex items-center gap-4">
          <div className="p-3 rounded-xl bg-orange-50 dark:bg-orange-500/10 shrink-0">
            <HiOutlineSun className="w-6 h-6 text-orange-500" />
          </div>
          <div>
            <span className="block text-xs font-medium text-gray-500 mb-0.5">Suhu Maks / Min</span>
            <p className="text-xl font-bold text-gray-800 dark:text-white">{maxSuhu}° <span className="text-sm text-gray-400 font-normal">/ {minSuhu}°</span></p>
          </div>
        </div>

        {/* Curah Hujan Total */}
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-white/[0.03] flex items-center gap-4">
          <div className="p-3 rounded-xl bg-cyan-50 dark:bg-cyan-500/10 shrink-0">
            <HiOutlineCloud className="w-6 h-6 text-cyan-500" />
          </div>
          <div>
            <span className="block text-xs font-medium text-gray-500 mb-0.5">Curah Hujan Total</span>
            <p className="text-xl font-bold text-gray-800 dark:text-white">{totalHujan.toFixed(1)} <span className="text-sm text-gray-400 font-normal">mm</span></p>
          </div>
        </div>

        {/* Rata-rata Kelembapan */}
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-white/[0.03] flex items-center gap-4">
          <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-500/10 shrink-0">
            <HiOutlineBeaker className="w-6 h-6 text-blue-500" />
          </div>
          <div>
            <span className="block text-xs font-medium text-gray-500 mb-0.5">Avg Kelembapan</span>
            <p className="text-xl font-bold text-gray-800 dark:text-white">{avgKelembapan}%</p>
          </div>
        </div>

        {/* Angin Maksimum */}
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-white/[0.03] flex items-center gap-4">
          <div className="p-3 rounded-xl bg-purple-50 dark:bg-purple-500/10 shrink-0">
            <HiOutlineArrowTrendingUp className="w-6 h-6 text-purple-500" />
          </div>
          <div>
            <span className="block text-xs font-medium text-gray-500 mb-0.5">Angin Maksimum</span>
            <p className="text-xl font-bold text-gray-800 dark:text-white">{maxAngin.toFixed(1)} <span className="text-sm text-gray-400 font-normal">km/j</span></p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Konten Utama — Tabel Waktu per Waktu */}
        <div className="lg:col-span-4 space-y-6">
          <div className="rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-white/[0.03] overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-slate-50/50 dark:bg-gray-800/50">
              <h3 className="text-base font-bold text-gray-900 dark:text-white">
                Rincian Waktu Prakiraan
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="bg-slate-50 dark:bg-gray-800 border-b border-slate-100 dark:border-gray-700">
                    <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-gray-400">Waktu</th>
                    <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-gray-400">Kondisi</th>
                    <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-gray-400">Suhu / Lembap</th>
                    <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-gray-400">Hujan / Awan</th>
                    <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-gray-400">Angin</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-gray-800">
                  {predictions.map((p, idx) => {
                    const d = new Date(p.waktu_lokal);
                    const tgl = d.toLocaleDateString("id-ID", { weekday: 'short', day: '2-digit', month: 'short' });
                    const jam = d.toLocaleTimeString("id-ID", { hour: '2-digit', minute: '2-digit' }).replace('.', ':');
                    const hujanBadge = curahHujanLabel(parseFloat(p.curah_hujan) || 0);

                    return (
                      <tr key={p.id || idx} className="hover:bg-slate-50 dark:hover:bg-gray-800/50 transition-colors">
                        <td className="px-6 py-4">
                          {!filterDate && <p className="font-semibold text-gray-800 dark:text-gray-200">{tgl}</p>}
                          <p className={`text-sm ${filterDate ? 'font-semibold text-gray-800 dark:text-gray-200' : 'text-slate-500'}`}>{jam} WIB</p>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <span className="leading-none">{weatherIcon(p.weather_code)}</span>
                            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{p.deskripsi_cuaca}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <p className="font-bold text-gray-800 dark:text-white">{p.suhu}°C</p>
                          <p className="text-xs text-slate-500 mt-1">Lembap: {p.kelembapan}%</p>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col items-start gap-1">
                            <AdminBadge variant={hujanBadge.variant}>{parseFloat(p.curah_hujan || 0).toFixed(1)} mm</AdminBadge>
                            <p className="text-xs text-slate-500 mt-0.5">Awan: {p.cloud_cover}%</p>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">{p.kecepatan_angin} <span className="text-xs font-normal text-slate-500">km/j</span></p>
                          <p className="text-xs text-slate-500 mt-1">{arahAnginLabel[p.arah_angin] || p.arah_angin}</p>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
