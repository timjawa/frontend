import React from "react";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import AdminBadge from "@/components/admin/ui/AdminBadge";
import Link from "next/link";
import {
  HiOutlineArrowLeft,
  HiOutlineCheckCircle,
  HiOutlineXCircle,
  HiMapPin,
  HiUser,
  HiClock,
  HiDocumentText,
  HiCamera,
  HiPhone,
  HiEnvelope,
  HiChatBubbleLeftEllipsis,
  HiVideoCamera,
  HiExclamationTriangle,
  HiCheckBadge,
} from "react-icons/hi2";

interface PengaduanDetailPageProps {
  params: {
    id: string;
  };
}

export default function PengaduanDetailPage({ params }: PengaduanDetailPageProps) {
  // Mock data - sesuai schema: laporan_bencana + relasi users, kecamatan, laporan_media, laporan_komentar
  const pengaduanData = {
    id: params.id,
    dibuat_pada: "2024-05-04 14:30:00",
    updated_at: "2024-05-04 15:10:00",
    jenis_bencana: "Banjir",
    deskripsi: "Banjir mulai naik sejak jam 2 siang, air sudah masuk ke rumah warga sekitar 50 cm. Butuh bantuan evakuasi segera untuk lansia dan anak-anak yang terjebak di dalam rumah.",
    alamat_lengkap: "Jl. Raya Gumukmas No. 45, RT 02/RW 01, Desa Gumukmas",
    latitude: -8.3700000,
    longitude: 113.4500000,
    status: "baru" as "baru" | "diverifikasi" | "ditolak" | "selesai",
    is_draft: false,

    // Relasi kecamatan
    kecamatan: { nama: "Gumukmas" },

    // Relasi users
    pelapor: {
      name: "Ahmad Hidayat",
      email: "ahmad.hidayat@example.com",
      no_telepon: "081234567890",
    },

    // Relasi laporan_media
    media: [
      { id: "m1", url: "https://placehold.co/600x400/1d4ed8/ffffff?text=Foto+Banjir+1", tipe: "foto", urutan: 1 },
      { id: "m2", url: "https://placehold.co/600x400/1e40af/ffffff?text=Foto+Banjir+2", tipe: "foto", urutan: 2 },
    ],

    // Relasi laporan_komentar
    komentar: [
      {
        id: "k1",
        user_name: "Admin BPBD",
        isi: "Tim evakuasi sedang bersiap menuju lokasi. Mohon warga tetap tenang dan menjauhi area arus deras.",
        dibuat_pada: "2024-05-04 14:45:00",
      },
    ],
  };

  const statusConfig = {
    baru: { color: "warning" as const, label: "Baru", bg: "bg-yellow-50 dark:bg-yellow-500/10", border: "border-yellow-200 dark:border-yellow-500/20", text: "text-yellow-700 dark:text-yellow-400" },
    diverifikasi: { color: "info" as const, label: "Diverifikasi", bg: "bg-blue-50 dark:bg-blue-500/10", border: "border-blue-200 dark:border-blue-500/20", text: "text-blue-700 dark:text-blue-400" },
    selesai: { color: "success" as const, label: "Selesai", bg: "bg-emerald-50 dark:bg-emerald-500/10", border: "border-emerald-200 dark:border-emerald-500/20", text: "text-emerald-700 dark:text-emerald-400" },
    ditolak: { color: "danger" as const, label: "Ditolak", bg: "bg-red-50 dark:bg-red-500/10", border: "border-red-200 dark:border-red-500/20", text: "text-red-700 dark:text-red-400" },
  };

  const currentStatus = statusConfig[pengaduanData.status];
  const embedUrl = `https://maps.google.com/maps?q=${pengaduanData.latitude},${pengaduanData.longitude}&z=15&output=embed`;
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${pengaduanData.latitude},${pengaduanData.longitude}`;

  return (
    <div>
      {/* Page Header */}
      <div className="flex items-center justify-between mb-6">
        <PageBreadcrumb pageTitle="Detail Pengaduan" />
        <div className="flex gap-3">
          <Link
            href="/admin/pengaduan"
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
          >
            <HiOutlineArrowLeft className="w-4 h-4" />
            Kembali
          </Link>
          <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-lg hover:bg-red-700 transition-colors shadow-sm">
            <HiOutlineXCircle className="w-4 h-4" />
            Tolak
          </button>
          <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 transition-colors shadow-sm">
            <HiOutlineCheckCircle className="w-4 h-4" />
            Verifikasi
          </button>
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
            <p className="text-base font-bold text-gray-800 dark:text-white">{pengaduanData.jenis_bencana}</p>
          </div>
        </div>

        {/* Status */}
        <div className={`rounded-2xl border p-5 shadow-sm flex items-center gap-4 ${currentStatus.bg} ${currentStatus.border}`}>
          <div className="p-3 rounded-xl bg-white/60 dark:bg-white/10 shrink-0">
            <HiCheckBadge className={`w-6 h-6 ${currentStatus.text}`} />
          </div>
          <div>
            <span className="block text-xs font-medium text-gray-500 mb-0.5">Status</span>
            <p className={`text-base font-bold ${currentStatus.text}`}>{currentStatus.label}</p>
          </div>
        </div>

        {/* Kecamatan */}
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-white/[0.03] flex items-center gap-4">
          <div className="p-3 rounded-xl bg-green-50 dark:bg-green-500/10 shrink-0">
            <HiMapPin className="w-6 h-6 text-green-600" />
          </div>
          <div>
            <span className="block text-xs font-medium text-gray-500 mb-0.5">Kecamatan</span>
            <p className="text-base font-bold text-gray-800 dark:text-white">{pengaduanData.kecamatan.nama}</p>
          </div>
        </div>

        {/* Waktu */}
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-white/[0.03] flex items-center gap-4">
          <div className="p-3 rounded-xl bg-purple-50 dark:bg-purple-500/10 shrink-0">
            <HiClock className="w-6 h-6 text-purple-600" />
          </div>
          <div>
            <span className="block text-xs font-medium text-gray-500 mb-0.5">Dilaporkan</span>
            <p className="text-sm font-bold text-gray-800 dark:text-white leading-tight">
              {pengaduanData.dibuat_pada.split(" ")[0]}
              <span className="block text-xs font-normal text-gray-500">{pengaduanData.dibuat_pada.split(" ")[1]}</span>
            </p>
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
            <div className="text-gray-800 dark:text-gray-200 leading-relaxed whitespace-pre-line bg-blue-50/50 dark:bg-blue-900/10 p-5 rounded-xl border border-blue-100 dark:border-blue-900/30">
              {pengaduanData.deskripsi}
            </div>
            <div className="mt-4">
              <span className="block text-xs font-medium text-gray-500 mb-1">Alamat Lengkap</span>
              <p className="text-sm text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-800/40 px-3 py-2 rounded-lg border border-gray-100 dark:border-gray-700/50">
                {pengaduanData.alamat_lengkap}
              </p>
            </div>
          </div>

          {/* Peta Lokasi */}
          <div className="rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-white/[0.03] overflow-hidden">
            <div className="px-6 pt-5 pb-3 border-b border-gray-100 dark:border-gray-800 flex items-center gap-2">
              <HiMapPin className="w-5 h-5 text-green-600" />
              <h3 className="text-base font-semibold text-gray-900 dark:text-white">Lokasi Kejadian</h3>
            </div>
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
                {pengaduanData.latitude.toFixed(7)}, {pengaduanData.longitude.toFixed(7)}
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
          </div>

          {/* Media Bukti */}
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-white/[0.03]">
            <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-4 border-b border-gray-100 dark:border-gray-800 pb-3 flex items-center gap-2">
              <HiCamera className="w-5 h-5 text-indigo-500" />
              Media Bukti
              <span className="ml-auto text-xs font-normal text-gray-400">{pengaduanData.media.length} file</span>
            </h3>

            {pengaduanData.media.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {pengaduanData.media.map((item) => (
                  <div key={item.id} className="relative group rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 aspect-[4/3] shadow-inner">
                    {item.tipe === "foto" ? (
                      <img
                        src={item.url}
                        alt={`Bukti ${item.urutan}`}
                        className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center h-full gap-2 text-gray-400">
                        <HiVideoCamera className="w-10 h-10" />
                        <span className="text-sm font-medium">Video Bukti</span>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <button className="px-4 py-2 bg-white text-gray-900 text-sm font-medium rounded-lg shadow-lg hover:bg-gray-50 transition-colors">
                        Lihat Penuh
                      </button>
                    </div>
                    <span className="absolute top-2 left-2 text-xs bg-black/50 text-white px-2 py-0.5 rounded-full capitalize">
                      {item.tipe}
                    </span>
                  </div>
                ))}
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
                <AdminBadge variant={currentStatus.color} dot>{currentStatus.label}</AdminBadge>
              </div>
              <div>
                <span className="block text-xs font-medium text-gray-500 mb-1">Jenis Bencana</span>
                <span className="inline-flex px-2.5 py-1 rounded-md text-sm font-medium bg-orange-50 text-orange-700 border border-orange-100 dark:bg-orange-900/20 dark:border-orange-800 dark:text-orange-300">
                  {pengaduanData.jenis_bencana}
                </span>
              </div>
              <div>
                <span className="block text-xs font-medium text-gray-500 mb-1">Kecamatan</span>
                <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">{pengaduanData.kecamatan.nama}</p>
              </div>
              <div>
                <span className="block text-xs font-medium text-gray-500 mb-1">Draft</span>
                <AdminBadge variant={pengaduanData.is_draft ? "warning" : "success"}>
                  {pengaduanData.is_draft ? "Draft" : "Terkirim"}
                </AdminBadge>
              </div>
              <div>
                <span className="block text-xs font-medium text-gray-500 mb-1">ID Laporan</span>
                <p className="text-xs text-gray-600 dark:text-gray-400 break-all font-mono bg-gray-50 dark:bg-gray-800/40 px-2 py-1.5 rounded-lg border border-gray-100 dark:border-gray-700/50">
                  {pengaduanData.id}
                </p>
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
                <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">{pengaduanData.pelapor.name}</p>
              </div>
              <div className="flex items-center gap-3 bg-gray-50 dark:bg-gray-800/40 p-2.5 rounded-lg border border-gray-100 dark:border-gray-700/50">
                <HiPhone className="w-4 h-4 text-gray-400 shrink-0" />
                <span className="text-sm text-gray-700 dark:text-gray-300">{pengaduanData.pelapor.no_telepon}</span>
              </div>
              <div className="flex items-center gap-3 bg-gray-50 dark:bg-gray-800/40 p-2.5 rounded-lg border border-gray-100 dark:border-gray-700/50">
                <HiEnvelope className="w-4 h-4 text-gray-400 shrink-0" />
                <span className="text-sm text-gray-700 dark:text-gray-300 break-all">{pengaduanData.pelapor.email}</span>
              </div>
            </div>
          </div>

          {/* Riwayat Komentar */}
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-white/[0.03]">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 border-b border-gray-100 dark:border-gray-800 pb-3 flex items-center gap-2">
              <HiChatBubbleLeftEllipsis className="w-5 h-5 text-purple-500" />
              Catatan Admin
            </h3>

            <div className="space-y-3 max-h-52 overflow-y-auto mb-4">
              {pengaduanData.komentar.length > 0 ? (
                pengaduanData.komentar.map((k) => (
                  <div key={k.id} className="bg-gray-50 dark:bg-gray-800/40 rounded-xl p-3 border border-gray-100 dark:border-gray-700/50">
                    <div className="flex justify-between items-center mb-1.5">
                      <span className="text-xs font-semibold text-gray-800 dark:text-gray-200">{k.user_name}</span>
                      <span className="text-xs text-gray-400">{k.dibuat_pada.split(" ")[1]}</span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{k.isi}</p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-400 italic text-center py-4">Belum ada catatan.</p>
              )}
            </div>

            <div className="pt-4 border-t border-gray-100 dark:border-gray-800">
              <textarea
                className="w-full text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:text-white transition-all outline-none resize-none"
                placeholder="Tambah catatan..."
                rows={3}
              />
              <button className="mt-2 w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors shadow-sm">
                Kirim Catatan
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
