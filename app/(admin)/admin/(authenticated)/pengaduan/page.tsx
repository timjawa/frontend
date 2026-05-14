"use client";

import React, { useState, useEffect, useCallback } from "react";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import AdminBadge from "@/components/admin/ui/AdminBadge";
import { HiMagnifyingGlass } from "react-icons/hi2";
import PengaduanTableAction from "./PengaduanTableAction";
import {
  HiOutlineDocumentText,
  HiOutlineClock,
  HiOutlineArrowPath,
  HiOutlineCheckCircle,
  HiOutlineXCircle,
  HiOutlinePhoto,
} from "react-icons/hi2";

import api from "@/lib/api";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

interface Laporan {
  id: string;
  user_id: string;
  kecamatan_id: string | null;
  jenis_bencana: string;
  deskripsi: string | null;
  alamat_lengkap: string | null;
  latitude: number | null;
  longitude: number | null;
  status: "baru" | "diverifikasi" | "ditolak" | "selesai";
  is_draft: boolean;
  dibuat_pada: string;
  updated_at: string;
  
  // Relasi
  user?: {
    id: string;
    name: string;
    email: string;
  };
  kecamatan?: {
    id: string;
    nama: string;
  };
  media?: Array<{
    id: string;
    url: string;
    tipe: "foto" | "video";
    urutan: number;
    uploaded_at?: string | null;
  }>;
}

interface PaginateMeta {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  from: number | null;
  to: number | null;
}

interface Stats {
  total: number;
  baru: number;
  diverifikasi: number;
  ditolak: number;
  selesai: number;
}

const statusColors = {
  baru: "warning",
  diverifikasi: "info", 
  ditolak: "danger",
  selesai: "success",
} as const;

