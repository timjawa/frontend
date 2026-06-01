"use client";

import React, { useState, useEffect } from "react";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import AdminBadge from "@/components/admin/ui/AdminBadge";
import Link from "next/link";
import Image from "next/image";
import { useParams } from "next/navigation";
import api, { getImageUrl } from "@/lib/api";
import {
  HiOutlineArrowLeft,
  HiOutlineHeart,
  HiMapPin,
  HiOutlineDocumentText,
  HiOutlineXCircle,
  HiOutlineBanknotes,
  HiTag,
  HiOutlineChatBubbleLeft,
  HiOutlineChartBar,
  HiOutlineCalendar,
} from "react-icons/hi2";

interface Kampanye {
  id: string;
  judul: string;
  deskripsi: string;
  jenis_bencana: string;
  kecamatan_id: string | null;
  kecamatan?: { nama: string } | null;
  target_donasi: string | null;
  total_terkumpul: string;
  total_disalurkan: string;
  status: "draft" | "aktif" | "ditutup";
  gambar: string | null;
  tanggal_mulai: string;
  tanggal_selesai: string | null;
  created_at: string;
}

interface DonaturHistory {
  id: string;
  nama_donatur: string | null;
  nominal: string;
  pesan: string | null;
  anonim: boolean;
  created_at: string;
}

const statusVariants: Record<string, "success" | "warning" | "default"> = {
  aktif: "success",
  draft: "warning",
  ditutup: "default",
} as const;

const formatCurrency = (value: string | number | null | undefined) =>
  new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(Number(value ?? 0));

const formatDate = (value: string | null | undefined) =>
  value ? new Date(value).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" }) : "—";

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

