"use client";

import React, { useState, useEffect } from "react";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import AdminBadge from "@/components/admin/ui/AdminBadge";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  HiOutlineArrowLeft,
  HiOutlinePencil,
  HiMapPin,
  HiOutlinePhone,
  HiOutlineUserCircle,
  HiOutlineHomeModern,
  HiOutlineCheckCircle,
  HiOutlineArrowPath,
  HiOutlineExclamationTriangle,
  HiOutlineXCircle,
  HiOutlineUsers,
} from "react-icons/hi2";
import api from "@/lib/api";

const STATUS_OPT = ["standby", "aktif", "penuh", "tutup"] as const;
const ST: Record<string, { label: string; color: "success" | "info" | "warning" | "danger" | "default", bgCard: string, border: string, text: string, desc: string, icon: any }> = {
  standby: { 
    label: "Standby", 
    color: "info",
    bgCard: "bg-blue-50 dark:bg-blue-500/10",
    border: "border-blue-200 dark:border-blue-500/20",
    text: "text-blue-700 dark:text-blue-400",
    desc: "Pos pengungsian dalam keadaan siaga dan siap digunakan jika diperlukan.",
    icon: <HiOutlineArrowPath className="w-6 h-6 text-blue-600 dark:text-blue-400" />
  },
  aktif: { 
    label: "Aktif", 
    color: "success",
    bgCard: "bg-emerald-50 dark:bg-emerald-500/10",
    border: "border-emerald-200 dark:border-emerald-500/20",
    text: "text-emerald-700 dark:text-emerald-400",
    desc: "Pos pengungsian sedang aktif menerima dan menampung pengungsi.",
    icon: <HiOutlineCheckCircle className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
  },
  penuh: { 
    label: "Penuh", 
    color: "warning",
    bgCard: "bg-orange-50 dark:bg-orange-500/10",
    border: "border-orange-200 dark:border-orange-500/20",
    text: "text-orange-700 dark:text-orange-400",
    desc: "Kapasitas pos pengungsian telah penuh. Tidak dapat menerima pengungsi baru.",
    icon: <HiOutlineExclamationTriangle className="w-6 h-6 text-orange-600 dark:text-orange-400" />
  },
  tutup: { 
    label: "Tutup", 
    color: "danger",
    bgCard: "bg-red-50 dark:bg-red-500/10",
    border: "border-red-200 dark:border-red-500/20",
    text: "text-red-700 dark:text-red-400",
    desc: "Pos pengungsian telah ditutup atau tidak lagi beroperasi.",
    icon: <HiOutlineXCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
  },
};

function SkeletonBlock({ className }: { className?: string }) {
  return <div className={`animate-pulse bg-gray-200 dark:bg-gray-700 rounded-lg ${className}`} />;
}

