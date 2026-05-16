"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
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
  HiOutlineCheckCircle,
  HiOutlineXCircle,
} from "react-icons/hi2";

import { fetchWeatherForecast, refreshForecastWeather } from "@/services/weather";

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

  return <Image src={`/icons/${iconFile}`} alt="Cuaca" width={28} height={28} className="w-7 h-7 object-contain" />;
}

function curahHujanBadge(mm: number): { variant: "success" | "warning" | "danger" | "info"; label: string } {
  if (mm === 0) return { variant: "success", label: "Tidak Hujan" };
  if (mm < 5) return { variant: "info", label: "Ringan" };
  if (mm < 20) return { variant: "warning", label: "Sedang" };
  return { variant: "danger", label: "Lebat" };
}

export default function PrediksiCuacaPage() {
  const [search, setSearch] = useState("");
  const [searchBy, setSearchBy] = useState("kecamatan");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [prediksiData, setPrediksiData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const showToast = (type: "success" | "error", message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  };

  // Flatten grouped data from backend (keyed by kecamatan name) into a flat array
  const flattenGroupedData = (grouped: Record<string, any[]>): any[] => {
    const flat: any[] = [];
    for (const kecamatan in grouped) {
      for (const item of grouped[kecamatan]) {
        flat.push(item);
      }
    }
    return flat;
  };

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await fetchWeatherForecast();
      if (res && res.data) {
        setPrediksiData(flattenGroupedData(res.data));
      }
    } catch (error) {
      console.error("Gagal mengambil data prakiraan:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleRefresh = async () => {
    try {
      setRefreshing(true);
      const res = await refreshForecastWeather();
      if (res && res.data) {
        // refreshForecast returns flat array (not grouped)
        if (Array.isArray(res.data)) {
          setPrediksiData(res.data);
        } else {
          setPrediksiData(flattenGroupedData(res.data));
        }
        showToast("success", "Data prakiraan cuaca berhasil diperbarui dari BMKG!");
      }
    } catch (error: any) {
      console.error("Gagal refresh data prakiraan:", error);
      const msg = error?.response?.status === 401
        ? "Sesi login telah berakhir. Silakan login ulang."
        : "Gagal memperbarui data prakiraan. Silakan coba lagi.";
      showToast("error", msg);
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  const filtered = prediksiData.filter((d) => {
    if (searchBy === "kecamatan") {
      const nama = d.kecamatan?.nama || "";
      const deskripsi = d.deskripsi_cuaca || "";
      return nama.toLowerCase().includes(search.toLowerCase()) ||
             deskripsi.toLowerCase().includes(search.toLowerCase());
    } else {
      const waktuLokal = d.waktu_lokal || "";
      let waktuStr = "";
      if (waktuLokal) {
        const dateObj = new Date(waktuLokal);
        waktuStr = `${dateObj.toLocaleDateString("id-ID", { day: "2-digit", month: "2-digit", year: "2-digit" })} ${dateObj.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }).replace(".", ":")}`;
      }
      return waktuStr.includes(search);
    }
  });

  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const paginatedData = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  // Stat summary
  const totalPrediksi = prediksiData.length;
  const validCurahHujan = prediksiData.filter((d) => d.curah_hujan != null);
  const maxCurahHujan = validCurahHujan.length > 0 ? Math.max(...validCurahHujan.map((d) => parseFloat(d.curah_hujan))) : 0;
  const validSuhu = prediksiData.filter((d) => d.suhu != null);
  const avgSuhu = validSuhu.length > 0 ? (validSuhu.reduce((s, d) => s + parseFloat(d.suhu), 0) / validSuhu.length).toFixed(1) : "0";
  const validUV = prediksiData.filter((d) => d.uv_index != null);
  const maxUV = validUV.length > 0 ? Math.max(...validUV.map((d) => parseFloat(d.uv_index))) : 0;

  // Last updated time
  const updateTimeRaw = prediksiData[0]?.dibuat_pada;
  let updateDateStr = "-";
  let updateTimeStr = "-";

  if (updateTimeRaw) {
    const dateObj = new Date(updateTimeRaw);
    updateDateStr = dateObj.toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" });
    updateTimeStr = dateObj.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }).replace(".", ":");
  }

  return (
    <div>
      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 animate-slide-in">
          <div className={`flex items-center gap-3 px-5 py-3.5 rounded-xl shadow-lg border backdrop-blur-sm min-w-[320px] max-w-[440px] ${
            toast.type === "success"
              ? "bg-emerald-50/95 border-emerald-200 text-emerald-800"
              : "bg-red-50/95 border-red-200 text-red-800"
          }`}>
            <span className="shrink-0 text-current">
              {toast.type === "success" ? <HiOutlineCheckCircle className="w-6 h-6" /> : <HiOutlineXCircle className="w-6 h-6" />}
            </span>
            <p className="text-sm font-medium flex-1">{toast.message}</p>
            <button onClick={() => setToast(null)} className="text-current opacity-50 hover:opacity-100 transition-opacity shrink-0 ml-2">
              ✕
            </button>
          </div>
        </div>
      )}
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
            <p className="text-xs text-gray-500 mb-0.5">Terakhir Diperbarui</p>
            <p className="text-sm font-bold text-gray-800 dark:text-white leading-tight">
              {updateDateStr}
            </p>
            <p className="text-xs text-gray-400 mt-0.5">{updateTimeStr} WIB</p>
          </div>
        </div>
      </div>

      {/* Table Card */}
      <div className="min-h-screen rounded-2xl border border-gray-200 bg-white px-5 py-3 dark:border-gray-800 dark:bg-white/[0.03] xl:px-10 xl:py-8">
        <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm rounded-2xl ring-1 ring-slate-100 dark:ring-gray-800 shadow-sm overflow-hidden">

          {/* Header Bar */}
          <div className="px-6 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-100 dark:border-gray-800">
            <div>
              <h3 className="text-base font-bold text-[#1B2E4B] dark:text-white">Data Prediksi Cuaca</h3>
              <p className="text-xs text-slate-400 dark:text-gray-400 mt-0.5">Prakiraan cuaca per kecamatan berdasarkan data BMKG</p>
            </div>
            <div className="flex items-center gap-2.5 flex-wrap">
              {/* Search */}
              <div className="flex items-center gap-2">
                <select 
                  value={searchBy}
                  onChange={(e) => setSearchBy(e.target.value)}
                  className="py-2 pl-3 pr-8 text-sm rounded-lg bg-slate-50 border border-slate-200 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none transition-all cursor-pointer"
                >
                  <option value="kecamatan">Kecamatan</option>
                  <option value="tanggal">Tanggal</option>
                </select>
                <div className="relative">
                  <HiMagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-gray-400" />
                  <input
                    type="text"
                    placeholder={searchBy === "kecamatan" ? "Cari kecamatan / kondisi..." : "Cari tanggal..."}
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-9 pr-4 py-2 text-sm rounded-lg bg-slate-50 border border-slate-200 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900/50 outline-none transition-all w-52"
                  />
                </div>
              </div>
              <button
                onClick={handleRefresh}
                disabled={refreshing || loading}
                className={`inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white rounded-lg shadow-sm whitespace-nowrap transition-all 
                ${refreshing || loading ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 active:scale-95 shadow-blue-200 dark:shadow-none'}`}
              >
                <HiArrowPath className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                {refreshing ? 'Memperbarui...' : 'Refresh Data'}
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="bg-slate-50/80 dark:bg-gray-800/80 border-b border-slate-100 dark:border-gray-700">
                  <th className="px-6 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-gray-400 w-12 text-center">No</th>
                  <th className="px-6 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-gray-400">Kecamatan</th>
                  <th className="px-6 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-gray-400">Waktu Prakiraan</th>
                  <th className="px-6 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-gray-400">Kondisi</th>
                  <th className="px-6 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-gray-400">Suhu</th>
                  <th className="px-6 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-gray-400">Kelembapan</th>
                  <th className="px-6 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-gray-400">Curah Hujan</th>
                  <th className="px-6 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-gray-400">Angin</th>
                  <th className="px-6 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-gray-400 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-gray-800">
                {loading ? (
                  <tr>
                    <td colSpan={9} className="px-6 py-12 text-center text-slate-400">
                      <div className="flex flex-col items-center justify-center space-y-3">
                        <HiArrowPath className="w-8 h-8 animate-spin text-slate-300" />
                        <p>Memuat data prakiraan cuaca...</p>
                      </div>
                    </td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="px-6 py-12 text-center text-slate-400">
                      <HiOutlineCloud className="w-10 h-10 mx-auto mb-2 text-slate-300" />
                      <p>Tidak ada data prakiraan ditemukan.</p>
                    </td>
                  </tr>
                ) : (
                  paginatedData.map((row, index) => {
                    const hujan = curahHujanBadge(parseFloat(row.curah_hujan) || 0);
                    const waktuLokal = row.waktu_lokal || "";
                    let waktuDate = "";
                    let waktuTime = "";
                    if (waktuLokal) {
                      const d = new Date(waktuLokal);
                      waktuDate = d.toLocaleDateString("id-ID", { day: "2-digit", month: "2-digit", year: "2-digit" });
                      waktuTime = d.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }).replace(".", ":");
                    }
                    return (
                      <tr key={row.id} className="hover:bg-blue-50/40 dark:hover:bg-blue-900/20 transition-colors">
                        {/* No */}
                        <td className="px-6 py-4 text-center text-slate-500 font-medium">{index + 1 + (currentPage - 1) * itemsPerPage}</td>

                        {/* Kecamatan */}
                        <td className="px-6 py-4 font-semibold text-[#1B2E4B] dark:text-white">
                          {row.kecamatan?.nama || "-"}
                        </td>

                        {/* Waktu Prakiraan */}
                        <td className="px-6 py-4">
                          <p className="text-sm font-medium text-gray-800 dark:text-gray-200 whitespace-nowrap">
                            {waktuDate}
                          </p>
                          <p className="text-xs text-slate-400">{waktuTime} WIB</p>
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
                              {parseFloat(row.curah_hujan || 0).toFixed(1)} <span className="text-xs font-normal text-gray-400">mm</span>
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
          <div className="px-6 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-t border-slate-100 dark:border-gray-800 bg-slate-50/50 dark:bg-gray-800/50">
            <p className="text-sm text-slate-500 dark:text-gray-400">
              Menampilkan <span className="font-semibold text-slate-700 dark:text-gray-300">{(currentPage - 1) * itemsPerPage + (paginatedData.length > 0 ? 1 : 0)}–{(currentPage - 1) * itemsPerPage + paginatedData.length}</span> dari{" "}
              <span className="font-semibold text-slate-700 dark:text-gray-300">{filtered.length}</span> prakiraan
            </p>
            <div className="flex items-center gap-1.5">
              <button 
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium border border-slate-200 dark:border-gray-700 bg-white dark:bg-gray-800 transition-colors ${currentPage === 1 ? 'text-slate-400 dark:text-gray-500 cursor-not-allowed opacity-50' : 'text-slate-700 dark:text-gray-300 hover:bg-slate-50 dark:hover:bg-gray-700'}`}
              >
                ← Sebelumnya
              </button>
              
              <button className="w-9 h-9 rounded-lg text-sm font-semibold bg-[#1B2E4B] text-white shadow-md shadow-[#1B2E4B]/20">
                {currentPage}
              </button>
              
              <button 
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages || totalPages === 0}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium border border-slate-200 dark:border-gray-700 bg-white dark:bg-gray-800 transition-colors ${currentPage === totalPages || totalPages === 0 ? 'text-slate-400 dark:text-gray-500 cursor-not-allowed opacity-50' : 'text-slate-700 dark:text-gray-300 hover:bg-slate-50 dark:hover:bg-gray-700'}`}
              >
                Selanjutnya →
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