export default function KampanyeDetailPage() {
  const params = useParams();
  const id = typeof params?.id === "string" ? params.id : "";
  const [data, setData] = useState<Kampanye | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // States for Donor History
  const [donors, setDonors] = useState<DonaturHistory[]>([]);
  const [donorsPage, setDonorsPage] = useState(1);
  const [donorsMeta, setDonorsMeta] = useState<{ current_page: number; last_page: number; total: number } | null>(null);
  const [donorsLoading, setDonorsLoading] = useState(false);
  const [donorsError, setDonorsError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setLoading(false);
      setError("ID kampanye donasi tidak valid.");
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await api.get(`/api/admin/donasi/kampanye/${id}`);
        setData(res.data?.data || null);
      } catch (err: unknown) {
        setError(getErrorMessage(err, "Terjadi kesalahan saat memuat data."));
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  useEffect(() => {
    if (!id) return;

    const fetchDonors = async () => {
      setDonorsLoading(true);
      setDonorsError(null);
      try {
        const res = await api.get("/api/admin/donasi/transaksi", {
          params: { page: donorsPage, per_page: 5, status: "berhasil", kampanye_id: id },
        });
        
        const newDonors = res.data?.data || [];
        setDonors((prev) => (donorsPage === 1 ? newDonors : [...prev, ...newDonors]));
        setDonorsMeta({
          current_page: res.data?.current_page || 1,
          last_page: res.data?.last_page || 1,
          total: res.data?.total || 0,
        });
      } catch (err: unknown) {
        setDonorsError(getErrorMessage(err, "Gagal memuat riwayat donatur."));
      } finally {
        setDonorsLoading(false);
      }
    };

    fetchDonors();
  }, [id, donorsPage]);

  const BackButton = () => (
    <Link
      href="/admin/donasi/kampanye"
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
          <PageBreadcrumb pageTitle="Detail Kampanye Donasi" className="mb-0" />
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
              <SkeletonBox className="h-5 w-40 mb-4" />
              <div className="border-t border-gray-100 dark:border-gray-800 pt-4 space-y-4">
                <div className="flex gap-2">
                  <SkeletonBox className="h-6 w-16 rounded-full" />
                  <SkeletonBox className="h-6 w-20 rounded-full" />
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
                <SkeletonBox className="h-3 w-full" />
                <SkeletonBox className="h-2.5 w-full rounded-full" />
                <div className="grid grid-cols-2 gap-2 pt-2">
                  <SkeletonBox className="h-10 w-full" />
                  <SkeletonBox className="h-10 w-full" />
                </div>
                <SkeletonBox className="h-5 w-40 mt-6" />
                <div className="border-t border-gray-100 dark:border-gray-800 pt-4 space-y-3">
                  <SkeletonBox className="h-10 w-36" />
                  <SkeletonBox className="h-10 w-36" />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6 shadow-sm mb-6">
          <SkeletonBox className="h-5 w-36 mb-4" />
          <SkeletonBox className="h-[280px] w-full rounded-xl" />
        </div>

        <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6 shadow-sm mb-6">
          <SkeletonBox className="h-5 w-40 mb-4" />
          <div className="divide-y divide-gray-100 dark:divide-gray-700">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="flex items-start gap-3 py-3.5 first:pt-0 last:pb-0">
                <SkeletonBox className="w-10 h-10 rounded-xl shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="flex justify-between gap-3">
                    <SkeletonBox className="h-4 w-32" />
                    <SkeletonBox className="h-4 w-24" />
                  </div>
                  <SkeletonBox className="h-3 w-44" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div>
        <div className="flex items-center justify-between mb-6">
          <PageBreadcrumb pageTitle="Detail Kampanye Donasi" className="mb-0" />
          <BackButton />
        </div>
        <div className="flex flex-col items-center justify-center py-20 text-red-500 gap-3">
          <HiOutlineXCircle className="w-12 h-12" />
          <p className="text-base font-medium">{error || "Data tidak ditemukan"}</p>
        </div>
      </div>
    );
  }

  const targetNominal = Number(data.target_donasi ?? 0);
  const terkumpulNominal = Number(data.total_terkumpul);
  const disalurkanNominal = Number(data.total_disalurkan);
  
  const progressPercent = targetNominal > 0 
    ? Math.min(Math.round((terkumpulNominal / targetNominal) * 100), 100) 
    : 0;

  const sisaTarget = targetNominal > terkumpulNominal ? targetNominal - terkumpulNominal : 0;

  const handleLoadMoreDonors = () => {
    if (donorsMeta && donorsPage < donorsMeta.last_page) {
      setDonorsPage((prev) => prev + 1);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <PageBreadcrumb pageTitle="Detail Kampanye Donasi" className="mb-0" />
        <div className="flex items-center gap-2">
          <BackButton />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-5 shadow-sm flex items-center gap-4">
          <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 shrink-0">
            <HiOutlineBanknotes className="w-5 h-5 text-emerald-500" />
          </div>
          <div className="min-w-0">
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">Total Terkumpul</p>
            <p className="text-2xl font-bold text-gray-800 dark:text-white truncate">{formatCurrency(terkumpulNominal)}</p>
          </div>
        </div>
        <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-5 shadow-sm flex items-center gap-4">
          <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-500/10 shrink-0">
            <HiOutlineChartBar className="w-5 h-5 text-blue-500" />
          </div>
          <div className="min-w-0">
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">Progress Target</p>
            <p className="text-2xl font-bold text-gray-800 dark:text-white">{targetNominal > 0 ? `${progressPercent}%` : "Terbuka"}</p>
          </div>
        </div>
        <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-5 shadow-sm flex items-center gap-4">
          <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-500/10 shrink-0">
            <HiOutlineHeart className="w-5 h-5 text-rose-500" />
          </div>
          <div className="min-w-0">
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">Total Donatur</p>
            <p className="text-2xl font-bold text-gray-800 dark:text-white">{donorsMeta?.total ?? 0}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6 items-stretch">
        {/* Kolom Kiri: Info Utama */}
        <div className="lg:col-span-2">
          
          {/* Main Card */}
          <div className="h-full rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-white/[0.03]">
            <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-4 border-b border-gray-100 dark:border-gray-800 pb-3">
              Informasi Kampanye
            </h3>
            <div className="flex flex-wrap items-center gap-2.5 mb-3">
              <AdminBadge variant={statusVariants[data.status] ?? "default"} dot>
                {data.status.toUpperCase()}
              </AdminBadge>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-600 dark:bg-blue-900/10 dark:text-blue-400 border border-blue-100 dark:border-blue-900/20">
                <HiTag className="w-3.5 h-3.5" />
                {data.jenis_bencana}
              </span>
            </div>

            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-4">
              {data.judul}
            </h1>

            {/* Lokasi Terdampak */}
            <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-gray-300 mb-4">
              <HiMapPin className="w-4 h-4 text-slate-400 shrink-0" />
              <span>Lokasi Bencana: <span className="font-semibold text-gray-800 dark:text-gray-100">{data.kecamatan?.nama ?? "Semua Kecamatan (Seluruh Jember)"}</span></span>
            </div>

            <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2 border-t border-gray-100 dark:border-gray-800 pt-4">
              <HiOutlineDocumentText className="w-5 h-5 text-blue-500" />
              Deskripsi Kampanye
            </h3>
            <div className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-line text-sm sm:text-base">
              {data.deskripsi || "— (tidak ada deskripsi)"}
            </div>
          </div>

        </div>

        {/* Kolom Kanan: Finansial & Waktu */}
        <div className="h-full">
          
          {/* Summary Card */}
          <div className="h-full rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-white/[0.03]">
            <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-4 border-b border-gray-100 dark:border-gray-800 pb-3 flex items-center gap-2">
              <HiOutlineBanknotes className="w-5 h-5 text-emerald-500" />
              Informasi Dana
            </h3>
            <div className="space-y-4">
              <div>
                <span className="block text-xs font-medium text-gray-400 mb-1">Total Terkumpul</span>
                <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                  {formatCurrency(terkumpulNominal)}
                </p>
              </div>

              {targetNominal > 0 ? (
                <>
                  <div>
                    <div className="flex justify-between text-xs font-medium text-gray-500 mb-1.5">
                      <span>Target: {formatCurrency(targetNominal)}</span>
                      <span className="font-bold text-blue-600 dark:text-blue-400">{progressPercent}%</span>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-gray-800 rounded-full h-2.5 overflow-hidden">
                      <div 
                        className="bg-blue-600 h-2.5 rounded-full transition-all duration-500" 
                        style={{ width: `${progressPercent}%` }}
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-50 dark:border-gray-800">
                    <div>
                      <span className="block text-[10px] font-medium text-gray-400">Sisa Target</span>
                      <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                        {sisaTarget > 0 ? formatCurrency(sisaTarget) : "Terpenuhi"}
                      </span>
                    </div>
                    <div>
                      <span className="block text-[10px] font-medium text-gray-400">Penyaluran</span>
                      <span className="text-xs font-semibold text-rose-500">
                        {formatCurrency(disalurkanNominal)}
                      </span>
                    </div>
                  </div>
                </>
              ) : (
                <div className="pt-2 border-t border-slate-50 dark:border-gray-800">
                  <span className="block text-[10px] font-medium text-gray-400 mb-1">Telah Disalurkan</span>
                  <span className="text-sm font-semibold text-rose-500">
                    {formatCurrency(disalurkanNominal)}
                  </span>
                  <p className="text-[11px] text-slate-400 mt-1">Kampanye ini tanpa batas target nominal.</p>
                </div>
              )}
            </div>

            <h3 className="text-base font-semibold text-gray-900 dark:text-white mt-6 mb-4 border-b border-gray-100 dark:border-gray-800 pb-3 flex items-center gap-2">
              <HiOutlineCalendar className="w-5 h-5 text-blue-500" />
              Periode Kampanye
            </h3>
            <div className="space-y-3.5">
              <div>
                <span className="block text-xs font-medium text-gray-400">Tanggal Mulai</span>
                <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 mt-0.5">
                  {formatDate(data.tanggal_mulai)}
                </p>
              </div>
              <div>
                <span className="block text-xs font-medium text-gray-400">Tanggal Selesai</span>
                <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 mt-0.5">
                  {data.tanggal_selesai ? formatDate(data.tanggal_selesai) : "Terbuka (Tidak ada batas)"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {data.gambar && (
        <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6 shadow-sm mb-6">
          <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2 border-b border-gray-100 dark:border-gray-700 pb-3">
            <HiOutlineDocumentText className="w-5 h-5 text-emerald-500" />
            Gambar Kampanye
          </h3>
          <div className="relative w-full aspect-[16/6] min-h-[280px] max-h-[460px] rounded-xl overflow-hidden border border-slate-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
            <Image
              src={getImageUrl(data.gambar)}
              alt={data.judul}
              fill
              className="object-cover"
            />
          </div>
        </div>
      )}

      <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6 shadow-sm mb-6">
        <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2 border-b border-gray-100 dark:border-gray-700 pb-3">
          <HiOutlineHeart className="w-5 h-5 text-rose-500" />
          Riwayat Donatur ({donorsMeta?.total ?? 0})
        </h3>

        {donorsError && (
          <div className="mb-4 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs flex items-center gap-2">
            <HiOutlineXCircle className="w-4 h-4 shrink-0" />
            <span>{donorsError}</span>
          </div>
        )}

        {donors.length === 0 && !donorsLoading ? (
          <div className="text-center py-8 text-slate-400 dark:text-gray-500">
            <HiOutlineHeart className="w-10 h-10 mx-auto mb-2 text-slate-300 dark:text-gray-600" />
            <p className="text-sm font-medium">Belum ada donatur untuk kampanye ini.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100 dark:divide-gray-700">
            {donors.map((donor) => {
              const isAnon = donor.anonim;
              const displayName = isAnon ? "Anonim" : donor.nama_donatur ?? "Donatur";
              const initial = isAnon ? "A" : displayName.charAt(0).toUpperCase();

              return (
                <div key={donor.id} className="flex items-start gap-3 py-3.5 first:pt-0 last:pb-0">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 dark:bg-blue-900/20 dark:border-blue-900/30 flex items-center justify-center shrink-0 mt-0.5">
                    <span className="text-sm font-bold text-blue-600 dark:text-blue-400">{initial}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-3 mb-0.5">
                      <span className="text-sm font-semibold text-gray-800 dark:text-gray-200 truncate">{displayName}</span>
                      <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400 shrink-0">{formatCurrency(donor.nominal)}</span>
                    </div>
                    <p className="text-xs text-gray-400 dark:text-gray-500">
                      {new Date(donor.created_at).toLocaleString("id-ID", {
                        day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit"
                      })}
                    </p>
                    {donor.pesan && (
                      <div className="flex items-start gap-2 bg-gray-50 dark:bg-gray-900/50 p-2.5 rounded-lg border border-gray-100 dark:border-gray-700 mt-2">
                        <HiOutlineChatBubbleLeft className="w-3.5 h-3.5 text-slate-400 mt-0.5 shrink-0" />
                        <p className="text-xs text-gray-600 dark:text-gray-300 italic leading-relaxed">&ldquo;{donor.pesan}&rdquo;</p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {donorsLoading && (
              <div className="space-y-3 py-3.5">
                {Array.from({ length: donorsPage === 1 ? 3 : 1 }).map((_, i) => (
                  <div key={i} className="flex gap-3 animate-pulse">
                    <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-gray-700 shrink-0" />
                    <div className="flex-1 space-y-2">
                      <div className="flex justify-between">
                        <div className="h-4 bg-slate-100 dark:bg-gray-700 rounded w-1/4" />
                        <div className="h-4 bg-slate-100 dark:bg-gray-700 rounded w-1/5" />
                      </div>
                      <div className="h-3 bg-slate-100 dark:bg-gray-700 rounded w-1/3" />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {donorsMeta && donorsPage < donorsMeta.last_page && !donorsLoading && (
              <div className="text-center pt-4 mt-2">
                <button
                  onClick={handleLoadMoreDonors}
                  className="px-6 py-2.5 text-xs font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/30 rounded-xl hover:bg-blue-100 dark:hover:bg-blue-900/25 active:scale-95 transition-all"
                >
                  Muat Lebih Banyak Donatur
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
