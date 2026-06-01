"use client";

import React, { useEffect, useState } from "react";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import AdminBadge from "@/components/admin/ui/AdminBadge";
import Link from "next/link";
import Image from "next/image";
import { useParams } from "next/navigation";
import api, { getImageUrl } from "@/lib/api";
import {
  HiOutlineArrowLeft,
  HiOutlineBanknotes,
  HiOutlineChartBar,
  HiOutlineDocumentText,
  HiOutlinePencil,
  HiOutlineReceiptRefund,
  HiOutlineUser,
  HiOutlineXCircle,
  HiClock,
  HiMapPin,
} from "react-icons/hi2";

interface Penyaluran {
  id: string;
  judul: string;
  deskripsi: string;
  nominal: string;
  penerima: string;
  tanggal_penyaluran: string;
  status: "draft" | "publish";
  bukti: string | null;
  bukti_url?: string | null;
  created_at: string;
  kampanye?: { id: string; judul: string; jenis_bencana?: string | null } | null;
}

const statusVariants: Record<string, "success" | "warning"> = {
  publish: "success",
  draft: "warning",
};

const formatCurrency = (value: string | number | null | undefined) =>
  new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(Number(value ?? 0));

const formatDate = (value: string | null | undefined) =>
  value ? new Date(value).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" }) : "-";

