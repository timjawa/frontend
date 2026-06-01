"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import AdminBadge from "@/components/admin/ui/AdminBadge";
import {
  HiMagnifyingGlass,
  HiArrowPath,
  HiOutlineCloud,
  HiOutlineCalendarDays,
  HiOutlineBeaker,
  HiOutlineSun,
  HiOutlineCheckCircle,
  HiOutlineXCircle,
  HiChevronDown,
  HiXMark,
  HiOutlineEye,
  HiOutlineMapPin,
} from "react-icons/hi2";

import { fetchWeatherForecast, refreshForecastWeather } from "@/services/weather";
import PrediksiTableAction from "./PrediksiTableAction";

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

function curahHujanBadge(mm: number) {
  if (mm === 0) return { variant: "success" as const, label: "Tidak Hujan" };
  if (mm < 5) return { variant: "info" as const, label: "Ringan" };
  if (mm < 20) return { variant: "warning" as const, label: "Sedang" };
  return { variant: "danger" as const, label: "Lebat" };
}

interface DailyRow {
  kecamatan_id: string;
  kecamatan_nama: string;
  dateStr: string; // YYYY-MM-DD
  suhu_min: number;
  suhu_max: number;
  curah_hujan_total: number;
  weather_code: number;
  deskripsi_cuaca: string;
  jumlah_prediksi: number;
}

