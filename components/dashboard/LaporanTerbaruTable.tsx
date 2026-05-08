"use client";
import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../ui/table";
import Badge from "../ui/badge/Badge";

type LaporanStatus = "baru" | "diverifikasi" | "ditolak" | "selesai";

interface Laporan {
  id: number;
  pelapor: string;
  inisial: string;
  jenis_bencana: string;
  kecamatan: string;
  status: LaporanStatus;
  dibuat_pada: string;
}

const laporanData: Laporan[] = [
  { id: 1, pelapor: "Siti Rahayu",   inisial: "SR", jenis_bencana: "Banjir",         kecamatan: "Ambulu",    status: "baru",        dibuat_pada: "07 Mei 2026, 20:14" },
  { id: 2, pelapor: "Budi Santoso",  inisial: "BS", jenis_bencana: "Tanah Longsor",  kecamatan: "Silo",      status: "diverifikasi", dibuat_pada: "07 Mei 2026, 19:42" },
  { id: 3, pelapor: "Ahmad Fauzi",   inisial: "AF", jenis_bencana: "Angin Kencang",  kecamatan: "Puger",     status: "selesai",      dibuat_pada: "07 Mei 2026, 18:05" },
  { id: 4, pelapor: "Dewi Lestari",  inisial: "DL", jenis_bencana: "Banjir Bandang", kecamatan: "Tempurejo", status: "diverifikasi", dibuat_pada: "07 Mei 2026, 17:30" },
  { id: 5, pelapor: "Rizky Pratama", inisial: "RP", jenis_bencana: "Kebakaran",      kecamatan: "Kaliwates", status: "ditolak",      dibuat_pada: "07 Mei 2026, 16:58" },
];

const statusMap: Record<LaporanStatus, { color: "primary" | "success" | "error" | "warning"; label: string }> = {
  baru:        { color: "primary", label: "Baru" },
  diverifikasi:{ color: "warning", label: "Diverifikasi" },
  selesai:     { color: "success", label: "Selesai" },
  ditolak:     { color: "error",   label: "Ditolak" },
};

export default function LaporanTerbaruTable() {
  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-4 pb-3 pt-4 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6">
      <div className="flex flex-col gap-2 mb-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            Laporan Bencana Terbaru
          </h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Laporan masuk hari ini dari seluruh kecamatan
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-theme-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200">
            Lihat Semua
          </button>
        </div>
      </div>

      <div className="max-w-full overflow-x-auto">
        <Table>
          <TableHeader className="border-gray-100 dark:border-gray-800 border-y">
            <TableRow>
              {["Pelapor", "Jenis Bencana", "Kecamatan", "Waktu", "Status"].map((h) => (
                <TableCell
                  key={h}
                  isHeader
                  className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  {h}
                </TableCell>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
            {laporanData.map((lap) => {
              const { color, label } = statusMap[lap.status];
              return (
                <TableRow key={lap.id}>
                  <TableCell className="py-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-100 text-sm font-semibold text-brand-600 dark:bg-brand-500/20 dark:text-brand-400">
                        {lap.inisial}
                      </div>
                      <p className="font-medium text-gray-800 text-theme-sm dark:text-white/90 whitespace-nowrap">
                        {lap.pelapor}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell className="py-3 text-gray-700 text-theme-sm dark:text-gray-300 whitespace-nowrap">
                    {lap.jenis_bencana}
                  </TableCell>
                  <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400 whitespace-nowrap">
                    Kec. {lap.kecamatan}
                  </TableCell>
                  <TableCell className="py-3 text-gray-500 text-theme-xs dark:text-gray-400 whitespace-nowrap">
                    {lap.dibuat_pada}
                  </TableCell>
                  <TableCell className="py-3">
                    <Badge size="sm" color={color}>
                      {label}
                    </Badge>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
