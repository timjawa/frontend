import React from "react";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import AdminBadge from "@/components/admin/ui/AdminBadge";
import Link from "next/link";
import {
  HiOutlineArrowLeft,
  HiOutlinePencil,
  HiMapPin,
  HiShieldExclamation,
  HiArrowTrendingUp,
  HiFingerPrint,
} from "react-icons/hi2";

interface KecamatanDetailPageProps {
  params: {
    id: string;
  };
}

export default function KecamatanDetailPage({ params }: KecamatanDetailPageProps) {
  // Mock data - hanya kolom yang ada di tabel kecamatan:
  // id, nama, latitude, longitude, elevasi, kode_wilayah, level_rawan
  const kecamatanData = {
    id: params.id,
    nama: "Gumukmas",
    kode_wilayah: "35.09.04.2001",
    latitude: -8.3000000,
    longitude: 113.4500000,
    elevasi: 10.00,
    level_rawan: "tinggi" as "rendah" | "sedang" | "tinggi",
  };

  const levelRawanConfig = {
    rendah: {
      color: "success" as const,
      label: "Rendah",
      bar: "w-1/3",
      barColor: "bg-emerald-500",
      bgCard: "bg-emerald-50 dark:bg-emerald-500/10",
      border: "border-emerald-200 dark:border-emerald-500/20",
      text: "text-emerald-700 dark:text-emerald-400",
      desc: "Wilayah ini tergolong aman dan memiliki risiko bencana yang rendah.",
    },
    sedang: {
      color: "warning" as const,
      label: "Sedang",
      bar: "w-2/3",
      barColor: "bg-yellow-500",
      bgCard: "bg-yellow-50 dark:bg-yellow-500/10",
      border: "border-yellow-200 dark:border-yellow-500/20",
      text: "text-yellow-700 dark:text-yellow-400",
      desc: "Wilayah ini perlu diwaspadai karena memiliki potensi risiko bencana yang sedang.",
    },
    tinggi: {
      color: "danger" as const,
      label: "Tinggi",
      bar: "w-full",
      barColor: "bg-red-500",
      bgCard: "bg-red-50 dark:bg-red-500/10",
      border: "border-red-200 dark:border-red-500/20",
      text: "text-red-700 dark:text-red-400",
      desc: "Wilayah ini memiliki risiko bencana yang TINGGI dan memerlukan perhatian serta kewaspadaan ekstra dari semua pihak.",
    },
  };

  const currentLevel = levelRawanConfig[kecamatanData.level_rawan];

  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${kecamatanData.latitude},${kecamatanData.longitude}`;
  const embedUrl = `https://maps.google.com/maps?q=${kecamatanData.latitude},${kecamatanData.longitude}&z=13&output=embed`;

  return (
    <div>
      {/* Page Header */}
      <div className="flex items-center justify-between mb-6">
        <PageBreadcrumb pageTitle="Detail Kecamatan" />
        <div className="flex gap-3">
          <Link
            href="/admin/kecamatan"
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
          >
            <HiOutlineArrowLeft className="w-4 h-4" />
            Kembali
          </Link>
          <Link
            href={`/admin/kecamatan/${params.id}/edit`}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
          >
            <HiOutlinePencil className="w-4 h-4" />
            Edit Kecamatan
          </Link>
        </div>
      </div>

      {/* Stat Cards Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {/* Nama */}
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-white/[0.03] flex items-center gap-4">
          <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-500/10 shrink-0">
            <HiMapPin className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <span className="block text-xs font-medium text-gray-500 mb-0.5">Nama</span>
            <p className="text-base font-bold text-gray-800 dark:text-white">{kecamatanData.nama}</p>
          </div>
        </div>

        {/* Kode Wilayah */}
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-white/[0.03] flex items-center gap-4">
          <div className="p-3 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 shrink-0">
            <HiFingerPrint className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
          </div>
          <div>
            <span className="block text-xs font-medium text-gray-500 mb-0.5">Kode Wilayah</span>
            <p className="text-sm font-bold font-mono text-gray-800 dark:text-white">{kecamatanData.kode_wilayah}</p>
          </div>
        </div>

        {/* Elevasi */}
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-white/[0.03] flex items-center gap-4">
          <div className="p-3 rounded-xl bg-teal-50 dark:bg-teal-500/10 shrink-0">
            <HiArrowTrendingUp className="w-6 h-6 text-teal-600 dark:text-teal-400" />
          </div>
          <div>
            <span className="block text-xs font-medium text-gray-500 mb-0.5">Elevasi</span>
            <p className="text-base font-bold text-gray-800 dark:text-white">
              {kecamatanData.elevasi.toFixed(0)}{" "}
              <span className="text-sm font-normal text-gray-500">mdpl</span>
            </p>
          </div>
        </div>

        {/* Level Rawan */}
        <div className={`rounded-2xl border p-5 shadow-sm flex items-center gap-4 ${currentLevel.bgCard} ${currentLevel.border}`}>
          <div className={`p-3 rounded-xl bg-white/60 dark:bg-white/10 shrink-0`}>
            <HiShieldExclamation className={`w-6 h-6 ${currentLevel.text}`} />
          </div>
          <div>
            <span className="block text-xs font-medium text-gray-500 mb-0.5">Level Rawan</span>
            <p className={`text-base font-bold ${currentLevel.text}`}>{currentLevel.label}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Konten Utama - Peta & Koordinat */}
        <div className="lg:col-span-2 space-y-6">

          {/* Peta Embed */}
          <div className="rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-white/[0.03] overflow-hidden">
            <div className="px-6 pt-5 pb-3 border-b border-gray-100 dark:border-gray-800">
              <h3 className="text-base font-semibold text-gray-900 dark:text-white">
                Lokasi di Peta
              </h3>
            </div>
            <div className="w-full h-64 bg-gray-100 dark:bg-gray-800">
              <iframe
                title={`Peta Kecamatan ${kecamatanData.nama}`}
                src={embedUrl}
                width="100%"
                height="100%"
                className="border-0 grayscale-[20%]"
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
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
                <p className="font-mono text-xl font-bold text-gray-800 dark:text-gray-200">
                  {kecamatanData.latitude.toFixed(7)}
                </p>
                <p className="text-xs text-gray-400 mt-1">Lintang Selatan (LS)</p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-800/40 rounded-xl border border-gray-100 dark:border-gray-700/50 p-4">
                <span className="block text-xs font-medium text-gray-500 mb-2 uppercase tracking-wider">Longitude</span>
                <p className="font-mono text-xl font-bold text-gray-800 dark:text-gray-200">
                  {kecamatanData.longitude.toFixed(7)}
                </p>
                <p className="text-xs text-gray-400 mt-1">Bujur Timur (BT)</p>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Informasi Kecamatan */}
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-white/[0.03]">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 border-b border-gray-100 dark:border-gray-800 pb-3">
              Informasi Kecamatan
            </h3>
            <div className="space-y-4">
              <div>
                <span className="block text-xs font-medium text-gray-500 mb-1">Status Level Rawan</span>
                <AdminBadge variant={currentLevel.color} dot>
                  {currentLevel.label}
                </AdminBadge>
              </div>

              <div>
                <span className="block text-xs font-medium text-gray-500 mb-1">Kode Wilayah</span>
                <span className="inline-flex px-2.5 py-1 rounded-md text-sm font-medium font-mono bg-blue-50 text-blue-700 border border-blue-100 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-300">
                  {kecamatanData.kode_wilayah}
                </span>
              </div>

              <div>
                <span className="block text-xs font-medium text-gray-500 mb-1">Elevasi</span>
                <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                  {kecamatanData.elevasi.toFixed(2)}{" "}
                  <span className="font-normal text-gray-500">mdpl</span>
                </p>
              </div>

              <div>
                <span className="block text-xs font-medium text-gray-500 mb-1">ID Kecamatan</span>
                <p className="text-xs text-gray-600 dark:text-gray-400 break-all font-mono bg-gray-50 dark:bg-gray-800/40 px-2 py-1.5 rounded-lg border border-gray-100 dark:border-gray-700/50">
                  {kecamatanData.id}
                </p>
              </div>
            </div>
          </div>

          {/* Level Rawan Visual */}
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-white/[0.03]">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 border-b border-gray-100 dark:border-gray-800 pb-3">
              Tingkat Kerawanan
            </h3>

            <div className="mb-3 flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">Level Risiko</span>
              <AdminBadge variant={currentLevel.color}>{currentLevel.label}</AdminBadge>
            </div>

            {/* Progress bar */}
            <div className="w-full h-2.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden mb-2">
              <div className={`h-full rounded-full ${currentLevel.barColor} ${currentLevel.bar} transition-all duration-700`} />
            </div>
            <div className="flex justify-between text-xs text-gray-400 mb-5">
              <span>Rendah</span>
              <span>Sedang</span>
              <span>Tinggi</span>
            </div>

            <div className={`p-4 rounded-xl border text-sm leading-relaxed ${currentLevel.bgCard} ${currentLevel.border} ${currentLevel.text}`}>
              {currentLevel.desc}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
