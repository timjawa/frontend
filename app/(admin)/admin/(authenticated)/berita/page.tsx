"use client";
import React, { useState, useEffect } from "react";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import AdminBadge from "@/components/admin/ui/AdminBadge";
import api, { getImageUrl } from "@/lib/api";
import { HiEllipsisVertical, HiMagnifyingGlass } from "react-icons/hi2";
import AdminButton from "@/components/admin/ui/AdminButton";
import { HiPlus } from "react-icons/hi";
import Link from "next/link";
import BeritaTableAction from "./BeritaTableAction";
import {
  HiOutlineNewspaper,
  HiOutlineCheckCircle,
  HiOutlinePencilSquare,
  HiOutlineArchiveBox,
} from "react-icons/hi2";

  export default function BeritaPage() {
  const [beritaList, setBeritaList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBerita = async () => {
      try {
        const response = await api.get('/api/berita');
        const responseData = response.data;
        
        // Memeriksa struktur data kembalian API (Laravel biasanya membungkus dengan "data")
        let extractedData = [];
        if (Array.isArray(responseData)) {
          extractedData = responseData;
        } else if (responseData && Array.isArray(responseData.data)) {
          extractedData = responseData.data;
        } else if (responseData && responseData.data && Array.isArray(responseData.data.data)) {
          extractedData = responseData.data.data;
        }

        setBeritaList(extractedData);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchBerita();
  }, []); // Array kosong berarti efek ini hanya berjalan sekali setelah render pertama

  if (loading) {
    return (
      <div>
        <PageBreadcrumb pageTitle="Manajemen Berita" />
        <p>Memuat berita...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <PageBreadcrumb pageTitle="Manajemen Berita" />
        <p>Error: {error}</p>
      </div>
    );
  }

  // Mengganti tableRows dengan beritaList dari API dan menyesuaikan nama field
  // Menambahkan index untuk kolom 'No', ditambahkan pengecekan Array.isArray
  const tableRows = (Array.isArray(beritaList) ? beritaList : []).map((berita: any, index: number) => ({
    no: index + 1, // Nomor urut
    id: berita.id, // UUID tetap disimpan untuk aksi
    foto: getImageUrl(berita.foto_cover),
    title: berita.judul, // Menggunakan judul
    cat: berita.kategori || "Umum", // Menggunakan kategori
    status: berita.status || "Draft", // Menggunakan status
    views: berita.views_count || 0, // Menggunakan views_count
    sv: (berita.status === "published" ? "success" : berita.status === "archived" ? "info" : "default" ) as "success" | "warning" | "danger" | "info" | "default",
  }));
  
  return (
    <div>
      <PageBreadcrumb pageTitle="Manajemen Berita" />

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-white/[0.03] flex items-center gap-4">
          <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-500/10 shrink-0">
            <HiOutlineNewspaper className="w-5 h-5 text-blue-500" />
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-0.5">Total Berita</p>
            <p className="text-2xl font-bold text-gray-800 dark:text-white">{tableRows.length}</p>
          </div>
        </div>
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-white/[0.03] flex items-center gap-4">
          <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 shrink-0">
            <HiOutlineCheckCircle className="w-5 h-5 text-emerald-500" />
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-0.5">Published</p>
            <p className="text-2xl font-bold text-gray-800 dark:text-white">
              {tableRows.filter((r) => r.status === "Published").length}
            </p>
          </div>
        </div>
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-white/[0.03] flex items-center gap-4">
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-500/10 shrink-0">
            <HiOutlinePencilSquare className="w-5 h-5 text-slate-400" />
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-0.5">Draft</p>
            <p className="text-2xl font-bold text-gray-800 dark:text-white">
              {tableRows.filter((r) => r.status === "Draft").length}
            </p>
          </div>
        </div>
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-white/[0.03] flex items-center gap-4">
          <div className="p-3 rounded-xl bg-orange-50 dark:bg-orange-500/10 shrink-0">
            <HiOutlineArchiveBox className="w-5 h-5 text-orange-400" />
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-0.5">Archived</p>
            <p className="text-2xl font-bold text-gray-800 dark:text-white">
              {tableRows.filter((r) => r.status === "Archived").length}
            </p>
          </div>
        </div>
      </div>

      <div className="min-h-screen rounded-2xl border border-gray-200 bg-white px-5 py-3 dark:border-gray-800 dark:bg-white/[0.03] xl:px-10 xl:py-8">
        <div className="bg-white/80 dark:bg-gray-900/50 backdrop-blur-sm rounded-2xl ring-1 ring-slate-100 dark:ring-gray-800 shadow-sm overflow-hidden">
          {/* Table header bar */}
          <div className="px-6 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-100 dark:border-gray-800">
            <div>
              <h3 className="text-base font-bold text-[#1B2E4B] dark:text-white">Daftar Berita</h3>
              <p className="text-xs text-slate-400 dark:text-gray-500 mt-0.5">Kelola seluruh artikel berita bencana</p>
            </div>
            <div className="flex items-center gap-2.5">
              <div className="relative">
                <HiMagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-gray-500" />
                <input
                  type="text"
                  placeholder="Cari berita..."
                  className="pl-9 pr-4 py-2 text-sm rounded-lg bg-slate-50 dark:bg-gray-800 border border-slate-200 dark:border-gray-700 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900 focus:bg-white dark:focus:bg-gray-900 outline-none transition-all w-48 text-gray-700 dark:text-gray-200"
                />
              </div>
              <Link
                href="/admin/berita/create"
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 active:scale-95 transition-all shadow-sm shadow-blue-200 dark:shadow-none whitespace-nowrap"
              >
                <HiPlus className="w-4 h-4" />
                Tambah Berita
              </Link>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto ">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="bg-slate-50/80 dark:bg-gray-800/50">
                  <th className="px-6 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-gray-500">
                    No
                  </th>
                  <th className="px-6 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-gray-500">
                    Foto
                  </th>
                  <th className="px-6 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-gray-500">
                    Judul Berita
                  </th>
                  <th className="px-6 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-gray-500">
                    Kategori
                  </th>
                  <th className="px-6 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-gray-500">
                    Status
                  </th>
                  <th className="px-6 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-gray-500">
                    Views
                  </th>
                  <th className="px-6 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-gray-500 text-right">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-gray-800">
                {tableRows.map((row) => (
                  <tr
                    key={row.id}
                    className="hover:bg-blue-50/40 dark:hover:bg-gray-800/40 transition-colors"
                  >
                    <td className="px-6 py-4 font-semibold text-[#1B2E4B] dark:text-gray-200">
                      {row.no}
                    </td>
                    <td className="px-6 py-4">
                      <div className="h-12 w-16 overflow-hidden rounded-md border border-gray-200 dark:border-gray-700">
                        <img
                          src={row.foto}
                          alt="Cover"
                          className="h-full w-full object-cover"
                        />
                      </div>
                    </td>
                    <td className="px-6 py-4 font-medium text-slate-700 dark:text-gray-300 max-w-[200px] truncate">{row.title}</td>
                    <td className="px-6 py-4 text-slate-500 dark:text-gray-400">{row.cat}</td>
                    <td className="px-6 py-4">
                      <AdminBadge variant={row.sv} dot>
                        {row.status}
                      </AdminBadge>
                    </td>
                    <td className="px-6 py-4 text-slate-500 dark:text-gray-400">{row.views}</td>
                    <td className="px-6 py-4 text-right">
                      <BeritaTableAction id={row.id} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="px-6 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-t border-slate-100 dark:border-gray-800 bg-slate-50/50 dark:bg-gray-800/30">
            <p className="text-sm text-slate-500 dark:text-gray-400">
              Menampilkan{" "}
              <span className="font-semibold text-slate-700 dark:text-gray-200">1–5</span> dari{" "}
              <span className="font-semibold text-slate-700 dark:text-gray-200">24</span> data
            </p>
            <div className="flex items-center gap-1.5 flex-wrap">
              <button
                className="px-3 py-1.5 rounded-lg text-sm font-medium border border-slate-200 dark:border-gray-700 text-slate-400 dark:text-gray-500 bg-white dark:bg-gray-800 cursor-not-allowed opacity-50"
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
                      : "bg-white dark:bg-gray-800 text-slate-600 dark:text-gray-300 border border-slate-200 dark:border-gray-700 hover:bg-slate-50 dark:hover:bg-gray-700"
                  }`}
                >
                  {n}
                </button>
              ))}
              <span className="px-1 text-slate-300 dark:text-gray-600">…</span>
              <button className="w-9 h-9 rounded-lg text-sm font-semibold bg-white dark:bg-gray-800 text-slate-600 dark:text-gray-300 border border-slate-200 dark:border-gray-700 hover:bg-slate-50 dark:hover:bg-gray-700">
                8
              </button>
              <button className="px-3 py-1.5 rounded-lg text-sm font-medium border border-slate-200 dark:border-gray-700 text-slate-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-slate-50 dark:hover:bg-gray-700 transition-colors">
                Selanjutnya →
              </button>
            </div>
          </div>
        </div>
        </div>
    </div>
  );
}
