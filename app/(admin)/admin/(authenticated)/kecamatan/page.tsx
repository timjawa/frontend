"use client";

import React from "react";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import AdminBadge from "@/components/admin/ui/AdminBadge";
import { HiMagnifyingGlass } from "react-icons/hi2";
import AdminButton from "@/components/admin/ui/AdminButton";
import { HiPlus } from "react-icons/hi";
import Link from "next/link";
import KecamatanTableAction from "./KecamatanTableAction";
import {
  HiOutlineMapPin,
  HiOutlineExclamationTriangle,
  HiOutlineShieldCheck,
  HiOutlineCheckBadge,
} from "react-icons/hi2";

export default function KecamatanPage() {
  const tableRows = [
    {
      id: "1",
      nama: "Ajung",
      kodeWilayah: "35.09.22.2001",
      latitude: -8.2300,
      longitude: 113.6500,
      elevasi: 60,
      levelRawan: "rendah",
      sv: "success" as const,
    },
    {
      id: "2",
      nama: "Ambulu",
      kodeWilayah: "35.09.07.2001",
      latitude: -8.3500,
      longitude: 113.6000,
      elevasi: 12,
      levelRawan: "sedang",
      sv: "warning" as const,
    },
    {
      id: "3",
      nama: "Arjasa",
      kodeWilayah: "35.09.23.2001",
      latitude: -8.1000,
      longitude: 113.7000,
      elevasi: 200,
      levelRawan: "rendah",
      sv: "success" as const,
    },
    {
      id: "4",
      nama: "Balung",
      kodeWilayah: "35.09.05.2001",
      latitude: -8.2800,
      longitude: 113.5500,
      elevasi: 40,
      levelRawan: "sedang",
      sv: "warning" as const,
    },
    {
      id: "5",
      nama: "Bangsalsari",
      kodeWilayah: "35.09.16.2001",
      latitude: -8.2000,
      longitude: 113.5000,
      elevasi: 85,
      levelRawan: "sedang",
      sv: "warning" as const,
    },
    {
      id: "6",
      nama: "Gumukmas",
      kodeWilayah: "35.09.04.2001",
      latitude: -8.3000,
      longitude: 113.4500,
      elevasi: 10,
      levelRawan: "tinggi",
      sv: "danger" as const,
    },
    {
      id: "7",
      nama: "Jelbuk",
      kodeWilayah: "35.09.24.2001",
      latitude: -8.0800,
      longitude: 113.6500,
      elevasi: 325,
      levelRawan: "rendah",
      sv: "success" as const,
    },
    {
      id: "8",
      nama: "Jenggawah",
      kodeWilayah: "35.09.12.2001",
      latitude: -8.2500,
      longitude: 113.7000,
      elevasi: 95,
      levelRawan: "sedang",
      sv: "warning" as const,
    },
    {
      id: "9",
      nama: "Jombang",
      kodeWilayah: "35.09.01.2001",
      latitude: -8.3200,
      longitude: 113.5000,
      elevasi: 35,
      levelRawan: "rendah",
      sv: "success" as const,
    },
    {
      id: "10",
      nama: "Kalisat",
      kodeWilayah: "35.09.18.2001",
      latitude: -8.1000,
      longitude: 113.8000,
      elevasi: 250,
      levelRawan: "rendah",
      sv: "success" as const,
    },
  ];

  const levelRawanColors = {
    "rendah": "success",
    "sedang": "warning",
    "tinggi": "danger"
  } as const;

  return (
    <div>
      <PageBreadcrumb pageTitle="Manajemen Kecamatan" />

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-white/[0.03] flex items-center gap-4">
          <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-500/10 shrink-0">
            <HiOutlineMapPin className="w-5 h-5 text-blue-500" />
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-0.5">Total Kecamatan</p>
            <p className="text-2xl font-bold text-gray-800 dark:text-white">{tableRows.length}</p>
          </div>
        </div>
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-white/[0.03] flex items-center gap-4">
          <div className="p-3 rounded-xl bg-red-50 dark:bg-red-500/10 shrink-0">
            <HiOutlineExclamationTriangle className="w-5 h-5 text-red-500" />
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-0.5">Rawan Tinggi</p>
            <p className="text-2xl font-bold text-gray-800 dark:text-white">
              {tableRows.filter((r) => r.levelRawan === "tinggi").length}
            </p>
          </div>
        </div>
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-white/[0.03] flex items-center gap-4">
          <div className="p-3 rounded-xl bg-yellow-50 dark:bg-yellow-500/10 shrink-0">
            <HiOutlineShieldCheck className="w-5 h-5 text-yellow-500" />
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-0.5">Rawan Sedang</p>
            <p className="text-2xl font-bold text-gray-800 dark:text-white">
              {tableRows.filter((r) => r.levelRawan === "sedang").length}
            </p>
          </div>
        </div>
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-white/[0.03] flex items-center gap-4">
          <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 shrink-0">
            <HiOutlineCheckBadge className="w-5 h-5 text-emerald-500" />
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-0.5">Rawan Rendah</p>
            <p className="text-2xl font-bold text-gray-800 dark:text-white">
              {tableRows.filter((r) => r.levelRawan === "rendah").length}
            </p>
          </div>
        </div>
      </div>

      <div className="min-h-screen rounded-2xl border border-gray-200 bg-white px-5 py-3 dark:border-gray-800 dark:bg-white/[0.03] xl:px-10 xl:py-8">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl ring-1 ring-slate-100 shadow-sm overflow-hidden">
          {/* Table header bar */}
          <div className="px-6 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-100">
            <div>
              <h3 className="text-base font-bold text-[#1B2E4B]">Data Kecamatan Jember</h3>
              <p className="text-xs text-slate-400 mt-0.5">Kelola data wilayah kecamatan se-Kabupaten Jember</p>
            </div>
            <div className="flex items-center gap-2.5">
              <div className="relative">
                <HiMagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Cari kecamatan..."
                  className="pl-9 pr-4 py-2 text-sm rounded-lg bg-slate-50 border border-slate-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 focus:bg-white outline-none transition-all w-48"
                />
              </div>
              <Link
                href="/admin/kecamatan/create"
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 active:scale-95 transition-all shadow-sm shadow-blue-200 dark:shadow-none whitespace-nowrap"
              >
                <HiPlus className="w-4 h-4" />
                Tambah Kecamatan
              </Link>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="bg-slate-50/80">
                  <th className="px-6 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-400 w-12 text-center">
                    No
                  </th>
                  <th className="px-6 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Nama Kecamatan
                  </th>
                  <th className="px-6 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Kode Wilayah
                  </th>
                  <th className="px-6 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Koordinat
                  </th>
                  <th className="px-6 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Elevasi
                  </th>
                  <th className="px-6 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Level Rawan
                  </th>
                  <th className="px-6 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-400 text-right">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {tableRows.map((row, index) => (
                  <tr
                    key={row.id}
                    className="hover:bg-blue-50/40 transition-colors"
                  >
                    <td className="px-6 py-4 text-center text-slate-500 font-medium">
                      {index + 1}
                    </td>
                    <td className="px-6 py-4 font-semibold text-[#1B2E4B]">
                      {row.nama}
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-gray-100 text-gray-700 text-xs font-medium font-mono">
                        {row.kodeWilayah}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-600">
                      <div className="text-xs font-mono">
                        <div>Lat: {row.latitude.toFixed(4)}</div>
                        <div>Lng: {row.longitude.toFixed(4)}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-600">
                      <span className="flex items-center gap-1">
                        {row.elevasi} mdpl
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <AdminBadge 
                        variant={levelRawanColors[row.levelRawan as keyof typeof levelRawanColors] || "info"} 
                        dot
                      >
                        {row.levelRawan.charAt(0).toUpperCase() + row.levelRawan.slice(1)}
                      </AdminBadge>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <KecamatanTableAction id={row.id} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="px-6 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-t border-slate-100 bg-slate-50/50">
            <p className="text-sm text-slate-500">
              Menampilkan{" "}
              <span className="font-semibold text-slate-700">1–10</span> dari{" "}
              <span className="font-semibold text-slate-700">31</span> data
            </p>
            <div className="flex items-center gap-1.5">
              <button
                className="px-3 py-1.5 rounded-lg text-sm font-medium border border-slate-200 text-slate-400 bg-white cursor-not-allowed opacity-50"
                disabled
              >
                ← Sebelumnya
              </button>
              {[1, 2, 3, 4].map((n) => (
                <button
                  key={n}
                  className={`w-9 h-9 rounded-lg text-sm font-semibold transition-colors ${
                    n === 1
                      ? "bg-[#1B2E4B] text-white shadow-md shadow-[#1B2E4B]/20"
                      : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
                  }`}
                >
                  {n}
                </button>
              ))}
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
