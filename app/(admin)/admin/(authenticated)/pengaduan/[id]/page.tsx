"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import AdminBadge from "@/components/admin/ui/AdminBadge";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  HiOutlineArrowLeft,
  HiOutlineArrowPath,
  HiOutlineCheckCircle,
  HiOutlineXCircle,
  HiMapPin,
  HiUser,
  HiClock,
  HiDocumentText,
  HiCamera,
  HiVideoCamera,
  HiPhone,
  HiEnvelope,
  HiChatBubbleLeftEllipsis,
  HiExclamationTriangle,
  HiCheckBadge,
} from "react-icons/hi2";
import { resolveMediaSrc, isYouTubeUrl, toYouTubeEmbed } from "@/lib/mediaUrl";

import api from "@/lib/api";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "https://api.jembersiaga.my.id/api";

interface Laporan {
  id: string;
  user_id: string;
  kecamatan_id: string | null;
  jenis_bencana: string;
  deskripsi: string | null;
  alamat_lengkap: string | null;
  latitude: number | string | null;
  longitude: number | string | null;
  status: "baru" | "diinvestigasi" | "diverifikasi" | "ditolak" | "selesai";
  is_draft: boolean;
  dibuat_pada: string;
  updated_at: string;
  
  // Relasi
  user?: {
    id: string;
    name: string;
    email: string;
    no_telepon: string | null;
  };
  kecamatan?: {
    id: string;
    nama: string;
  };
  media?: Array<{
    id: string;
    url: string;
    tipe: "foto" | "video";
    urutan: number;
    uploaded_at?: string | null;
  }>;
  komentar?: Array<{
    id: string;
    user_id: string;
    user?: {
      name: string;
    };
    isi: string;
    dibuat_pada: string;
  }>;
}

function SkeletonBlock({ className }: { className?: string }) {
  return <div className={`animate-pulse bg-gray-200 dark:bg-gray-700 rounded-lg ${className}`} />;
}