export default function PosPengungsiDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;

  const [pos, setPos] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await api.get(`/api/pos-pengungsian/${id}`);
        setPos(res.data);
      } catch (err: any) {
        setError(err.response?.data?.message || "Data pos pengungsian tidak ditemukan.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  if (error) {
    return (
      <div>
        <div className="flex items-center justify-between mb-6">
          <PageBreadcrumb pageTitle="Detail Pos Pengungsian" className="mb-0" />
          <Link
            href="/admin/pos-pengungsian"
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
          >
            <HiOutlineArrowLeft className="w-4 h-4" />
            Kembali
          </Link>
        </div>
        <div className="flex flex-col items-center justify-center py-20 text-red-500 gap-3">
          <HiOutlineExclamationTriangle className="w-12 h-12" />
          <p className="text-base font-medium">{error}</p>
        </div>
      </div>
    );
  }

  const statusData = pos ? ST[pos.status] || ST["standby"] : null;
  const mapsUrl = pos && pos.latitude && pos.longitude
    ? `https://www.google.com/maps/search/?api=1&query=${pos.latitude},${pos.longitude}`
    : "#";
  const embedUrl = pos && pos.latitude && pos.longitude
    ? `https://maps.google.com/maps?q=${pos.latitude},${pos.longitude}&z=13&output=embed`
    : "";
  
  const pct = pos && pos.kapasitas > 0 ? Math.min((pos.terisi / pos.kapasitas) * 100, 100) : 0;
  const barColor = pct >= 100 ? "bg-red-500" : pct >= 75 ? "bg-orange-400" : "bg-emerald-500";

  return (
    <div>
      {/* Page Header */}
      <div className="flex items-center justify-between mb-6">
        <PageBreadcrumb pageTitle="Detail Pos Pengungsian" className="mb-0" />
        <div className="flex gap-3">
          <Link
            href="/admin/pos-pengungsian"
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
          >
            <HiOutlineArrowLeft className="w-4 h-4" />
            Kembali
          </Link>
        </div>
      </div>

      {/* Stat Cards Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {/* Nama Pos */}
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-white/[0.03] flex items-center gap-4">
          <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-500/10 shrink-0">
            <HiOutlineHomeModern className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div className="min-w-0">
            <span className="block text-xs font-medium text-gray-500 mb-0.5">Nama Pos</span>
            {loading ? (
              <SkeletonBlock className="h-5 w-24 mt-1" />
            ) : (
              <p className="text-base font-bold text-gray-800 dark:text-white truncate">{pos?.nama}</p>
            )}
          </div>
        </div>

        {/* Kecamatan */}
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-white/[0.03] flex items-center gap-4">
          <div className="p-3 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 shrink-0">
            <HiMapPin className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
          </div>
          <div className="min-w-0">
            <span className="block text-xs font-medium text-gray-500 mb-0.5">Kecamatan</span>
            {loading ? (
              <SkeletonBlock className="h-5 w-28 mt-1" />
            ) : (
              <p className="text-sm font-bold text-gray-800 dark:text-white truncate">{pos?.kecamatan?.nama ?? "—"}</p>
            )}
          </div>
        </div>

        {/* Kapasitas & Terisi */}
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-white/[0.03] flex items-center gap-4">
          <div className="p-3 rounded-xl bg-purple-50 dark:bg-purple-500/10 shrink-0">
            <HiOutlineUsers className="w-6 h-6 text-purple-600 dark:text-purple-400" />
          </div>
          <div className="w-full pr-2">
            <span className="block text-xs font-medium text-gray-500 mb-0.5">Keterisian</span>
            {loading ? (
              <SkeletonBlock className="h-5 w-16 mt-1" />
            ) : (
              <div className="flex items-center gap-2">
                 <p className="text-base font-bold text-gray-800 dark:text-white">
                  {pos?.terisi ?? 0} <span className="text-sm font-normal text-gray-500">/ {pos?.kapasitas ?? 0}</span>
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Status */}
        {loading ? (
          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm flex items-center gap-4">
            <div className="p-3 rounded-xl bg-gray-100 shrink-0">
              <HiOutlineExclamationTriangle className="w-6 h-6 text-gray-400" />
            </div>
            <div>
              <SkeletonBlock className="h-3 w-20 mb-2" />
              <SkeletonBlock className="h-5 w-16" />
            </div>
          </div>
        ) : (
          <div className={`rounded-2xl border p-5 shadow-sm flex items-center gap-4 ${statusData?.bgCard} ${statusData?.border}`}>
            <div className="p-3 rounded-xl bg-white/60 dark:bg-white/10 shrink-0">
              {statusData?.icon}
            </div>
            <div>
              <span className="block text-xs font-medium text-gray-500 mb-0.5">Status</span>
              <p className={`text-base font-bold ${statusData?.text}`}>{statusData?.label}</p>
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Konten Utama - Peta & Koordinat */}
        <div className="lg:col-span-2 space-y-6">
          {/* Peta Embed */}
          <div className="rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-white/[0.03] overflow-hidden">
            <div className="px-6 pt-5 pb-3 border-b border-gray-100 dark:border-gray-800">
              <h3 className="text-base font-semibold text-gray-900 dark:text-white">Lokasi di Peta</h3>
            </div>
            <div className="w-full h-64 bg-gray-100 dark:bg-gray-800">
              {loading ? (
                <div className="w-full h-full animate-pulse bg-gray-200 dark:bg-gray-700" />
              ) : pos?.latitude && pos?.longitude ? (
                <iframe
                  title={`Peta Pos ${pos?.nama}`}
                  src={embedUrl}
                  width="100%"
                  height="100%"
                  className="border-0 grayscale-[20%]"
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  <p>Koordinat tidak tersedia</p>
                </div>
              )}
            </div>
            <div className="px-6 py-3">
              <a
                href={mapsUrl}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-center gap-2 w-full py-2 bg-blue-50 hover:bg-blue-100 text-blue-600 dark:bg-blue-500/10 dark:hover:bg-blue-500/20 dark:text-blue-400 font-medium rounded-xl transition-colors text-sm border border-blue-100 dark:border-blue-500/20"
              >
                <HiMapPin className="w-4 h-4" />
                Buka di Google Maps
              </a>
            </div>
          </div>

          {/* Koordinat Detail */}
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-white/[0.03]">
            <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-4 border-b border-gray-100 dark:border-gray-800 pb-3">
              Koordinat Geografis
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-gray-50 dark:bg-gray-800/40 rounded-xl border border-gray-100 dark:border-gray-700/50 p-4">
                <span className="block text-xs font-medium text-gray-500 mb-2 uppercase tracking-wider">Latitude</span>
                {loading ? (
                  <SkeletonBlock className="h-7 w-32 mt-1" />
                ) : (
                  <>
                    <p className="font-mono text-xl font-bold text-gray-800 dark:text-gray-200">
                      {pos?.latitude ? Number(pos.latitude).toFixed(7) : "—"}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">Lintang Selatan (LS)</p>
                  </>
                )}
              </div>
              <div className="bg-gray-50 dark:bg-gray-800/40 rounded-xl border border-gray-100 dark:border-gray-700/50 p-4">
                <span className="block text-xs font-medium text-gray-500 mb-2 uppercase tracking-wider">Longitude</span>
                {loading ? (
                  <SkeletonBlock className="h-7 w-32 mt-1" />
                ) : (
                  <>
                    <p className="font-mono text-xl font-bold text-gray-800 dark:text-gray-200">
                      {pos?.longitude ? Number(pos.longitude).toFixed(7) : "—"}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">Bujur Timur (BT)</p>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Informasi Pos */}
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-white/[0.03]">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 border-b border-gray-100 dark:border-gray-800 pb-3">
              Informasi Pos Pengungsian
            </h3>
            <div className="space-y-4">
              <div>
                <span className="block text-xs font-medium text-gray-500 mb-1">Status</span>
                {loading ? (
                  <SkeletonBlock className="h-6 w-20" />
                ) : (
                  <AdminBadge variant={statusData!.color} dot>
                    {statusData!.label}
                  </AdminBadge>
                )}
              </div>

              <div>
                <span className="block text-xs font-medium text-gray-500 mb-1">Penanggung Jawab</span>
                {loading ? (
                  <SkeletonBlock className="h-6 w-32" />
                ) : (
                  <div className="flex items-center gap-2 text-sm text-gray-800 dark:text-gray-200">
                    <HiOutlineUserCircle className="w-5 h-5 text-gray-400" />
                    {pos?.penanggung_jawab || "—"}
                  </div>
                )}
              </div>

              <div>
                <span className="block text-xs font-medium text-gray-500 mb-1">Telepon</span>
                {loading ? (
                  <SkeletonBlock className="h-6 w-28" />
                ) : (
                  <div className="flex items-center gap-2 text-sm text-gray-800 dark:text-gray-200">
                    <HiOutlinePhone className="w-5 h-5 text-gray-400" />
                    {pos?.telepon ? (
                      <a href={`tel:${pos.telepon}`} className="hover:text-blue-500 transition-colors">{pos.telepon}</a>
                    ) : "—"}
                  </div>
                )}
              </div>

              <div>
                <span className="block text-xs font-medium text-gray-500 mb-1">Alamat</span>
                {loading ? (
                  <SkeletonBlock className="h-10 w-full" />
                ) : (
                  <p className="text-sm text-gray-800 dark:text-gray-200">
                    {pos?.alamat || "—"}
                  </p>
                )}
              </div>
              
              <div>
                <span className="block text-xs font-medium text-gray-500 mb-1">ID Pos</span>
                {loading ? (
                  <SkeletonBlock className="h-8 w-full" />
                ) : (
                  <p className="text-xs text-gray-600 dark:text-gray-400 break-all font-mono bg-gray-50 dark:bg-gray-800/40 px-2 py-1.5 rounded-lg border border-gray-100 dark:border-gray-700/50">
                    {pos?.id}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Kapasitas Visual */}
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-white/[0.03]">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 border-b border-gray-100 dark:border-gray-800 pb-3">
              Kapasitas Terisi
            </h3>

            <div className="mb-3 flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">Persentase Keterisian</span>
              {loading ? (
                <SkeletonBlock className="h-5 w-12" />
              ) : (
                <span className="text-sm font-bold text-gray-800 dark:text-white">{Math.round(pct)}%</span>
              )}
            </div>

            {/* Progress bar */}
            <div className="w-full h-2.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden mb-2">
              {!loading && (
                <div className={`h-full rounded-full ${barColor} transition-all duration-700`} style={{ width: `${pct}%` }} />
              )}
            </div>
            <div className="flex justify-between text-xs text-gray-400 mb-5">
              <span>0%</span>
              <span>100%</span>
            </div>

            {loading ? (
              <SkeletonBlock className="h-16 w-full" />
            ) : (
              <div className={`p-4 rounded-xl border text-sm leading-relaxed ${statusData?.bgCard} ${statusData?.border} ${statusData?.text}`}>
                {statusData?.desc}
              </div>
            )}
          </div>
          
          {/* Fasilitas */}
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-white/[0.03]">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 border-b border-gray-100 dark:border-gray-800 pb-3">
              Fasilitas Tersedia
            </h3>
            {loading ? (
               <div className="flex flex-wrap gap-2">
                 <SkeletonBlock className="h-6 w-16" />
                 <SkeletonBlock className="h-6 w-24" />
                 <SkeletonBlock className="h-6 w-20" />
               </div>
            ) : pos?.fasilitas && pos.fasilitas.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {pos.fasilitas.map((f: string) => (
                  <span key={f} className="px-3 py-1 rounded-lg bg-slate-100 text-slate-700 text-xs font-medium border border-slate-200 capitalize">
                    {f}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500 italic">Belum ada fasilitas terdata.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
