"use client";

import React, { useState, useEffect, useCallback } from "react";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import AdminBadge from "@/components/admin/ui/AdminBadge";
import { HiMagnifyingGlass } from "react-icons/hi2";
import Link from "next/link";
import PeringatanDiniTableAction from "./PeringatanDiniTableAction";
import {
  HiOutlineBellAlert,
  HiOutlineExclamationTriangle,
  HiPlus,
} from "react-icons/hi2";

const getApiBase = () => process.env.NEXT_PUBLIC_API_URL || (typeof window !== 'undefined' && ["localhost", "127.0.0.1"].includes(window.location.hostname) ? `${window.location.protocol}//${window.location.hostname}:8000/api` : "https://api.jembersiaga.my.id/api");

interface PeringatanDini {
  id: string;
  kecamatan_id: string;
  kecamatan?: { nama: string };
  dibuat_oleh: string;
  pembuat?: { name: string };
  deskripsi: string;
  tingkat_urgensi: "rendah" | "sedang" | "tinggi" | "kritis";
  is_active: boolean;
  created_at: string;
}

interface PaginateMeta {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  from: number | null;
  to: number | null;
}

const urgensiColors: Record<string, "info" | "warning" | "danger" | "success" | "default"> = {
  rendah: "info",
  sedang: "warning",
  tinggi: "danger",
  kritis: "danger",
};

