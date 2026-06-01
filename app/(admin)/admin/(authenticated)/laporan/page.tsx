"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import AdminBadge from "@/components/admin/ui/AdminBadge";
import api from "@/lib/api";
import { HiOutlineCalendar, HiOutlineDocumentText, HiOutlinePrinter } from "react-icons/hi2";

type ReportType = "pengaduan" | "donasi";

type LaporanBencana = {
  id: string;
  dibuat_pada: string;
  status: string;
  jenis_bencana: string;
  alamat_lengkap?: string | null;
  user?: { name?: string | null; email?: string | null } | null;
  kecamatan?: { nama?: string | null } | null;
};

type KampanyeDonasi = {
  id: string;
  judul: string;
  jenis_bencana: string;
  target_donasi: string | number;
  total_terkumpul: string | number;
  total_disalurkan: string | number;
  sisa_dana?: string | number;
  progress_persen?: string | number;
  status: string;
  tanggal_mulai?: string | null;
  tanggal_selesai?: string | null;
  kecamatan?: { nama?: string | null } | null;
};

type DonasiHistory = {
  id: string;
  nominal: string | number;
  status: string;
  anonim: boolean;
  nama_donatur?: string | null;
  created_at: string;
  kampanye?: { judul?: string | null } | null;
  user?: { name?: string | null; email?: string | null } | null;
  pembayaran?: { order_id?: string | null; metode_bayar?: string | null; status_transaksi?: string | null } | null;
};

const ST: Record<string, { label: string; variant: "success" | "info" | "warning" | "danger" | "default" }> = {
  baru: { label: "Baru", variant: "info" },
  diverifikasi: { label: "Diverifikasi", variant: "warning" },
  selesai: { label: "Selesai", variant: "success" },
  ditolak: { label: "Ditolak", variant: "danger" },
  aktif: { label: "Aktif", variant: "success" },
  draft: { label: "Draft", variant: "warning" },
  ditutup: { label: "Ditutup", variant: "default" },
};

const formatCurrency = (value: string | number | null | undefined) =>
  new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(Number(value ?? 0));

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

const formatDate = (value?: string | null) => {
  if (!value) return "-";
  const datePart = value.slice(0, 10);
  const [year, month, day] = datePart.split("-");
  return day && month && year ? `${day}/${month}/${year}` : value;
};

const filterLabelClass = "block text-xs font-semibold text-gray-600 dark:text-gray-300 mb-1.5";
const filterControlClass =
  "w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-900 shadow-sm outline-none transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:border-gray-700 dark:bg-gray-900/60 dark:text-gray-100 dark:focus:border-blue-400 dark:focus:ring-blue-500/20";
const dateInputClass = `${filterControlClass} pl-10 pr-3 md:w-56 cursor-pointer`;

async function fetchAllCampaigns() {
  const rows: KampanyeDonasi[] = [];
  let page = 1;
  let lastPage = 1;

  do {
    const res = await api.get("/api/admin/donasi/kampanye", {
      params: { page, per_page: 50, _: Date.now() },
      headers: { "Cache-Control": "no-cache" },
    });
    rows.push(...(res.data.data ?? []));
    lastPage = Number(res.data.last_page ?? 1);
    page += 1;
  } while (page <= lastPage);

  return rows;
}

async function fetchAllDonationHistory(kampanyeId?: string) {
  const rows: DonasiHistory[] = [];
  let page = 1;
  let lastPage = 1;

  do {
    const res = await api.get("/api/admin/donasi/transaksi", {
      params: {
        page,
        per_page: 50,
        status: "berhasil",
        kampanye_id: kampanyeId || undefined,
        _: Date.now(),
      },
      headers: { "Cache-Control": "no-cache" },
    });
    rows.push(...(res.data.data ?? []));
    lastPage = Number(res.data.last_page ?? 1);
    page += 1;
  } while (page <= lastPage);

  return rows;
}

