"use client";

import React, { useState, useEffect } from "react";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import AdminBadge from "@/components/admin/ui/AdminBadge";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  HiOutlineArrowLeft,
  HiOutlineBellAlert,
  HiMapPin,
  HiUser,
  HiClock,
  HiDocumentText,
  HiOutlineXCircle,
} from "react-icons/hi2";

const getApiBase = () => process.env.NEXT_PUBLIC_API_URL || (typeof window !== 'undefined' && ["localhost", "127.0.0.1"].includes(window.location.hostname) ? `${window.location.protocol}//${window.location.hostname}:8000/api` : "https://api.jembersiaga.my.id/api");

interface PeringatanDini {
  id: string;
  kecamatan_id: string;
  kecamatan?: { nama: string };
  dibuat_oleh: string;
  pembuat?: { name: string; email?: string; no_telepon?: string };
  deskripsi: string;
  tingkat_urgensi: "rendah" | "sedang" | "tinggi" | "kritis";
  is_active: boolean;
  created_at: string;
}

const urgensiColors: Record<string, "info" | "warning" | "danger" | "success" | "default"> = {
  rendah: "info",
  sedang: "warning",
  tinggi: "danger",
  kritis: "danger",
};

export default function PeringatanDiniDetailPage() {
  const params = useParams();
  const id = typeof params?.id === "string" ? params.id : "";
  const [data, setData] = useState<PeringatanDini | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setLoading(false);
      setError("ID peringatan dini tidak valid.");
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`${getApiBase()}/peringatan-dini/${id}`);
        if (!res.ok) {
          throw new Error("Gagal memuat data peringatan dini.");
        }
        const json = await res.json();
        setData(json.data || null);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Terjadi kesalahan saat memuat data.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  if (loading) {
    return (
      <div>
        <div className="flex items-center justify-between mb-6">
          <PageBreadcrumb pageTitle="Detail Peringatan Dini" className="mb-0" />
          <Link
            href="/admin/peringatan-dini"
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
          >
            <HiOutlineArrowLeft className="w-4 h-4" />
            Kembali
          </Link>
        </div>
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div>
        <div className="flex items-center justify-between mb-6">
          <PageBreadcrumb pageTitle="Detail Peringatan Dini" className="mb-0" />
          <Link
            href="/admin/peringatan-dini"
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
          >
            <HiOutlineArrowLeft className="w-4 h-4" />
            Kembali
          </Link>
        </div>
        <div className="flex flex-col items-center justify-center py-20 text-red-500 gap-3">
          <HiOutlineXCircle className="w-12 h-12" />
          <p className="text-base font-medium">{error || "Data tidak ditemukan"}</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <PageBreadcrumb pageTitle="Detail Peringatan Dini" className="mb-0" />
        <Link
          href="/admin/peringatan-dini"
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 bg-white dark:bg-gray-800 border border-slate-200 dark:border-gray-700 rounded-lg hover:bg-slate-50 dark:hover:bg-gray-700 transition-colors"
        >
          <HiOutlineArrowLeft className="w-4 h-4" />
          Kembali
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Kolom Kiri: Detail Utama */}
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-white/[0.03]">
            <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-4 border-b border-gray-100 dark:border-gray-800 pb-3 flex items-center gap-2">
              <HiDocumentText className="w-5 h-5 text-blue-500" />
              Deskripsi Peringatan
            </h3>
            <div className="text-gray-800 dark:text-gray-200 leading-relaxed whitespace-pre-line bg-blue-50/50 dark:bg-blue-900/10 p-5 rounded-xl border border-blue-100 dark:border-blue-900/30">
              {data.deskripsi || "— (tidak ada deskripsi)"}
            </div>
            
            <div className="mt-6 flex flex-wrap gap-4">
              <div className="flex-1 bg-gray-50 dark:bg-gray-800/40 p-4 rounded-xl border border-gray-100 dark:border-gray-700/50">
                <div className="flex items-center gap-2 mb-2">
                  <HiOutlineBellAlert className="w-5 h-5 text-orange-500" />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Tingkat Urgensi</span>
                </div>
                <AdminBadge variant={urgensiColors[data.tingkat_urgensi] ?? "info"}>
                  {data.tingkat_urgensi.toUpperCase()}
                </AdminBadge>
              </div>

              <div className="flex-1 bg-gray-50 dark:bg-gray-800/40 p-4 rounded-xl border border-gray-100 dark:border-gray-700/50">
                <div className="flex items-center gap-2 mb-2">
                  <HiOutlineXCircle className={`w-5 h-5 ${data.is_active ? "text-emerald-500" : "text-red-500"}`} />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Status</span>
                </div>
                <AdminBadge variant={data.is_active ? "success" : "danger"} dot>
                  {data.is_active ? "Aktif" : "Tidak Aktif"}
                </AdminBadge>
              </div>
            </div>
          </div>
        </div>

        {/* Kolom Kanan: Info Tambahan */}
        <div className="space-y-6">
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-white/[0.03]">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 border-b border-gray-100 dark:border-gray-800 pb-3 flex items-center gap-2">
              <HiMapPin className="w-5 h-5 text-green-500" />
              Lokasi Terdampak
            </h3>
            <div className="space-y-3">
              <div>
                <span className="block text-xs font-medium text-gray-500 mb-1">Kecamatan</span>
                <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                  {data.kecamatan?.nama ?? "Semua Kecamatan (Seluruh Kabupaten)"}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-white/[0.03]">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 border-b border-gray-100 dark:border-gray-800 pb-3 flex items-center gap-2">
              <HiUser className="w-5 h-5 text-purple-500" />
              Informasi Pembuat
            </h3>
            <div className="space-y-3">
              <div>
                <span className="block text-xs font-medium text-gray-500 mb-1">Nama</span>
                <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                  {data.pembuat?.name || "Admin / Sistem"}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-white/[0.03]">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 border-b border-gray-100 dark:border-gray-800 pb-3 flex items-center gap-2">
              <HiClock className="w-5 h-5 text-blue-500" />
              Riwayat Waktu
            </h3>
            <div className="space-y-3">
              <div>
                <span className="block text-xs font-medium text-gray-500 mb-1">Dibuat Pada</span>
                <p className="text-sm text-gray-800 dark:text-gray-200">
                  {new Date(data.created_at).toLocaleString("id-ID")}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
