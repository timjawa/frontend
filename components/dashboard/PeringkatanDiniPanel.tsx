"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../ui/table";
import Badge from "../ui/badge/Badge";
import { fetchPeringatanDini, PeringatanDini as APIPeringatanDini } from "@/services/dashboard";
import { HiArrowPath } from "react-icons/hi2";

type UrgencyLevel = "rendah" | "sedang" | "tinggi" | "kritis";


const urgencyMap: Record<UrgencyLevel, { color: "error" | "warning" | "primary" | "success"; label: string }> = {
  kritis: { color: "error", label: "Kritis" },
  tinggi: { color: "warning", label: "Tinggi" },
  sedang: { color: "primary", label: "Sedang" },
  rendah: { color: "success", label: "Rendah" },
};

export default function PeringkatanDiniPanel() {
  const [warnings, setWarnings] = useState<APIPeringatanDini[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        // Load active or latest 5 warnings
        const res = await fetchPeringatanDini({ per_page: 5 });
        setWarnings(res.data);
      } catch (error) {
        console.error("Gagal memuat peringatan dini:", error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);


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
          <Link href="/admin/peringatan-dini" className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-theme-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200">
            Lihat Semua
          </Link>
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
            {loading ? (
              <TableRow>
                <td className="py-8 text-center" colSpan={5}>
                  <div className="flex justify-center items-center gap-2 text-gray-400">
                    <HiArrowPath className="animate-spin" /> Memuat peringatan dini...
                  </div>
                </td>
              </TableRow>
            ) : warnings.length === 0 ? (
              <TableRow>
                <td className="py-8 text-center" colSpan={5}>
                  <div className="text-gray-500">Belum ada data peringatan dini aktif.</div>
                </td>
              </TableRow>
            ) : (
              warnings.map((w) => {
                const { color, label } = urgencyMap[w.tingkat_urgensi];
                
                const formatter = new Intl.DateTimeFormat('id-ID', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
                const berlakuHingga = w.berlaku_hingga
                  ? formatter.format(new Date(w.berlaku_hingga))
                  : "Tanpa batas";
                 
                // Because dummy data has 'jenis_ancaman' and backend 'peringatan-dini' API just has 'deskripsi', we might fall back to a title.
                // Or maybe just show "" as jenis_ancaman, or extract prefix from deskripsi.
                const ancaman = w.deskripsi.split(' ').slice(0, 2).join(' '); // A rough extraction if needed, or simply "Peringatan"

                return (
                  <TableRow key={w.id}>
                    <TableCell className="py-3">
                      <p className="font-medium text-gray-800 text-theme-sm dark:text-white/90 whitespace-nowrap">
                        Kec. {w.kecamatan?.nama || "Umum"}
                      </p>
                      <span className="text-gray-500 text-theme-xs dark:text-gray-400">
                        {w.pembuat?.name || "Admin BPBD"}
                      </span>
                    </TableCell>
                    <TableCell className="py-3 text-gray-700 text-theme-sm dark:text-gray-300 whitespace-nowrap">
                      Peringatan
                    </TableCell>
                    <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400 max-w-[220px]">
                      <span className="line-clamp-1" title={w.deskripsi}>{w.deskripsi}</span>
                    </TableCell>
                    <TableCell className="py-3 text-gray-500 text-theme-xs dark:text-gray-400 whitespace-nowrap">
                      {berlakuHingga}
                    </TableCell>
                    <TableCell className="py-3">
                      <Badge size="sm" color={color}>
                        {label}
                      </Badge>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