export default function PeringatanDiniPage() {
  const [data, setData] = useState<PeringatanDini[]>([]);
  const [meta, setMeta] = useState<PaginateMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [filterUrgensi, setFilterUrgensi] = useState("all");
  const [page, setPage] = useState(1);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ page: String(page), per_page: "10" });
      if (search) params.append("search", search);
      if (filterUrgensi !== "all") params.append("tingkat_urgensi", filterUrgensi);

      const res = await fetch(`${getApiBase()}/peringatan-dini?${params.toString()}`);
      if (!res.ok) throw new Error("Gagal mengambil data peringatan dini.");
      const json = await res.json();

      setData(json.data ?? []);
      setMeta({
        current_page: json.current_page,
        last_page: json.last_page,
        per_page: json.per_page,
        total: json.total,
        from: json.from,
        to: json.to,
      });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan.");
    } finally {
      setLoading(false);
    }
  }, [page, search, filterUrgensi]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSearch = () => {
    setPage(1);
    setSearch(searchInput);
  };

  const handleUrgensiFilter = (value: string) => {
    setPage(1);
    setFilterUrgensi(value);
  };

  const handleDelete = (id: string) => {
    setData((prev) => prev.filter((k) => k.id !== id));
    if (meta) setMeta({ ...meta, total: meta.total - 1 });
  };

  const pages = meta ? Array.from({ length: meta.last_page }, (_, i) => i + 1) : [];

  return (
    <div>
      <PageBreadcrumb pageTitle="Manajemen Peringatan Dini" />

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-white/[0.03] flex items-center gap-4">
          <div className="p-3 rounded-xl bg-orange-50 dark:bg-orange-500/10 shrink-0">
            <HiOutlineBellAlert className="w-5 h-5 text-orange-500" />
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-0.5">Total Peringatan</p>
            <p className="text-2xl font-bold text-gray-800 dark:text-white">
              {loading ? "—" : meta?.total ?? data.length}
            </p>
          </div>
        </div>
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-white/[0.03] flex items-center gap-4">
          <div className="p-3 rounded-xl bg-red-50 dark:bg-red-500/10 shrink-0">
            <HiOutlineExclamationTriangle className="w-5 h-5 text-red-500" />
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-0.5">Kritis / Tinggi</p>
            <p className="text-2xl font-bold text-gray-800 dark:text-white">
              {loading ? "—" : data.filter((d) => d.tingkat_urgensi === 'kritis' || d.tingkat_urgensi === 'tinggi').length}
            </p>
          </div>
        </div>
      </div>

      <div className="min-h-screen rounded-2xl border border-gray-200 bg-white px-5 py-3 dark:border-gray-800 dark:bg-white/[0.03] xl:px-10 xl:py-8">
        <div className="bg-white/80 dark:bg-gray-900/50 backdrop-blur-sm rounded-2xl ring-1 ring-slate-100 dark:ring-gray-800 shadow-sm overflow-hidden">
          {/* Table header */}
          <div className="px-6 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-100 dark:border-gray-800">
            <div>
              <h3 className="text-base font-bold text-[#1B2E4B] dark:text-white">Data Peringatan Dini</h3>
              <p className="text-xs text-slate-400 dark:text-gray-500 mt-0.5">Kelola peringatan dini bencana untuk masyarakat</p>
            </div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <select
                value={filterUrgensi}
                onChange={(e) => handleUrgensiFilter(e.target.value)}
                className="px-3 py-2 text-sm rounded-lg bg-slate-50 dark:bg-gray-800 border border-slate-200 dark:border-gray-700 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900 focus:bg-white dark:focus:bg-gray-900 outline-none transition-all text-gray-700 dark:text-gray-200"
              >
                <option value="all">Semua status</option>
                <option value="rendah">Rendah</option>
                <option value="sedang">Sedang</option>
                <option value="tinggi">Tinggi</option>
                <option value="kritis">Kritis</option>
              </select>
              <div className="relative">
                <HiMagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-gray-500" />
                <input
                  type="text"
                  placeholder="Cari peringatan..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  className="pl-9 pr-4 py-2 text-sm rounded-lg bg-slate-50 dark:bg-gray-800 border border-slate-200 dark:border-gray-700 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900 focus:bg-white dark:focus:bg-gray-900 outline-none transition-all w-48 text-gray-700 dark:text-gray-200"
                />
              </div>
              <Link
                href="/admin/peringatan-dini/create"
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 active:scale-95 transition-all shadow-sm shadow-blue-200 dark:shadow-none whitespace-nowrap"
              >
                <HiPlus className="w-4 h-4" />
                Tambah Peringatan
              </Link>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="bg-slate-50/80 dark:bg-gray-800/50">
                  <th className="px-6 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-gray-500 w-12 text-center">No</th>
                  <th className="px-6 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-gray-500">Kecamatan</th>
                  <th className="px-6 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-gray-500">Deskripsi</th>
                  <th className="px-6 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-gray-500">Tingkat Urgensi</th>
                  <th className="px-6 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-gray-500">Status</th>
                  <th className="px-6 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-gray-500 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-gray-800">
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      {Array.from({ length: 6 }).map((__, j) => (
                        <td key={j} className="px-6 py-4">
                          <div className="h-4 bg-slate-100 dark:bg-gray-800 rounded-md w-full" />
                        </td>
                      ))}
                    </tr>
                  ))
                ) : error ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-red-500">
                      <HiOutlineExclamationTriangle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      <p>{error}</p>
                    </td>
                  </tr>
                ) : data.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-slate-400 dark:text-gray-500">
                      <HiOutlineBellAlert className="w-10 h-10 mx-auto mb-2 text-slate-300 dark:text-gray-600" />
                      <p>Tidak ada data peringatan dini ditemukan.</p>
                    </td>
                  </tr>
                ) : (
                  data.map((row, index) => (
                    <tr key={row.id} className="hover:bg-blue-50/40 dark:hover:bg-gray-800/40 transition-colors">
                      <td className="px-6 py-4 text-center text-slate-500 dark:text-gray-400 font-medium">
                        {meta ? (meta.from ?? 1) + index : index + 1}
                      </td>
                      <td className="px-6 py-4 font-semibold text-[#1B2E4B] dark:text-gray-200">
                        {row.kecamatan?.nama ?? "Semua Kecamatan"}
                        <p className="text-xs text-slate-400 dark:text-gray-500 font-normal mt-0.5">Dibuat oleh: {row.pembuat?.name ?? "-"}</p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="line-clamp-2 max-w-xs text-sm text-slate-600 dark:text-gray-400">{row.deskripsi}</p>
                      </td>
                      <td className="px-6 py-4">
                        <AdminBadge variant={urgensiColors[row.tingkat_urgensi] ?? "info"}>
                          {row.tingkat_urgensi.toUpperCase()}
                        </AdminBadge>
                      </td>
                      <td className="px-6 py-4 text-slate-600 dark:text-gray-400">
                        <AdminBadge variant={row.is_active ? "success" : "danger"} dot>
                          {row.is_active ? "Aktif" : "Tidak Aktif"}
                        </AdminBadge>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <PeringatanDiniTableAction id={row.id} onDeleted={handleDelete} />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="px-6 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-t border-slate-100 dark:border-gray-800 bg-slate-50/50 dark:bg-gray-800/30">
            <p className="text-sm text-slate-500 dark:text-gray-400">
              {meta && meta.from != null ? (
                <>
                  Menampilkan{" "}
                  <span className="font-semibold text-slate-700 dark:text-gray-200">{meta.from}–{meta.to}</span> dari{" "}
                  <span className="font-semibold text-slate-700 dark:text-gray-200">{meta.total}</span> data
                </>
              ) : (
                "Memuat data..."
              )}
            </p>
            <div className="flex items-center gap-1.5 flex-wrap">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={!meta || page <= 1}
                className="px-3 py-1.5 rounded-lg text-sm font-medium border border-slate-200 dark:border-gray-700 text-slate-600 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-slate-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                ← Sebelumnya
              </button>
              {pages.slice(Math.max(0, page - 3), page + 2).map((n) => (
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
                disabled={!meta || page >= meta.last_page}
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
