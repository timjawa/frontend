import React from "react";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import AdminBadge from "@/components/admin/ui/AdminBadge";
import { HiEllipsisVertical, HiMagnifyingGlass } from "react-icons/hi2";
import AdminButton from "@/components/admin/ui/AdminButton";
import { HiPlus } from "react-icons/hi";

export default function BeritaPage() {
  const tableRows = [
    {
      id: "LP-260401",
      name: "Budi Santoso",
      cat: "Banjir",
      kec: "Kaliwates",
      date: "23 Apr 2026",
      status: "Baru",
      sv: "default" as const,
    },
    {
      id: "LP-260402",
      name: "Siti Aminah",
      cat: "Pohon Tumbang",
      kec: "Sumbersari",
      date: "23 Apr 2026",
      status: "Diverifikasi",
      sv: "info" as const,
    },
    {
      id: "LP-260403",
      name: "Agus Pratama",
      cat: "Tanah Longsor",
      kec: "Panti",
      date: "22 Apr 2026",
      status: "Selesai",
      sv: "success" as const,
    },
    {
      id: "LP-260404",
      name: "Dewi Lestari",
      cat: "Kebakaran",
      kec: "Patrang",
      date: "21 Apr 2026",
      status: "Ditolak",
      sv: "danger" as const,
    },
    {
      id: "LP-260405",
      name: "Rudi Hartono",
      cat: "Banjir",
      kec: "Ambulu",
      date: "20 Apr 2026",
      status: "Baru",
      sv: "default" as const,
    },
  ];
  return (
    <div>
      <PageBreadcrumb pageTitle="Manajemen Berita" />
      <div className="min-h-screen rounded-2xl border border-gray-200 bg-white px-5 py-3 dark:border-gray-800 dark:bg-white/[0.03] xl:px-10 xl:py-8">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl ring-1 ring-slate-100 shadow-sm overflow-hidden">
          {/* Table header bar */}
          <div className="px-6 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-100">
            <h3 className="text-base font-bold text-[#1B2E4B]">
              Laporan Terbaru
            </h3>
            <div className="flex items-center gap-3">
              <div className="relative">
                <HiMagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Cari laporan..."
                  className="pl-9 pr-4 py-2 text-sm rounded-xl bg-slate-50 ring-1 ring-slate-200 focus:ring-2 focus:ring-[#1B2E4B] focus:bg-white outline-none transition-all w-52"
                />
              </div>
              <AdminButton size="sm" variant="outline">
                Filter
              </AdminButton>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto ">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="bg-slate-50/80">
                  <th className="px-6 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-400">
                    ID
                  </th>
                  <th className="px-6 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Pelapor
                  </th>
                  <th className="px-6 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Kategori
                  </th>
                  <th className="px-6 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Kecamatan
                  </th>
                  <th className="px-6 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Tanggal
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
                {tableRows.map((row) => (
                  <tr
                    key={row.id}
                    className="hover:bg-blue-50/40 transition-colors"
                  >
                    <td className="px-6 py-4 font-semibold text-[#1B2E4B]">
                      {row.id}
                    </td>
                    <td className="px-6 py-4 text-slate-700">{row.name}</td>
                    <td className="px-6 py-4 text-slate-700">{row.cat}</td>
                    <td className="px-6 py-4 text-slate-500">{row.kec}</td>
                    <td className="px-6 py-4 text-slate-400">{row.date}</td>
                    <td className="px-6 py-4">
                      <AdminBadge variant={row.sv} dot>
                        {row.status}
                      </AdminBadge>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors">
                        <HiEllipsisVertical className="w-5 h-5" />
                      </button>
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
              <span className="font-semibold text-slate-700">1–5</span> dari{" "}
              <span className="font-semibold text-slate-700">24</span> data
            </p>
            <div className="flex items-center gap-1.5">
              <button
                className="px-3 py-1.5 rounded-lg text-sm font-medium border border-slate-200 text-slate-400 bg-white cursor-not-allowed opacity-50"
                disabled
              >
                ← Sebelumnya
              </button>
              {[1, 2, 3].map((n) => (
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
              <span className="px-1 text-slate-300">…</span>
              <button className="w-9 h-9 rounded-lg text-sm font-semibold bg-white text-slate-600 border border-slate-200 hover:bg-slate-50">
                8
              </button>
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