export default function PengaduanDetailPage() {
  const params = useParams();
  const id = typeof params?.id === "string" ? params.id : "";
  const [pengaduanData, setPengaduanData] = useState<Laporan | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [submittingComment, setSubmittingComment] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setLoading(false);
      setError("ID laporan tidak valid.");
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await api.get(`/api/admin/laporan/${id}`);
        setPengaduanData(res.data?.data || res.data);
      } catch (err: any) {
        setError(err.response?.data?.message || "Gagal memuat data.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleStatusUpdate = async (newStatus: string) => {
    if (!pengaduanData || !id) return;
    
    setUpdatingStatus(true);
    try {
      const res = await api.put(`/api/admin/laporan/${id}/status`, { status: newStatus });
      setPengaduanData(res.data?.data || res.data);
    } catch (err: any) {
      setError(err.response?.data?.message || "Terjadi kesalahan saat update status.");
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleCommentSubmit = async () => {
    if (!pengaduanData || !commentText.trim() || !id) return;
    
    setSubmittingComment(true);
    try {
      const res = await api.post(`/api/admin/laporan/${id}/comment`, { isi: commentText });
      const newKomentar = res.data?.data || res.data;
      
      setPengaduanData(prev => ({
        ...prev!,
        komentar: [...(prev?.komentar || []), newKomentar]
      }));
      setCommentText("");
    } catch (err: any) {
      setError(err.response?.data?.message || "Terjadi kesalahan menambah komentar.");
    } finally {
      setSubmittingComment(false);
    }
  };

  const statusConfig = {
    baru:          { color: "warning" as const,  label: "Baru",           bg: "bg-yellow-50 dark:bg-yellow-500/10",  border: "border-yellow-200 dark:border-yellow-500/20",  text: "text-yellow-700 dark:text-yellow-400" },
    diinvestigasi: { color: "info" as const,     label: "Diinvestigasi",  bg: "bg-indigo-50 dark:bg-indigo-500/10",  border: "border-indigo-200 dark:border-indigo-500/20",  text: "text-indigo-700 dark:text-indigo-400" },
    diverifikasi:  { color: "default" as const,  label: "Diverifikasi",   bg: "bg-blue-50 dark:bg-blue-500/10",      border: "border-blue-200 dark:border-blue-500/20",      text: "text-blue-700 dark:text-blue-400" },
    selesai:       { color: "success" as const,  label: "Selesai",        bg: "bg-emerald-50 dark:bg-emerald-500/10", border: "border-emerald-200 dark:border-emerald-500/20", text: "text-emerald-700 dark:text-emerald-400" },
    ditolak:       { color: "danger" as const,   label: "Ditolak",        bg: "bg-red-50 dark:bg-red-500/10",         border: "border-red-200 dark:border-red-500/20",         text: "text-red-700 dark:text-red-400" },
  };

  if (error || (!loading && !pengaduanData)) {
    return (
      <div>
        <div className="flex items-center justify-between mb-6">
          <PageBreadcrumb pageTitle="Detail Pengaduan" className="mb-0" />
          <Link
            href="/admin/pengaduan"
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

  const currentStatus = pengaduanData ? statusConfig[pengaduanData.status] : null;
  const lat = pengaduanData ? Number(pengaduanData.latitude) : 0;
  const lng = pengaduanData ? Number(pengaduanData.longitude) : 0;
  const hasCoords = pengaduanData ? Number.isFinite(lat) && Number.isFinite(lng) : false;
  const embedUrl = hasCoords ? `https://maps.google.com/maps?q=${lat},${lng}&z=15&output=embed` : "";
  const mapsUrl = hasCoords ? `https://www.google.com/maps/search/?api=1&query=${lat},${lng}` : "#";

  return (
    <div>
      {/* Page Header */}
      <div className="flex items-center justify-between mb-6">
        <PageBreadcrumb pageTitle="Detail Pengaduan" className="mb-0" />
        <div className="flex gap-3">
          <Link
            href="/admin/pengaduan"
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 bg-white dark:bg-gray-800 border border-slate-200 dark:border-gray-700 rounded-lg hover:bg-slate-50 dark:hover:bg-gray-700 transition-colors"
          >
            <HiOutlineArrowLeft className="w-4 h-4" />
            Kembali
          </Link>

          {/* baru → hanya tombol Investigasi */}
          {!loading && pengaduanData?.status === "baru" && (
            <button
              onClick={() => handleStatusUpdate("diinvestigasi")}
              disabled={updatingStatus}
              className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <HiOutlineArrowPath className="w-4 h-4" />
              {updatingStatus ? "Memproses..." : "Investigasi"}
            </button>
          )}

          {/* diinvestigasi → Tolak & Verifikasi */}
          {!loading && pengaduanData?.status === "diinvestigasi" && (
            <>
              <button
                onClick={() => handleStatusUpdate("ditolak")}
                disabled={updatingStatus}
                className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <HiOutlineXCircle className="w-4 h-4" />
                {updatingStatus ? "Memproses..." : "Tolak"}
              </button>
              <button
                onClick={() => handleStatusUpdate("diverifikasi")}
                disabled={updatingStatus}
                className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <HiOutlineCheckCircle className="w-4 h-4" />
                {updatingStatus ? "Memproses..." : "Verifikasi"}
              </button>
            </>
          )}

          {/* diverifikasi → hanya tombol Selesai */}
          {!loading && pengaduanData?.status === "diverifikasi" && (
            <button
              onClick={() => handleStatusUpdate("selesai")}
              disabled={updatingStatus}
              className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 transition-colors shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <HiOutlineCheckCircle className="w-4 h-4" />
              {updatingStatus ? "Memproses..." : "Selesai"}
            </button>
          )}

          {/* ditolak & selesai → tidak ada tombol aksi */}
        </div>
      </div>

      {/* Stat Cards Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {/* Jenis Bencana */}
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-white/[0.03] flex items-center gap-4">
          <div className="p-3 rounded-xl bg-orange-50 dark:bg-orange-500/10 shrink-0">
            <HiExclamationTriangle className="w-6 h-6 text-orange-500" />
          </div>
          <div>
            <span className="block text-xs font-medium text-gray-500 mb-0.5">Jenis Bencana</span>
            {loading ? <SkeletonBlock className="h-5 w-24" /> : <p className="text-base font-bold text-gray-800 dark:text-white">{pengaduanData?.jenis_bencana}</p>}
          </div>
        </div>

        {/* Status */}
        {loading ? (
          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm flex items-center gap-4">
            <div className="p-3 rounded-xl bg-gray-100 dark:bg-gray-800 shrink-0">
              <HiCheckBadge className="w-6 h-6 text-gray-400" />
            </div>
            <div>
              <SkeletonBlock className="h-3 w-16 mb-1.5" />
              <SkeletonBlock className="h-5 w-20" />
            </div>
          </div>
        ) : (
          <div className={`rounded-2xl border p-5 shadow-sm flex items-center gap-4 ${currentStatus!.bg} ${currentStatus!.border}`}>
            <div className="p-3 rounded-xl bg-white/60 dark:bg-white/10 shrink-0">
              <HiCheckBadge className={`w-6 h-6 ${currentStatus!.text}`} />
            </div>
            <div>
              <span className="block text-xs font-medium text-gray-500 mb-0.5">Status</span>
              <p className={`text-base font-bold ${currentStatus!.text}`}>{currentStatus!.label}</p>
            </div>
          </div>
        )}

        {/* Kecamatan */}
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-white/[0.03] flex items-center gap-4">
          <div className="p-3 rounded-xl bg-green-50 dark:bg-green-500/10 shrink-0">
            <HiMapPin className="w-6 h-6 text-green-600" />
          </div>
          <div>
            <span className="block text-xs font-medium text-gray-500 mb-0.5">Kecamatan</span>
            {loading ? <SkeletonBlock className="h-5 w-28" /> : <p className="text-base font-bold text-gray-800 dark:text-white">{pengaduanData?.kecamatan?.nama || '-'}</p>}
          </div>
        </div>

        {/* Waktu */}
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-white/[0.03] flex items-center gap-4">
          <div className="p-3 rounded-xl bg-purple-50 dark:bg-purple-500/10 shrink-0">
            <HiClock className="w-6 h-6 text-purple-600" />
          </div>
          <div>
            <span className="block text-xs font-medium text-gray-500 mb-0.5">Dilaporkan</span>
            {loading ? (
              <>
                <SkeletonBlock className="h-4 w-20 mb-1" />
                <SkeletonBlock className="h-3 w-16" />
              </>
            ) : (
              <p className="text-sm font-bold text-gray-800 dark:text-white leading-tight">
                {new Date(pengaduanData!.dibuat_pada).toLocaleDateString('id-ID')}
                <span className="block text-xs font-normal text-gray-500">{new Date(pengaduanData!.dibuat_pada).toLocaleTimeString('id-ID')}</span>
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Konten Utama */}
        <div className="lg:col-span-2 space-y-6">

          {/* Deskripsi Kejadian */}
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-white/[0.03]">
            <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-4 border-b border-gray-100 dark:border-gray-800 pb-3 flex items-center gap-2">
              <HiDocumentText className="w-5 h-5 text-blue-500" />
              Deskripsi Kejadian
            </h3>
            {loading ? (
              <div className="space-y-2 mb-4">
                <SkeletonBlock className="h-4 w-full" />
                <SkeletonBlock className="h-4 w-full" />
                <SkeletonBlock className="h-4 w-3/4" />
              </div>
            ) : (
              <div className="text-gray-800 dark:text-gray-200 leading-relaxed whitespace-pre-line bg-blue-50/50 dark:bg-blue-900/10 p-5 rounded-xl border border-blue-100 dark:border-blue-900/30">
                {pengaduanData?.deskripsi?.trim() ? pengaduanData.deskripsi : "— (tidak ada narasi)"}
              </div>
            )}
            <div className="mt-4">
              <span className="block text-xs font-medium text-gray-500 mb-1">Alamat Lengkap</span>
              {loading ? (
                <SkeletonBlock className="h-8 w-full" />
              ) : (
                <p className="text-sm text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-800/40 px-3 py-2 rounded-lg border border-gray-100 dark:border-gray-700/50">
                  {pengaduanData?.alamat_lengkap || '-'}
                </p>
              )}
            </div>
          </div>

          {/* Peta Lokasi */}
          <div className="rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-white/[0.03] overflow-hidden">
            <div className="px-6 pt-5 pb-3 border-b border-gray-100 dark:border-gray-800 flex items-center gap-2">
              <HiMapPin className="w-5 h-5 text-green-600" />
              <h3 className="text-base font-semibold text-gray-900 dark:text-white">Lokasi Kejadian</h3>
            </div>
            {loading ? (
              <div className="w-full h-60 animate-pulse bg-gray-200 dark:bg-gray-700" />
            ) : hasCoords ? (
              <>
                <div className="w-full h-60 bg-gray-100 dark:bg-gray-800">
                  <iframe
                    title="Peta Lokasi Laporan"
                    src={embedUrl}
                    width="100%"
                    height="100%"
                    className="border-0"
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                  />
                </div>
                <div className="px-6 py-3 flex items-center justify-between">
                  <p className="font-mono text-xs text-gray-500">
                    {lat.toFixed(7)}, {lng.toFixed(7)}
                  </p>
                  <a
                    href={mapsUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 font-medium transition-colors"
                  >
                    <HiMapPin className="w-4 h-4" />
                    Buka di Google Maps
                  </a>
                </div>
              </>
            ) : (
              <div className="px-6 py-12 text-center text-gray-500">
                <HiMapPin className="w-10 h-10 mx-auto mb-2 text-gray-300" />
                <p>Lokasi tidak tersedia.</p>
              </div>
            )}
          </div>

          {/* Media Bukti — tabel laporan_media */}
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-white/[0.03]">
            <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-1 border-b border-gray-100 dark:border-gray-800 pb-3 flex items-center gap-2">
              <HiCamera className="w-5 h-5 text-indigo-500" />
              Media bukti
              <span className="ml-auto text-xs font-normal text-gray-400">{loading ? '-' : (pengaduanData?.media?.length || 0)} baris</span>
            </h3>
            <p className="text-xs text-gray-400 mb-4">Kolom: url, tipe, urutan, uploaded_at</p>

            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <SkeletonBlock className="aspect-[4/3] w-full" />
                <SkeletonBlock className="aspect-[4/3] w-full" />
              </div>
            ) : pengaduanData?.media && pengaduanData.media.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {pengaduanData.media.map((item) => {
                  // Tangani data dummy yang tidak memiliki ekstensi
                  let filename = item.url;
                  if (!filename.includes('.')) {
                    filename = item.tipe === 'video' ? `${filename}.mp4` : `${filename}.jpg`;
                  }
                  
                  const mediaUrl = filename.includes('/') ? filename : `/storage/uploads/pengaduan/${filename}`;
                  const resolved = resolveMediaSrc(API_BASE, mediaUrl);
                  const ytEmbed =
                    item.tipe === "video" && isYouTubeUrl(item.url) ? toYouTubeEmbed(item.url) : null;
                  const openHref =
                    item.tipe === "video" && isYouTubeUrl(item.url) ? item.url : resolved;

                  return (
                    <div
                      key={item.id}
                      className="relative group rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 aspect-[4/3] shadow-inner flex flex-col"
                    >
                      <div className="flex-1 min-h-0 relative">
                        {item.tipe === "foto" ? (
                          <img
                            src={resolved}
                            alt={`Bukti urutan ${item.urutan}`}
                            className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-105"
                          />
                        ) : (
                          <div className="w-full h-full flex flex-col items-center justify-center bg-gray-900 text-white p-4 text-center">
                            <HiVideoCamera className="w-8 h-8 text-gray-400 mb-2" />
                            <span className="text-sm font-medium">Dokumentasi Video</span>
                            <span className="text-xs text-gray-400 mt-1">Buka untuk memutar</span>
                          </div>
                        )}
                      </div>
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none group-hover:pointer-events-auto">
                        {item.tipe === "foto" ? (
                          <button
                            onClick={() => setSelectedImage(resolved)}
                            className="px-4 py-2 bg-white text-gray-900 text-sm font-medium rounded-lg shadow-lg hover:bg-gray-50 transition-colors"
                          >
                            Buka
                          </button>
                        ) : (
                          <a
                            href={openHref}
                            target="_blank"
                            rel="noreferrer"
                            className="px-4 py-2 bg-white text-gray-900 text-sm font-medium rounded-lg shadow-lg hover:bg-gray-50 transition-colors"
                          >
                            Buka
                          </a>
                        )}
                      </div>
                      <div className="absolute bottom-0 inset-x-0 bg-black/55 text-white text-[10px] px-2 py-1 truncate">
                        {item.uploaded_at
                          ? `uploaded_at: ${new Date(item.uploaded_at).toLocaleString("id-ID")}`
                          : "uploaded_at: —"}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-10 text-gray-500 bg-gray-50 dark:bg-gray-800/40 rounded-xl border border-dashed border-gray-300 dark:border-gray-700">
                <HiCamera className="w-10 h-10 mx-auto text-gray-300 dark:text-gray-600 mb-2" />
                <p className="text-sm">Tidak ada media bukti yang dilampirkan.</p>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">

          {/* Informasi Laporan */}
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-white/[0.03]">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 border-b border-gray-100 dark:border-gray-800 pb-3">
              Informasi Laporan
            </h3>
            <div className="space-y-4">
              <div>
                <span className="block text-xs font-medium text-gray-500 mb-1">Status</span>
                {loading ? <SkeletonBlock className="h-6 w-20" /> : (
                  <AdminBadge variant={currentStatus!.color} dot>{currentStatus!.label}</AdminBadge>
                )}
              </div>
              <div>
                <span className="block text-xs font-medium text-gray-500 mb-1">Jenis Bencana</span>
                {loading ? <SkeletonBlock className="h-6 w-32" /> : (
                  <span className="inline-flex px-2.5 py-1 rounded-md text-sm font-medium bg-orange-50 text-orange-700 border border-orange-100 dark:bg-orange-900/20 dark:border-orange-800 dark:text-orange-300">
                    {pengaduanData?.jenis_bencana}
                  </span>
                )}
              </div>
              <div>
                <span className="block text-xs font-medium text-gray-500 mb-1">Kecamatan</span>
                {loading ? <SkeletonBlock className="h-5 w-28" /> : (
                  <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">{pengaduanData?.kecamatan?.nama || "—"}</p>
                )}
              </div>
              <div>
                <span className="block text-xs font-medium text-gray-500 mb-1">Dibuat / diperbarui</span>
                {loading ? (
                  <div className="space-y-1">
                    <SkeletonBlock className="h-4 w-40" />
                    <SkeletonBlock className="h-4 w-40" />
                  </div>
                ) : (
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    <span className="block">dibuat_pada: {new Date(pengaduanData!.dibuat_pada).toLocaleString("id-ID")}</span>
                    <span className="block mt-0.5">updated_at: {new Date(pengaduanData!.updated_at).toLocaleString("id-ID")}</span>
                  </p>
                )}
              </div>
              <div>
                <span className="block text-xs font-medium text-gray-500 mb-1">Draft</span>
                {loading ? <SkeletonBlock className="h-6 w-16" /> : (
                  <AdminBadge variant={pengaduanData?.is_draft ? "warning" : "success"}>
                    {pengaduanData?.is_draft ? "Draft" : "Terkirim"}
                  </AdminBadge>
                )}
              </div>
              <div>
                <span className="block text-xs font-medium text-gray-500 mb-1">ID Laporan</span>
                {loading ? <SkeletonBlock className="h-8 w-full" /> : (
                  <p className="text-xs text-gray-600 dark:text-gray-400 break-all font-mono bg-gray-50 dark:bg-gray-800/40 px-2 py-1.5 rounded-lg border border-gray-100 dark:border-gray-700/50">
                    {pengaduanData?.id}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Informasi Pelapor */}
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-white/[0.03]">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 border-b border-gray-100 dark:border-gray-800 pb-3 flex items-center gap-2">
              <HiUser className="w-5 h-5 text-orange-500" />
              Informasi Pelapor
            </h3>
            <div className="space-y-3">
              <div>
                <span className="block text-xs font-medium text-gray-500 mb-1">Nama</span>
                {loading ? <SkeletonBlock className="h-5 w-32" /> : (
                  <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">{pengaduanData?.user?.name || '-'}</p>
                )}
              </div>
              <div className="flex items-center gap-3 bg-gray-50 dark:bg-gray-800/40 p-2.5 rounded-lg border border-gray-100 dark:border-gray-700/50">
                <HiPhone className="w-4 h-4 text-gray-400 shrink-0" />
                {loading ? <SkeletonBlock className="h-5 w-24" /> : (
                  <span className="text-sm text-gray-700 dark:text-gray-300">{pengaduanData?.user?.no_telepon || '-'}</span>
                )}
              </div>
              <div className="flex items-center gap-3 bg-gray-50 dark:bg-gray-800/40 p-2.5 rounded-lg border border-gray-100 dark:border-gray-700/50">
                <HiEnvelope className="w-4 h-4 text-gray-400 shrink-0" />
                {loading ? <SkeletonBlock className="h-5 w-40" /> : (
                  <span className="text-sm text-gray-700 dark:text-gray-300 break-all">{pengaduanData?.user?.email || '-'}</span>
                )}
              </div>
            </div>
          </div>

          {/* Riwayat Komentar */}
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-white/[0.03]">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1 border-b border-gray-100 dark:border-gray-800 pb-3 flex items-center gap-2">
              <HiChatBubbleLeftEllipsis className="w-5 h-5 text-purple-500" />
              Komentar
            </h3>

            <div className="space-y-3 max-h-52 overflow-y-auto mb-4 mt-3">
              {loading ? (
                <div className="space-y-3">
                  <SkeletonBlock className="h-16 w-full" />
                  <SkeletonBlock className="h-16 w-full" />
                </div>
              ) : pengaduanData?.komentar && pengaduanData.komentar.length > 0 ? (
                pengaduanData.komentar.map((k) => (
                  <div key={k.id} className="bg-gray-50 dark:bg-gray-800/40 rounded-xl p-3 border border-gray-100 dark:border-gray-700/50">
                    <div className="flex justify-between items-start gap-2 mb-1.5">
                      <span className="text-xs font-semibold text-gray-800 dark:text-gray-200">{k.user?.name || "Pengguna"}</span>
                      <span className="text-[10px] text-gray-400 shrink-0 text-right leading-tight">
                        {new Date(k.dibuat_pada).toLocaleString("id-ID")}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed whitespace-pre-wrap">{k.isi}</p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-400 italic text-center py-4">Belum ada catatan.</p>
              )}
            </div>

            <div className="pt-4 border-t border-gray-100 dark:border-gray-800">
              <textarea
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                className="w-full text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:text-white transition-all outline-none resize-none"
                placeholder="Tambah catatan..."
                rows={3}
              />
              <button
                onClick={handleCommentSubmit}
                disabled={submittingComment || !commentText.trim()}
                className="mt-2 w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {submittingComment ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    Mengirim...
                  </>
                ) : (
                  <>
                    Kirim Catatan
                  </>
                )}
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* Image Modal (Popup) */}
      {selectedImage && typeof document !== "undefined" && createPortal(
        <div 
          className="fixed inset-0 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
          style={{ zIndex: 9999999 }}
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative max-w-5xl w-full flex items-center justify-center">
            <button 
              className="absolute -top-12 right-0 text-white hover:text-gray-300 transition-colors"
              onClick={() => setSelectedImage(null)}
            >
              <HiOutlineXCircle className="w-10 h-10" />
            </button>
            <img 
              src={selectedImage} 
              alt="Bukti Foto" 
              className="max-w-full max-h-[85vh] object-contain rounded-xl shadow-2xl"
              onClick={(e) => e.stopPropagation()} // Prevent clicking image from closing modal
            />
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
