"use client";

import React, { useCallback, useEffect, useState } from "react";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import AdminBadge from "@/components/admin/ui/AdminBadge";
import api from "@/lib/api";
import { HiMagnifyingGlass, HiOutlineCreditCard } from "react-icons/hi2";

type DonasiRow = {
  id: string;
  nominal: string;
  status: string;
  anonim: boolean;
  nama_donatur?: string | null;
  created_at: string;
  kampanye?: { judul: string } | null;
  pembayaran?: { order_id: string; metode_bayar?: string | null; status_transaksi: string } | null;
};

type Meta = { current_page: number; last_page: number; total: number; from: number | null; to: number | null };
type KampanyeOption = { id: string; judul: string };
type ApiError = { response?: { data?: { message?: string } } };

const formatCurrency = (value: string | number | null | undefined) =>
  new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(Number(value ?? 0));

const badgeVariant = (status: string): "success" | "warning" | "danger" | "default" =>
  status === "berhasil" ? "success" : status === "menunggu" ? "warning" : status === "gagal" ? "danger" : "default";

export default function TransaksiDonasiPage() {
  const [data, setData] = useState<DonasiRow[]>([]);
  const [meta, setMeta] = useState<Meta | null>(null);
  const [kampanye, setKampanye] = useState<KampanyeOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("");
  const [kampanyeId, setKampanyeId] = useState("");
  const [method, setMethod] = useState("");
  const [orderSearch, setOrderSearch] = useState("");
  const [page, setPage] = useState(1);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [list, campaigns] = await Promise.all([
        api.get("/api/admin/donasi/transaksi", { params: { page, per_page: 10, status, kampanye_id: kampanyeId, metode_bayar: method } }),
        api.get("/api/admin/donasi/kampanye", { params: { per_page: 100 } }),
      ]);
      let rows = list.data.data ?? [];
      if (orderSearch.trim()) {
        rows = rows.filter((item: DonasiRow) => item.pembayaran?.order_id?.toLowerCase().includes(orderSearch.toLowerCase()));
      }
      setData(rows);
      setMeta({ current_page: list.data.current_page, last_page: list.data.last_page, total: list.data.total, from: list.data.from, to: list.data.to });
      setKampanye(campaigns.data.data ?? []);
    } catch (err: unknown) {
      setError(getApiMessage(err, "Gagal memuat transaksi donasi."));
    } finally {
      setLoading(false);
    }
  }, [page, status, kampanyeId, method, orderSearch]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const pages = meta ? Array.from({ length: meta.last_page }, (_, i) => i + 1) : [];

  return (
    <div>
      <PageBreadcrumb pageTitle="Transaksi Donasi" />
      <div className="min-h-screen rounded-2xl border border-gray-200 bg-white px-5 py-3 dark:border-gray-800 dark:bg-white/[0.03] xl:px-10 xl:py-8">
        <div className="bg-white/80 dark:bg-gray-900/50 rounded-2xl ring-1 ring-slate-100 dark:ring-gray-800 shadow-sm overflow-hidden">
          <div className="px-6 py-4 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 border-b border-slate-100 dark:border-gray-800">
            <div>
              <h3 className="text-base font-bold text-[#1B2E4B] dark:text-white">Daftar Transaksi</h3>
              <p className="text-xs text-slate-400 dark:text-gray-500 mt-0.5">Pantau status pembayaran dan data Midtrans</p>
            </div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <div className="relative">
                <HiMagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input value={orderSearch} onChange={(e) => setOrderSearch(e.target.value)} placeholder="Cari order ID..." className="pl-9 pr-4 py-2 text-sm rounded-lg bg-slate-50 dark:bg-gray-800 border border-slate-200 dark:border-gray-700 outline-none w-44 text-gray-700 dark:text-gray-200" />
              </div>
              <select value={kampanyeId} onChange={(e) => { setKampanyeId(e.target.value); setPage(1); }} className="px-3 py-2 text-sm rounded-lg bg-slate-50 dark:bg-gray-800 border border-slate-200 dark:border-gray-700">
                <option value="">Semua Kampanye</option>
                {kampanye.map((item) => <option key={item.id} value={item.id}>{item.judul}</option>)}
              </select>
              <select value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }} className="px-3 py-2 text-sm rounded-lg bg-slate-50 dark:bg-gray-800 border border-slate-200 dark:border-gray-700">
                <option value="">Semua Status</option>
                <option value="menunggu">Menunggu</option>
                <option value="berhasil">Berhasil</option>
                <option value="gagal">Gagal</option>
                <option value="kedaluwarsa">Kedaluwarsa</option>
              </select>
              <input value={method} onChange={(e) => setMethod(e.target.value)} placeholder="Metode bayar" className="px-3 py-2 text-sm rounded-lg bg-slate-50 dark:bg-gray-800 border border-slate-200 dark:border-gray-700 outline-none w-36" />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="bg-slate-50/80 dark:bg-gray-800/50">
                  {["Order ID", "Donatur", "Kampanye", "Nominal", "Metode", "Status", "Tanggal"].map((head) => (
                    <th key={head} className="px-6 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-gray-500">{head}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-gray-800">
                {loading ? Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">{Array.from({ length: 7 }).map((__, j) => <td key={j} className="px-6 py-4"><div className="h-4 bg-slate-100 dark:bg-gray-800 rounded-md" /></td>)}</tr>
                )) : error ? (
                  <tr><td colSpan={7} className="px-6 py-12 text-center text-red-500">{error}</td></tr>
                ) : data.length === 0 ? (
                  <tr><td colSpan={7} className="px-6 py-12 text-center text-slate-400"><HiOutlineCreditCard className="w-10 h-10 mx-auto mb-2" />Belum ada transaksi donasi.</td></tr>
                ) : data.map((item) => (
                  <tr key={item.id} className="hover:bg-blue-50/40 dark:hover:bg-gray-800/40">
                    <td className="px-6 py-4 font-mono text-xs text-slate-600">{item.pembayaran?.order_id ?? "-"}</td>
                    <td className="px-6 py-4 font-semibold text-[#1B2E4B] dark:text-gray-200">{item.anonim ? "Anonim" : item.nama_donatur ?? "-"}</td>
                    <td className="px-6 py-4 text-slate-600 dark:text-gray-300">{item.kampanye?.judul ?? "-"}</td>
                    <td className="px-6 py-4 font-semibold text-slate-700 dark:text-gray-200">{formatCurrency(item.nominal)}</td>
                    <td className="px-6 py-4 text-slate-500">{item.pembayaran?.metode_bayar ?? "-"}</td>
                    <td className="px-6 py-4"><AdminBadge variant={badgeVariant(item.status)} dot>{item.status}</AdminBadge></td>
                    <td className="px-6 py-4 text-slate-500">{new Date(item.created_at).toLocaleDateString("id-ID")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <Pagination meta={meta} page={page} pages={pages} setPage={setPage} />
        </div>
      </div>
    </div>
  );
}

function getApiMessage(error: unknown, fallback: string) {
  const apiError = error as ApiError;
  return apiError.response?.data?.message || (error instanceof Error ? error.message : fallback);
}

function Pagination({ meta, page, pages, setPage }: { meta: Meta | null; page: number; pages: number[]; setPage: (next: number | ((p: number) => number)) => void }) {
  return (
    <div className="px-6 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-t border-slate-100 dark:border-gray-800 bg-slate-50/50 dark:bg-gray-800/30">
      <p className="text-sm text-slate-500">{meta?.from ? <>Menampilkan <span className="font-semibold">{meta.from}-{meta.to}</span> dari <span className="font-semibold">{meta.total}</span> data</> : "Memuat data..."}</p>
      <div className="flex items-center gap-1.5">
        <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={!meta || page <= 1} className="px-3 py-1.5 rounded-lg text-sm border bg-white disabled:opacity-40">Sebelumnya</button>
        {pages.slice(Math.max(0, page - 3), page + 2).map((n) => <button key={n} onClick={() => setPage(n)} className={`w-9 h-9 rounded-lg text-sm font-semibold border ${n === page ? "bg-[#1B2E4B] text-white" : "bg-white text-slate-600"}`}>{n}</button>)}
        <button onClick={() => setPage((p) => p + 1)} disabled={!meta || page >= meta.last_page} className="px-3 py-1.5 rounded-lg text-sm border bg-white disabled:opacity-40">Selanjutnya</button>
      </div>
    </div>
  );
}
