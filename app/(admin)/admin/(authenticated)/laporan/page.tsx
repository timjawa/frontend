"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import AdminBadge from "@/components/admin/ui/AdminBadge";
import { HiOutlinePrinter, HiOutlineDocumentText, HiOutlineCalendar } from "react-icons/hi2";
import api from "@/lib/api";

const STATUS_OPT = ["baru", "diverifikasi", "ditolak", "selesai"] as const;
const ST: Record<string, { label: string; variant: "success" | "info" | "warning" | "danger" | "default" }> = {
  baru: { label: "Baru", variant: "info" },
  diverifikasi: { label: "Diverifikasi", variant: "warning" },
  selesai: { label: "Selesai", variant: "success" },
  ditolak: { label: "Ditolak", variant: "danger" },
};

type LaporanBencana = {
  id: string;
  dibuat_pada: string;
  status: string;
  jenis_bencana: string;
  alamat_lengkap?: string | null;
  user?: {
    name?: string | null;
    email?: string | null;
  } | null;
  kecamatan?: {
    nama?: string | null;
  } | null;
};

export default function LaporanPage() {
  const [data, setData] = useState<LaporanBencana[]>([]);
  const [loading, setLoading] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const startDateRef = useRef<HTMLInputElement>(null);
  const endDateRef = useRef<HTMLInputElement>(null);

  const filterLabelClass = "block text-xs font-semibold text-gray-600 dark:text-gray-300 mb-1.5";
  const filterControlClass =
    "w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-900 shadow-sm outline-none transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:border-gray-700 dark:bg-gray-900/60 dark:text-gray-100 dark:focus:border-blue-400 dark:focus:ring-blue-500/20";
  const dateInputClass = `${filterControlClass} pl-10 pr-3 md:w-56 cursor-pointer`;

  const openDatePicker = (input: HTMLInputElement | null) => {
    if (!input) return;
    input.focus();
    if ("showPicker" in input) {
      input.showPicker();
    } else {
      input.click();
    }
  };

  const formatDate = (value: string) => {
    if (!value) return "";
    const [year, month, day] = value.split("-");
    return day && month && year ? `${day}/${month}/${year}` : value;
  };

  const reportPeriod =
    startDate && endDate
      ? `${formatDate(startDate)} - ${formatDate(endDate)}`
      : startDate
        ? `Mulai dari ${formatDate(startDate)}`
        : endDate
          ? `Hingga ${formatDate(endDate)}`
          : "Semua Waktu";
  const printedAt = new Date().toLocaleDateString("id-ID", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  
  // Ambil data untuk laporan. Kita fetch dengan per_page besar agar bisa diprint semua hasil filter.
  const fetchLaporan = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string | number> = { per_page: 500 }; // Ambil hingga 500 data untuk report
      if (startDate) params.start_date = startDate;
      if (endDate) params.end_date = endDate;
      if (filterStatus !== "all") params.status = filterStatus;

      const res = await api.get("/api/admin/laporan", { params });
      setData(res.data.data || []);
    } catch (error) {
      console.error("Gagal memuat laporan", error);
    } finally {
      setLoading(false);
    }
  }, [startDate, endDate, filterStatus]);

  useEffect(() => {
    fetchLaporan();
  }, [fetchLaporan]);

  const handlePrint = () => {
    window.print();
  };

  return (
    <>
      {/* CSS untuk mengatur tampilan saat di-print (sembunyikan sidebar, navbar, dll) */}
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          html,
          body {
            background: #ffffff !important;
            color: #111827 !important;
            font-family: Arial, Helvetica, sans-serif !important;
            font-size: 11px !important;
          }
          body * {
            visibility: hidden;
          }
          #printable-report, #printable-report * {
            visibility: visible;
          }
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
          .no-print {
            display: none !important;
          }
          .print-only {
            display: block !important;
          }
          .print-report-card {
            border: 0 !important;
            border-radius: 0 !important;
            box-shadow: none !important;
            padding: 0 !important;
            background: #ffffff !important;
          }
          .print-screen-summary {
            display: none !important;
          }
          .print-letterhead {
            display: grid !important;
            grid-template-columns: 64px 1fr 64px;
            align-items: center;
            gap: 12px;
            padding-bottom: 10px;
            border-bottom: 3px double #111827;
            text-align: center;
          }
          .print-logo-box {
            width: 56px;
            height: 56px;
            border: 1px solid #111827;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 18px;
            font-weight: 700;
          }
          .print-agency {
            font-size: 15px;
            line-height: 1.25;
            font-weight: 700;
            text-transform: uppercase;
          }
          .print-system {
            font-size: 12px;
            line-height: 1.35;
            font-weight: 700;
            text-transform: uppercase;
          }
          .print-address {
            margin-top: 3px;
            font-size: 10px;
            font-weight: 400;
            line-height: 1.35;
          }
          .print-title {
            margin: 18px 0 12px;
            text-align: center;
          }
          .print-title h1 {
            margin: 0;
            font-size: 14px;
            font-weight: 700;
            text-decoration: underline;
            text-transform: uppercase;
            letter-spacing: 0.02em;
          }
          .print-meta {
            display: grid !important;
            grid-template-columns: 1fr;
            gap: 6px;
            margin-bottom: 14px;
            font-size: 10px;
          }
          .print-meta-row {
            display: grid !important;
            grid-template-columns: 90px 8px 1fr;
          }
          .print-total {
            font-weight: 700;
          }
          .print-table-wrap {
            overflow: visible !important;
          }
          .print-table {
            width: 100% !important;
            border-collapse: collapse !important;
            table-layout: fixed;
            font-size: 9px !important;
          }
          .print-table thead tr {
            background: #e5e7eb !important;
            border: 1px solid #111827 !important;
          }
          .print-table th,
          .print-table td {
            border: 1px solid #111827 !important;
            padding: 5px 6px !important;
            color: #111827 !important;
            vertical-align: top;
          }
          .print-table th {
            text-align: center;
            font-weight: 700;
            text-transform: uppercase;
          }
          .print-table tbody tr {
            break-inside: avoid;
          }
          .print-table th:nth-child(5),
          .print-table td:nth-child(5) {
            width: 95px;
          }
          .print-no {
            width: 34px;
            text-align: center;
          }
          .print-date {
            width: 72px;
            white-space: nowrap;
          }
          .print-person {
            width: 138px;
          }
          .print-type {
            width: 95px;
          }
          .print-district {
            width: 95px;
          }
          .print-status {
            width: 72px;
            text-align: center;
          }
          .print-status-text {
            border: 0 !important;
            padding: 0 !important;
            font-weight: 700;
            text-transform: uppercase;
          }
          .print-muted {
            color: #374151 !important;
            font-size: 8px !important;
          }
          .print-empty {
            padding: 24px !important;
            text-align: center;
            font-style: italic;
          }
          .print-signatures {
            display: grid !important;
            grid-template-columns: 1fr 1fr;
            gap: 80px;
            margin-top: 28px;
            font-size: 10px;
          }
          .print-signature-block {
            text-align: center;
          }
          .print-signature-space {
            height: 56px;
          }
          .print-signature-name {
            display: inline-block;
            min-width: 180px;
            border-bottom: 1px solid #111827;
            font-weight: 700;
          }
          .print-footer-note {
            margin-top: 16px;
            padding-top: 6px;
            border-top: 1px solid #9ca3af;
            font-size: 8px;
            color: #374151 !important;
          }
          @page {
            size: landscape;
            margin: 1.2cm;
          }
        }
      `}} />

      <div className="no-print">
        <PageBreadcrumb pageTitle="Laporan Pengaduan Bencana" />
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-white/[0.03] mb-6 no-print">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
            {/* Filter Tanggal Mulai */}
            <div>
              <label className={filterLabelClass}>Dari Tanggal</label>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => openDatePicker(startDateRef.current)}
                  className="absolute left-3 top-1/2 z-10 -translate-y-1/2 text-gray-400 transition-colors hover:text-blue-600 dark:text-gray-500 dark:hover:text-blue-400"
                  aria-label="Pilih dari tanggal"
                >
                  <HiOutlineCalendar className="w-4 h-4" />
                </button>
                <input
                  type="text"
                  value={formatDate(startDate)}
                  onClick={() => openDatePicker(startDateRef.current)}
                  readOnly
                  className={dateInputClass}
                  placeholder="dd/mm/yyyy"
                />
                <input 
                  ref={startDateRef}
                  type="date" 
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="absolute inset-0 h-full w-full opacity-0 pointer-events-none [color-scheme:light] dark:[color-scheme:dark]"
                  tabIndex={-1}
                  aria-hidden="true"
                />
              </div>
            </div>

            {/* Filter Tanggal Selesai */}
            <div>
              <label className={filterLabelClass}>Sampai Tanggal</label>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => openDatePicker(endDateRef.current)}
                  className="absolute left-3 top-1/2 z-10 -translate-y-1/2 text-gray-400 transition-colors hover:text-blue-600 dark:text-gray-500 dark:hover:text-blue-400"
                  aria-label="Pilih sampai tanggal"
                >
                  <HiOutlineCalendar className="w-4 h-4" />
                </button>
                <input
                  type="text"
                  value={formatDate(endDate)}
                  onClick={() => openDatePicker(endDateRef.current)}
                  readOnly
                  className={dateInputClass}
                  placeholder="dd/mm/yyyy"
                />
                <input 
                  ref={endDateRef}
                  type="date" 
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="absolute inset-0 h-full w-full opacity-0 pointer-events-none [color-scheme:light] dark:[color-scheme:dark]"
                  tabIndex={-1}
                  aria-hidden="true"
                />
              </div>
            </div>
            
            {/* Filter Status */}
            <div>
              <label className={filterLabelClass}>Status Laporan</label>
              <select 
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className={`${filterControlClass} md:w-56`}
              >
                <option value="all">Semua Status</option>
                {STATUS_OPT.map(s => <option key={s} value={s}>{ST[s].label}</option>)}
              </select>
            </div>
          </div>

          {/* Tombol Aksi */}
          <div className="flex gap-3 mt-4 md:mt-0">
            <button 
              onClick={handlePrint}
              disabled={data.length === 0}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 active:scale-95 transition-all shadow-sm shadow-blue-200 disabled:opacity-60 disabled:cursor-not-allowed whitespace-nowrap"
            >
              <HiOutlinePrinter className="w-4 h-4" /> Export PDF
            </button>
          </div>
        </div>
      </div>

      {/* Kontainer Printable */}
      <div id="printable-report" className="print-report-card rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-white/[0.03]">
        <div className="print-only hidden">
          <div className="print-letterhead">
            <div className="print-logo-box">JS</div>
            <div>
              <div className="print-agency">Pemerintah Kabupaten Jember</div>
              <div className="print-system">Jember Siaga - Sistem Pengaduan Bencana</div>
              <div className="print-address">
                Laporan administrasi pengaduan bencana masyarakat Kabupaten Jember
              </div>
            </div>
            <div className="print-logo-box">JS</div>
          </div>

          <div className="print-title">
            <h1>Laporan Pengaduan Bencana</h1>
          </div>

          <div className="print-meta">
            <div className="print-meta-row">
              <span>Periode</span>
              <span>:</span>
              <span>{reportPeriod}</span>
            </div>
            <div className="print-meta-row">
              <span>Total Laporan</span>
              <span>:</span>
              <span className="print-total">{data.length} laporan</span>
            </div>
          </div>
        </div>

        <div className="print-screen-summary mb-6 pb-4 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white uppercase tracking-wide">
              Laporan Pengaduan Bencana
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              {startDate && endDate 
                ? `Periode: ${formatDate(startDate)} - ${formatDate(endDate)}`
                : startDate ? `Mulai dari: ${formatDate(startDate)}`
                : endDate ? `Hingga: ${formatDate(endDate)}`
                : "Semua Waktu"}
            </p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-blue-600">{data.length}</div>
            <div className="text-xs font-medium text-gray-500 uppercase tracking-wider">Total Laporan</div>
          </div>
        </div>

        <div className="print-table-wrap overflow-x-auto">
          <table className="print-table w-full text-left text-sm border-collapse">
            <thead>
              <tr className="bg-gray-50/80 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-800">
                {["No", "Tanggal", "Pelapor", "Jenis Bencana", "Kecamatan", "Alamat", "Status"].map((h) => (
                  <th
                    key={h}
                    className={`px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-400 whitespace-nowrap ${
                      h === "No" ? "print-no" :
                      h === "Tanggal" ? "print-date" :
                      h === "Pelapor" ? "print-person" :
                      h === "Jenis Bencana" ? "print-type" :
                      h === "Kecamatan" ? "print-district" :
                      h === "Status" ? "print-status" : ""
                    }`}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-gray-400 dark:text-gray-500">
                    <span className="inline-block w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mb-2" />
                    <p>Memuat laporan...</p>
                  </td>
                </tr>
              ) : data.length === 0 ? (
                <tr>
                  <td colSpan={7} className="print-empty px-4 py-12 text-center text-gray-400 dark:text-gray-500">
                    <HiOutlineDocumentText className="w-10 h-10 mx-auto mb-2 text-gray-300 dark:text-gray-600" />
                    <p>Tidak ada laporan pengaduan pada periode ini.</p>
                  </td>
                </tr>
              ) : (
                data.map((item, idx) => {
                  const st = ST[item.status] ?? { label: item.status, variant: "default" };
                  return (
                    <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors">
                      <td className="print-no px-4 py-3 text-center text-gray-500 dark:text-gray-400">{idx + 1}</td>
                      <td className="print-date px-4 py-3 text-gray-700 dark:text-gray-300 whitespace-nowrap">
                        {formatDate(item.dibuat_pada.slice(0, 10))}
                      </td>
                      <td className="print-person px-4 py-3">
                        <div className="font-medium text-gray-900 dark:text-gray-200">{item.user?.name || "Anonim"}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">{item.user?.email || "—"}</div>
                      </td>
                      <td className="print-type px-4 py-3 font-semibold text-gray-800 dark:text-gray-200">{item.jenis_bencana}</td>
                      <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{item.kecamatan?.nama || "—"}</td>
                      <td className="px-4 py-3 text-gray-600 dark:text-gray-400 max-w-[200px] truncate" title={item.alamat_lengkap || undefined}>
                        {item.alamat_lengkap || "—"}
                      </td>
                      <td className="print-status px-4 py-3">
                        {/* Di mode print badge background tidak selalu tampil bagus, jadi tambahkan styling border solid */}
                        <div className="print-status-text print:border print:border-gray-300 print:text-black print:px-2 print:py-1 print:rounded-md inline-block">
                          <span className="print:hidden">
                            <AdminBadge variant={st.variant} dot>
                              {st.label}
                            </AdminBadge>
                          </span>
                          <span className="hidden print:inline text-xs font-bold uppercase">{st.label}</span>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        
        {/* Footer Laporan hanya muncul di mode print */}
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
            Dokumen ini dicetak dari Sistem JESI (Jember Siaga - Sistem Pengaduan Bencana) dan digunakan sebagai rekap administrasi pengaduan bencana.
          </div>
        </div>
      </div>
    </>
  );
}
