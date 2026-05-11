"use client";

import React, { useState, useEffect, useCallback } from "react";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import AdminBadge from "@/components/admin/ui/AdminBadge";
import { HiMagnifyingGlass } from "react-icons/hi2";
import Link from "next/link";
import KontakDaruratTableAction from "./KontakDaruratTableAction";
import {
  HiOutlinePhone,
  HiOutlineCheckBadge,
  HiOutlineExclamationTriangle,
  HiPlus,
} from "react-icons/hi2";

const getApiBase = () => typeof window !== 'undefined' ? `${window.location.protocol}//${window.location.hostname}:8000/api` : (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api");

interface KontakDarurat {
  id: string;
  nama: string;
  nomor: string;
  kategori: string;
  keterangan: string | null;
  is_active: boolean;
}

interface PaginateMeta {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  from: number | null;
  to: number | null;
}

const kategoriColors: Record<string, "info" | "warning" | "danger" | "success" | "brand"> = {
  polisi: "info",
  pemadam: "danger",
  ambulans: "success",
  bpbd: "warning",
  sar: "brand",
  pln: "warning",
  lainnya: "info",
};

export default function KontakDaruratPage() {
  const [data, setData] = useState<KontakDarurat[]>([]);
  const [meta, setMeta] = useState<PaginateMeta | null>(null);
  const [summary, setSummary] = useState<{total_kontak: number, total_aktif: number} | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [page, setPage] = useState(1);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ page: String(page), per_page: "10" });
      if (search) params.append("search", search);

      const res = await fetch(`${getApiBase()}/kontak-darurat?${params.toString()}`);
      if (!res.ok) throw new Error("Gagal mengambil data kontak darurat.");
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

      if (json.summary) {
        setSummary(json.summary);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan.");
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSearch = () => {
    setPage(1);
    setSearch(searchInput);
  };

  const handleDelete = (id: string) => {
    setData((prev) => prev.filter((k) => k.id !== id));
    if (meta) setMeta({ ...meta, total: meta.total - 1 });
  };

  const pages = meta ? Array.from({ length: meta.last_page }, (_, i) => i + 1) : [];

  return (
    <div>
      <PageBreadcrumb pageTitle="Manajemen Kontak Darurat" />

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-white/[0.03] flex items-center gap-4">
          <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-500/10 shrink-0">
            <HiOutlinePhone className="w-5 h-5 text-blue-500" />
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-0.5">Total Kontak</p>
            <p className="text-2xl font-bold text-gray-800 dark:text-white">
              {loading ? "—" : summary?.total_kontak ?? meta?.total ?? data.length}
            </p>
          </div>
        </div>
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-white/[0.03] flex items-center gap-4">
          <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 shrink-0">
            <HiOutlineCheckBadge className="w-5 h-5 text-emerald-500" />
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-0.5">Aktif</p>
            <p className="text-2xl font-bold text-gray-800 dark:text-white">
              {loading ? "—" : summary?.total_aktif ?? data.filter((d) => d.is_active).length}
            </p>
          </div>
        </div>
      </div>

      <div className="min-h-screen rounded-2xl border border-gray-200 bg-white px-5 py-3 dark:border-gray-800 dark:bg-white/[0.03] xl:px-10 xl:py-8">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl ring-1 ring-slate-100 shadow-sm overflow-hidden">
          {/* Table header */}
          <div className="px-6 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-100">
            <div>
              <h3 className="text-base font-bold text-[#1B2E4B]">Data Kontak Darurat</h3>
              <p className="text-xs text-slate-400 mt-0.5">Kelola informasi kontak penting/darurat</p>
            </div>
            <div className="flex items-center gap-2.5">
              <div className="relative">
                <HiMagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Cari kontak..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  className="pl-9 pr-4 py-2 text-sm rounded-lg bg-slate-50 border border-slate-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 focus:bg-white outline-none transition-all w-48"
                />
              </div>
              <Link
                href="/admin/kontak-darurat/create"
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 active:scale-95 transition-all shadow-sm shadow-blue-200 dark:shadow-none whitespace-nowrap"
              >
                <HiPlus className="w-4 h-4" />
                Tambah Kontak
              </Link>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="bg-slate-50/80">
                  <th className="px-6 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-400 w-12 text-center">No</th>
                  <th className="px-6 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-400">Nama Instansi</th>
                  <th className="px-6 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-400">Nomor Telepon</th>
                  <th className="px-6 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-400">Kategori</th>
                  <th className="px-6 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-400">Status</th>
                  <th className="px-6 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-400 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      {Array.from({ length: 6 }).map((__, j) => (
                        <td key={j} className="px-6 py-4">
                          <div className="h-4 bg-slate-100 rounded-md w-full" />
                        </td>
                      ))}
                    </tr>
                  ))
                ) : error ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-red-500">
                      <HiOutlineExclamationTriangle className="w-8 h-8 mx-auto mb-2" />
                      {error}
                    </td>
                  </tr>
                ) : data.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                      <HiOutlinePhone className="w-10 h-10 mx-auto mb-2 text-slate-300" />
                      <p>Tidak ada data kontak ditemukan.</p>
                    </td>
                  </tr>
                ) : (
                  data.map((row, index) => (
                    <tr key={row.id} className="hover:bg-blue-50/40 transition-colors">
                      <td className="px-6 py-4 text-center text-slate-500 font-medium">
                        {meta ? (meta.from ?? 1) + index : index + 1}
                      </td>
                      <td className="px-6 py-4 font-semibold text-[#1B2E4B]">
                        {row.nama}
                        {row.keterangan && <p className="text-xs text-slate-400 font-normal mt-0.5">{row.keterangan}</p>}
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-gray-100 text-gray-800 text-sm font-bold font-mono tracking-wider">
                          {row.nomor}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <AdminBadge variant={kategoriColors[row.kategori] ?? "info"}>
                          {row.kategori.toUpperCase()}
                        </AdminBadge>
                      </td>
                      <td className="px-6 py-4">
                        <AdminBadge variant={row.is_active ? "success" : "danger"} dot>
                          {row.is_active ? "Aktif" : "Tidak Aktif"}
                        </AdminBadge>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <KontakDaruratTableAction id={row.id} onDeleted={handleDelete} />
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
              {meta && meta.from != null ? (
                <>
                  Menampilkan{" "}
                  <span className="font-semibold text-slate-700">{meta.from}–{meta.to}</span> dari{" "}
                  <span className="font-semibold text-slate-700">{meta.total}</span> data
                </>
              ) : (
                "Memuat data..."
              )}
            </p>
            <div className="flex items-center gap-1.5 flex-wrap">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={!meta || page <= 1}
                className="px-3 py-1.5 rounded-lg text-sm font-medium border border-slate-200 text-slate-600 bg-white hover:bg-slate-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
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
                      : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
                  }`}
                >
                  {n}
                </button>
              ))}
              <button
                onClick={() => setPage((p) => p + 1)}
                disabled={!meta || page >= meta.last_page}
                className="px-3 py-1.5 rounded-lg text-sm font-medium border border-slate-200 text-slate-700 bg-white hover:bg-slate-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
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
