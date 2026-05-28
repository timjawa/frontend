"use client";

import React, { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import AdminBadge from "@/components/admin/ui/AdminBadge";
import api from "@/lib/api";
import { HiMagnifyingGlass, HiOutlineBanknotes, HiOutlineCheckCircle, HiOutlineDocumentText, HiOutlineHeart, HiPlus } from "react-icons/hi2";

type Kampanye = {
  id: string;
  judul: string;
  jenis_bencana: string;
  target_donasi: string | null;
  total_terkumpul: string;
  total_disalurkan: string;
  status: "draft" | "aktif" | "ditutup";
  kecamatan?: { nama: string } | null;
};

type Meta = { current_page: number; last_page: number; total: number; from: number | null; to: number | null };
type Stats = { total: number; aktif: number; draft: number; ditutup: number; total_terkumpul: number; total_disalurkan: number };
type ApiError = { response?: { data?: { message?: string } } };

const formatCurrency = (value: string | number | null | undefined) =>
  new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(Number(value ?? 0));

const statusVariant: Record<string, "success" | "warning" | "default"> = {
  aktif: "success",
  draft: "warning",
  ditutup: "default",
};

export default function KampanyeDonasiPage() {
  const [data, setData] = useState<Kampanye[]>([]);
  const [meta, setMeta] = useState<Meta | null>(null);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [list, stat] = await Promise.all([
        api.get("/api/admin/donasi/kampanye", { params: { page, per_page: 10, search, status } }),
        api.get("/api/admin/donasi/kampanye/stats"),
      ]);
      setData(list.data.data ?? []);
      setMeta({
        current_page: list.data.current_page,
        last_page: list.data.last_page,
        total: list.data.total,
        from: list.data.from,
        to: list.data.to,
      });
      setStats(stat.data);
    } catch (err: unknown) {
      setError(getApiMessage(err, "Gagal memuat kampanye donasi."));
    } finally {
      setLoading(false);
    }
  }, [page, search, status]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput);
      setPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const pages = meta ? Array.from({ length: meta.last_page }, (_, i) => i + 1) : [];

  return (
    <div>
      <PageBreadcrumb pageTitle="Kampanye Donasi" />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Stat icon={<HiOutlineHeart />} label="Total Kampanye" value={loading ? "-" : stats?.total ?? 0} />
        <Stat icon={<HiOutlineCheckCircle />} label="Aktif" value={loading ? "-" : stats?.aktif ?? 0} tone="emerald" />
        <Stat icon={<HiOutlineDocumentText />} label="Draft" value={loading ? "-" : stats?.draft ?? 0} tone="amber" />
        <Stat icon={<HiOutlineBanknotes />} label="Dana Terkumpul" value={loading ? "-" : formatCurrency(stats?.total_terkumpul)} tone="sky" />
      </div>

      <div className="min-h-screen rounded-2xl border border-gray-200 bg-white px-5 py-3 dark:border-gray-800 dark:bg-white/[0.03] xl:px-10 xl:py-8">
        <div className="bg-white/80 dark:bg-gray-900/50 rounded-2xl ring-1 ring-slate-100 dark:ring-gray-800 shadow-sm overflow-hidden">
          <div className="px-6 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-100 dark:border-gray-800">
            <div>
              <h3 className="text-base font-bold text-[#1B2E4B] dark:text-white">Daftar Kampanye Donasi</h3>
              <p className="text-xs text-slate-400 dark:text-gray-500 mt-0.5">Kelola open donasi bencana dan status publikasinya</p>
            </div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <div className="relative">
                <HiMagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input value={searchInput} onChange={(e) => setSearchInput(e.target.value)} placeholder="Cari kampanye..." className="pl-9 pr-4 py-2 text-sm rounded-lg bg-slate-50 dark:bg-gray-800 border border-slate-200 dark:border-gray-700 outline-none w-48 text-gray-700 dark:text-gray-200" />
              </div>
              <select value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }} className="px-3 py-2 text-sm rounded-lg bg-slate-50 dark:bg-gray-800 border border-slate-200 dark:border-gray-700 text-gray-700 dark:text-gray-300">
                <option value="">Semua Status</option>
                <option value="draft">Draft</option>
                <option value="aktif">Aktif</option>
                <option value="ditutup">Ditutup</option>
              </select>
              <Link href="/admin/donasi/kampanye/create" className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 active:scale-95 transition-all shadow-sm">
                <HiPlus className="w-4 h-4" />
                Tambah Kampanye
              </Link>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="bg-slate-50/80 dark:bg-gray-800/50">
                  {["Judul", "Jenis", "Kecamatan", "Target", "Terkumpul", "Disalurkan", "Status", "Aksi"].map((head) => (
                    <th key={head} className="px-6 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-gray-500">{head}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-gray-800">
                {loading ? Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">{Array.from({ length: 8 }).map((__, j) => <td key={j} className="px-6 py-4"><div className="h-4 bg-slate-100 dark:bg-gray-800 rounded-md" /></td>)}</tr>
                )) : error ? (
                  <tr><td colSpan={8} className="px-6 py-12 text-center text-red-500">{error}</td></tr>
                ) : data.length === 0 ? (
                  <tr><td colSpan={8} className="px-6 py-12 text-center text-slate-400">Belum ada kampanye donasi.</td></tr>
                ) : data.map((item) => (
                  <tr key={item.id} className="hover:bg-blue-50/40 dark:hover:bg-gray-800/40">
                    <td className="px-6 py-4 font-semibold text-[#1B2E4B] dark:text-gray-200">{item.judul}</td>
                    <td className="px-6 py-4 text-slate-600 dark:text-gray-300">{item.jenis_bencana}</td>
                    <td className="px-6 py-4 text-slate-500">{item.kecamatan?.nama ?? "-"}</td>
                    <td className="px-6 py-4 text-slate-500">{formatCurrency(item.target_donasi)}</td>
                    <td className="px-6 py-4 font-semibold text-slate-700 dark:text-gray-200">{formatCurrency(item.total_terkumpul)}</td>
                    <td className="px-6 py-4 text-slate-500">{formatCurrency(item.total_disalurkan)}</td>
                    <td className="px-6 py-4"><AdminBadge variant={statusVariant[item.status]} dot>{item.status}</AdminBadge></td>
                    <td className="px-6 py-4"><Link href={`/admin/donasi/kampanye/${item.id}/edit`} className="text-sm font-semibold text-blue-600 hover:underline">Edit</Link></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="px-6 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-t border-slate-100 dark:border-gray-800 bg-slate-50/50 dark:bg-gray-800/30">
            <p className="text-sm text-slate-500">{meta?.from ? <>Menampilkan <span className="font-semibold">{meta.from}-{meta.to}</span> dari <span className="font-semibold">{meta.total}</span> data</> : "Memuat data..."}</p>
            <div className="flex items-center gap-1.5">
              <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={!meta || page <= 1} className="px-3 py-1.5 rounded-lg text-sm border bg-white disabled:opacity-40">Sebelumnya</button>
              {pages.slice(Math.max(0, page - 3), page + 2).map((n) => <button key={n} onClick={() => setPage(n)} className={`w-9 h-9 rounded-lg text-sm font-semibold border ${n === page ? "bg-[#1B2E4B] text-white" : "bg-white text-slate-600"}`}>{n}</button>)}
              <button onClick={() => setPage((p) => p + 1)} disabled={!meta || page >= meta.last_page} className="px-3 py-1.5 rounded-lg text-sm border bg-white disabled:opacity-40">Selanjutnya</button>
            </div>
          </div>
        </div>
      </div>
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
