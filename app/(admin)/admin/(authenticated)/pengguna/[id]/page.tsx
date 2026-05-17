"use client";

import React, { useState, useEffect, useCallback } from "react";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import AdminBadge from "@/components/admin/ui/AdminBadge";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  HiOutlineArrowLeft,
  HiOutlineNoSymbol,
  HiOutlineCheckCircle,
  HiOutlineEnvelope,
  HiOutlinePhone,
  HiOutlineMapPin,
  HiOutlineCalendar,
  HiOutlineIdentification,
  HiOutlineStar,
  HiOutlineDocumentText,
  HiOutlineChatBubbleLeftRight,
  HiOutlineArrowTrendingUp,
  HiOutlineExclamationCircle,
  HiOutlineExclamationTriangle,
  HiOutlineArrowPath,
} from "react-icons/hi2";
import api from "@/lib/api";

const roleConfig: Record<string, { label: string; variant: "info" | "warning" | "success" | "danger" | "default" }> = {
  masyarakat: { label: "Masyarakat", variant: "info" },
  admin_bpbd: { label: "Admin BPBD", variant: "warning" },
};

const aktivitasIcon: Record<string, React.ReactNode> = {
  laporan:    <HiOutlineDocumentText className="w-4 h-4 text-blue-500" />,
  komentar:   <HiOutlineChatBubbleLeftRight className="w-4 h-4 text-slate-400" />,
  poin:       <HiOutlineArrowTrendingUp className="w-4 h-4 text-emerald-500" />,
};

const aktivitasBadge: Record<string, { label: string; variant: "info" | "warning" | "success" | "danger" | "default" }> = {
  laporan:    { label: "Laporan",    variant: "info" },
  komentar:   { label: "Komentar",   variant: "default" },
  poin:       { label: "Poin",       variant: "success" },
};

function Avatar({ name, foto }: { name: string; foto: string | null }) {
  if (foto) return <img src={foto} alt={name} className="w-20 h-20 rounded-2xl object-cover" />;
  const initials = name.split(" ").slice(0, 2).map((w) => w[0] ?? "").join("").toUpperCase() || "?";
  const colors = ["bg-blue-500", "bg-purple-500", "bg-emerald-500", "bg-orange-500", "bg-rose-500", "bg-indigo-500"];
  const color = colors[name.charCodeAt(0) % colors.length] ?? "bg-blue-500";
  return (
    <div className={`w-20 h-20 rounded-2xl ${color} flex items-center justify-center text-white text-2xl font-bold shrink-0`}>
      {initials}
    </div>
  );
}

function SkeletonBox({ className }: { className?: string }) {
  return <div className={`animate-pulse bg-slate-100 dark:bg-gray-700 rounded-lg ${className}`} />;
}

