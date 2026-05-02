"use client";

import React from "react";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import AdminBadge from "@/components/admin/ui/AdminBadge";
import { HiMagnifyingGlass } from "react-icons/hi2";
import AdminButton from "@/components/admin/ui/AdminButton";
import { HiPlus } from "react-icons/hi";
import Link from "next/link";
import FaqTableAction from "./FaqTableAction";

export default function FaqPage() {
  const tableRows = [
    {
      id: 1,
      question: "Bagaimana cara melaporkan keadaan darurat?",
      category: "Umum",
      order: 1,
      status: "Aktif",
      sv: "success" as const,
    },
    {
      id: 2,
      question: "Apakah layanan call center tersedia 24 jam?",
      category: "Layanan",
      order: 2,
      status: "Aktif",
      sv: "success" as const,
    },
    {
      id: 3,
      question: "Berapa lama respon tim saat terjadi bencana?",
      category: "Bencana",
      order: 3,
      status: "Tidak Aktif",
      sv: "danger" as const,
    },
    {
      id: 4,
      question: "Dimana letak posko evakuasi terdekat?",
      category: "Fasilitas",
      order: 4,
      status: "Aktif",
      sv: "success" as const,
    },
    {
      id: 5,
      question: "Bagaimana cara menjadi relawan?",
      category: "Relawan",
      order: 5,
      status: "Aktif",
      sv: "success" as const,
    },
  ];

  return (
    <div>
      <PageBreadcrumb pageTitle="Manajemen FAQ" />
      <div className="min-h-screen rounded-2xl border border-gray-200 bg-white px-5 py-3 dark:border-gray-800 dark:bg-white/[0.03] xl:px-10 xl:py-8">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl ring-1 ring-slate-100 shadow-sm overflow-hidden">
          {/* Table header bar */}
          <div className="px-6 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-100">
            <h3 className="text-base font-bold text-[#1B2E4B]">
              Daftar FAQ
            </h3>
            <div className="flex items-center gap-3">
              <Link href="/admin/faq/create">
                <AdminButton size="sm" variant="primary" className="flex items-center gap-2">
                  <HiPlus className="w-4 h-4" />
                  Tambah FAQ
                </AdminButton>
              </Link>
              <div className="relative">
                <HiMagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Cari FAQ..."
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
                    No
                  </th>
                  <th className="px-6 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Pertanyaan
                  </th>
                  <th className="px-6 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Kategori
                  </th>
                  <th className="px-6 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-400 text-center">
                    Urutan
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
                    <td className="px-6 py-4 font-medium text-slate-700 max-w-[300px] truncate">{row.question}</td>
                    <td className="px-6 py-4 text-slate-500">{row.category}</td>
                    <td className="px-6 py-4 text-center">
                      <span className="inline-flex w-7 h-7 items-center justify-center rounded-md bg-slate-100 text-slate-600 font-semibold text-xs border border-slate-200">
                        {row.order}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <AdminBadge variant={row.sv} dot>
                        {row.status}
                      </AdminBadge>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <FaqTableAction id={row.id} />
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
              <span className="font-semibold text-slate-700">12</span> data
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
                3
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
