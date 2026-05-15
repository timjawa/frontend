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

type UrgencyLevel = "rendah" | "sedang" | "tinggi" | "kritis";

interface Warning {
  id: number;
  kecamatan: string;
  jenis_ancaman: string;
  deskripsi: string;
  tingkat_urgensi: UrgencyLevel;
  is_active: boolean;
  dibuat_oleh: string;
}

const warnings: Warning[] = [
  {
    id: 1,
    kecamatan: "Tempurejo",
    jenis_ancaman: "Banjir Bandang",
    deskripsi: "Potensi banjir bandang di hulu sungai Bedadung akibat hujan ekstrem.",
    tingkat_urgensi: "kritis",
    is_active: true,
    dibuat_oleh: "BPBD Jember",
  },
  {
    id: 2,
    kecamatan: "Silo",
    jenis_ancaman: "Tanah Longsor",
    deskripsi: "Waspada longsor jalur Gunung Gumitir, kondisi tanah labil.",
    tingkat_urgensi: "tinggi",
    is_active: true,
    dibuat_oleh: "Admin BPBD",
  },
  {
    id: 3,
    kecamatan: "Ambulu",
    jenis_ancaman: "Banjir",
    deskripsi: "Ketinggian air Sungai Bondoyudo meningkat, siaga level 2.",
    tingkat_urgensi: "sedang",
    is_active: true,
    dibuat_oleh: "Admin BPBD",
  },
  {
    id: 4,
    kecamatan: "Puger",
    jenis_ancaman: "Angin Kencang",
    deskripsi: "Angin kencang berpotensi 60 km/jam di pesisir selatan.",
    tingkat_urgensi: "rendah",
    is_active: true,
    dibuat_oleh: "Admin BPBD",
  },
];

const urgencyMap: Record<UrgencyLevel, { color: "error" | "warning" | "primary" | "success"; label: string }> = {
  kritis: { color: "error", label: "Kritis" },
  tinggi: { color: "warning", label: "Tinggi" },
  sedang: { color: "primary", label: "Sedang" },
  rendah: { color: "success", label: "Rendah" },
};

export default function PeringkatanDiniPanel() {
  return (
    <div className="flex flex-col h-full overflow-hidden rounded-2xl border border-gray-200 bg-white px-5 pt-5 pb-5 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6 sm:pt-6">
      <div className="flex flex-col gap-2 mb-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            Peringatan Dini Aktif
          </h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {warnings.length} peringatan sedang berlaku
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
              {["Kecamatan", "Jenis Ancaman", "Deskripsi", "Status", "Urgensi"].map((h) => (
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
            {warnings.map((w) => {
              const { color, label } = urgencyMap[w.tingkat_urgensi];
              return (
                <TableRow key={w.id}>
                  <TableCell className="py-3">
                    <p className="font-medium text-gray-800 text-theme-sm dark:text-white/90 whitespace-nowrap">
                      Kec. {w.kecamatan}
                    </p>
                    <span className="text-gray-500 text-theme-xs dark:text-gray-400">
                      {w.dibuat_oleh}
                    </span>
                  </TableCell>
                  <TableCell className="py-3 text-gray-700 text-theme-sm dark:text-gray-300 whitespace-nowrap">
                    {w.jenis_ancaman}
                  </TableCell>
                  <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400 max-w-[220px]">
                    <span className="line-clamp-1">{w.deskripsi}</span>
                  </TableCell>
                  <TableCell className="py-3 text-gray-500 text-theme-xs dark:text-gray-400 whitespace-nowrap">
                    <Badge size="sm" color={w.is_active ? "success" : "error"}>
                      {w.is_active ? "Aktif" : "Tidak Aktif"}
                    </Badge>
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
