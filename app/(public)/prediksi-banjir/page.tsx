"use client";

import { useEffect, useMemo, useState } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import {
  HiArrowPath,
  HiMagnifyingGlass,
  HiOutlineChartBarSquare,
  HiOutlineCloud,
  HiOutlineExclamationTriangle,
  HiOutlineMapPin,
  HiOutlineShieldCheck,
  HiOutlineSignal,
} from "react-icons/hi2";
import {
  fetchRealtimeFloodPredictions,
  FloodPredictionResponse,
  FloodPredictionRow,
} from "@/services/floodPrediction";

const riskStyle: Record<FloodPredictionRow["kategori_risiko"], string> = {
  rendah: "bg-emerald-50 text-emerald-700 border-emerald-200",
  sedang: "bg-amber-50 text-amber-700 border-amber-200",
  tinggi: "bg-orange-50 text-orange-700 border-orange-200",
  kritis: "bg-red-50 text-red-700 border-red-200",
};

const rawanStyle: Record<FloodPredictionRow["level_rawan"], string> = {
  rendah: "bg-slate-50 text-slate-600 border-slate-200",
  sedang: "bg-blue-50 text-blue-700 border-blue-200",
  tinggi: "bg-rose-50 text-rose-700 border-rose-200",
};

const statusStyle: Record<"aman" | "waspada" | "banjir", string> = {
  aman: "bg-emerald-50 text-emerald-700 border-emerald-200",
  waspada: "bg-amber-50 text-amber-700 border-amber-200",
  banjir: "bg-red-50 text-red-700 border-red-200",
};

function getOperationalStatus(row: FloodPredictionRow): "aman" | "waspada" | "banjir" {
  if (row.status_operasional) return row.status_operasional;
  if (row.label === "banjir") return "banjir";
  if (row.kategori_risiko === "tinggi" || row.kategori_risiko === "kritis") return "waspada";
  return "aman";
}

function formatPercent(value: number | null | undefined) {
  if (value == null || Number.isNaN(value)) return "-";
  return `${Math.round(value * 100)}%`;
}

function formatNumber(value: number | null | undefined, suffix = "", digits = 1) {
  if (value == null || Number.isNaN(value)) return "-";
  return `${value.toFixed(digits)}${suffix}`;
}

function formatDateTime(value: string | null | undefined) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  const tanggal = date.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
  const jam = date.toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
  }).replace(".", ":");
  return `${tanggal} ${jam} WIB`;
}

function RiskBadge({ value }: { value: FloodPredictionRow["kategori_risiko"] }) {
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold capitalize ${riskStyle[value]}`}>
      {value}
    </span>
  );
}

function RawanBadge({ value }: { value: FloodPredictionRow["level_rawan"] }) {
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold capitalize ${rawanStyle[value]}`}>
      {value}
    </span>
  );
}