export default function PengaduanPage() {
  const [data, setData] = useState<Laporan[]>([]);
  const [meta, setMeta] = useState<PaginateMeta | null>(null);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [page, setPage] = useState(1);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ page: String(page), per_page: "10" });
      if (search) params.append("search", search);
      if (filterStatus !== "all") params.append("status", filterStatus);

      const res = await api.get(`/api/admin/laporan?${params.toString()}`);
      const json = res.data;

      setData(json.data ?? []);
      setMeta({
        current_page: json.current_page,
        last_page: json.last_page,
        per_page: json.per_page,
        total: json.total,
        from: json.from,
        to: json.to,
      });
    } catch (err: any) {
      const apiMsg = err.response?.data?.message;
      const status = err.response?.status;
      const hint =
          status === 401
            ? "Sesi tidak valid atau sudah habis — login ulang sebagai admin."
            : status === 403
              ? "Akun Anda tidak punya hak admin (role harus admin_bpbd atau super_admin)."
              : "";
      setError(apiMsg || hint || "Terjadi kesalahan.");
    } finally {
      setLoading(false);
    }
  }, [page, search, filterStatus]);

  const fetchStats = useCallback(async () => {
    try {
      const res = await api.get(`/api/admin/laporan/stats`);
      setStats(res.data);
    } catch (err) {
      console.error("Failed to fetch stats:", err);
    }
  }, []);

  useEffect(() => {
    fetchData();
    fetchStats();
  }, [fetchData, fetchStats]);

  const handleSearch = () => {
    setPage(1);
    setSearch(searchInput);
  };

  const handleDelete = async (id: string) => {
    // Refresh data and stats after delete
    await fetchData();
    await fetchStats();
  };

  return (
    <div>
      <PageBreadcrumb pageTitle="Manajemen Pengaduan" />

      {/* Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-white/[0.03] flex items-center gap-4">
          <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-500/10 shrink-0">
            <HiOutlineDocumentText className="w-5 h-5 text-blue-500" />
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-0.5">Total Pengaduan</p>
            <p className="text-2xl font-bold text-gray-800 dark:text-white">
              {loading ? "—" : stats?.total ?? 0}
            </p>
          </div>
        </div>
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-white/[0.03] flex items-center gap-4">
          <div className="p-3 rounded-xl bg-yellow-50 dark:bg-yellow-500/10 shrink-0">
            <HiOutlineClock className="w-5 h-5 text-yellow-500" />
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-0.5">Baru</p>
            <p className="text-2xl font-bold text-gray-800 dark:text-white">
              {loading ? "—" : stats?.baru ?? 0}
            </p>
          </div>
        </div>
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-white/[0.03] flex items-center gap-4">
          <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-500/10 shrink-0">
            <HiOutlineArrowPath className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-0.5">Diverifikasi</p>
            <p className="text-2xl font-bold text-gray-800 dark:text-white">
              {loading ? "—" : stats?.diverifikasi ?? 0}
            </p>
          </div>
        </div>
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-white/[0.03] flex items-center gap-4">
          <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-500/10 shrink-0">
            <HiOutlineXCircle className="w-5 h-5 text-rose-500" />
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-0.5">Ditolak</p>
            <p className="text-2xl font-bold text-gray-800 dark:text-white">
              {loading ? "—" : stats?.ditolak ?? 0}
            </p>
          </div>
        </div>
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-white/[0.03] flex items-center gap-4">
          <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 shrink-0">
            <HiOutlineCheckCircle className="w-5 h-5 text-emerald-500" />
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-0.5">Selesai</p>
            <p className="text-2xl font-bold text-gray-800 dark:text-white">
              {loading ? "—" : stats?.selesai ?? 0}
            </p>
          </div>
        </div>
      </div>

      <div className="min-h-screen rounded-2xl border border-gray-200 bg-white px-5 py-3 dark:border-gray-800 dark:bg-white/[0.03] xl:px-10 xl:py-8">
        <div className="bg-white/80 dark:bg-gray-900/50 backdrop-blur-sm rounded-2xl ring-1 ring-slate-100 dark:ring-gray-800 shadow-sm overflow-hidden">
          {/* Table header bar */}
          <div className="px-6 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-100 dark:border-gray-800">
            <div>
              <h3 className="text-base font-bold text-[#1B2E4B] dark:text-white">Daftar Pengaduan</h3>
              <p className="text-xs text-slate-400 dark:text-gray-500 mt-0.5">Kelola laporan pengaduan dari masyarakat</p>
            </div>
            <div className="flex items-center gap-2.5 flex-wrap">
              {/* Filter Status */}
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="py-2 px-3 text-sm rounded-lg bg-slate-50 dark:bg-gray-800 border border-slate-200 dark:border-gray-700 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900 outline-none transition-all text-slate-600 dark:text-gray-300"
              >
                <option value="all">Semua Status</option>
                <option value="baru">Baru</option>
                <option value="diverifikasi">Diverifikasi</option>
                <option value="selesai">Selesai</option>
                <option value="ditolak">Ditolak</option>
              </select>
              {/* Search */}
              <div className="relative">
                <HiMagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-gray-500" />
                <input
                  type="text"
                  placeholder="Cari lokasi / pelapor..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  className="pl-9 pr-4 py-2 text-sm rounded-lg bg-slate-50 dark:bg-gray-800 border border-slate-200 dark:border-gray-700 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900 focus:bg-white dark:focus:bg-gray-900 outline-none transition-all w-48 text-gray-700 dark:text-gray-200"
                />
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="bg-slate-50/80 dark:bg-gray-800/50">
                  <th className="px-6 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-gray-500">
                    No
                  </th>
                  <th className="px-6 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-gray-500">
                    Waktu
                  </th>
                  <th className="px-6 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-gray-500 min-w-[180px]">
                    Jenis Bencana
                  </th>
                  <th className="px-6 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-gray-500">
                    Lokasi
                  </th>
                  <th className="px-6 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-gray-500 text-center">
                    Media
                  </th>
                  <th className="px-6 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-gray-500">
                    Pelapor
                  </th>
                  <th className="px-6 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-gray-500">
                    Status
                  </th>
                  <th className="px-6 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-gray-500 text-right">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-gray-800">
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      {Array.from({ length: 8 }).map((__, j) => (
                        <td key={j} className="px-6 py-4">
                          <div className="h-4 bg-slate-100 dark:bg-gray-800 rounded-md w-full" />
                        </td>
                      ))}
                    </tr>
                  ))
                ) : error ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-12 text-center text-red-500">
                      <HiOutlineXCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      <p>{error}</p>
                    </td>
                  </tr>
                ) : data.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-12 text-center text-slate-400 dark:text-gray-500">
                      <HiOutlineDocumentText className="w-10 h-10 mx-auto mb-2 text-slate-300 dark:text-gray-600" />
                      <p>Tidak ada pengaduan ditemukan.</p>
                    </td>
                  </tr>
                ) : (
                  data.map((item, index) => {
                    const st = statusColors[item.status as keyof typeof statusColors] || "default";
                    return (
                      <tr key={item.id} className="hover:bg-blue-50/40 dark:hover:bg-gray-800/40 transition-colors">
                        <td className="px-6 py-4 text-slate-500 dark:text-gray-400 font-medium">
                          {meta?.from != null ? meta.from + index : index + 1}
                        </td>
                        <td className="px-6 py-4">
                          <div className="font-semibold text-[#1B2E4B] dark:text-gray-200">
                            {new Date(item.dibuat_pada).toLocaleDateString("id-ID")}
                          </div>
                          <div className="text-xs text-slate-500 dark:text-gray-400">
                            {new Date(item.dibuat_pada).toLocaleTimeString("id-ID")}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="font-semibold text-slate-700 dark:text-gray-300">
                            {item.jenis_bencana}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="font-medium text-[#1B2E4B] dark:text-gray-200">
                            {item.kecamatan?.nama ?? "—"}
                          </div>
                          <div className="text-xs text-slate-500 dark:text-gray-400 max-w-[150px] truncate" title={item.alamat_lengkap}>
                            {item.alamat_lengkap}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-slate-100 dark:bg-gray-800 text-slate-500 dark:text-gray-400 font-semibold text-xs border border-slate-200 dark:border-gray-700 shadow-sm">
                            {item.media?.length ?? 0}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="font-medium text-[#1B2E4B] dark:text-gray-200">
                            {item.user?.name ?? "Anonim"}
                          </div>
                          {item.user?.email && (
                            <div className="text-xs text-slate-500 dark:text-gray-400">
                              {item.user.email}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <AdminBadge variant={st as any} dot>
                            {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                          </AdminBadge>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <PengaduanTableAction id={item.id} onDeleted={handleDelete} />
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          <div className="px-6 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-t border-slate-100 dark:border-gray-800 bg-slate-50/50 dark:bg-gray-800/30">
            <p className="text-sm text-slate-500 dark:text-gray-400">
              {meta?.from != null ? (
                <>
                  Menampilkan <span className="font-semibold text-slate-700 dark:text-gray-200">{meta.from}–{meta.to}</span> dari{" "}
                  <span className="font-semibold text-slate-700 dark:text-gray-200">{meta.total}</span> data
                </>
              ) : (
                "Memuat data..."
              )}
            </p>
            <div className="flex items-center gap-1.5 flex-wrap">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={!meta || page === 1}
                className="px-3 py-1.5 rounded-lg text-sm font-medium border border-slate-200 dark:border-gray-700 text-slate-600 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-slate-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                ← Sebelumnya
              </button>
              {meta && Array.from({ length: meta.last_page }, (_, i) => i + 1)
                .slice(Math.max(0, page - 3), page + 2)
                .map((n) => (
                  <button
                    key={n}
                    onClick={() => setPage(n)}
                    className={`w-9 h-9 rounded-lg text-sm font-semibold transition-colors ${
                      n === page
                        ? "bg-[#1B2E4B] text-white shadow-md shadow-[#1B2E4B]/20"
                        : "bg-white dark:bg-gray-800 text-slate-600 dark:text-gray-300 border border-slate-200 dark:border-gray-700 hover:bg-slate-50 dark:hover:bg-gray-700"
                    }`}
                  >
                    {n}
                  </button>
                ))}
              <button
                onClick={() => setPage((p) => p + 1)}
                disabled={!meta || page === meta.last_page}
                className="px-3 py-1.5 rounded-lg text-sm font-medium border border-slate-200 dark:border-gray-700 text-slate-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-slate-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
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
