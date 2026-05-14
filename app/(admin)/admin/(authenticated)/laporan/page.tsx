"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import AdminBadge from "@/components/admin/ui/AdminBadge";
import { HiOutlinePrinter, HiOutlineDocumentText, HiOutlineCalendar, HiMagnifyingGlass } from "react-icons/hi2";
import api from "@/lib/api";

const STATUS_OPT = ["baru", "diverifikasi", "ditolak", "selesai"] as const;
const ST: Record<string, { label: string; variant: "success" | "info" | "warning" | "danger" | "default" }> = {
  baru: { label: "Baru", variant: "info" },
  diverifikasi: { label: "Diverifikasi", variant: "warning" },
  selesai: { label: "Selesai", variant: "success" },
  ditolak: { label: "Ditolak", variant: "danger" },
};

export default function LaporanPage() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  
  // Ambil data untuk laporan. Kita fetch dengan per_page besar agar bisa diprint semua hasil filter.
  const fetchLaporan = useCallback(async () => {
    setLoading(true);
    try {
      const params: any = { per_page: 500 }; // Ambil hingga 500 data untuk report
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
            padding: 20px;
            background: white !important;
          }
          .no-print {
            display: none !important;
          }
          @page {
            size: landscape;
            margin: 1cm;
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
              <label className="block text-xs font-medium text-gray-500 mb-1">Dari Tanggal</label>
              <div className="relative">
                <HiOutlineCalendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input 
                  type="date" 
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="pl-9 pr-4 py-2 w-full md:w-40 text-sm border border-gray-200 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                />
              </div>
            </div>

            {/* Filter Tanggal Selesai */}
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Sampai Tanggal</label>
              <div className="relative">
                <HiOutlineCalendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input 
                  type="date" 
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="pl-9 pr-4 py-2 w-full md:w-40 text-sm border border-gray-200 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                />
              </div>
            </div>
            
            {/* Filter Status */}
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Status Laporan</label>
              <select 
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-2 w-full md:w-40 text-sm border border-gray-200 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
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
      <div id="printable-report" className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-white/[0.03]">
        <div className="mb-6 pb-4 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white uppercase tracking-wide">
              Laporan Pengaduan Bencana
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              {startDate && endDate 
                ? `Periode: ${new Date(startDate).toLocaleDateString('id-ID')} - ${new Date(endDate).toLocaleDateString('id-ID')}`
                : startDate ? `Mulai dari: ${new Date(startDate).toLocaleDateString('id-ID')}`
                : endDate ? `Hingga: ${new Date(endDate).toLocaleDateString('id-ID')}`
                : "Semua Waktu"}
            </p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-blue-600">{data.length}</div>
            <div className="text-xs font-medium text-gray-500 uppercase tracking-wider">Total Laporan</div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="bg-gray-50/80 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-800">
                {["No", "Tanggal", "Pelapor", "Jenis Bencana", "Kecamatan", "Alamat", "Status"].map((h) => (
                  <th key={h} className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-400 whitespace-nowrap">
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
                  <td colSpan={7} className="px-4 py-12 text-center text-gray-400 dark:text-gray-500">
                    <HiOutlineDocumentText className="w-10 h-10 mx-auto mb-2 text-gray-300 dark:text-gray-600" />
                    <p>Tidak ada laporan pengaduan pada periode ini.</p>
                  </td>
                </tr>
              ) : (
                data.map((item, idx) => {
                  const st = ST[item.status] ?? { label: item.status, variant: "default" };
                  return (
                    <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors">
                      <td className="px-4 py-3 text-center text-gray-500 dark:text-gray-400">{idx + 1}</td>
                      <td className="px-4 py-3 text-gray-700 dark:text-gray-300 whitespace-nowrap">
                        {new Date(item.dibuat_pada).toLocaleDateString("id-ID")}
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-medium text-gray-900 dark:text-gray-200">{item.user?.name || "Anonim"}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">{item.user?.email || "—"}</div>
                      </td>
                      <td className="px-4 py-3 font-semibold text-gray-800 dark:text-gray-200">{item.jenis_bencana}</td>
                      <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{item.kecamatan?.nama || "—"}</td>
                      <td className="px-4 py-3 text-gray-600 dark:text-gray-400 max-w-[200px] truncate" title={item.alamat_lengkap}>
                        {item.alamat_lengkap || "—"}
                      </td>
                      <td className="px-4 py-3">
                        {/* Di mode print badge background tidak selalu tampil bagus, jadi tambahkan styling border solid */}
                        <div className="print:border print:border-gray-300 print:text-black print:px-2 print:py-1 print:rounded-md inline-block">
                          <div className="print:hidden inline-block">
                            <AdminBadge variant={st.variant} dot>
                              {st.label}
                            </AdminBadge>
                          </div>
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
          <div className="flex justify-between items-end">
            <div>
              <p>Dicetak dari Sistem JESI (Jember Emergency System)</p>
              <p>Tanggal Cetak: {new Date().toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
            </div>
            <div className="text-center">
              <p className="mb-16">Petugas / Admin BPBD</p>
              <p className="font-bold border-b border-gray-400 min-w-[150px] inline-block"></p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
