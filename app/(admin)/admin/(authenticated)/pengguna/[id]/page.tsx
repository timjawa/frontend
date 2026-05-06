import React from "react";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import AdminBadge from "@/components/admin/ui/AdminBadge";
import Link from "next/link";
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
  HiOutlineBell,
  HiOutlineChatBubbleLeftRight,
  HiOutlineArrowTrendingUp,
  HiOutlineExclamationCircle,
} from "react-icons/hi2";

interface PenggunaDetailPageProps {
  params: { id: string };
}

export default function PenggunaDetailPage({ params }: PenggunaDetailPageProps) {
  // Mock data — kolom tabel users
  const user = {
    id: params.id,
    name: "Siti Rahayu",
    email: "siti@bpbd.jember.go.id",
    firebase_uid: "BKJy8mXzP4UqN3a7cRLt",
    alamat: "Jl. Kalisat Utama No.5, Kalisat, Jember",
    no_telepon: "081234000002",
    foto: null,
    role: "admin_bpbd" as const,
    is_active: false,
    created_at: "2023-11-02",
    updated_at: "2024-04-15",
  };

  // Mock data — tabel user_points (linked by user_id)
  const userPoints = { total_points: 1250, updated_at: "2024-05-01" };

  // Mock data — ringkasan aktivitas
  const stats = {
    total_laporan: 8,
    total_notifikasi_belum_dibaca: 3,
    total_komentar: 22,
  };

  // Mock data — histori aktivitas gabungan
  // Sumber: laporan_bencana, laporan_komentar, point_transactions, notifikasi
  const aktivitasHistori = [
    {
      id: "a1",
      tipe: "laporan" as const,
      judul: "Banjir di Jl. Mawar, Gumukmas",
      deskripsi: "Laporan bencana baru dikirim",
      waktu: "2024-05-02 09:15",
      badge: { variant: "info" as const, label: "Laporan" },
    },
    {
      id: "a2",
      tipe: "komentar" as const,
      judul: "Komentar pada laporan #LB-0023",
      deskripsi: "\"Semoga cepat tertangani, area sudah terendam\"…",
      waktu: "2024-05-01 14:30",
      badge: { variant: "default" as const, label: "Komentar" },
    },
    {
      id: "a3",
      tipe: "poin" as const,
      judul: "+50 Poin — Laporan Diverifikasi",
      deskripsi: "Poin diterima karena laporan berhasil diverifikasi admin",
      waktu: "2024-04-30 11:00",
      badge: { variant: "success" as const, label: "Poin" },
    },
    {
      id: "a4",
      tipe: "laporan" as const,
      judul: "Genangan Air di Ambulu",
      deskripsi: "Laporan bencana baru dikirim",
      waktu: "2024-04-28 07:45",
      badge: { variant: "info" as const, label: "Laporan" },
    },
    {
      id: "a5",
      tipe: "notifikasi" as const,
      judul: "Peringatan Dini: Cuaca Ekstrem Kalisat",
      deskripsi: "Notifikasi peringatan dini diterima",
      waktu: "2024-04-25 16:20",
      badge: { variant: "warning" as const, label: "Notifikasi" },
    },
    {
      id: "a6",
      tipe: "komentar" as const,
      judul: "Komentar pada laporan #LB-0018",
      deskripsi: "\"Mohon diperhatikan, jalur evakuasi sudah tersedia\"…",
      waktu: "2024-04-22 10:05",
      badge: { variant: "default" as const, label: "Komentar" },
    },
  ];

  const aktivitasIcon = {
    laporan: <HiOutlineDocumentText className="w-4 h-4 text-blue-500" />,
    komentar: <HiOutlineChatBubbleLeftRight className="w-4 h-4 text-slate-400" />,
    poin: <HiOutlineArrowTrendingUp className="w-4 h-4 text-emerald-500" />,
    notifikasi: <HiOutlineBell className="w-4 h-4 text-orange-400" />,
  };

  const roleConfig = {
    masyarakat: { label: "Masyarakat", variant: "info" as const },
    admin_bpbd: { label: "Admin BPBD", variant: "warning" as const },
    super_admin: { label: "Super Admin", variant: "success" as const },
  };


  function Avatar({ name, foto }: { name: string; foto: string | null }) {
    if (foto) return <img src={foto} alt={name} className="w-20 h-20 rounded-2xl object-cover" />;
    const initials = name.split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase();
    const colors = ["bg-blue-500", "bg-purple-500", "bg-emerald-500", "bg-orange-500", "bg-rose-500", "bg-indigo-500"];
    const color = colors[name.charCodeAt(0) % colors.length];
    return (
      <div className={`w-20 h-20 rounded-2xl ${color} flex items-center justify-center text-white text-2xl font-bold shrink-0`}>
        {initials}
      </div>
    );
  }

  const role = roleConfig[user.role];

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <PageBreadcrumb pageTitle="Detail Pengguna" className="mb-0" />
        <div className="flex gap-3">
          <Link
            href="/admin/pengguna"
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
          >
            <HiOutlineArrowLeft className="w-4 h-4" />
            Kembali
          </Link>
          <button
            className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white rounded-lg transition-all shadow-sm ${
              user.is_active
                ? "bg-rose-600 hover:bg-rose-700 shadow-rose-200"
                : "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-200"
            }`}
          >
            {user.is_active ? (
              <><HiOutlineNoSymbol className="w-4 h-4" /> Nonaktifkan</>
            ) : (
              <><HiOutlineCheckCircle className="w-4 h-4" /> Aktifkan</>
            )}
          </button>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-white/[0.03] flex items-center gap-4">
          <div className="p-3 rounded-xl bg-yellow-50 dark:bg-yellow-500/10 shrink-0">
            <HiOutlineStar className="w-5 h-5 text-yellow-500" />
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-0.5">Total Poin</p>
            <p className="text-2xl font-bold text-gray-800 dark:text-white">{userPoints.total_points.toLocaleString()}</p>
          </div>
        </div>
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-white/[0.03] flex items-center gap-4">
          <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-500/10 shrink-0">
            <HiOutlineDocumentText className="w-5 h-5 text-blue-500" />
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-0.5">Laporan Dikirim</p>
            <p className="text-2xl font-bold text-gray-800 dark:text-white">{stats.total_laporan}</p>
          </div>
        </div>
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-white/[0.03] flex items-center gap-4">
          <div className="p-3 rounded-xl bg-purple-50 dark:bg-purple-500/10 shrink-0">
            <HiOutlineBell className="w-5 h-5 text-purple-500" />
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-0.5">Notif Belum Dibaca</p>
            <p className="text-2xl font-bold text-gray-800 dark:text-white">{stats.total_notifikasi_belum_dibaca}</p>
          </div>
        </div>
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-white/[0.03] flex items-center gap-4">
          <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 shrink-0">
            <HiOutlineIdentification className="w-5 h-5 text-emerald-500" />
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-0.5">Status Akun</p>
            <p className="text-lg font-bold mt-0.5">
              <AdminBadge variant={user.is_active ? "success" : "danger"} dot>
                {user.is_active ? "Aktif" : "Nonaktif"}
              </AdminBadge>
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Konten Utama */}
        <div className="lg:col-span-2 space-y-6">

          {/* Profil */}
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-white/[0.03]">
            <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-4 border-b border-gray-100 dark:border-gray-800 pb-3">
              Informasi Profil
            </h3>
            <div className="flex items-start gap-5 mb-6">
              <Avatar name={user.name} foto={user.foto} />
              <div>
                <h2 className="text-xl font-bold text-gray-800 dark:text-white">{user.name}</h2>
                <div className="flex items-center gap-2 mt-1.5">
                  <AdminBadge variant={role.variant}>{role.label}</AdminBadge>
                  <AdminBadge variant={user.is_active ? "success" : "danger"} dot>
                    {user.is_active ? "Aktif" : "Nonaktif"}
                  </AdminBadge>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex items-start gap-3 p-4 bg-gray-50 dark:bg-gray-800/40 rounded-xl border border-gray-100 dark:border-gray-700/50">
                <HiOutlineEnvelope className="w-5 h-5 text-slate-400 mt-0.5 shrink-0" />
                <div>
                  <span className="block text-xs font-medium text-gray-500 mb-1">Email</span>
                  <p className="text-sm text-gray-800 dark:text-gray-200 break-all">{user.email}</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-4 bg-gray-50 dark:bg-gray-800/40 rounded-xl border border-gray-100 dark:border-gray-700/50">
                <HiOutlinePhone className="w-5 h-5 text-slate-400 mt-0.5 shrink-0" />
                <div>
                  <span className="block text-xs font-medium text-gray-500 mb-1">No. Telepon</span>
                  <p className="text-sm text-gray-800 dark:text-gray-200">{user.no_telepon ?? <span className="italic text-gray-400">Belum diisi</span>}</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-4 bg-gray-50 dark:bg-gray-800/40 rounded-xl border border-gray-100 dark:border-gray-700/50 sm:col-span-2">
                <HiOutlineMapPin className="w-5 h-5 text-slate-400 mt-0.5 shrink-0" />
                <div>
                  <span className="block text-xs font-medium text-gray-500 mb-1">Alamat</span>
                  <p className="text-sm text-gray-800 dark:text-gray-200">{user.alamat ?? <span className="italic text-gray-400">Belum diisi</span>}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Histori Aktivitas */}
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-white/[0.03]">
            <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-4 border-b border-gray-100 dark:border-gray-800 pb-3 flex items-center gap-2">
              <HiOutlineExclamationCircle className="w-5 h-5 text-slate-400" />
              Histori Aktivitas
            </h3>
            <div className="space-y-0 divide-y divide-gray-100 dark:divide-gray-800">
              {aktivitasHistori.map((item) => (
                <div key={item.id} className="flex items-start gap-3 py-3.5 first:pt-0 last:pb-0">
                  {/* Ikon tipe */}
                  <div className="p-2 rounded-xl bg-gray-50 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-700/50 shrink-0 mt-0.5">
                    {aktivitasIcon[item.tipe]}
                  </div>
                  {/* Konten */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                      <span className="text-sm font-semibold text-gray-800 dark:text-gray-200 truncate">{item.judul}</span>
                      <AdminBadge variant={item.badge.variant}>{item.badge.label}</AdminBadge>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed truncate">{item.deskripsi}</p>
                    <p className="text-xs text-gray-400 mt-1">{item.waktu}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Sidebar */}
        <div className="space-y-6">

          {/* Informasi Akun */}
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-white/[0.03]">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 border-b border-gray-100 dark:border-gray-800 pb-3">
              Informasi Akun
            </h3>
            <div className="space-y-4">
              <div>
                <span className="block text-xs font-medium text-gray-500 mb-1">ID Pengguna</span>
                <p className="text-xs font-mono bg-gray-50 dark:bg-gray-800/40 px-2 py-1.5 rounded-lg border border-gray-100 dark:border-gray-700/50 text-gray-600 dark:text-gray-400 break-all">
                  {user.id}
                </p>
              </div>
              <div>
                <span className="block text-xs font-medium text-gray-500 mb-1">Firebase UID</span>
                <p className="text-xs font-mono bg-gray-50 dark:bg-gray-800/40 px-2 py-1.5 rounded-lg border border-gray-100 dark:border-gray-700/50 text-gray-600 dark:text-gray-400 break-all">
                  {user.firebase_uid ?? <span className="italic">—</span>}
                </p>
              </div>
              <div>
                <span className="block text-xs font-medium text-gray-500 mb-1">Role</span>
                <AdminBadge variant={role.variant}>{role.label}</AdminBadge>
              </div>
              <div className="flex items-center gap-2">
                <HiOutlineCalendar className="w-4 h-4 text-gray-400 shrink-0" />
                <div>
                  <span className="block text-xs font-medium text-gray-500">Bergabung</span>
                  <p className="text-sm text-gray-700 dark:text-gray-300">{user.created_at}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <HiOutlineCalendar className="w-4 h-4 text-gray-400 shrink-0" />
                <div>
                  <span className="block text-xs font-medium text-gray-500">Terakhir Diperbarui</span>
                  <p className="text-sm text-gray-700 dark:text-gray-300">{user.updated_at}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Poin Gamifikasi */}
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-white/[0.03]">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 border-b border-gray-100 dark:border-gray-800 pb-3 flex items-center gap-2">
              <HiOutlineStar className="w-5 h-5 text-yellow-500" />
              Poin Gamifikasi
            </h3>
            <div className="text-center py-3">
              <p className="text-4xl font-bold text-gray-800 dark:text-white">{userPoints.total_points.toLocaleString()}</p>
              <p className="text-sm text-gray-500 mt-1">Total Poin</p>
            </div>
            <div className="w-full h-2 bg-gray-100 dark:bg-gray-700 rounded-full mt-4 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full"
                style={{ width: `${Math.min((userPoints.total_points / 2000) * 100, 100)}%` }}
              />
            </div>
            <p className="text-xs text-gray-400 mt-2 text-center">
              {userPoints.total_points} / 2.000 poin ke level berikutnya
            </p>
            <p className="text-xs text-gray-400 text-center mt-1">Diperbarui: {userPoints.updated_at}</p>
          </div>

        </div>
      </div>
    </div>
  );
}
