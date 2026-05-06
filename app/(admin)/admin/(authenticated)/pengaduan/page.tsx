"use client";

import React, { useState } from "react";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import AdminBadge from "@/components/admin/ui/AdminBadge";
import { HiMagnifyingGlass } from "react-icons/hi2";
import AdminButton from "@/components/admin/ui/AdminButton";
import PengaduanTableAction from "./PengaduanTableAction";
import {
  HiOutlineDocumentText,
  HiOutlineClock,
  HiOutlineArrowPath,
  HiOutlineCheckCircle,
  HiOutlineXCircle,
} from "react-icons/hi2";

export default function PengaduanPage() {
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  const tableRows = [
    {
      id: 1,
      waktu: "2024-05-04 14:30:00",
      jenisBencana: "Banjir",
      lokasi: "Gumukmas",
      pelapor: "Ahmad Hidayat",
      status: "Pending",
      sv: "warning" as const,
    },
    {
      id: 2,
      waktu: "2024-05-04 13:15:00",
      jenisBencana: "Longsor",
      lokasi: "Ledokombo",
      pelapor: "Siti Aminah",
      status: "Diproses",
      sv: "info" as const,
    },
    {
      id: 3,
      waktu: "2024-05-04 11:45:00",
      jenisBencana: "Kebakaran",
      lokasi: "Kaliwates",
      pelapor: "Budi Santoso",
      status: "Selesai",
      sv: "success" as const,
    },
    {
      id: 4,
      waktu: "2024-05-04 10:20:00",
      jenisBencana: "Gempa",
      lokasi: "Silo",
      pelapor: "Dewi Lestari",
      status: "Ditolak",
      sv: "danger" as const,
    },
    {
      id: 5,
      waktu: "2024-05-04 09:10:00",
      jenisBencana: "Angin Kencang",
      lokasi: "Puger",
      pelapor: "Rudi Hartono",
      status: "Pending",
      sv: "warning" as const,
    },
    {
      id: 6,
      waktu: "2024-05-03 16:45:00",
      jenisBencana: "Banjir",
      lokasi: "Mumbulsari",
      pelapor: "Fatimah Zahra",
      status: "Diproses",
      sv: "info" as const,
    },
    {
      id: 7,
      waktu: "2024-05-03 15:30:00",
      jenisBencana: "Longsor",
      lokasi: "Sukowono",
      pelapor: "Irfan Hakim",
      status: "Selesai",
      sv: "success" as const,
    },
    {
      id: 8,
      waktu: "2024-05-03 14:15:00",
      jenisBencana: "Kekeringan",
      lokasi: "Kencong",
      pelapor: "Rina Wati",
      status: "Pending",
      sv: "warning" as const,
    },
  ];

  const filtered = tableRows.filter((r) => {
    const matchSearch =
      r.pelapor.toLowerCase().includes(search.toLowerCase()) ||
      r.jenisBencana.toLowerCase().includes(search.toLowerCase()) ||
      r.lokasi.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === "all" || r.status === filterStatus;
    return matchSearch && matchStatus;
  });

  return (
    <div>
      <PageBreadcrumb pageTitle="Manajemen Pengaduan" />

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-white/[0.03] flex items-center gap-4">
          <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-500/10 shrink-0">
            <HiOutlineDocumentText className="w-5 h-5 text-blue-500" />
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-0.5">Total Pengaduan</p>
            <p className="text-2xl font-bold text-gray-800 dark:text-white">{tableRows.length}</p>
          </div>
        </div>
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-white/[0.03] flex items-center gap-4">
          <div className="p-3 rounded-xl bg-yellow-50 dark:bg-yellow-500/10 shrink-0">
            <HiOutlineClock className="w-5 h-5 text-yellow-500" />
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-0.5">Pending</p>
            <p className="text-2xl font-bold text-gray-800 dark:text-white">
              {tableRows.filter((r) => r.status === "Pending").length}
            </p>
          </div>
        </div>
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-white/[0.03] flex items-center gap-4">
          <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-500/10 shrink-0">
            <HiOutlineArrowPath className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-0.5">Diproses</p>
            <p className="text-2xl font-bold text-gray-800 dark:text-white">
              {tableRows.filter((r) => r.status === "Diproses").length}
            </p>
          </div>
        </div>
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-white/[0.03] flex items-center gap-4">
          <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 shrink-0">
            <HiOutlineCheckCircle className="w-5 h-5 text-emerald-500" />
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-0.5">Selesai</p>
            <p className="text-2xl font-bold text-gray-800 dark:text-white">
              {tableRows.filter((r) => r.status === "Selesai").length}
            </p>
          </div>
        </div>
      </div>

      <div className="min-h-screen rounded-2xl border border-gray-200 bg-white px-5 py-3 dark:border-gray-800 dark:bg-white/[0.03] xl:px-10 xl:py-8">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl ring-1 ring-slate-100 shadow-sm overflow-hidden">
          {/* Table header bar */}
          <div className="px-6 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-100">
            <div>
              <h3 className="text-base font-bold text-[#1B2E4B]">Daftar Pengaduan</h3>
              <p className="text-xs text-slate-400 mt-0.5">Kelola laporan pengaduan dari masyarakat</p>
            </div>
            <div className="flex items-center gap-2.5 flex-wrap">
              {/* Filter Status */}
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="py-2 px-3 text-sm rounded-lg bg-slate-50 border border-slate-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none transition-all text-slate-600"
              >
                <option value="all">Semua Status</option>
                <option value="Pending">Pending</option>
                <option value="Diproses">Diproses</option>
                <option value="Selesai">Selesai</option>
                <option value="Ditolak">Ditolak</option>
              </select>
              {/* Search */}
              <div className="relative">
                <HiMagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Cari lokasi / pelapor..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9 pr-4 py-2 text-sm rounded-lg bg-slate-50 border border-slate-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 focus:bg-white outline-none transition-all w-48"
                />
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="bg-slate-50/80">
                  <th className="px-6 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-400">
                    No
                  </th>
                  <th className="px-6 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Waktu
                  </th>
                  <th className="px-6 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Jenis Bencana
                  </th>
                  <th className="px-6 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Lokasi (Kecamatan)
                  </th>
                  <th className="px-6 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Pelapor
                  </th>
                  <th className="px-6 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Status
                  </th>
                  <th className="px-6 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-400 text-right">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-slate-400">
                      <HiOutlineDocumentText className="w-10 h-10 mx-auto mb-2 text-slate-300" />
                      <p>Tidak ada pengaduan ditemukan.</p>
                    </td>
                  </tr>
                ) : (
                  filtered.map((row) => (
                    <tr
                      key={row.id}
                      className="hover:bg-blue-50/40 transition-colors"
                    >
                      <td className="px-6 py-4 font-semibold text-[#1B2E4B]">
                        {row.id}
                      </td>
                      <td className="px-6 py-4 text-slate-600 whitespace-nowrap">
                        {row.waktu}
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 text-xs font-medium">
                          {row.jenisBencana}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-600">
                        {row.lokasi}
                      </td>
                      <td className="px-6 py-4 text-slate-700 font-medium">
                        {row.pelapor}
                      </td>
                      <td className="px-6 py-4">
                        <AdminBadge variant={row.sv} dot>
                          {row.status}
                        </AdminBadge>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <PengaduanTableAction id={row.id} />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="px-6 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-t border-slate-100 bg-slate-50/50">
            <p className="text-sm text-slate-500">
              Menampilkan <span className="font-semibold text-slate-700">{filtered.length > 0 ? "1" : "0"}–{filtered.length}</span> dari{" "}
              <span className="font-semibold text-slate-700">{tableRows.length}</span> pengaduan
            </p>
            <div className="flex items-center gap-1.5">
              <button className="px-3 py-1.5 rounded-lg text-sm font-medium border border-slate-200 text-slate-400 bg-white cursor-not-allowed opacity-50" disabled>
                ← Sebelumnya
              </button>
              <button className="w-9 h-9 rounded-lg text-sm font-semibold bg-[#1B2E4B] text-white shadow-md shadow-[#1B2E4B]/20">1</button>
              <button className="px-3 py-1.5 rounded-lg text-sm font-medium border border-slate-200 text-slate-700 bg-white hover:bg-slate-50 transition-colors">
                Selanjutnya →
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
