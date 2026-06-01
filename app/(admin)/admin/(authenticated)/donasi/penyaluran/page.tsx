"use client";

import React, { useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import AdminBadge from "@/components/admin/ui/AdminBadge";
import api from "@/lib/api";
import {
  HiPlus,
  HiMagnifyingGlass,
  HiOutlineReceiptRefund,
  HiOutlineCheckCircle,
  HiOutlineClock,
  HiOutlineBanknotes,
  HiOutlineDocumentText,
  HiOutlineExclamationTriangle,
  HiEllipsisVertical,
  HiOutlineEye,
  HiOutlinePencil,
  HiOutlineTrash,
} from "react-icons/hi2";
import { Dropdown } from "@/components/ui/dropdown/Dropdown";
import { DropdownItem } from "@/components/ui/dropdown/DropdownItem";

type Row = {
  id: string;
  judul: string;
  nominal: string;
  penerima: string;
  tanggal_penyaluran: string;
  status: "draft" | "publish";
  bukti_url?: string | null;
  kampanye?: { judul: string } | null;
};

type Meta = { current_page: number; last_page: number; total: number; from: number | null; to: number | null };
type Stats = { total: number; publish: number; draft: number; total_nominal: number };
type ApiError = { response?: { data?: { message?: string } } };

const formatCurrency = (value: string | number | null | undefined) =>
  new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(Number(value ?? 0));

function PenyaluranTableAction({ id, onDelete }: { id: string; onDelete: (id: string) => void }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative inline-block text-left">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="dropdown-toggle p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-gray-700 dark:hover:text-gray-200 transition-colors"
      >
        <HiEllipsisVertical className="w-5 h-5" />
      </button>

      <Dropdown isOpen={isOpen} onClose={() => setIsOpen(false)} className="w-40 right-0 top-full">
        <div className="py-1">
          <DropdownItem tag="a" href={`/admin/donasi/penyaluran/${id}`} className="flex items-center gap-2">
            <HiOutlineEye className="w-4 h-4" />
            Detail
          </DropdownItem>
          <DropdownItem tag="a" href={`/admin/donasi/penyaluran/${id}/edit`} className="flex items-center gap-2">
            <HiOutlinePencil className="w-4 h-4" />
            Edit
          </DropdownItem>
          <DropdownItem
            tag="button"
            onClick={() => {
              setIsOpen(false);
              onDelete(id);
            }}
            className="flex items-center gap-2 text-rose-500 hover:text-rose-600 hover:bg-rose-50"
          >
            <HiOutlineTrash className="w-4 h-4" />
            Hapus
          </DropdownItem>
        </div>
      </Dropdown>
    </div>
  );
}

