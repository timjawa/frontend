"use client";

import React, { useCallback, useEffect, useState } from "react";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import AdminBadge from "@/components/admin/ui/AdminBadge";
import api from "@/lib/api";
import { HiMagnifyingGlass } from "react-icons/hi2";

type Row = {
  id: string;
  order_id: string;
  transaction_id?: string | null;
  status_transaksi: string;
  metode_bayar?: string | null;
  status_proses: "diterima" | "diproses" | "gagal";
  diterima_pada: string;
};

type Meta = { current_page: number; last_page: number; total: number; from: number | null; to: number | null };
type ApiError = { response?: { data?: { message?: string } } };

export default function NotifikasiMidtransPage() {
  const [data, setData] = useState<Row[]>([]);
  const [meta, setMeta] = useState<Meta | null>(null);
  const [status, setStatus] = useState("");
  const [orderId, setOrderId] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get("/api/admin/donasi/notifikasi-midtrans", { params: { page, per_page: 10, status_proses: status, order_id: orderId } });
      setData(res.data.data ?? []);
      setMeta({ current_page: res.data.current_page, last_page: res.data.last_page, total: res.data.total, from: res.data.from, to: res.data.to });
    } catch (err: unknown) {
      setError(getApiMessage(err, "Gagal memuat notifikasi Midtrans."));
    } finally {
      setLoading(false);
    }
  }, [page, status, orderId]);

  useEffect(() => { fetchData(); }, [fetchData]);
  const pages = meta ? Array.from({ length: meta.last_page }, (_, i) => i + 1) : [];

  return (
    <div>
      <PageBreadcrumb pageTitle="Notifikasi Midtrans" />
      <div className="min-h-screen rounded-2xl border border-gray-200 bg-white px-5 py-3 dark:border-gray-800 dark:bg-white/[0.03] xl:px-10 xl:py-8">
        <div className="bg-white/80 dark:bg-gray-900/50 rounded-2xl ring-1 ring-slate-100 dark:ring-gray-800 shadow-sm overflow-hidden">
          <div className="px-6 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-100 dark:border-gray-800">
            <div>
              <h3 className="text-base font-bold text-[#1B2E4B] dark:text-white">Audit Webhook Midtrans</h3>
              <p className="text-xs text-slate-400 dark:text-gray-500 mt-0.5">Semua callback disimpan untuk pengecekan teknis</p>
            </div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <div className="relative">
                <HiMagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input value={orderId} onChange={(e) => setOrderId(e.target.value)} placeholder="Order ID..." className="pl-9 pr-4 py-2 text-sm rounded-lg bg-slate-50 dark:bg-gray-800 border border-slate-200 dark:border-gray-700 outline-none w-44" />
              </div>
              <select value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }} className="px-3 py-2 text-sm rounded-lg bg-slate-50 dark:bg-gray-800 border border-slate-200 dark:border-gray-700">
                <option value="">Semua Proses</option>
                <option value="diterima">Diterima</option>
                <option value="diproses">Diproses</option>
                <option value="gagal">Gagal</option>
              </select>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="bg-slate-50/80 dark:bg-gray-800/50">
                  {["Order ID", "Transaction ID", "Status Transaksi", "Metode", "Status Proses", "Waktu Diterima"].map((head) => (
                    <th key={head} className="px-6 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-gray-500">{head}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-gray-800">
                {loading ? Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">{Array.from({ length: 6 }).map((__, j) => <td key={j} className="px-6 py-4"><div className="h-4 bg-slate-100 dark:bg-gray-800 rounded-md" /></td>)}</tr>
                )) : error ? (
                  <tr><td colSpan={6} className="px-6 py-12 text-center text-red-500">{error}</td></tr>
                ) : data.length === 0 ? (
                  <tr><td colSpan={6} className="px-6 py-12 text-center text-slate-400">Belum ada webhook Midtrans.</td></tr>
                ) : data.map((item) => (
                  <tr key={item.id} className="hover:bg-blue-50/40 dark:hover:bg-gray-800/40">
                    <td className="px-6 py-4 font-mono text-xs text-slate-600">{item.order_id}</td>
                    <td className="px-6 py-4 font-mono text-xs text-slate-500">{item.transaction_id ?? "-"}</td>
                    <td className="px-6 py-4 text-slate-600 dark:text-gray-300">{item.status_transaksi}</td>
                    <td className="px-6 py-4 text-slate-500">{item.metode_bayar ?? "-"}</td>
                    <td className="px-6 py-4"><AdminBadge variant={item.status_proses === "diproses" ? "success" : item.status_proses === "gagal" ? "danger" : "warning"} dot>{item.status_proses}</AdminBadge></td>
                    <td className="px-6 py-4 text-slate-500">{new Date(item.diterima_pada).toLocaleString("id-ID")}</td>
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