function StatusBadge({ value }: { value: "aman" | "waspada" | "banjir" }) {
  const Icon = value === "banjir" ? HiOutlineExclamationTriangle : HiOutlineShieldCheck;

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold capitalize ${statusStyle[value]}`}>
      <Icon className="w-4 h-4" />
      {value}
    </span>
  );
}

export default function PrediksiBanjirPage() {
  const [search, setSearch] = useState("");
  const [riskFilter, setRiskFilter] = useState<"all" | FloodPredictionRow["kategori_risiko"]>("all");
  const [response, setResponse] = useState<FloodPredictionResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadData = async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);
      setError(null);
      const data = await fetchRealtimeFloodPredictions();
      setResponse(data);
    } catch (err) {
      console.error("Gagal memuat prediksi banjir:", err);
      setError(
        "Prediksi banjir belum bisa dimuat. Pastikan API prediksi dan koneksi database aktif."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const rows = response?.data ?? [];
  const summary = response?.summary;

  const filteredRows = useMemo(() => {
    const query = search.trim().toLowerCase();
    return rows.filter((row) => {
      const matchesSearch =
        !query ||
        row.kecamatan_nama.toLowerCase().includes(query) ||
        row.level_rawan.toLowerCase().includes(query) ||
        row.kategori_risiko.toLowerCase().includes(query);
      const matchesRisk = riskFilter === "all" || row.kategori_risiko === riskFilter;
      return matchesSearch && matchesRisk;
    });
  }, [rows, search, riskFilter]);

  const sortedRows = useMemo(() => {
    return [...filteredRows].sort((a, b) => b.probabilitas_banjir - a.probabilitas_banjir);
  }, [filteredRows]);

  const highRiskCount = (summary?.risiko.tinggi ?? 0) + (summary?.risiko.kritis ?? 0);
  const averageProbability = summary ? formatPercent(summary.probabilitas_rata_rata) : "-";
  const maxProbability = summary ? formatPercent(summary.probabilitas_maksimum) : "-";

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-[#F3F8FF]">
        <section className="pt-28 pb-4">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="relative p-6 sm:p-8">
              <div className="relative z-10 text-center">
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-primary mb-3 tracking-tight">
                  Prediksi Banjir Jember
                </h1>
                <p className="text-slate-600 max-w-2xl mx-auto text-sm sm:text-[15px] leading-relaxed">
                  Tabel ini memakai data cuaca realtime, level kerawanan kecamatan,
                  elevasi, dan laporan banjir 7 hari terakhir untuk memperkirakan
                  risiko banjir di setiap kecamatan.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="pb-6">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm flex items-center gap-4">
                <div className="p-3 rounded-xl bg-blue-50 shrink-0">
                  <HiOutlineMapPin className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-0.5">Total Kecamatan</p>
                  <p className="text-2xl font-bold text-gray-800">{summary?.total_kecamatan ?? rows.length}</p>
                </div>
              </div>
              <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm flex items-center gap-4">
                <div className="p-3 rounded-xl bg-red-50 shrink-0">
                  <HiOutlineExclamationTriangle className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-0.5">Status Banjir</p>
                  <p className="text-2xl font-bold text-gray-800">{summary?.prediksi_banjir ?? 0}</p>
                </div>
              </div>
              <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm flex items-center gap-4">
                <div className="p-3 rounded-xl bg-amber-50 shrink-0">
                  <HiOutlineSignal className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-0.5">Risiko Tinggi+</p>
                  <p className="text-2xl font-bold text-gray-800">{highRiskCount}</p>
                </div>
              </div>
              <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm flex items-center gap-4">
                <div className="p-3 rounded-xl bg-emerald-50 shrink-0">
                  <HiOutlineChartBarSquare className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-0.5">Prob. Rata-rata</p>
                  <p className="text-2xl font-bold text-gray-800">{averageProbability}</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="pb-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-white rounded-2xl shadow-sm border border-border overflow-hidden">
              <div className="px-5 sm:px-6 py-4 border-b border-slate-100 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div>
                  <h2 className="text-base font-bold text-[#1B2E4B]">Tabel Prediksi Banjir</h2>
                  <p className="text-xs text-slate-500 mt-1">
                    Threshold model {response ? response.threshold.toFixed(2) : "0.35"}. Data cuaca terakhir: {formatDateTime(summary?.terakhir_diperbarui)}
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-2.5">
                  <div className="relative">
                    <HiMagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Cari kecamatan atau risiko..."
                      value={search}
                      onChange={(event) => setSearch(event.target.value)}
                      className="pl-9 pr-4 py-2.5 text-sm rounded-lg bg-slate-50 border border-slate-200 text-slate-700 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none transition-all w-full sm:w-64"
                    />
                  </div>
                  <select
                    value={riskFilter}
                    onChange={(event) => setRiskFilter(event.target.value as typeof riskFilter)}
                    className="px-3 py-2.5 text-sm rounded-lg bg-slate-50 border border-slate-200 text-slate-700 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                  >
                    <option value="all">Semua Risiko</option>
                    <option value="rendah">Rendah</option>
                    <option value="sedang">Sedang</option>
                    <option value="tinggi">Tinggi</option>
                    <option value="kritis">Kritis</option>
                  </select>
                  <button
                    type="button"
                    onClick={() => loadData(true)}
                    disabled={refreshing || loading}
                    className={`inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold text-white rounded-lg transition-all ${
                      refreshing || loading ? "bg-blue-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
                    }`}
                  >
                    <HiArrowPath className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
                    {refreshing ? "Memuat..." : "Refresh"}
                  </button>
                </div>
              </div>

              {error && (
                <div className="mx-5 sm:mx-6 mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {error}
                </div>
              )}

              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100">
                      <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-500 w-12 text-center">No</th>
                      <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-500 min-w-[160px]">Kecamatan</th>
                      <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-500">Probabilitas</th>
                      <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-500">Risiko</th>
                      <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-500">Status</th>
                      <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-500">Cuaca</th>
                      <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-500">Kerawanan</th>
                      <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-500">Laporan 7 Hari</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {loading ? (
                      Array.from({ length: 8 }).map((_, index) => (
                        <tr key={index} className="animate-pulse">
                          <td className="px-5 py-4"><div className="h-4 bg-slate-100 rounded w-5 mx-auto" /></td>
                          <td className="px-5 py-4"><div className="h-4 bg-slate-200 rounded w-28" /></td>
                          <td className="px-5 py-4"><div className="h-3 bg-slate-200 rounded w-24" /></td>
                          <td className="px-5 py-4"><div className="h-6 bg-slate-100 rounded-full w-16" /></td>
                          <td className="px-5 py-4"><div className="h-6 bg-slate-100 rounded-full w-20" /></td>
                          <td className="px-5 py-4"><div className="h-4 bg-slate-200 rounded w-24" /></td>
                          <td className="px-5 py-4"><div className="h-6 bg-slate-100 rounded-full w-16" /></td>
                          <td className="px-5 py-4"><div className="h-4 bg-slate-200 rounded w-10" /></td>
                        </tr>
                      ))
                    ) : sortedRows.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="px-5 py-14 text-center text-slate-400">
                          <HiOutlineCloud className="w-10 h-10 mx-auto mb-2 text-slate-300" />
                          Tidak ada data prediksi yang sesuai filter.
                        </td>
                      </tr>
                    ) : (
                      sortedRows.map((row, index) => (
                        <tr key={row.kecamatan_id} className="hover:bg-blue-50/40 transition-colors">
                          <td className="px-5 py-4 text-center text-slate-500 font-medium">{index + 1}</td>
                          <td className="px-5 py-4">
                            <p className="font-semibold text-[#1B2E4B]">{row.kecamatan_nama}</p>
                            <p className="text-xs text-slate-400 mt-1">{formatDateTime(row.fetched_at)}</p>
                          </td>
                          <td className="px-5 py-4 min-w-[150px]">
                            <div className="flex items-center gap-3">
                              <div className="w-24 h-2 bg-slate-100 rounded-full overflow-hidden">
                                <div
                                  className={`h-full rounded-full ${
                                    row.kategori_risiko === "kritis"
                                      ? "bg-red-500"
                                      : row.kategori_risiko === "tinggi"
                                      ? "bg-orange-500"
                                      : row.kategori_risiko === "sedang"
                                      ? "bg-amber-500"
                                      : "bg-emerald-500"
                                  }`}
                                  style={{ width: `${Math.round(row.probabilitas_banjir * 100)}%` }}
                                />
                              </div>
                              <span className="font-bold text-slate-700">{formatPercent(row.probabilitas_banjir)}</span>
                            </div>
                          </td>
                          <td className="px-5 py-4">
                            <RiskBadge value={row.kategori_risiko} />
                          </td>
                          <td className="px-5 py-4">
                            <StatusBadge value={getOperationalStatus(row)} />
                          </td>
                          <td className="px-5 py-4">
                            <p className="font-semibold text-slate-700">{formatNumber(row.curah_hujan, " mm")}</p>
                            <p className="text-xs text-slate-400 mt-1">
                              {formatNumber(row.suhu, "°C")} · {formatNumber(row.kelembapan, "%", 0)}
                            </p>
                          </td>
                          <td className="px-5 py-4">
                            <RawanBadge value={row.level_rawan} />
                            <p className="text-xs text-slate-400 mt-1">Elevasi {formatNumber(row.elevasi, " m", 0)}</p>
                          </td>
                          <td className="px-5 py-4">
                            <span className="font-bold text-slate-700">{row.jumlah_laporan_banjir_7_hari}</span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              <div className="px-5 sm:px-6 py-4 border-t border-slate-100 bg-slate-50/60 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <p className="text-sm text-slate-500">
                  Menampilkan <span className="font-semibold text-slate-700">{sortedRows.length}</span> dari{" "}
                  <span className="font-semibold text-slate-700">{rows.length}</span> kecamatan.
                </p>
                <p className="text-sm text-slate-500">
                  Probabilitas maksimum: <span className="font-semibold text-slate-700">{maxProbability}</span>
                </p>
              </div>
            </div>
          </div>
        </section>

      </main>
      <Footer />
    </>
  );
}