const formatDateTime = (value: string | null | undefined) =>
  value
    ? new Date(value).toLocaleString("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "-";

const getErrorMessage = (err: unknown, fallback: string) => {
  if (typeof err === "object" && err !== null) {
    const error = err as { response?: { data?: { message?: unknown } }; message?: unknown };
    if (typeof error.response?.data?.message === "string") return error.response.data.message;
    if (typeof error.message === "string") return error.message;
  }

  return fallback;
};

function SkeletonBox({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse rounded-lg bg-slate-100 dark:bg-gray-700 ${className}`} />;
}

export default function PenyaluranDetailPage() {
  const params = useParams();
  const id = typeof params?.id === "string" ? params.id : "";
  const [data, setData] = useState<Penyaluran | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setLoading(false);
      setError("ID penyaluran tidak valid.");
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await api.get(`/api/admin/donasi/penyaluran/${id}`);
        setData(res.data?.data || null);
      } catch (err: unknown) {
        setError(getErrorMessage(err, "Terjadi kesalahan saat memuat data."));
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const BackButton = () => (
    <Link
      href="/admin/donasi/penyaluran"
      className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 bg-white dark:bg-gray-800 border border-slate-200 dark:border-gray-700 rounded-lg hover:bg-slate-50 dark:hover:bg-gray-700 transition-colors"
    >
      <HiOutlineArrowLeft className="w-4 h-4" />
      Kembali
    </Link>
  );

  if (loading) {
    return (
      <div>
        <div className="flex items-center justify-between mb-6">
          <PageBreadcrumb pageTitle="Detail Penyaluran Donasi" className="mb-0" />
          <BackButton />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-5 shadow-sm flex items-center gap-4">
              <SkeletonBox className="w-11 h-11 rounded-xl shrink-0" />
              <div className="flex-1 space-y-2">
                <SkeletonBox className="h-3 w-24" />
                <SkeletonBox className="h-7 w-32" />
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6 items-stretch">
          <div className="lg:col-span-2">
            <div className="h-full rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-white/[0.03]">
              <SkeletonBox className="h-5 w-44 mb-4" />
              <div className="border-t border-gray-100 dark:border-gray-800 pt-4 space-y-4">
                <div className="flex gap-2">
                  <SkeletonBox className="h-6 w-20 rounded-full" />
                  <SkeletonBox className="h-6 w-24 rounded-full" />
                </div>
                <SkeletonBox className="h-8 w-2/5" />
                <SkeletonBox className="h-4 w-64" />
                <div className="border-t border-gray-100 dark:border-gray-800 pt-4 space-y-3">
                  <SkeletonBox className="h-5 w-44" />
                  <SkeletonBox className="h-4 w-full" />
                  <SkeletonBox className="h-4 w-3/4" />
                </div>
              </div>
            </div>
          </div>

          <div className="h-full">
            <div className="h-full rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-white/[0.03]">
              <SkeletonBox className="h-5 w-32 mb-4" />
              <div className="border-t border-gray-100 dark:border-gray-800 pt-4 space-y-4">
                <SkeletonBox className="h-3 w-28" />
                <SkeletonBox className="h-8 w-40" />
                <SkeletonBox className="h-5 w-40 mt-6" />
                <div className="border-t border-gray-100 dark:border-gray-800 pt-4 space-y-3">
                  <SkeletonBox className="h-10 w-40" />
                  <SkeletonBox className="h-10 w-36" />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6 shadow-sm mb-6">
          <SkeletonBox className="h-5 w-40 mb-4" />
          <SkeletonBox className="h-[280px] w-full rounded-xl" />
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div>
        <div className="flex items-center justify-between mb-6">
          <PageBreadcrumb pageTitle="Detail Penyaluran Donasi" className="mb-0" />
          <BackButton />
        </div>
        <div className="flex flex-col items-center justify-center py-20 text-red-500 gap-3">
          <HiOutlineXCircle className="w-12 h-12" />
          <p className="text-base font-medium">{error || "Data tidak ditemukan"}</p>
        </div>
      </div>
    );
  }

  const isPdf = data.bukti?.toLowerCase().endsWith(".pdf");
  const buktiUrl = data.bukti_url || (data.bukti ? getImageUrl(data.bukti) : null);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <PageBreadcrumb pageTitle="Detail Penyaluran Donasi" className="mb-0" />
        <div className="flex items-center gap-2">
          <Link
            href={`/admin/donasi/penyaluran/${id}/edit`}
            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 active:scale-95 transition-all shadow-sm"
          >
            <HiOutlinePencil className="w-4 h-4" />
            Edit
          </Link>
          <BackButton />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-5 shadow-sm flex items-center gap-4">
          <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 shrink-0">
            <HiOutlineBanknotes className="w-5 h-5 text-emerald-500" />
          </div>
          <div className="min-w-0">
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">Nominal Disalurkan</p>
            <p className="text-2xl font-bold text-gray-800 dark:text-white truncate">{formatCurrency(data.nominal)}</p>
          </div>
        </div>
        <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-5 shadow-sm flex items-center gap-4">
          <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-500/10 shrink-0">
            <HiOutlineChartBar className="w-5 h-5 text-blue-500" />
          </div>
          <div className="min-w-0">
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">Status Penyaluran</p>
            <p className="text-2xl font-bold text-gray-800 dark:text-white capitalize">{data.status}</p>
          </div>
        </div>
        <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-5 shadow-sm flex items-center gap-4">
          <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-500/10 shrink-0">
            <HiClock className="w-5 h-5 text-rose-500" />
          </div>
          <div className="min-w-0">
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">Tanggal Penyaluran</p>
            <p className="text-xl font-bold text-gray-800 dark:text-white truncate">{formatDate(data.tanggal_penyaluran)}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6 items-stretch">
        <div className="lg:col-span-2">
          <div className="h-full rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-white/[0.03]">
            <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-4 border-b border-gray-100 dark:border-gray-800 pb-3">
              Informasi Penyaluran
            </h3>

            <div className="flex flex-wrap items-center gap-2.5 mb-3">
              <AdminBadge variant={statusVariants[data.status] ?? "warning"} dot>
                {data.status.toUpperCase()}
              </AdminBadge>
              {data.kampanye?.jenis_bencana && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-600 dark:bg-blue-900/10 dark:text-blue-400 border border-blue-100 dark:border-blue-900/20">
                  <HiOutlineReceiptRefund className="w-3.5 h-3.5" />
                  {data.kampanye.jenis_bencana}
                </span>
              )}
            </div>

            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-4">
              {data.judul}
            </h1>

            <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-gray-300 mb-4">
              <HiOutlineUser className="w-4 h-4 text-slate-400 shrink-0" />
              <span>
                Penerima: <span className="font-semibold text-gray-800 dark:text-gray-100">{data.penerima}</span>
              </span>
            </div>

            <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2 border-t border-gray-100 dark:border-gray-800 pt-4">
              <HiOutlineDocumentText className="w-5 h-5 text-blue-500" />
              Deskripsi Penyaluran
            </h3>
            <div className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-line text-sm sm:text-base">
              {data.deskripsi || "- (tidak ada deskripsi)"}
            </div>
          </div>
        </div>

        <div className="h-full">
          <div className="h-full rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-white/[0.03]">
            <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-4 border-b border-gray-100 dark:border-gray-800 pb-3 flex items-center gap-2">
              <HiOutlineBanknotes className="w-5 h-5 text-emerald-500" />
              Informasi Dana
            </h3>
            <div className="space-y-3">
              <div>
                <span className="block text-xs font-medium text-gray-400 mb-1">Nominal Disalurkan</span>
                <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                  {formatCurrency(data.nominal)}
                </p>
              </div>
              <div className="pt-3 border-t border-slate-50 dark:border-gray-800">
                <span className="block text-xs font-medium text-gray-400 mb-1">Penerima Bantuan</span>
                <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">{data.penerima}</p>
              </div>
            </div>

            {data.kampanye && (
              <>
                <h3 className="text-base font-semibold text-gray-900 dark:text-white mt-6 mb-4 border-b border-gray-100 dark:border-gray-800 pb-3 flex items-center gap-2">
                  <HiMapPin className="w-5 h-5 text-rose-500" />
                  Kampanye Terkait
                </h3>
                <div>
                  <span className="block text-xs font-medium text-gray-400 mb-1">Nama Kampanye</span>
                  <Link
                    href={`/admin/donasi/kampanye/${data.kampanye.id}`}
                    className="text-sm font-semibold text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    {data.kampanye.judul}
                  </Link>
                  {data.kampanye.jenis_bencana && <p className="text-xs text-slate-400 mt-1">{data.kampanye.jenis_bencana}</p>}
                </div>
              </>
            )}

            <h3 className="text-base font-semibold text-gray-900 dark:text-white mt-6 mb-4 border-b border-gray-100 dark:border-gray-800 pb-3 flex items-center gap-2">
              <HiClock className="w-5 h-5 text-blue-500" />
              Waktu Penyaluran
            </h3>
            <div className="space-y-3.5">
              <div>
                <span className="block text-xs font-medium text-gray-400">Tanggal Penyaluran</span>
                <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 mt-0.5">
                  {formatDate(data.tanggal_penyaluran)}
                </p>
              </div>
              <div>
                <span className="block text-xs font-medium text-gray-400">Dibuat Pada</span>
                <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 mt-0.5">
                  {formatDateTime(data.created_at)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6 shadow-sm mb-6">
        <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2 border-b border-gray-100 dark:border-gray-700 pb-3">
          <HiOutlineDocumentText className="w-5 h-5 text-emerald-500" />
          Bukti Penyaluran
        </h3>

        {buktiUrl ? (
          isPdf ? (
            <a
              href={buktiUrl}
              target="_blank"
              rel="noreferrer"
              className="flex min-h-[220px] w-full items-center justify-center gap-3 rounded-xl border border-blue-100 bg-blue-50 text-sm font-semibold text-blue-600 transition-colors hover:bg-blue-100 dark:border-blue-900/20 dark:bg-blue-900/10 dark:text-blue-400 dark:hover:bg-blue-900/20"
            >
              <HiOutlineDocumentText className="w-6 h-6" />
              Lihat Dokumen PDF
            </a>
          ) : (
            <div className="relative w-full aspect-[16/6] min-h-[280px] max-h-[460px] rounded-xl overflow-hidden border border-slate-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
              <Image
                src={buktiUrl}
                alt="Bukti Penyaluran"
                fill
                className="object-contain"
              />
            </div>
          )
        ) : (
          <div className="text-center py-10 text-slate-400 dark:text-gray-500">
            <HiOutlineDocumentText className="w-10 h-10 mx-auto mb-2 text-slate-300 dark:text-gray-600" />
            <p className="text-sm font-medium">Belum ada bukti penyaluran.</p>
          </div>
        )}
      </div>
    </div>
  );
}
