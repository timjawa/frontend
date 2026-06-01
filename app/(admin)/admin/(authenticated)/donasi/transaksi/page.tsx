"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import AdminBadge from "@/components/admin/ui/AdminBadge";
import api from "@/lib/api";
import {
  HiOutlineCalendar,
  HiOutlineCreditCard,
  HiOutlineCheckCircle,
  HiOutlineClock,
  HiOutlineBanknotes,
  HiOutlineExclamationTriangle,
} from "react-icons/hi2";

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
type Stats = { total: number; berhasil: number; menunggu: number; gagal: number; total_nominal: number };
type ApiError = { response?: { data?: { message?: string } } };

const formatCurrency = (value: string | number | null | undefined) =>
  new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(Number(value ?? 0));

const badgeVariant = (status: string): "success" | "warning" | "danger" | "default" =>
  status === "berhasil" ? "success" : status === "menunggu" ? "warning" : status === "gagal" ? "danger" : "default";

const formatPaymentMethod = (value?: string | null) => {
  if (!value) return "-";

  const labels: Record<string, string> = {
    bank_transfer: "Bank Transfer",
    credit_card: "Credit Card",
    gopay: "GoPay",
    shopeepay: "ShopeePay",
    qris: "QRIS",
    echannel: "Mandiri Bill",
    cstore: "Convenience Store",
    bca_klikpay: "BCA KlikPay",
    bca_klikbca: "KlikBCA",
    bri_epay: "BRI ePay",
    cimb_clicks: "CIMB Clicks",
    danamon_online: "Danamon Online",
  };

  return labels[value] ?? value
    .split("_")
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

export default function TransaksiDonasiPage() {
  const [data, setData] = useState<DonasiRow[]>([]);
  const [meta, setMeta] = useState<Meta | null>(null);
  const [stats, setStats] = useState<Stats | null>(null);
  const [kampanye, setKampanye] = useState<KampanyeOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("");
  const [kampanyeId, setKampanyeId] = useState("");
  const [transactionDate, setTransactionDate] = useState("");
  const [page, setPage] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const transactionDateRef = useRef<HTMLInputElement>(null);

  const openTransactionDatePicker = () => {
    const input = transactionDateRef.current;
    if (!input) return;

    if (typeof input.showPicker === "function") {
      input.showPicker();
      return;
    }

    input.focus();
  };

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [list, campaigns] = await Promise.all([
        api.get("/api/admin/donasi/transaksi", {
          headers: { "Cache-Control": "no-cache" },
          params: {
            page,
            per_page: 10,
            status,
            kampanye_id: kampanyeId,
            start_date: transactionDate,
            end_date: transactionDate,
            _: Date.now(),
          },
        }),
        api.get("/api/admin/donasi/kampanye", { params: { per_page: 100, _: Date.now() } }),
      ]);
      const rows = list.data.data ?? [];
      setData(rows);
      setMeta({ current_page: list.data.current_page, last_page: list.data.last_page, total: list.data.total, from: list.data.from, to: list.data.to });
      setKampanye(campaigns.data.data ?? []);

      // Compute stats from all data (use summary if available, otherwise compute from list)
      if (list.data.stats) {
        setStats(list.data.stats);
      } else {
        // Fetch stats separately from all-data endpoint
        try {
          const allRes = await api.get("/api/admin/donasi/transaksi", {
            params: { per_page: 1000, _: Date.now() },
            headers: { "Cache-Control": "no-cache" },
          });
          const allRows: DonasiRow[] = allRes.data.data ?? [];
          const berhasil = allRows.filter((r) => r.status === "berhasil").length;
          const menunggu = allRows.filter((r) => r.status === "menunggu").length;
          const gagal = allRows.filter((r) => r.status === "gagal").length;
          const total_nominal = allRows
            .filter((r) => r.status === "berhasil")
            .reduce((sum, r) => sum + Number(r.nominal), 0);
          setStats({ total: allRows.length, berhasil, menunggu, gagal, total_nominal });
        } catch {
          // Stats not critical, ignore error
        }
      }
    } catch (err: unknown) {
      setError(getApiMessage(err, "Gagal memuat transaksi donasi."));
    } finally {
      setLoading(false);
    }
  }, [page, status, kampanyeId, transactionDate]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const pages = meta ? Array.from({ length: meta.last_page }, (_, i) => i + 1) : [];

  return (
    <div>
      <PageBreadcrumb pageTitle="Transaksi Donasi" />

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Stat
          icon={<HiOutlineCreditCard />}
          label="Total Transaksi"
          value={loading ? "-" : stats?.total ?? meta?.total ?? 0}
        />
        <Stat
          icon={<HiOutlineCheckCircle />}
          label="Berhasil"
          value={loading ? "-" : stats?.berhasil ?? 0}
          tone="emerald"
        />
        <Stat
          icon={<HiOutlineClock />}
          label="Menunggu"
          value={loading ? "-" : stats?.menunggu ?? 0}
          tone="amber"
        />
        <Stat
          icon={<HiOutlineBanknotes />}
          label="Dana Terkumpul"
          value={loading ? "-" : formatCurrency(stats?.total_nominal)}
          tone="sky"
        />
      </div>

      <div className="min-h-screen rounded-2xl border border-gray-200 bg-white px-5 py-3 dark:border-gray-800 dark:bg-white/[0.03] xl:px-10 xl:py-8">
        <div className="bg-white/80 dark:bg-gray-900/50 backdrop-blur-sm rounded-2xl ring-1 ring-slate-100 dark:ring-gray-800 shadow-sm overflow-hidden">
          <div className="px-6 py-4 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 border-b border-slate-100 dark:border-gray-800">
            <div>
              <h3 className="text-base font-bold text-[#1B2E4B] dark:text-white">Daftar Transaksi</h3>
              <p className="text-xs text-slate-400 dark:text-gray-500 mt-0.5">Pantau status pembayaran dan data Midtrans</p>
            </div>
            <div className="flex items-center justify-start lg:justify-end gap-2.5 flex-wrap">
              <select value={kampanyeId} onChange={(e) => { setKampanyeId(e.target.value); setPage(1); }} className="px-3 py-2 text-sm rounded-lg bg-slate-50 dark:bg-gray-800 border border-slate-200 dark:border-gray-700 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900 outline-none transition-all text-gray-700 dark:text-gray-300">
                <option value="">Semua Kampanye</option>
                {kampanye.map((item) => <option key={item.id} value={item.id}>{item.judul}</option>)}
              </select>
              <select value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }} className="px-3 py-2 text-sm rounded-lg bg-slate-50 dark:bg-gray-800 border border-slate-200 dark:border-gray-700 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900 outline-none transition-all text-gray-700 dark:text-gray-300">
                <option value="">Semua Status</option>
                <option value="menunggu">Menunggu</option>
                <option value="berhasil">Berhasil</option>
                <option value="gagal">Gagal</option>
                <option value="kedaluwarsa">Kedaluwarsa</option>
              </select>
              <div className="relative w-full sm:w-44 lg:w-48">
                <button
                  type="button"
                  onClick={openTransactionDatePicker}
                  aria-label="Pilih tanggal transaksi"
                  className="absolute left-2.5 top-1/2 -translate-y-1/2 rounded-md p-1 text-slate-400 hover:text-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900"
                >
                  <HiOutlineCalendar className="w-4 h-4" />
                </button>
                <input
                  ref={transactionDateRef}
                  type="date"
                  value={transactionDate}
                  onChange={(e) => {
                    setTransactionDate(e.target.value);
                    setPage(1);
                  }}
                  aria-label="Filter tanggal transaksi"
                  className="w-full pl-9 pr-4 py-2 text-sm rounded-lg bg-slate-50 dark:bg-gray-800 border border-slate-200 dark:border-gray-700 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900 focus:bg-white dark:focus:bg-gray-900 outline-none transition-all text-gray-700 dark:text-gray-200"
                />
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="bg-slate-50/80 dark:bg-gray-800/50">
                  {["No", "Order ID", "Donatur", "Kampanye", "Nominal", "Metode", "Status", "Tanggal"].map((head) => (
                    <th key={head} className={`px-6 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-gray-500 ${head === "No" ? "w-12 text-center" : ""}`}>{head}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-gray-800">
                {loading ? Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">{Array.from({ length: 8 }).map((__, j) => <td key={j} className="px-6 py-4"><div className="h-4 bg-slate-100 dark:bg-gray-800 rounded-md" /></td>)}</tr>
                )) : error ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-12 text-center text-red-500">
                      <HiOutlineExclamationTriangle className="w-8 h-8 mx-auto mb-2" />
                      {error}
                      <button onClick={fetchData} className="block mx-auto mt-2 text-sm font-semibold text-blue-600 hover:underline">Coba Lagi</button>
                    </td>
                  </tr>
                ) : data.length === 0 ? (
                  <tr><td colSpan={8} className="px-6 py-12 text-center text-slate-400 dark:text-gray-500"><HiOutlineCreditCard className="w-10 h-10 mx-auto mb-2 text-slate-300 dark:text-gray-600" /><p>Belum ada transaksi donasi.</p></td></tr>
                ) : data.map((item, index) => {
                  const midtransStatus = item.pembayaran?.status_transaksi?.toLowerCase();
                  const displayStatus = item.status === "menunggu" && ["settlement", "capture"].includes(midtransStatus ?? "")
                    ? "berhasil"
                    : item.status;

                  return (
                    <tr key={item.id} className="hover:bg-blue-50/40 dark:hover:bg-gray-800/40 transition-colors">
                      <td className="px-6 py-4 text-center text-slate-500 dark:text-gray-400 font-medium">{meta ? (meta.from ?? 1) + index : index + 1}</td>
                      <td className="px-6 py-4 font-mono text-xs text-slate-600">{item.pembayaran?.order_id ?? "-"}</td>
                      <td className="px-6 py-4 font-semibold text-[#1B2E4B] dark:text-gray-200">{item.anonim ? "Anonim" : item.nama_donatur ?? "-"}</td>
                      <td className="px-6 py-4 text-slate-600 dark:text-gray-300">{item.kampanye?.judul ?? "-"}</td>
                      <td className="px-6 py-4 font-semibold text-slate-700 dark:text-gray-200">{formatCurrency(item.nominal)}</td>
                      <td className="px-6 py-4 text-slate-500">{formatPaymentMethod(item.pembayaran?.metode_bayar)}</td>
                      <td className="px-6 py-4"><AdminBadge variant={badgeVariant(displayStatus)} dot>{displayStatus}</AdminBadge></td>
                      <td className="px-6 py-4 text-slate-500">{new Date(item.created_at).toLocaleDateString("id-ID")}</td>
                    </tr>
                  );
                })}
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