export default function PrediksiCuacaPage() {
  const [selectedKecamatan, setSelectedKecamatan] = useState("");
  const [kecamatanSearchInput, setKecamatanSearchInput] = useState("");
  const [isKecamatanOpen, setIsKecamatanOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const getLocalDateString = (offsetDays = 0) => {
    const d = new Date();
    d.setDate(d.getDate() + offsetDays);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  };
  
  const [allData, setAllData] = useState<any[]>([]);
  const [rows, setRows] = useState<DailyRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsKecamatanOpen(false);
        setKecamatanSearchInput(selectedKecamatan);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [selectedKecamatan]);

  const showToast = (type: "success" | "error", message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  };

  const buildRows = (grouped: Record<string, any[]>) => {
    const flat: any[] = [];
    for (const kecamatan in grouped) {
      for (const item of grouped[kecamatan]) {
        flat.push(item);
      }
    }

    // Group by kecamatan + day
    const dayGroups = new Map<string, any[]>();
    for (const item of flat) {
      if (!item.waktu_lokal) continue;
      const d = new Date(item.waktu_lokal);
      const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      const kecId = item.kecamatan?.id || item.kecamatan_id || "";
      const kecNama = item.kecamatan?.nama || "Unknown";
      
      const key = `${kecId}|${kecNama}|${dateStr}`;
      if (!dayGroups.has(key)) {
        dayGroups.set(key, []);
      }
      dayGroups.get(key)!.push(item);
    }

    const summaries: DailyRow[] = [];
    dayGroups.forEach((items, key) => {
      const [kecId, kecNama, dateStr] = key.split("|");
      
      // Pilih cuaca representatif (mendekati siang hari misal jam 12-14)
      const representative = items.reduce((prev: any, curr: any) => {
        const dPrev = new Date(prev.waktu_lokal).getHours();
        const dCurr = new Date(curr.waktu_lokal).getHours();
        const diffPrev = Math.abs(dPrev - 13);
        const diffCurr = Math.abs(dCurr - 13);
        return diffCurr < diffPrev ? curr : prev;
      }, items[0]);

      const suhus = items.map((d: any) => parseFloat(d.suhu) || 0).filter((s) => s > 0);
      const minT = suhus.length > 0 ? Math.min(...suhus) : 0;
      const maxT = suhus.length > 0 ? Math.max(...suhus) : 0;
      
      // Curah hujan akumulatif per hari
      const totalHujan = items.reduce((acc, curr) => acc + (parseFloat(curr.curah_hujan) || 0), 0);

      summaries.push({
        kecamatan_id: kecId,
        kecamatan_nama: kecNama,
        dateStr: dateStr,
        suhu_min: minT,
        suhu_max: maxT,
        curah_hujan_total: totalHujan,
        weather_code: representative.weather_code,
        deskripsi_cuaca: representative.deskripsi_cuaca,
        jumlah_prediksi: items.length,
      });
    });

    // Urutkan berdasarkan tanggal lalu kecamatan
    summaries.sort((a, b) => {
      if (a.dateStr === b.dateStr) return a.kecamatan_nama.localeCompare(b.kecamatan_nama);
      return a.dateStr.localeCompare(b.dateStr);
    });

    return { flat, summaries };
  };

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await fetchWeatherForecast();
      if (res && res.data) {
        const { flat, summaries } = buildRows(res.data);
        setAllData(flat);
        setRows(summaries);
      }
    } catch (error) {
      console.error("Gagal mengambil data prakiraan:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const handleRefresh = async () => {
    try {
      setRefreshing(true);
      const res = await refreshForecastWeather();
      if (res && res.data) {
        let grouped: Record<string, any[]>;
        if (Array.isArray(res.data)) {
          grouped = {};
          for (const item of res.data) {
            const nama = item.kecamatan?.nama || "Unknown";
            if (!grouped[nama]) grouped[nama] = [];
            grouped[nama].push(item);
          }
        } else {
          grouped = res.data;
        }
        const { flat, summaries } = buildRows(grouped);
        setAllData(flat);
        setRows(summaries);
        showToast("success", "Data prakiraan cuaca berhasil diperbarui dari BMKG!");
      }
    } catch (error: any) {
      const msg = error?.response?.status === 401
        ? "Sesi login telah berakhir. Silakan login ulang."
        : "Gagal memperbarui data prakiraan. Silakan coba lagi.";
      showToast("error", msg);
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => { setCurrentPage(1); }, [selectedKecamatan, selectedDate]);

  // Extract unique list of kecamatan names from summaries
  const uniqueKecamatans = Array.from(new Set(rows.map(r => r.kecamatan_nama))).sort();
  const filteredKecamatans = uniqueKecamatans.filter((n) =>
    n.toLowerCase().includes(kecamatanSearchInput.toLowerCase())
  );

  const filtered = rows.filter((s) => {
    if (selectedKecamatan && s.kecamatan_nama.toLowerCase() !== selectedKecamatan.toLowerCase()) return false;
    if (selectedDate && s.dateStr !== selectedDate) return false;
    return true;
  });

  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const paginatedData = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const getPageNumbers = () => {
    const delta = 2;
    const range: number[] = [];
    const rangeWithDots: (number | string)[] = [];
    let l: number | undefined;
    for (let i = 1; i <= totalPages; i++) {
      if (i === 1 || i === totalPages || (i >= currentPage - delta && i <= currentPage + delta)) range.push(i);
    }
    for (const i of range) {
      if (l !== undefined) {
        if (i - l === 2) rangeWithDots.push(l + 1);
        else if (i - l > 2) rangeWithDots.push("...");
      }
      rangeWithDots.push(i);
      l = i;
    }
    return rangeWithDots;
  };

  // Stats
  const validCH = allData.filter((d) => d.curah_hujan != null);
  const maxCH = validCH.length > 0 ? Math.max(...validCH.map((d: any) => parseFloat(d.curah_hujan))) : 0;
  const validSuhu = allData.filter((d) => d.suhu != null);
  const avgSuhu = validSuhu.length > 0 ? (validSuhu.reduce((s: number, d: any) => s + parseFloat(d.suhu), 0) / validSuhu.length).toFixed(1) : "0";
  const updateTimeRaw = allData[0]?.dibuat_pada;
  let updateDateStr = "-";
  let updateTimeStr = "-";
  if (updateTimeRaw) {
    const d = new Date(updateTimeRaw);
    updateDateStr = d.toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" });
    updateTimeStr = d.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }).replace(".", ":");
  }

  return (
    <div>
      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 animate-slide-in">
          <div className={`flex items-center gap-3 px-5 py-3.5 rounded-xl shadow-lg border backdrop-blur-sm min-w-[320px] max-w-[440px] ${
            toast.type === "success" ? "bg-emerald-50/95 border-emerald-200 text-emerald-800" : "bg-red-50/95 border-red-200 text-red-800"
          }`}>
            <span className="shrink-0 text-current">
              {toast.type === "success" ? <HiOutlineCheckCircle className="w-6 h-6" /> : <HiOutlineXCircle className="w-6 h-6" />}
            </span>
            <p className="text-sm font-medium flex-1">{toast.message}</p>
            <button onClick={() => setToast(null)} className="text-current opacity-50 hover:opacity-100 transition-opacity shrink-0 ml-2">✕</button>
          </div>
        </div>
      )}

      <PageBreadcrumb pageTitle="Prediksi Cuaca" />

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-white/[0.03] flex items-center gap-4">
          <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-500/10 shrink-0"><HiOutlineMapPin className="w-5 h-5 text-blue-500" /></div>
          <div>
            <p className="text-xs text-gray-500 mb-0.5">Total Kecamatan</p>
            <p className="text-2xl font-bold text-gray-800 dark:text-white">{uniqueKecamatans.length}</p>
          </div>
        </div>
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-white/[0.03] flex items-center gap-4">
          <div className="p-3 rounded-xl bg-cyan-50 dark:bg-cyan-500/10 shrink-0"><HiOutlineCloud className="w-5 h-5 text-cyan-500" /></div>
          <div>
            <p className="text-xs text-gray-500 mb-0.5">Curah Hujan Maks.</p>
            <p className="text-2xl font-bold text-gray-800 dark:text-white">{maxCH.toFixed(1)} <span className="text-sm font-normal text-gray-400">mm</span></p>
          </div>
        </div>
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-white/[0.03] flex items-center gap-4">
          <div className="p-3 rounded-xl bg-orange-50 dark:bg-orange-500/10 shrink-0"><HiOutlineBeaker className="w-5 h-5 text-orange-500" /></div>
          <div>
            <p className="text-xs text-gray-500 mb-0.5">Rata-rata Suhu</p>
            <p className="text-2xl font-bold text-gray-800 dark:text-white">{avgSuhu}°C</p>
          </div>
        </div>
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-white/[0.03] flex items-center gap-4">
          <div className="p-3 rounded-xl bg-yellow-50 dark:bg-yellow-500/10 shrink-0"><HiOutlineSun className="w-5 h-5 text-yellow-500" /></div>
          <div>
            <p className="text-xs text-gray-500 mb-0.5">Terakhir Diperbarui</p>
            <p className="text-sm font-bold text-gray-800 dark:text-white leading-tight">{updateDateStr}</p>
            <p className="text-xs text-gray-400 mt-0.5">{updateTimeStr} WIB</p>
          </div>
        </div>
      </div>

      {/* Table Card */}
      <div className="min-h-screen rounded-2xl border border-gray-200 bg-white px-5 py-3 dark:border-gray-800 dark:bg-white/[0.03] xl:px-10 xl:py-8">
        <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm rounded-2xl ring-1 ring-slate-100 dark:ring-gray-800 shadow-sm overflow-hidden">

          {/* Header */}
          <div className="px-6 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-100 dark:border-gray-800">
            <div>
              <h3 className="text-base font-bold text-[#1B2E4B] dark:text-white">Prediksi Harian</h3>
              <p className="text-xs text-slate-400 dark:text-gray-400 mt-0.5">Rangkuman cuaca harian — BMKG</p>
            </div>
            <div className="flex items-center gap-2.5 flex-wrap">
              {/* Date Selector Dropdown */}
              <div className="relative">
                <HiOutlineCalendarDays className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-gray-400 pointer-events-none" />
                <select
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="pl-9 pr-8 py-2 text-sm rounded-lg bg-slate-50 border border-slate-200 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900/50 outline-none transition-all cursor-pointer font-medium appearance-none w-36"
                >
                  <option value="">Semua Hari</option>
                  <option value={getLocalDateString(0)}>Hari Ini</option>
                  <option value={getLocalDateString(1)}>Besok</option>
                  <option value={getLocalDateString(2)}>Lusa</option>
                </select>
                <HiChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-gray-400 pointer-events-none" />
              </div>

              {/* Kecamatan Search */}
              <div className="relative" ref={dropdownRef}>
                <div className="relative">
                  <HiMagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-gray-400" />
                  <input
                    type="text"
                    placeholder="Cari Kecamatan..."
                    value={kecamatanSearchInput}
                    onFocus={() => setIsKecamatanOpen(true)}
                    onChange={(e) => {
                      setKecamatanSearchInput(e.target.value);
                      setIsKecamatanOpen(true);
                      if (e.target.value === "") setSelectedKecamatan("");
                    }}
                    className="pl-9 pr-8 py-2 text-sm rounded-lg bg-slate-50 border border-slate-200 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900/50 outline-none transition-all w-56 cursor-text"
                  />
                  {kecamatanSearchInput ? (
                    <button onClick={() => { setSelectedKecamatan(""); setKecamatanSearchInput(""); setIsKecamatanOpen(false); }}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
                      <HiXMark className="w-4 h-4" />
                    </button>
                  ) : (
                    <HiChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-gray-400 pointer-events-none" />
                  )}
                </div>
                {isKecamatanOpen && (
                  <div className="absolute left-0 mt-1 w-full max-h-60 overflow-y-auto rounded-lg border border-slate-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-800 z-50 py-1">
                    {filteredKecamatans.length === 0 ? (
                      <div className="px-4 py-2 text-xs text-slate-400 dark:text-gray-500">Tidak ada kecamatan ditemukan</div>
                    ) : (
                      filteredKecamatans.map((nama) => (
                        <button key={nama}
                          onClick={() => { setSelectedKecamatan(nama); setKecamatanSearchInput(nama); setIsKecamatanOpen(false); }}
                          className={`w-full text-left px-4 py-2 text-sm transition-colors hover:bg-slate-50 dark:hover:bg-gray-700/50 ${
                            selectedKecamatan === nama ? "bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400 font-medium" : "text-slate-700 dark:text-gray-200"
                          }`}>
                          {nama}
                        </button>
                      ))
                    )}
                  </div>
                )}
              </div>

              <button onClick={handleRefresh} disabled={refreshing || loading}
                className={`inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white rounded-lg shadow-sm whitespace-nowrap transition-all ${
                  refreshing || loading ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 active:scale-95 shadow-blue-200 dark:shadow-none'
                }`}>
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
                  <th className="px-6 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-gray-400">Tanggal</th>
                  <th className="px-6 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-gray-400">Kondisi (Siang)</th>
                  <th className="px-6 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-gray-400">Suhu (Min/Max)</th>
                  <th className="px-6 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-gray-400">Curah Hujan (Total)</th>
                  <th className="px-6 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-gray-400 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-gray-800">
                {loading ? (
                  [...Array(5)].map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td className="px-6 py-4"><div className="h-4 bg-gray-100 dark:bg-gray-800 rounded w-4 mx-auto" /></td>
                      <td className="px-6 py-4"><div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24" /></td>
                      <td className="px-6 py-4"><div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32" /></td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 bg-gray-200 dark:bg-gray-700 rounded-full shrink-0" />
                          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20" />
                        </div>
                      </td>
                      <td className="px-6 py-4"><div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-16" /></td>
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-12" />
                          <div className="h-5 bg-gray-100 dark:bg-gray-800 rounded w-16" />
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right"><div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-16 inline-block" /></td>
                    </tr>
                  ))
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-slate-400">
                      <HiOutlineCloud className="w-10 h-10 mx-auto mb-2 text-slate-300" />
                      <p>Tidak ada data prakiraan ditemukan.</p>
                    </td>
                  </tr>
                ) : (
                  paginatedData.map((row, index) => {
                    const hujan = curahHujanBadge(row.curah_hujan_total);
                    let tanggalStr = "-";
                    if (row.dateStr) {
                      const d = new Date(row.dateStr);
                      tanggalStr = d.toLocaleDateString("id-ID", { day: "2-digit", month: "long", year: "numeric", weekday: "short" });
                    }
                    return (
                      <tr key={`${row.kecamatan_id}-${row.dateStr}`} className="hover:bg-blue-50/40 dark:hover:bg-blue-900/20 transition-colors">
                        <td className="px-6 py-4 text-center text-slate-500 font-medium">{index + 1 + (currentPage - 1) * itemsPerPage}</td>
                        <td className="px-6 py-4">
                          <p className="font-semibold text-[#1B2E4B] dark:text-white">{row.kecamatan_nama}</p>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-sm font-medium text-gray-800 dark:text-gray-200 whitespace-nowrap">{tanggalStr}</p>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <span className="leading-none">{weatherIcon(row.weather_code)}</span>
                            <span className="text-sm text-slate-600 dark:text-slate-400">{row.deskripsi_cuaca}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <p className="font-bold text-gray-800 dark:text-white">{row.suhu_min}° - {row.suhu_max}°C</p>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col gap-1 items-start">
                            <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                              {row.curah_hujan_total.toFixed(1)} <span className="text-xs font-normal text-gray-400">mm</span>
                            </span>
                            <AdminBadge variant={hujan.variant}>{hujan.label}</AdminBadge>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <PrediksiTableAction kecamatanId={row.kecamatan_id} dateStr={row.dateStr} />
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
              <span className="font-semibold text-slate-700 dark:text-gray-300">{filtered.length}</span> baris harian
            </p>
            <div className="flex items-center gap-1.5">
              <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium border border-slate-200 dark:border-gray-700 bg-white dark:bg-gray-800 transition-colors ${currentPage === 1 ? 'text-slate-400 dark:text-gray-500 cursor-not-allowed opacity-50' : 'text-slate-700 dark:text-gray-300 hover:bg-slate-50 dark:hover:bg-gray-700'}`}>
                ← Sebelumnya
              </button>
              {getPageNumbers().map((page, idx) => {
                if (page === "...") {
                  return <span key={`dots-${idx}`} className="w-9 h-9 flex items-center justify-center text-slate-400 dark:text-gray-500 text-sm font-medium select-none">...</span>;
                }
                const pageNum = page as number;
                return (
                  <button key={`page-${pageNum}`} onClick={() => setCurrentPage(pageNum)}
                    className={`w-9 h-9 rounded-lg text-sm font-semibold transition-all ${
                      currentPage === pageNum ? "bg-[#1B2E4B] text-white shadow-md shadow-[#1B2E4B]/20" : "border border-slate-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-slate-700 dark:text-gray-300 hover:bg-slate-50 dark:hover:bg-gray-700"
                    }`}>
                    {pageNum}
                  </button>
                );
              })}
              <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages || totalPages === 0}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium border border-slate-200 dark:border-gray-700 bg-white dark:bg-gray-800 transition-colors ${currentPage === totalPages || totalPages === 0 ? 'text-slate-400 dark:text-gray-500 cursor-not-allowed opacity-50' : 'text-slate-700 dark:text-gray-300 hover:bg-slate-50 dark:hover:bg-gray-700'}`}>
                Selanjutnya →
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
