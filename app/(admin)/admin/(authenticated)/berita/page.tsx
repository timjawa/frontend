"use client";

import React, { useState, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import AdminBadge from "@/components/admin/ui/AdminBadge";
import { HiMagnifyingGlass, HiPlus, HiOutlineNewspaper, HiOutlineCheckCircle, HiOutlineDocumentText, HiOutlineArchiveBox, HiOutlineExclamationTriangle } from "react-icons/hi2";
import Link from "next/link";
import Image from "next/image";
import BeritaTableAction from "./BeritaTableAction";
import api, { getImageUrl } from "@/lib/api";

interface Berita {
  id: string | number;
  judul: string;
  kategori: string;
  status: string;
  foto_cover: string;
  views_count?: number;
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

const statusVariants: Record<string, string> = {
  published: "success",
  draft: "warning",
  archived: "info",
} as const;

export default function AdminBeritaPage() {
  const [data, setData] = useState<Berita[]>([]);
  const [meta, setMeta] = useState<PaginateMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<{ total: number; published: number; draft: number; archived: number } | null>(null);

  // Premium Toast and Confirm Dialog state
  const [mounted, setMounted] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    type: "danger" | "warning" | "success";
  } | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const showToast = (msg: string, type: "success" | "error" = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const triggerConfirm = (
    title: string,
    message: string,
    onConfirm: () => void,
    type: "danger" | "warning" | "success" = "warning"
  ) => {
    setConfirmModal({
      isOpen: true,
      title,
      message,
      onConfirm: () => {
        onConfirm();
        setConfirmModal(null);
      },
      type,
    });
  };

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {
        page: page,
        per_page: 10,
        search: search,
        status: statusFilter,
        admin: 1 // Tambahkan parameter admin
      };

      const res = await api.get('/api/berita', { params });
      
      let items: Berita[] = [];
      let pageMeta: PaginateMeta | null = null;

      // Handle standard Laravel pagination structure
      if (res.data && res.data.data) {
        items = res.data.data;
        pageMeta = {
          current_page: res.data.current_page,
          last_page: res.data.last_page,
          per_page: res.data.per_page,
          total: res.data.total,
          from: res.data.from,
          to: res.data.to,
        };
      } else {
        items = Array.isArray(res.data) ? res.data : [];
      }

      setData(items);
      setMeta(pageMeta);

      // Fetch stats
      try {
        const statsRes = await api.get('/api/berita/stats');
        setStats(statsRes.data);
      } catch (e) {
        // Fallback stats if endpoint not available
        setStats({
          total: pageMeta?.total ?? items.length,
          published: items.filter(b => b.status?.toLowerCase() === 'published').length,
          draft: items.filter(b => b.status?.toLowerCase() === 'draft').length,
          archived: items.filter(b => b.status?.toLowerCase() === 'archived').length,
        });
      }
    } catch (err: any) {
      setError(err?.response?.data?.message ?? err.message ?? "Gagal memuat data");
    } finally {
      setLoading(false);
    }
  }, [page, search, statusFilter]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Debounced search reactive implementation
  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      setSearch(searchInput);
      setPage(1);
    }, 400);
    return () => clearTimeout(delayDebounce);
  }, [searchInput]);

  const pages = meta ? Array.from({ length: meta.last_page }, (_, i) => i + 1) : [];

  return (
    <div>
      <PageBreadcrumb pageTitle="Manajemen Berita" />

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-white/[0.03] flex items-center gap-4">
          <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-500/10 shrink-0">
            <HiOutlineNewspaper className="w-5 h-5 text-blue-500" />
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-0.5">Total Berita</p>
            <p className="text-2xl font-bold text-gray-800 dark:text-white">
              {loading && !stats ? "—" : stats?.total ?? 0}
            </p>
          </div>
        </div>
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-white/[0.03] flex items-center gap-4">
          <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 shrink-0">
            <HiOutlineCheckCircle className="w-5 h-5 text-emerald-500" />
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-0.5">Published</p>
            <p className="text-2xl font-bold text-gray-800 dark:text-white">
              {loading && !stats ? "—" : stats?.published ?? 0}
            </p>
          </div>
        </div>
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-white/[0.03] flex items-center gap-4">
          <div className="p-3 rounded-xl bg-yellow-50 dark:bg-yellow-500/10 shrink-0">
            <HiOutlineDocumentText className="w-5 h-5 text-yellow-500" />
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-0.5">Draft</p>
            <p className="text-2xl font-bold text-gray-800 dark:text-white">
              {loading && !stats ? "—" : stats?.draft ?? 0}
            </p>
          </div>
        </div>
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-white/[0.03] flex items-center gap-4">
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-500/10 shrink-0">
            <HiOutlineArchiveBox className="w-5 h-5 text-slate-500" />
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-0.5">Archived</p>
            <p className="text-2xl font-bold text-gray-800 dark:text-white">
              {loading && !stats ? "—" : stats?.archived ?? 0}
            </p>
          </div>
        </div>
      </div>

      <div className="min-h-screen rounded-2xl border border-gray-200 bg-white px-5 py-3 dark:border-gray-800 dark:bg-white/[0.03] xl:px-10 xl:py-8">
        <div className="bg-white/80 dark:bg-gray-900/50 backdrop-blur-sm rounded-2xl ring-1 ring-slate-100 dark:ring-gray-800 shadow-sm overflow-hidden">
          {/* Table header bar */}
          <div className="px-6 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-100 dark:border-gray-800">
            <div>
              <h3 className="text-base font-bold text-[#1B2E4B] dark:text-white">Daftar Berita</h3>
              <p className="text-xs text-slate-400 dark:text-gray-500 mt-0.5">Kelola konten berita dan informasi publik</p>
            </div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <div className="relative">
                <HiMagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-gray-500" />
                <input
                  type="text"
                  placeholder="Cari berita..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  className="pl-9 pr-4 py-2 text-sm rounded-lg bg-slate-50 dark:bg-gray-800 border border-slate-200 dark:border-gray-700 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900 focus:bg-white dark:focus:bg-gray-900 outline-none transition-all w-48 text-gray-700 dark:text-gray-200"
                />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setPage(1);
                }}
                className="px-3 py-2 text-sm rounded-lg bg-slate-50 dark:bg-gray-800 border border-slate-200 dark:border-gray-700 outline-none focus:ring-2 focus:ring-blue-100 text-gray-700 dark:text-gray-300"
              >
                <option value="">Semua Status</option>
                <option value="published">Published</option>
                <option value="draft">Draft</option>
                <option value="archived">Archived</option>
              </select>
              <Link
                href="/admin/berita/create"
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 active:scale-95 transition-all shadow-sm shadow-blue-200 dark:shadow-none whitespace-nowrap"
              >
                <HiPlus className="w-4 h-4" />
                Tambah Berita
              </Link>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="bg-slate-50/80 dark:bg-gray-800/50">
                  <th className="px-6 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-gray-500 w-12 text-center">No</th>
                  <th className="px-6 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-gray-500">Foto</th>
                  <th className="px-6 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-gray-500">Judul Berita</th>
                  <th className="px-6 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-gray-500">Kategori</th>
                  <th className="px-6 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-gray-500">Status</th>
                  <th className="px-6 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-gray-500">Views</th>
                  <th className="px-6 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-gray-500 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-gray-800">
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      {Array.from({ length: 7 }).map((__, j) => (
                        <td key={j} className="px-6 py-4">
                          <div className="h-4 bg-slate-100 dark:bg-gray-800 rounded-md w-full" />
                        </td>
                      ))}
                    </tr>
                  ))
                ) : error ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-red-500">
                      <HiOutlineExclamationTriangle className="w-8 h-8 mx-auto mb-2" />
                      {error}
                      <button onClick={fetchData} className="block mx-auto mt-2 text-sm font-semibold text-blue-600 hover:underline">Coba Lagi</button>
                    </td>
                  </tr>
                ) : data.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-slate-400 dark:text-gray-500">
                      <HiOutlineNewspaper className="w-10 h-10 mx-auto mb-2 text-slate-300 dark:text-gray-600" />
                      <p>Tidak ada berita ditemukan.</p>
                    </td>
                  </tr>
                ) : (
                  data.map((row, index) => (
                    <tr key={row.id} className="hover:bg-blue-50/40 dark:hover:bg-gray-800/40 transition-colors">
                      <td className="px-6 py-4 text-center text-slate-500 dark:text-gray-400 font-medium">
                        {meta ? (meta.from ?? 1) + index : index + 1}
                      </td>
                      <td className="px-6 py-4">
                        <div className="relative w-12 h-12 rounded-lg overflow-hidden border border-slate-100 dark:border-gray-700">
                          <Image
                            src={getImageUrl(row.foto_cover)}
                            alt=""
                            fill
                            className="object-cover"
                            sizes="48px"
                          />
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-semibold text-[#1B2E4B] dark:text-gray-200 line-clamp-1">{row.judul}</p>
                        <p className="text-[11px] text-slate-400 dark:text-gray-500 mt-0.5">
                          {(() => {
                            const dateVal = row.created_at || (row as any).dibuat_pada;
                            if (!dateVal) return "—";
                            const d = new Date(dateVal);
                            return isNaN(d.getTime()) 
                              ? "—" 
                              : d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
                          })()}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-xs font-medium text-slate-600 dark:text-gray-400">
                          {row.kategori}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <AdminBadge
                          variant={(statusVariants[row.status?.toLowerCase()] as any) ?? "info"}
                          dot
                        >
                          {row.status}
                        </AdminBadge>
                      </td>
                      <td className="px-6 py-4 text-slate-500 dark:text-gray-400">
                        {row.views_count ?? 0}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <BeritaTableAction 
                          id={row.id} 
                          onDelete={(id) => {
                            triggerConfirm(
                              "Hapus Berita",
                              "Apakah Anda yakin ingin menghapus berita ini? Berita yang dihapus akan hilang secara permanen dari publik dan dashboard.",
                              async () => {
                                try {
                                  await api.delete(`/api/berita/${id}`);
                                  showToast("Berita berhasil dihapus!");
                                  fetchData();
                                } catch (err: any) {
                                  console.error(err);
                                  const msg = err.response?.data?.message || 'Terjadi kesalahan.';
                                  showToast(`Gagal menghapus berita: ${msg}`, "error");
                                }
                              },
                              "danger"
                            );
                          }}
                        />
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

      {/* Toast Notification - Portaled to Body */}
      {mounted && toast && typeof window !== "undefined" && createPortal(
        <div className={`fixed top-6 right-6 z-[99999] px-6 py-3 rounded-2xl shadow-2xl border flex items-center gap-3 animate-in fade-in slide-in-from-top-4 duration-300 ${
          toast.type === "success" 
            ? "bg-emerald-500 border-emerald-400 text-white" 
            : "bg-red-500 border-red-400 text-white"
        }`}>
          {toast.type === "success" ? <HiOutlineCheckCircle className="w-5 h-5 shrink-0" /> : <HiOutlineExclamationTriangle className="w-5 h-5 shrink-0" />}
          <span className="font-bold text-sm">{toast.msg}</span>
        </div>,
        document.body
      )}

      {/* Custom Confirmation Dialog - Portaled to Body */}
      {mounted && confirmModal && confirmModal.isOpen && typeof window !== "undefined" && createPortal(
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-150">
          {/* Backdrop click */}
          <div className="absolute inset-0" onClick={() => setConfirmModal(null)} />

          <div 
            className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-sm p-6 border border-gray-150 dark:border-gray-800 animate-in fade-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex flex-col items-center text-center gap-3 mb-5">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${
                confirmModal.type === "danger" 
                  ? "bg-red-50 dark:bg-red-500/10" 
                  : confirmModal.type === "success" 
                  ? "bg-emerald-50 dark:bg-emerald-500/10" 
                  : "bg-yellow-50 dark:bg-yellow-500/10"
              }`}>
                {confirmModal.type === "danger" ? (
                  <HiOutlineExclamationTriangle className="w-7 h-7 text-red-500" />
                ) : confirmModal.type === "success" ? (
                  <HiOutlineCheckCircle className="w-7 h-7 text-emerald-500" />
                ) : (
                  <HiOutlineExclamationTriangle className="w-7 h-7 text-yellow-500" />
                )}
              </div>
              <div>
                <h3 className="text-base font-bold text-gray-900 dark:text-white">{confirmModal.title}</h3>
                <p className="text-sm text-gray-550 dark:text-gray-400 mt-1 leading-relaxed">
                  {confirmModal.message}
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setConfirmModal(null)}
                className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={confirmModal.onConfirm}
                className={`flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold text-white rounded-xl active:scale-95 transition-all shadow-sm ${
                  confirmModal.type === "danger"
                    ? "bg-red-600 hover:bg-red-700"
                    : confirmModal.type === "success"
                    ? "bg-emerald-600 hover:bg-emerald-700"
                    : "bg-blue-600 hover:bg-blue-700"
                }`}
              >
                Lanjutkan
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
