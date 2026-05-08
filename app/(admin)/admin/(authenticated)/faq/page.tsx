"use client";

import React, { useEffect, useState } from "react";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import AdminBadge from "@/components/admin/ui/AdminBadge";
import { HiMagnifyingGlass } from "react-icons/hi2";
import Link from "next/link";
import FaqTableAction from "./FaqTableAction";
import api from "@/lib/api";
import {
  HiOutlineQuestionMarkCircle,
  HiOutlineCheckCircle,
  HiOutlineXCircle,
  HiOutlineTag,
} from "react-icons/hi2";

interface Faq {
  id: string;
  pertanyaan: string;
  jawaban: string;
  kategori: string;
  urutan: number;
  is_active: boolean;
}

export default function FaqPage() {
  const [faqs, setFaqs] = useState<Faq[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchFaqs();
  }, []);

  const fetchFaqs = async () => {
    try {
      setLoading(true);
      const response = await api.get("/api/faq");
      if (response.data.success) {
        setFaqs(response.data.data);
      } else {
        setError("Gagal memuat data FAQ");
      }
    } catch (err) {
      console.error("Error fetching FAQs:", err);
      setError("Terjadi kesalahan saat memuat data");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Apakah Anda yakin ingin menghapus FAQ ini?")) {
      try {
        const response = await api.delete(`/api/faq/${id}`);
        if (response.data.success) {
          setFaqs(faqs.filter((f) => f.id !== id));
        } else {
          alert("Gagal menghapus FAQ");
        }
      } catch (err) {
        console.error("Error deleting FAQ:", err);
        alert("Terjadi kesalahan saat menghapus");
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div>
      <PageBreadcrumb pageTitle="Manajemen FAQ" />

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-white/[0.03] flex items-center gap-4">
          <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-500/10 shrink-0">
            <HiOutlineQuestionMarkCircle className="w-5 h-5 text-blue-500" />
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-0.5">Total FAQ</p>
            <p className="text-2xl font-bold text-gray-800 dark:text-white">{faqs.length}</p>
          </div>
        </div>
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-white/[0.03] flex items-center gap-4">
          <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 shrink-0">
            <HiOutlineCheckCircle className="w-5 h-5 text-emerald-500" />
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-0.5">Aktif</p>
            <p className="text-2xl font-bold text-gray-800 dark:text-white">
              {faqs.filter((r) => r.is_active).length}
            </p>
          </div>
        </div>
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-white/[0.03] flex items-center gap-4">
          <div className="p-3 rounded-xl bg-red-50 dark:bg-red-500/10 shrink-0">
            <HiOutlineXCircle className="w-5 h-5 text-red-400" />
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-0.5">Tidak Aktif</p>
            <p className="text-2xl font-bold text-gray-800 dark:text-white">
              {faqs.filter((r) => !r.is_active).length}
            </p>
          </div>
        </div>
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-white/[0.03] flex items-center gap-4">
          <div className="p-3 rounded-xl bg-purple-50 dark:bg-purple-500/10 shrink-0">
            <HiOutlineTag className="w-5 h-5 text-purple-500" />
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-0.5">Kategori</p>
            <p className="text-2xl font-bold text-gray-800 dark:text-white">
              {new Set(faqs.map((r) => r.kategori)).size}
            </p>
          </div>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm">
          {error}
        </div>
      )}

      <div className="min-h-screen rounded-2xl border border-gray-200 bg-white px-5 py-3 dark:border-gray-800 dark:bg-white/[0.03] xl:px-10 xl:py-8">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl ring-1 ring-slate-100 shadow-sm overflow-hidden">
          {/* Table header bar */}
          <div className="px-6 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-100">
            <div>
              <h3 className="text-base font-bold text-[#1B2E4B]">Daftar FAQ</h3>
              <p className="text-xs text-slate-400 mt-0.5">Kelola pertanyaan yang sering diajukan</p>
            </div>
            <div className="flex items-center gap-2.5">
              <div className="relative">
                <HiMagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Cari FAQ..."
                  className="pl-9 pr-4 py-2 text-sm rounded-lg bg-slate-50 border border-slate-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 focus:bg-white outline-none transition-all w-48"
                />
              </div>
              <Link
                href="/admin/faq/create"
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 active:scale-95 transition-all shadow-sm shadow-blue-200 dark:shadow-none whitespace-nowrap"
              >
                <HiPlus className="w-4 h-4" />
                Tambah FAQ
              </Link>
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
                {faqs.map((row, index) => (
                  <tr
                    key={row.id}
                    className="hover:bg-blue-50/40 transition-colors"
                  >
                    <td className="px-6 py-4 font-semibold text-[#1B2E4B]">
                      {index + 1}
                    </td>
                    <td className="px-6 py-4 font-medium text-slate-700 max-w-[300px] truncate">{row.pertanyaan}</td>
                    <td className="px-6 py-4 text-slate-500">{row.kategori}</td>
                    <td className="px-6 py-4 text-center">
                      <span className="inline-flex w-7 h-7 items-center justify-center rounded-md bg-slate-100 text-slate-600 font-semibold text-xs border border-slate-200">
                        {row.urutan}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <AdminBadge variant={row.is_active ? "success" : "danger"} dot>
                        {row.is_active ? "Aktif" : "Tidak Aktif"}
                      </AdminBadge>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <FaqTableAction id={row.id} onDelete={() => handleDelete(row.id)} />
                    </td>
                  </tr>
                ))}
                {faqs.length === 0 && !loading && (
                    <tr>
                        <td colSpan={6} className="px-6 py-10 text-center text-slate-500">
                            Tidak ada data FAQ tersedia
                        </td>
                    </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="px-6 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-t border-slate-100 bg-slate-50/50">
            <p className="text-sm text-slate-500">
              Menampilkan{" "}
              <span className="font-semibold text-slate-700">1–{faqs.length}</span> dari{" "}
              <span className="font-semibold text-slate-700">{faqs.length}</span> data
            </p>
            {/* Pagination buttons can be implemented dynamically if needed */}
          </div>
        </div>
      </div>
    </div>
  );
}

import { HiPlus } from "react-icons/hi";