export default function PenggunaDetailPage() {
  const params = useParams();
  const id = params?.id as string;

  const [data, setData]       = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);

  // toggle state
  const [showConfirm, setShowConfirm] = useState(false);
  const [toggling, setToggling]       = useState(false);
  const [toggleErr, setToggleErr]     = useState<string | null>(null);

  const fetchDetail = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get(`/api/admin/pengguna/${id}`);
      setData(res.data);
    } catch (err: any) {
      setError(err.response?.data?.message || "Gagal memuat data pengguna.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { fetchDetail(); }, [fetchDetail]);

  const handleToggle = async () => {
    setToggling(true);
    setToggleErr(null);
    try {
      await api.put(`/api/admin/pengguna/${id}/toggle-active`);
      setShowConfirm(false);
      await fetchDetail();
    } catch (err: any) {
      setToggleErr(err.response?.data?.message || "Gagal mengubah status.");
    } finally {
      setToggling(false);
    }
  };

  const user    = data?.user;
  const points  = data?.points  ?? { total_points: 0, updated_at: null };
  const stats   = data?.stats   ?? { total_laporan: 0, total_komentar: 0 };
  const aktivitas = data?.aktivitas ?? [];
  const role    = user ? (roleConfig[user.role] ?? { label: user.role, variant: "default" as const }) : null;
  const isActive = user?.is_active ?? false;

  // ── Error State ──────────────────────────────────────────────
  if (!loading && error) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <HiOutlineExclamationCircle className="w-12 h-12 text-red-400 mb-3" />
        <p className="text-lg font-semibold text-slate-700">{error}</p>
        <Link href="/admin/pengguna" className="mt-4 text-sm text-blue-500 hover:underline flex items-center gap-1">
          <HiOutlineArrowLeft className="w-4 h-4" /> Kembali ke daftar
        </Link>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <PageBreadcrumb pageTitle="Detail Pengguna" className="mb-0" />
        <div className="flex gap-3">
          <Link
            href="/admin/pengguna"
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-600 dark:text-gray-300 bg-white dark:bg-gray-800 border border-slate-200 dark:border-gray-700 rounded-lg hover:bg-slate-50 dark:hover:bg-gray-700 transition-colors"
          >
            <HiOutlineArrowLeft className="w-4 h-4" />
            Kembali
          </Link>
          {!loading && user && (
            <button
              onClick={() => { setShowConfirm(true); setToggleErr(null); }}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white rounded-lg transition-all shadow-sm ${
                isActive ? "bg-rose-600 hover:bg-rose-700" : "bg-emerald-600 hover:bg-emerald-700"
              }`}
            >
              {isActive ? <><HiOutlineNoSymbol className="w-4 h-4" /> Nonaktifkan</> : <><HiOutlineCheckCircle className="w-4 h-4" /> Aktifkan</>}
            </button>
          )}
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {/* Poin */}
        <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-5 shadow-sm flex items-center gap-4">
          <div className="p-3 rounded-xl bg-yellow-50 dark:bg-yellow-500/10 shrink-0"><HiOutlineStar className="w-5 h-5 text-yellow-500" /></div>
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">Total Poin</p>
            {loading ? <SkeletonBox className="h-7 w-16" /> : <p className="text-2xl font-bold text-gray-800 dark:text-white">{points.total_points.toLocaleString()}</p>}
          </div>
        </div>
        {/* Laporan */}
        <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-5 shadow-sm flex items-center gap-4">
          <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-500/10 shrink-0"><HiOutlineDocumentText className="w-5 h-5 text-blue-500" /></div>
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">Laporan Dikirim</p>
            {loading ? <SkeletonBox className="h-7 w-10" /> : <p className="text-2xl font-bold text-gray-800 dark:text-white">{stats.total_laporan}</p>}
          </div>
        </div>
        {/* Status */}
        <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-5 shadow-sm flex items-center gap-4">
          <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 shrink-0"><HiOutlineIdentification className="w-5 h-5 text-emerald-500" /></div>
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">Status Akun</p>
            {loading ? <SkeletonBox className="h-6 w-16 mt-1" /> : (
              <AdminBadge variant={isActive ? "success" : "danger"} dot>
                {isActive ? "Aktif" : "Nonaktif"}
              </AdminBadge>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6 items-stretch">
          {/* Profil */}
          <div className="lg:col-span-2 rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6 shadow-sm h-full flex flex-col">
            <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-4 border-b border-gray-100 dark:border-gray-700 pb-3">Informasi Profil</h3>
            {loading ? (
              <div className="flex items-start gap-5 mb-6">
                <SkeletonBox className="w-20 h-20 rounded-2xl shrink-0" />
                <div className="flex-1 space-y-2 pt-1">
                  <SkeletonBox className="h-6 w-48" />
                  <SkeletonBox className="h-5 w-28" />
                </div>
              </div>
            ) : user ? (
              <div className="flex items-start gap-5 mb-6">
                <Avatar name={user.name} foto={user.foto_url?.startsWith('http') && !user.foto_url?.includes('ui-avatars') ? user.foto_url : null} />
                <div>
                  <h2 className="text-xl font-bold text-gray-800 dark:text-white">{user.name}</h2>
                  <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                    {role && <AdminBadge variant={role.variant}>{role.label}</AdminBadge>}
                    <AdminBadge variant={isActive ? "success" : "danger"} dot>{isActive ? "Aktif" : "Nonaktif"}</AdminBadge>
                  </div>
                </div>
              </div>
            ) : null}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-auto">
              <div className="flex items-start gap-3 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-gray-100 dark:border-gray-700">
                <HiOutlineEnvelope className="w-5 h-5 text-slate-400 dark:text-slate-500 mt-0.5 shrink-0" />
                <div className="min-w-0">
                  <span className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Email</span>
                  {loading ? <SkeletonBox className="h-4 w-40" /> : <p className="text-sm text-gray-800 dark:text-gray-200 truncate">{user?.email ?? "—"}</p>}
                </div>
              </div>
              <div className="flex items-start gap-3 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-gray-100 dark:border-gray-700">
                <HiOutlinePhone className="w-5 h-5 text-slate-400 dark:text-slate-500 mt-0.5 shrink-0" />
                <div className="min-w-0">
                  <span className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">No. Telepon</span>
                  {loading ? <SkeletonBox className="h-4 w-28" /> : (
                    <p className="text-sm text-gray-800 dark:text-gray-200">{user?.no_telepon || <span className="italic text-gray-400 dark:text-gray-500">Belum diisi</span>}</p>
                  )}
                </div>
              </div>
              <div className="flex items-start gap-3 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-gray-100 dark:border-gray-700 sm:col-span-2">
                <HiOutlineMapPin className="w-5 h-5 text-slate-400 dark:text-slate-500 mt-0.5 shrink-0" />
                <div className="min-w-0">
                  <span className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Alamat</span>
                  {loading ? <SkeletonBox className="h-4 w-full" /> : (
                    <p className="text-sm text-gray-800 dark:text-gray-200">{user?.alamat || <span className="italic text-gray-400 dark:text-gray-500">Belum diisi</span>}</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Informasi Akun */}
          <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6 shadow-sm h-full flex flex-col lg:col-span-1">
            <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-4 border-b border-gray-100 dark:border-gray-700 pb-3">Informasi Akun</h3>
            {loading ? (
              <div className="space-y-4">
                {Array.from({ length: 4 }).map((_, i) => <SkeletonBox key={i} className="h-10 w-full" />)}
              </div>
            ) : user ? (
              <div className="space-y-4 flex-1">
                <div>
                  <span className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">ID Pengguna</span>
                  <p className="text-xs font-mono bg-gray-50 dark:bg-gray-900/50 px-2 py-1.5 rounded-lg border border-gray-100 dark:border-gray-700 text-gray-600 dark:text-gray-300 break-all">{user.id}</p>
                </div>
                {user.firebase_uid && (
                  <div>
                    <span className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Firebase UID</span>
                    <p className="text-xs font-mono bg-gray-50 dark:bg-gray-900/50 px-2 py-1.5 rounded-lg border border-gray-100 dark:border-gray-700 text-gray-600 dark:text-gray-300 break-all">{user.firebase_uid}</p>
                  </div>
                )}
                <div>
                  <span className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Role</span>
                  {role && <AdminBadge variant={role.variant}>{role.label}</AdminBadge>}
                </div>
                <div className="flex items-center gap-2">
                  <HiOutlineCalendar className="w-4 h-4 text-gray-400 dark:text-gray-500 shrink-0" />
                  <div>
                    <span className="block text-xs font-medium text-gray-500 dark:text-gray-400">Bergabung</span>
                    <p className="text-sm text-gray-700 dark:text-gray-200">{user.created_at ? new Date(user.created_at).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" }) : "—"}</p>
                  </div>
                </div>
                <div>
                  <span className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Total Komentar</span>
                  <p className="text-sm font-semibold text-gray-700 dark:text-gray-200">{stats.total_komentar} komentar</p>
                </div>
              </div>
            ) : null}
          </div>
      </div>

      {/* Histori Aktivitas */}
      <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6 shadow-sm mb-6">
        <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-4 border-b border-gray-100 dark:border-gray-700 pb-3 flex items-center gap-2">
          <HiOutlineExclamationCircle className="w-5 h-5 text-slate-400 dark:text-slate-500" />
          Histori Aktivitas
        </h3>
        {loading ? (
          <div className="space-y-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-start gap-3 animate-pulse">
                <SkeletonBox className="w-9 h-9 rounded-xl shrink-0" />
                <div className="flex-1 space-y-2">
                  <SkeletonBox className="h-4 w-1/4" />
                  <SkeletonBox className="h-3 w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : aktivitas.length === 0 ? (
          <p className="text-sm text-slate-400 dark:text-slate-500 text-center py-6">Belum ada aktivitas tercatat.</p>
        ) : (
          <div className="divide-y divide-gray-100 dark:divide-gray-700">
            {aktivitas.map((item: any) => {
              const badge = aktivitasBadge[item.tipe] ?? { label: item.tipe, variant: "default" as const };
              const icon  = aktivitasIcon[item.tipe] ?? <HiOutlineExclamationCircle className="w-4 h-4" />;
              return (
                <div key={item.id} className="flex items-start gap-3 py-3.5 first:pt-0 last:pb-0">
                  <div className="p-2 rounded-xl bg-gray-50 dark:bg-gray-900/50 border border-gray-100 dark:border-gray-700 shrink-0 mt-0.5">{icon}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                      <span className="text-sm font-semibold text-gray-800 dark:text-gray-200 truncate">{item.judul}</span>
                      <AdminBadge variant={badge.variant}>{badge.label}</AdminBadge>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed truncate">{item.deskripsi}</p>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                      {item.waktu ? new Date(item.waktu).toLocaleString("id-ID") : "—"}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Confirmation Modal (Toggle Active) ── */}
      {showConfirm && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => !toggling && setShowConfirm(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 border border-gray-100">
            <div className="flex flex-col items-center text-center gap-3 mb-5">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${isActive ? "bg-red-50" : "bg-emerald-50"}`}>
                {isActive
                  ? <HiOutlineExclamationTriangle className="w-7 h-7 text-red-500" />
                  : <HiOutlineCheckCircle className="w-7 h-7 text-emerald-500" />}
              </div>
              <div>
                <h3 className="text-base font-bold text-gray-900">{isActive ? "Nonaktifkan Pengguna?" : "Aktifkan Pengguna?"}</h3>
                <p className="text-sm text-gray-500 mt-1">
                  {isActive
                    ? "Pengguna tidak akan dapat login sampai diaktifkan kembali."
                    : "Pengguna akan mendapatkan kembali akses penuh ke sistem."}
                </p>
              </div>
            </div>
            {toggleErr && (
              <div className="mb-4 px-3 py-2.5 rounded-lg bg-red-50 border border-red-200 text-red-600 text-xs text-center">{toggleErr}</div>
            )}
            <div className="flex gap-3">
              <button onClick={() => setShowConfirm(false)} disabled={toggling}
                className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 disabled:opacity-50">
                Batal
              </button>
              <button onClick={handleToggle} disabled={toggling}
                className={`flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold text-white rounded-xl disabled:opacity-60 ${
                  isActive ? "bg-red-600 hover:bg-red-700" : "bg-emerald-600 hover:bg-emerald-700"
                }`}>
                {toggling ? <HiOutlineArrowPath className="w-4 h-4 animate-spin" /> : null}
                {toggling ? "Memproses..." : (isActive ? "Ya, Nonaktifkan" : "Ya, Aktifkan")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