export default function LaporanPage() {
  const [reportType, setReportType] = useState<ReportType>("pengaduan");
  const [laporanData, setLaporanData] = useState<LaporanBencana[]>([]);
  const [kampanyeData, setKampanyeData] = useState<KampanyeDonasi[]>([]);
  const [donasiHistory, setDonasiHistory] = useState<DonasiHistory[]>([]);
  const [loading, setLoading] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [filterHari, setFilterHari] = useState("all");
  const [kampanyeId, setKampanyeId] = useState("");
  const startDateRef = useRef<HTMLInputElement>(null);
  const endDateRef = useRef<HTMLInputElement>(null);

  const isDonationReport = reportType === "donasi";

  const selectedCampaign = kampanyeData.find((item) => item.id === kampanyeId);
  const totalCollected = donasiHistory.reduce((sum, item) => sum + Number(item.nominal ?? 0), 0);
  const uniqueDonors = new Set(donasiHistory.map((item) => (item.anonim ? `anonim-${item.id}` : item.user?.email || item.nama_donatur || item.id))).size;
  const selectedCampaignPeriod = selectedCampaign
    ? `${formatDate(selectedCampaign.tanggal_mulai)} - ${formatDate(selectedCampaign.tanggal_selesai)}`
    : "-";

  const activeCount = isDonationReport ? donasiHistory.length : laporanData.length;
  const reportTitle = isDonationReport ? "Laporan Donasi Kampanye" : "Laporan Pengaduan Bencana";
  const printedAt = new Date().toLocaleDateString("id-ID", { year: "numeric", month: "long", day: "numeric" });
  const reportPeriod =
    startDate && endDate
      ? `${formatDate(startDate)} - ${formatDate(endDate)}`
      : startDate
        ? `Mulai dari ${formatDate(startDate)}`
        : endDate
          ? `Hingga ${formatDate(endDate)}`
          : "Semua Waktu";

  const openDatePicker = (input: HTMLInputElement | null) => {
    if (!input) return;
    input.focus();
    if (typeof (input as HTMLInputElement & { showPicker?: () => void }).showPicker === "function") {
      (input as HTMLInputElement & { showPicker: () => void }).showPicker();
    } else {
      input.click();
    }
  };

  const handleFilterHariChange = (val: string) => {
    setFilterHari(val);
    if (val === "all") {
      setStartDate("");
      setEndDate("");
    } else if (val !== "custom") {
      const days = parseInt(val);
      const end = new Date();
      const start = new Date();
      start.setDate(end.getDate() - days);
      setEndDate(end.toISOString().split("T")[0]);
      setStartDate(start.toISOString().split("T")[0]);
    }
  };

  const fetchLaporanPengaduan = useCallback(async () => {
    const params: Record<string, string | number> = { per_page: 500 };
    if (startDate) params.start_date = startDate;
    if (endDate) params.end_date = endDate;

    const res = await api.get("/api/admin/laporan", { params });
    const results = (res.data.data ?? []).filter((item: LaporanBencana) => item.status === "diverifikasi" || item.status === "selesai");
    setLaporanData(results);
  }, [startDate, endDate]);

  const fetchLaporanDonasi = useCallback(async () => {
    const [campaigns, history] = await Promise.all([
      fetchAllCampaigns(),
      fetchAllDonationHistory(kampanyeId),
    ]);
    setKampanyeData(campaigns);
    setDonasiHistory(history);
  }, [kampanyeId]);

  useEffect(() => {
    let active = true;
    setLoading(true);
    const request = reportType === "donasi" ? fetchLaporanDonasi() : fetchLaporanPengaduan();
    request
      .catch((error) => console.error("Gagal memuat laporan", error))
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [reportType, fetchLaporanDonasi, fetchLaporanPengaduan]);

  const handlePrint = () => window.print();

  return (
    <>
      <style dangerouslySetInnerHTML={{
        __html: `
        @media print {
          html, body {
            background: #fff !important;
            color: #111827 !important;
            font-family: Arial, Helvetica, sans-serif !important;
            font-size: 11px !important;
          }
          body * { visibility: hidden; }
          #printable-report, #printable-report * { visibility: visible; }
          #printable-report {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            padding: 0;
            background: white !important;
            border: 0 !important;
            border-radius: 0 !important;
            box-shadow: none !important;
            color: #111827 !important;
          }
          .no-print { display: none !important; }
          .print-only { display: block !important; }
          .print-report-card { border: 0 !important; border-radius: 0 !important; box-shadow: none !important; padding: 0 !important; background: #fff !important; }
          .print-screen-summary { display: none !important; }
          .print-letterhead {
            display: grid !important;
            grid-template-columns: 64px 1fr 64px;
            align-items: center;
            gap: 12px;
            padding-bottom: 10px;
            border-bottom: 3px double #111827;
            text-align: center;
          }
          .print-logo-box { width: 56px; height: 56px; display: flex; align-items: center; justify-content: center; }
          .print-agency { font-size: 15px; line-height: 1.25; font-weight: 700; text-transform: uppercase; }
          .print-system { font-size: 12px; line-height: 1.35; font-weight: 700; text-transform: uppercase; }
          .print-address { margin-top: 3px; font-size: 10px; font-weight: 400; line-height: 1.35; }
          .print-title { margin: 18px 0 12px; text-align: center; }
          .print-title h1 { margin: 0; font-size: 14px; font-weight: 700; text-decoration: underline; text-transform: uppercase; letter-spacing: 0.02em; }
          .print-meta { display: grid !important; grid-template-columns: 1fr; gap: 6px; margin-bottom: 14px; font-size: 10px; }
          .print-meta-row { display: grid !important; grid-template-columns: 110px 8px 1fr; }
          .print-meta-two-col {
            display: grid !important;
            grid-template-columns: minmax(0, 1fr) 300px;
            column-gap: 24px;
            margin-bottom: 8px;
          }
          .print-meta-right {
            justify-self: end;
            width: 300px;
          }
          .print-total { font-weight: 700; }
          .print-table-wrap { overflow: visible !important; }
          .print-table { width: 100% !important; border-collapse: collapse !important; table-layout: fixed; font-size: 9px !important; }
          .print-table thead tr { background: #e5e7eb !important; border: 1px solid #111827 !important; }
          .print-table th, .print-table td { border: 1px solid #111827 !important; padding: 5px 6px !important; color: #111827 !important; vertical-align: top; }
          .print-table th { text-align: center; font-weight: 700; text-transform: uppercase; }
          .print-table tbody tr { break-inside: avoid; }
          .print-no { width: 34px; text-align: center; }
          .print-date { width: 72px; white-space: nowrap; }
          .print-person { width: 138px; }
          .print-status { width: 72px; text-align: center; }
          .print-status-text { border: 0 !important; padding: 0 !important; font-weight: 700; text-transform: uppercase; }
          .print-empty { padding: 24px !important; text-align: center; font-style: italic; }
          .print-signatures { display: grid !important; grid-template-columns: 1fr 1fr; gap: 80px; margin-top: 28px; font-size: 10px; }
          .print-signature-block { text-align: center; }
          .print-signature-space { height: 56px; }
          .print-signature-name { display: inline-block; min-width: 180px; border-bottom: 1px solid #111827; font-weight: 700; }
          .print-footer-note { margin-top: 16px; padding-top: 6px; border-top: 1px solid #9ca3af; font-size: 8px; color: #374151 !important; }
          @page { size: landscape; margin: 1.2cm; }
        }
      `}} />

      <div className="no-print">
        <PageBreadcrumb pageTitle={reportTitle} />
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-white/[0.03] mb-6 no-print">
        <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-4">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:flex gap-4 w-full">
            <div>
              <label className={filterLabelClass}>Jenis Laporan</label>
              <select value={reportType} onChange={(e) => setReportType(e.target.value as ReportType)} className={`${filterControlClass} md:w-64`}>
                <option value="pengaduan">Laporan Pengaduan Bencana</option>
                <option value="donasi">Laporan Donasi Kampanye</option>
              </select>
            </div>

            {isDonationReport ? (
              <div>
                <label className={filterLabelClass}>Kampanye</label>
                <select value={kampanyeId} onChange={(e) => setKampanyeId(e.target.value)} className={`${filterControlClass} md:w-72`}>
                  <option value="">Semua Kampanye</option>
                  {kampanyeData.map((item) => (
                    <option key={item.id} value={item.id}>{item.judul}</option>
                  ))}
                </select>
              </div>
            ) : (
              <>
                <div className="print-meta-right">
                  <label className={filterLabelClass}>Dari Tanggal</label>
                  <div className="relative">
                    <button type="button" onClick={() => openDatePicker(startDateRef.current)} className="absolute left-3 top-1/2 z-10 -translate-y-1/2 text-gray-400 transition-colors hover:text-blue-600 dark:text-gray-500 dark:hover:text-blue-400" aria-label="Pilih dari tanggal">
                      <HiOutlineCalendar className="w-4 h-4" />
                    </button>
                    <input type="text" value={formatDate(startDate)} onClick={() => openDatePicker(startDateRef.current)} readOnly className={dateInputClass} placeholder="dd/mm/yyyy" />
                    <input ref={startDateRef} type="date" value={startDate} onChange={(e) => { setStartDate(e.target.value); setFilterHari("custom"); }} className="absolute inset-0 h-full w-full opacity-0 pointer-events-none [color-scheme:light] dark:[color-scheme:dark]" tabIndex={-1} aria-hidden="true" />
                  </div>
                </div>

                <div>
                  <label className={filterLabelClass}>Sampai Tanggal</label>
                  <div className="relative">
                    <button type="button" onClick={() => openDatePicker(endDateRef.current)} className="absolute left-3 top-1/2 z-10 -translate-y-1/2 text-gray-400 transition-colors hover:text-blue-600 dark:text-gray-500 dark:hover:text-blue-400" aria-label="Pilih sampai tanggal">
                      <HiOutlineCalendar className="w-4 h-4" />
                    </button>
                    <input type="text" value={formatDate(endDate)} onClick={() => openDatePicker(endDateRef.current)} readOnly className={dateInputClass} placeholder="dd/mm/yyyy" />
                    <input ref={endDateRef} type="date" value={endDate} onChange={(e) => { setEndDate(e.target.value); setFilterHari("custom"); }} className="absolute inset-0 h-full w-full opacity-0 pointer-events-none [color-scheme:light] dark:[color-scheme:dark]" tabIndex={-1} aria-hidden="true" />
                  </div>
                </div>

                <div>
                  <label className={filterLabelClass}>Filter Periode</label>
                  <select value={filterHari} onChange={(e) => handleFilterHariChange(e.target.value)} className={`${filterControlClass} md:w-56`}>
                    <option value="all">Semua Waktu</option>
                    <option value="7">7 Hari Terakhir</option>
                    <option value="30">30 Hari Terakhir</option>
                    <option value="custom">Kustom Tanggal</option>
                  </select>
                </div>
              </>
            )}
          </div>

          <button onClick={handlePrint} disabled={loading || activeCount === 0} className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 active:scale-95 transition-all shadow-sm shadow-blue-200 disabled:opacity-60 disabled:cursor-not-allowed whitespace-nowrap">
            <HiOutlinePrinter className="w-4 h-4" /> Export PDF
          </button>
        </div>
      </div>

      <div id="printable-report" className="print-report-card rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-white/[0.03]">
        <div className="print-only hidden">
          <div className="print-letterhead">
            <div className="print-logo-box">
              <img src="/Lambang-kabupaten-jember.png" alt="Lambang Kabupaten Jember" className="w-full h-full object-contain" />
            </div>
            <div>
              <div className="print-agency">Pemerintah Kabupaten Jember</div>
              <div className="print-system">Jember Siaga - Sistem Pengaduan Bencana</div>
              <div className="print-address">Laporan administrasi pengaduan bencana dan donasi masyarakat Kabupaten Jember</div>
            </div>
            <div className="print-logo-box">
              <img src="/logo.svg" alt="Logo Jember Siaga" className="w-full h-full object-contain" />
            </div>
          </div>

          <div className="print-title">
            <h1>{reportTitle}</h1>
          </div>

          <div className="print-meta">
            {isDonationReport && selectedCampaign ? (
              <div className="print-meta-two-col">
                <div>
                  <div className="print-meta-row">
                    <span>Kampanye</span>
                    <span>:</span>
                    <span>{selectedCampaign.judul}</span>
                  </div>
                  <div className="print-meta-row">
                    <span>Jenis Bencana</span>
                    <span>:</span>
                    <span>{selectedCampaign.jenis_bencana || "-"}</span>
                  </div>
                  <div className="print-meta-row">
                    <span>Kecamatan</span>
                    <span>:</span>
                    <span>{selectedCampaign.kecamatan?.nama || "-"}</span>
                  </div>
                  <div className="print-meta-row">
                    <span>Periode Kampanye</span>
                    <span>:</span>
                    <span>{selectedCampaignPeriod}</span>
                  </div>
                </div>
                <div>
                  <div className="print-meta-row">
                    <span>Target Donasi</span>
                    <span>:</span>
                    <span>{formatCurrency(selectedCampaign.target_donasi)}</span>
                  </div>
                  <div className="print-meta-row">
                    <span>Total Data</span>
                    <span>:</span>
                    <span className="print-total">{activeCount} donasi</span>
                  </div>
                  <div className="print-meta-row">
                    <span>Total Terkumpul</span>
                    <span>:</span>
                    <span className="print-total">{formatCurrency(totalCollected)}</span>
                  </div>
                  <div className="print-meta-row">
                    <span>Dana Disalurkan</span>
                    <span>:</span>
                    <span>{formatCurrency(selectedCampaign.total_disalurkan)}</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="print-meta-row">
                <span>{isDonationReport ? "Kampanye" : "Periode"}</span>
                <span>:</span>
                <span>{isDonationReport ? "Semua Kampanye" : reportPeriod}</span>
              </div>
            )}
            {(!isDonationReport || !selectedCampaign) && (
              <div className="print-meta-row">
                <span>Total Data</span>
                <span>:</span>
                <span className="print-total">{activeCount} {isDonationReport ? "donasi" : "laporan"}</span>
              </div>
            )}
            {isDonationReport && !selectedCampaign && (
              <div className="print-meta-row">
                <span>Total Terkumpul</span>
                <span>:</span>
                <span className="print-total">{formatCurrency(totalCollected)}</span>
              </div>
            )}
          </div>
        </div>

        <div className="print-screen-summary mb-6 pb-4 border-b border-gray-100 flex items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white uppercase tracking-wide">{reportTitle}</h2>
            <p className="text-sm text-gray-500 mt-1">
              {isDonationReport ? `Kampanye: ${selectedCampaign?.judul ?? "Semua Kampanye"}` : `Periode: ${reportPeriod}`}
            </p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-blue-600">{activeCount}</div>
            <div className="text-xs font-medium text-gray-500 uppercase tracking-wider">{isDonationReport ? "Total Donasi" : "Total Laporan"}</div>
          </div>
        </div>

        {isDonationReport ? (
          <DonationReportTable
            rows={donasiHistory}
            loading={loading}
            totalCollected={totalCollected}
            uniqueDonors={uniqueDonors}
          />
        ) : (
          <ComplaintReportTable rows={laporanData} loading={loading} />
        )}

        <div className="hidden print:block mt-16 text-sm text-gray-600">
          <div className="print-signatures">
            <div className="print-signature-block">
              <p>Mengetahui,</p>
              <p>Koordinator Penanganan</p>
              <div className="print-signature-space" />
              <span className="print-signature-name">&nbsp;</span>
              <p>NIP. ................................</p>
            </div>
            <div className="print-signature-block">
              <p>Jember, {printedAt}</p>
              <p>Petugas / Admin BPBD</p>
              <div className="print-signature-space" />
              <span className="print-signature-name">&nbsp;</span>
              <p>NIP. ................................</p>
            </div>
          </div>
          <div className="print-footer-note">
            Dokumen ini dicetak dari Sistem JESI (Jember Siaga) dan digunakan sebagai rekap administrasi.
          </div>
        </div>
      </div>
    </>
  );
}

function ComplaintReportTable({ rows, loading }: { rows: LaporanBencana[]; loading: boolean }) {
  return (
    <div className="print-table-wrap overflow-x-auto">
      <table className="print-table w-full text-left text-sm border-collapse">
        <thead>
          <tr className="bg-gray-50/80 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-800">
            {["No", "Tanggal", "Pelapor", "Jenis Bencana", "Kecamatan", "Alamat", "Status"].map((head) => (
              <th key={head} className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-400 whitespace-nowrap">{head}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
          {loading ? (
            <LoadingRow colSpan={7} label="Memuat laporan..." />
          ) : rows.length === 0 ? (
            <EmptyRow colSpan={7} label="Tidak ada laporan pengaduan pada filter ini." />
          ) : (
            rows.map((item, idx) => {
              const st = ST[item.status] ?? { label: item.status, variant: "default" as const };
              return (
                <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors">
                  <td className="print-no px-4 py-3 text-center text-gray-500 dark:text-gray-400">{idx + 1}</td>
                  <td className="print-date px-4 py-3 text-gray-700 dark:text-gray-300 whitespace-nowrap">{formatDate(item.dibuat_pada)}</td>
                  <td className="print-person px-4 py-3">
                    <div className="font-medium text-gray-900 dark:text-gray-200">{item.user?.name || "Anonim"}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">{item.user?.email || "-"}</div>
                  </td>
                  <td className="px-4 py-3 font-semibold text-gray-800 dark:text-gray-200">{item.jenis_bencana}</td>
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{item.kecamatan?.nama || "-"}</td>
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-400 max-w-[200px] truncate" title={item.alamat_lengkap || undefined}>{item.alamat_lengkap || "-"}</td>
                  <td className="print-status px-4 py-3">
                    <StatusCell label={st.label} variant={st.variant} />
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}

function DonationReportTable({
  rows,
  loading,
  totalCollected,
  uniqueDonors,
}: {
  rows: DonasiHistory[];
  loading: boolean;
  totalCollected: number;
  uniqueDonors: number;
}) {
  return (
    <>
      <div className="print-screen-summary grid grid-cols-1 md:grid-cols-2 gap-3 mb-5">
        <SummaryCard label="Jumlah Donatur" value={`${uniqueDonors} orang`} />
        <SummaryCard label="Dana Terkumpul" value={formatCurrency(totalCollected)} />
      </div>
      <div className="print-table-wrap overflow-x-auto">
        <table className="print-table w-full text-left text-sm border-collapse">
          <thead>
            <tr className="bg-gray-50/80 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-800">
              {["No", "Tanggal", "Order ID", "Donatur", "Kampanye", "Nominal", "Metode", "Status"].map((head) => (
                <th key={head} className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-400 whitespace-nowrap">{head}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
            {loading ? (
              <LoadingRow colSpan={8} label="Memuat laporan donasi..." />
            ) : rows.length === 0 ? (
              <EmptyRow colSpan={8} label="Belum ada riwayat donasi berhasil pada filter ini." />
            ) : (
              rows.map((item, idx) => {
                const st = ST[item.status] ?? { label: item.status, variant: "default" as const };
                const donorName = item.anonim ? "Anonim" : item.nama_donatur || item.user?.name || "Anonim";
                return (
                  <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors">
                    <td className="print-no px-4 py-3 text-center text-gray-500 dark:text-gray-400">{idx + 1}</td>
                    <td className="print-date px-4 py-3 text-gray-700 dark:text-gray-300 whitespace-nowrap">{formatDate(item.created_at)}</td>
                    <td className="px-4 py-3 font-mono text-xs text-gray-600 dark:text-gray-400">{item.pembayaran?.order_id || "-"}</td>
                    <td className="print-person px-4 py-3">
                      <div className="font-semibold text-gray-900 dark:text-gray-200">{donorName}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">{item.anonim ? "-" : item.user?.email || "-"}</div>
                    </td>
                    <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{item.kampanye?.judul || "-"}</td>
                    <td className="px-4 py-3 font-semibold text-gray-900 dark:text-gray-200 whitespace-nowrap">{formatCurrency(item.nominal)}</td>
                    <td className="px-4 py-3 text-gray-700 dark:text-gray-300 whitespace-nowrap">{formatPaymentMethod(item.pembayaran?.metode_bayar)}</td>
                    <td className="print-status px-4 py-3">
                      <StatusCell label={st.label} variant={st.variant} />
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}

function StatusCell({ label, variant }: { label: string; variant: "success" | "info" | "warning" | "danger" | "default" }) {
  return (
    <div className="print-status-text print:border print:border-gray-300 print:text-black print:px-2 print:py-1 print:rounded-md inline-block">
      <span className="print:hidden">
        <AdminBadge variant={variant} dot>{label}</AdminBadge>
      </span>
      <span className="hidden print:inline text-xs font-bold uppercase">{label}</span>
    </div>
  );
}

function SummaryCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-gray-100 bg-gray-50/70 p-4 dark:border-gray-800 dark:bg-gray-900/40">
      <div className="text-xs font-semibold uppercase tracking-wider text-gray-500">{label}</div>
      <div className="mt-1 text-lg font-bold text-gray-900 dark:text-white">{value}</div>
    </div>
  );
}

function LoadingRow({ colSpan, label }: { colSpan: number; label: string }) {
  return (
    <tr>
      <td colSpan={colSpan} className="px-4 py-8 text-center text-gray-400 dark:text-gray-500">
        <span className="inline-block w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mb-2" />
        <p>{label}</p>
      </td>
    </tr>
  );
}

function EmptyRow({ colSpan, label }: { colSpan: number; label: string }) {
  return (
    <tr>
      <td colSpan={colSpan} className="print-empty px-4 py-12 text-center text-gray-400 dark:text-gray-500">
        <HiOutlineDocumentText className="w-10 h-10 mx-auto mb-2 text-gray-300 dark:text-gray-600" />
        <p>{label}</p>
      </td>
    </tr>
  );
}
