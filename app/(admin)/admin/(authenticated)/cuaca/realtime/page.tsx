"use client";

import { useState, useEffect } from "react";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import Image from "next/image";
import { 
  HiMagnifyingGlass, 
  HiArrowPath, 
  HiOutlineCloud, 
  HiOutlineBeaker, 
  HiOutlineSun,
  HiOutlineCheckCircle,
  HiOutlineXCircle,
} from "react-icons/hi2";
import CuacaTableAction from "./CuacaTableAction";

import { fetchRealtimeWeather, refreshRealtimeWeather } from "@/services/weather";

function weatherIcon(code: number) {
  let iconFile = "berawan.svg";

  if (code >= 200 && code <= 232) {
    iconFile = "hujan-petir.svg";
  } else if ((code >= 300 && code <= 321) || code === 500) {
    iconFile = "hujan-ringan.svg";
  } else if (code === 501 || code === 520 || code === 521) {
    iconFile = "hujan-sedang.svg";
  } else if (code >= 502 && code <= 531) {
    iconFile = "hujan-lebat.svg";
  } else if (code >= 600 && code <= 622) {
    iconFile = "hujan-lebat.svg"; // Fallback salju
  } else if (code >= 701 && code <= 781) {
    iconFile = "berawan.svg";
  } else if (code === 800) {
    iconFile = "cerah.svg";
  } else if (code === 801) {
    iconFile = "cerah-berawan.svg";
  } else if (code === 802 || code === 803 || code === 804) {
    iconFile = "berawan.svg";
  }

  return <Image src={`/icons/${iconFile}`} alt="Cuaca" width={28} height={28} className="w-7 h-7 object-contain" />;
}

export default function CuacaRealtimePage() {
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [cuacaData, setCuacaData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const showToast = (type: "success" | "error", message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  };

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await fetchRealtimeWeather();
      if (res && res.data) {
        setCuacaData(res.data);
      }
    } catch (error) {
      console.error("Gagal mengambil data:", error);
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
      const res = await refreshRealtimeWeather();
      if (res && res.data) {
        setCuacaData(res.data);
        showToast("success", "Data cuaca realtime berhasil diperbarui!");
      }
    } catch (error: any) {
      console.error("Gagal refresh data:", error);
      const msg = error?.response?.status === 401
        ? "Sesi login telah berakhir. Silakan login ulang."
        : "Gagal memperbarui data cuaca. Silakan coba lagi.";
      showToast("error", msg);
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  const filtered = cuacaData?.filter((d) =>
    (d.kecamatan?.nama?.toLowerCase() || "").includes(search.toLowerCase()) ||
    (d.deskripsi?.toLowerCase() || "").includes(search.toLowerCase())
  ) || [];

  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const paginatedData = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const validSuhu = cuacaData.filter((d) => d.suhu != null);
  const avgSuhu = validSuhu.length > 0 ? (validSuhu.reduce((s, d) => s + parseFloat(d.suhu), 0) / validSuhu.length).toFixed(1) : "0";
  const validAngin = cuacaData.filter((d) => d.kecepatan_angin != null);
  const avgAngin = validAngin.length > 0 ? (validAngin.reduce((s, d) => s + parseFloat(d.kecepatan_angin), 0) / validAngin.length).toFixed(1) : "0";
  const validKelembapan = cuacaData.filter((d) => d.kelembapan != null);
  const avgKelembapan = validKelembapan.length > 0 ? Math.round(validKelembapan.reduce((s, d) => s + parseInt(d.kelembapan), 0) / validKelembapan.length) : 0;
  
  const updateTimeRaw = cuacaData[0]?.fetched_at;
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
      <PageBreadcrumb pageTitle="Cuaca Realtime" />

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
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
          <div className="p-3 rounded-xl bg-cyan-50 dark:bg-cyan-500/10 shrink-0">
            <HiOutlineCloud className="w-5 h-5 text-cyan-500" />
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-0.5">Rata-rata Kelembapan</p>
            <p className="text-2xl font-bold text-gray-800 dark:text-white">{avgKelembapan}%</p>
          </div>
        </div>
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-white/[0.03] flex items-center gap-4">
          <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-500/10 shrink-0">
            <HiOutlineCloud className="w-5 h-5 text-blue-500" />
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-0.5">Rata-rata Kecepatan Angin</p>
            <p className="text-2xl font-bold text-gray-800 dark:text-white">
              {avgAngin} <span className="text-sm font-normal text-gray-400">m/s</span>
            </p>
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
                {loading ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-slate-400">
                      <div className="flex flex-col items-center justify-center space-y-3">
                        <HiArrowPath className="w-8 h-8 animate-spin text-slate-300" />
                        <p>Memuat data cuaca...</p>
                      </div>
                    </td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-slate-400">
                      <HiOutlineCloud className="w-10 h-10 mx-auto mb-2 text-slate-300" />
                      <p>Tidak ada data cuaca ditemukan.</p>
                    </td>
                  </tr>
                ) : (
                  paginatedData.map((row, index) => (
                    <tr key={row.id} className="hover:bg-blue-50/40 transition-colors">
                      <td className="px-6 py-4 text-center text-slate-500 font-medium">{index + 1 + (currentPage - 1) * itemsPerPage}</td>
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
                      <td className="px-6 py-4 text-slate-500 text-sm">
                        {row.fetched_at ? (() => {
                          const d = new Date(row.fetched_at);
                          const date = d.toLocaleDateString("id-ID", { day: "2-digit", month: "2-digit", year: "2-digit" });
                          const time = d.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }).replace(".", ":");
                          return `${date} ${time}`;
                        })() : "-"}
                      </td>
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
              Menampilkan <span className="font-semibold text-slate-700">{(currentPage - 1) * itemsPerPage + (paginatedData.length > 0 ? 1 : 0)}–{(currentPage - 1) * itemsPerPage + paginatedData.length}</span> dari{" "}
              <span className="font-semibold text-slate-700">{filtered.length}</span> data
            </p>
            <div className="flex items-center gap-1.5">
              <button 
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium border border-slate-200 bg-white transition-colors ${currentPage === 1 ? 'text-slate-400 cursor-not-allowed opacity-50' : 'text-slate-700 hover:bg-slate-50'}`}
              >
                ← Sebelumnya
              </button>
              
              <button className="w-9 h-9 rounded-lg text-sm font-semibold bg-[#1B2E4B] text-white shadow-md shadow-[#1B2E4B]/20">
                {currentPage}
              </button>
              
              <button 
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages || totalPages === 0}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium border border-slate-200 bg-white transition-colors ${currentPage === totalPages || totalPages === 0 ? 'text-slate-400 cursor-not-allowed opacity-50' : 'text-slate-700 hover:bg-slate-50'}`}
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