export default function PenyaluranDonasiPage() {
  const [data, setData] = useState<Row[]>([]);
  const [meta, setMeta] = useState<Meta | null>(null);
  const [stats, setStats] = useState<Stats | null>(null);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Toast & Confirm state
  const [mounted, setMounted] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  } | null>(null);

  useEffect(() => { setMounted(true); }, []);

  const showToast = (msg: string, type: "success" | "error" = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const triggerConfirm = (title: string, message: string, onConfirm: () => void) => {
    setConfirmModal({ isOpen: true, title, message, onConfirm: () => { onConfirm(); setConfirmModal(null); } });
  };

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const list = await api.get("/api/admin/donasi/penyaluran", { params: { page, per_page: 10, search } });
      const rows: Row[] = list.data.data ?? [];
      setData(rows);
      setMeta({ current_page: list.data.current_page, last_page: list.data.last_page, total: list.data.total, from: list.data.from, to: list.data.to });

      // Compute stats from all penyaluran
      try {
        const allRes = await api.get("/api/admin/donasi/penyaluran", { params: { per_page: 1000 } });
        const allRows: Row[] = allRes.data.data ?? [];
        const publish = allRows.filter((r) => r.status === "publish").length;
        const draft = allRows.filter((r) => r.status === "draft").length;
        const total_nominal = allRows
          .filter((r) => r.status === "publish")
          .reduce((sum, r) => sum + Number(r.nominal), 0);
        setStats({ total: allRows.length, publish, draft, total_nominal });
      } catch {
        // not critical
      }
    } catch (err: unknown) {
      setError(getApiMessage(err, "Gagal memuat penyaluran donasi."));
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => { fetchData(); }, [fetchData]);
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput);
      setPage(1);
    }, 400);

    return () => clearTimeout(timer);
  }, [searchInput]);

  const pages = meta ? Array.from({ length: meta.last_page }, (_, i) => i + 1) : [];

  const handleDelete = (id: string) => {
    triggerConfirm(
      "Hapus Penyaluran?",
      "Apakah Anda yakin ingin menghapus data penyaluran ini? Data akan terhapus secara permanen.",
      async () => {
        try {
          await api.delete(`/api/admin/donasi/penyaluran/${id}`);
          showToast("Penyaluran berhasil dihapus!");
          fetchData();
        } catch (err: unknown) {
          const msg = getApiMessage(err, "Terjadi kesalahan saat menghapus.");
          showToast(`Gagal menghapus: ${msg}`, "error");
        }
      }
    );
  };

  return (
    <div>
      <PageBreadcrumb pageTitle="Penyaluran Donasi" />

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Stat
          icon={<HiOutlineReceiptRefund />}
          label="Total Penyaluran"
          value={loading ? "-" : stats?.total ?? 0}
        />
        <Stat
          icon={<HiOutlineCheckCircle />}
          label="Publish"
          value={loading ? "-" : stats?.publish ?? 0}
          tone="emerald"
        />
        <Stat
          icon={<HiOutlineClock />}
          label="Draft"
          value={loading ? "-" : stats?.draft ?? 0}
          tone="amber"
        />
        <Stat
          icon={<HiOutlineBanknotes />}
          label="Total Disalurkan"
          value={loading ? "-" : formatCurrency(stats?.total_nominal)}
          tone="sky"
        />
      </div>

      <div className="min-h-screen rounded-2xl border border-gray-200 bg-white px-5 py-3 dark:border-gray-800 dark:bg-white/[0.03] xl:px-10 xl:py-8">
        <div className="bg-white/80 dark:bg-gray-900/50 backdrop-blur-sm rounded-2xl ring-1 ring-slate-100 dark:ring-gray-800 shadow-sm overflow-hidden">
          <div className="px-6 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-100 dark:border-gray-800">
            <div>
              <h3 className="text-base font-bold text-[#1B2E4B] dark:text-white">Log Penyaluran Dana</h3>
              <p className="text-xs text-slate-400 dark:text-gray-500 mt-0.5">Catat bukti penyaluran untuk transparansi publik</p>
            </div>
            <div className="flex items-center justify-start sm:justify-end gap-2.5 flex-wrap">
              <div className="relative w-full sm:w-56 lg:w-64">
                <HiMagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder="Cari penyaluran..."
                  className="w-full pl-9 pr-4 py-2 text-sm rounded-lg bg-slate-50 dark:bg-gray-800 border border-slate-200 dark:border-gray-700 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900 focus:bg-white dark:focus:bg-gray-900 outline-none transition-all text-gray-700 dark:text-gray-200"
                />
              </div>
              <Link href="/admin/donasi/penyaluran/create" className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 active:scale-95 transition-all shadow-sm shadow-blue-200 dark:shadow-none whitespace-nowrap">
                <HiPlus className="w-4 h-4" />
                Tambah Penyaluran
              </Link>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="bg-slate-50/80 dark:bg-gray-800/50">
                  {["No", "Kampanye", "Judul", "Nominal", "Penerima", "Tanggal", "Status", "Bukti", "Aksi"].map((head) => (
                    <th key={head} className={`px-6 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-gray-500 ${head === "No" ? "w-12 text-center" : head === "Aksi" ? "text-right" : ""}`}>{head}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-gray-800">
                {loading ? Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">{Array.from({ length: 9 }).map((__, j) => <td key={j} className="px-6 py-4"><div className="h-4 bg-slate-100 dark:bg-gray-800 rounded-md" /></td>)}</tr>
                )) : error ? (
                  <tr>
                    <td colSpan={9} className="px-6 py-12 text-center text-red-500">
                      <HiOutlineExclamationTriangle className="w-8 h-8 mx-auto mb-2" />
                      {error}
                      <button onClick={fetchData} className="block mx-auto mt-2 text-sm font-semibold text-blue-600 hover:underline">Coba Lagi</button>
                    </td>
                  </tr>
                ) : data.length === 0 ? (
                  <tr><td colSpan={9} className="px-6 py-12 text-center text-slate-400 dark:text-gray-500"><HiOutlineReceiptRefund className="w-10 h-10 mx-auto mb-2 text-slate-300 dark:text-gray-600" /><p>Belum ada penyaluran donasi.</p></td></tr>
                ) : data.map((item, index) => (
                  <tr key={item.id} className="hover:bg-blue-50/40 dark:hover:bg-gray-800/40 transition-colors">
                    <td className="px-6 py-4 text-center text-slate-500 dark:text-gray-400 font-medium">{meta ? (meta.from ?? 1) + index : index + 1}</td>
                    <td className="px-6 py-4 text-slate-600 dark:text-gray-300 max-w-[160px] truncate">{item.kampanye?.judul ?? "-"}</td>
                    <td className="px-6 py-4 font-semibold text-[#1B2E4B] dark:text-gray-200">{item.judul}</td>
                    <td className="px-6 py-4 font-semibold text-slate-700 dark:text-gray-200">{formatCurrency(item.nominal)}</td>
                    <td className="px-6 py-4 text-slate-500">{item.penerima}</td>
                    <td className="px-6 py-4 text-slate-500">{new Date(item.tanggal_penyaluran).toLocaleDateString("id-ID")}</td>
                    <td className="px-6 py-4"><AdminBadge variant={item.status === "publish" ? "success" : "warning"} dot>{item.status}</AdminBadge></td>
                    <td className="px-6 py-4">
                      {item.bukti_url ? (
                        <a href={item.bukti_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-blue-600 font-semibold hover:underline text-sm">
                          <HiOutlineDocumentText className="w-4 h-4" />
                          Lihat
                        </a>
                      ) : (
                        <span className="text-slate-400">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <PenyaluranTableAction id={item.id} onDelete={handleDelete} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pagination meta={meta} page={page} pages={pages} setPage={setPage} />
        </div>
      </div>

      {/* Toast Notification */}
      {mounted && toast && typeof window !== "undefined" && createPortal(
        <div className={`fixed top-6 right-6 z-[99999] px-6 py-3 rounded-2xl shadow-2xl border flex items-center gap-3 animate-in fade-in slide-in-from-top-4 duration-300 ${
          toast.type === "success" ? "bg-emerald-500 border-emerald-400 text-white" : "bg-red-500 border-red-400 text-white"
        }`}>
          {toast.type === "success" ? <HiOutlineCheckCircle className="w-5 h-5 shrink-0" /> : <HiOutlineExclamationTriangle className="w-5 h-5 shrink-0" />}
          <span className="font-bold text-sm">{toast.msg}</span>
        </div>,
        document.body
      )}

      {/* Confirm Dialog */}
      {mounted && confirmModal && confirmModal.isOpen && typeof window !== "undefined" && createPortal(
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="absolute inset-0" onClick={() => setConfirmModal(null)} />
          <div className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-sm p-6 border border-gray-150 dark:border-gray-800 animate-in fade-in zoom-in-95 duration-150" onClick={(e) => e.stopPropagation()}>
            <div className="flex flex-col items-center text-center gap-3 mb-5">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center bg-red-50 dark:bg-red-500/10">
                <HiOutlineExclamationTriangle className="w-7 h-7 text-red-500" />
              </div>
              <div>
                <h3 className="text-base font-bold text-gray-900 dark:text-white">{confirmModal.title}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">{confirmModal.message}</p>
              </div>
            </div>
            <div className="flex gap-3">
              <button type="button" onClick={() => setConfirmModal(null)} className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                Batal
              </button>
              <button type="button" onClick={confirmModal.onConfirm} className="flex-1 px-4 py-2.5 text-sm font-semibold text-white bg-red-600 hover:bg-red-700 rounded-xl active:scale-95 transition-all">
                Hapus
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}

function getApiMessage(error: unknown, fallback: string) {
  const apiError = error as ApiError;
  return apiError.response?.data?.message || (error instanceof Error ? error.message : fallback);
}

function Stat({ icon, label, value, tone = "blue" }: { icon: React.ReactNode; label: string; value: React.ReactNode; tone?: "blue" | "emerald" | "amber" | "sky" }) {
  const toneClass = {
    blue: "bg-blue-50 text-blue-500",
    emerald: "bg-emerald-50 text-emerald-500",
    amber: "bg-amber-50 text-amber-500",
    sky: "bg-sky-50 text-sky-500",
  }[tone];

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-white/[0.03] flex items-center gap-4">
      <div className={`p-3 rounded-xl shrink-0 [&>svg]:w-5 [&>svg]:h-5 ${toneClass}`}>{icon}</div>
      <div>
        <p className="text-xs text-gray-500 mb-0.5">{label}</p>
        <p className="text-2xl font-bold text-gray-800 dark:text-white">{value}</p>
      </div>
    </div>
  );
}

function Pagination({ meta, page, pages, setPage }: { meta: Meta | null; page: number; pages: number[]; setPage: (next: number | ((p: number) => number)) => void }) {
  return (
    <div className="px-6 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-t border-slate-100 dark:border-gray-800 bg-slate-50/50 dark:bg-gray-800/30">
      <p className="text-sm text-slate-500">{meta?.from ? <>Menampilkan <span className="font-semibold">{meta.from}-{meta.to}</span> dari <span className="font-semibold">{meta.total}</span> data</> : "Memuat data..."}</p>
      <div className="flex items-center gap-1.5">
        <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={!meta || page <= 1} className="px-3 py-1.5 rounded-lg text-sm font-medium border border-slate-200 dark:border-gray-700 text-slate-600 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-slate-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed">Sebelumnya</button>
        {pages.slice(Math.max(0, page - 3), page + 2).map((n) => <button key={n} onClick={() => setPage(n)} className={`w-9 h-9 rounded-lg text-sm font-semibold transition-colors ${n === page ? "bg-[#1B2E4B] text-white shadow-md shadow-[#1B2E4B]/20" : "bg-white dark:bg-gray-800 text-slate-600 dark:text-gray-300 border border-slate-200 dark:border-gray-700 hover:bg-slate-50 dark:hover:bg-gray-700"}`}>{n}</button>)}
        <button onClick={() => setPage((p) => p + 1)} disabled={!meta || page >= meta.last_page} className="px-3 py-1.5 rounded-lg text-sm font-medium border border-slate-200 dark:border-gray-700 text-slate-600 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-slate-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed">Selanjutnya</button>
      </div>
    </div>
  );
}
