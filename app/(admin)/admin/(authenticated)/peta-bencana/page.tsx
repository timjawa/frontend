"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import AdminBadge from "@/components/admin/ui/AdminBadge";
import {
  HiOutlineMapPin,
  HiOutlineExclamationTriangle,
  HiOutlineArrowPath,
  HiOutlinePlus,
  HiOutlineXMark,
  HiOutlineCheck,
  HiOutlineHome,
  HiOutlineShieldExclamation,
  HiOutlineFlag,
  HiOutlinePencilSquare,
  HiChevronDown,
  HiChevronUp,
  HiChevronLeft,
} from "react-icons/hi2";
import api from "@/lib/api";
import type { MarkerData } from "@/components/peta-bencana/PetaBencanaMap";

const PetaBencanaMap = dynamic(
  () => import("@/components/peta-bencana/PetaBencanaMap"),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full min-h-[500px] bg-gray-100 dark:bg-gray-800 animate-pulse rounded-b-2xl flex items-center justify-center">
        <span className="text-gray-400 text-sm">Memuat peta...</span>
      </div>
    ),
  }
);

const KATEGORI_OPTIONS = [
  "BANJIR",
  "GEMPA BUMI",
  "TANAH LONGSOR",
  "KEBAKARAN",
  "CUACA EKSTREM",
  "PERINGATAN DINI",
  "POS PENGUNGSIAN",
  "UMUM",
];

const BAHAYA_OPTIONS = [
  { value: "rendah", label: "Rendah", color: "text-green-600", bg: "bg-green-50 border-green-200" },
  { value: "sedang", label: "Sedang", color: "text-yellow-600", bg: "bg-yellow-50 border-yellow-200" },
  { value: "tinggi", label: "Tinggi", color: "text-orange-600", bg: "bg-orange-50 border-orange-200" },
  { value: "kritis", label: "KRITIS", color: "text-red-600", bg: "bg-red-50 border-red-200" },
];



const statusPosBadge = {
  standby: { variant: "info" as const, label: "Standby" },
  aktif: { variant: "success" as const, label: "Aktif" },
  penuh: { variant: "danger" as const, label: "Penuh" },
  tutup: { variant: "default" as const, label: "Tutup" },
};

const urgensiConfig = {
  rendah: { variant: "success" as const, label: "Rendah" },
  sedang: { variant: "warning" as const, label: "Sedang" },
  tinggi: { variant: "danger" as const, label: "Tinggi" },
  kritis: { variant: "danger" as const, label: "KRITIS" },
};

const STATUS_BADGE: Record<string, { label: string; variant: "success" | "warning" | "info" | "danger" | "default" }> = {
  baru: { label: "Baru", variant: "info" },
  diinvestigasi: { label: "Investigasi", variant: "warning" },
  diverifikasi: { label: "Diverifikasi", variant: "default" },
  selesai: { label: "Selesai", variant: "success" },
  ditolak: { label: "Ditolak", variant: "danger" },
};


type Laporan = {
  id: string;
  jenis_bencana: string;
  alamat_lengkap?: string | null;
  latitude?: number | string | null;
  longitude?: number | string | null;
  status: string;
  dibuat_pada: string;
  user?: { name?: string | null } | null;
  kecamatan?: { nama?: string | null } | null;
};

type ManualMarker = {
  id: string;
  latitude: number;
  longitude: number;
  tipe_marker: "titik" | "garis" | "area";
  path_data: [number, number][] | null;
  kategori: string;
  label: string | null;
  tingkat_bahaya: string;
  dibuat_pada?: string;
  source?: "laporan" | "manual" | "pos_pengungsian";
  status?: string;
  kapasitas?: number;
  terisi?: number;
  radius?: number | string | null;
};

const inputClass =
  "w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 shadow-sm outline-none transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:border-gray-700 dark:bg-gray-900/60 dark:text-gray-100 dark:focus:border-blue-400 dark:focus:ring-blue-500/20";
const labelClass = "block text-xs font-semibold text-gray-600 dark:text-gray-300 mb-1.5";

export default function PetaBencanaPage() {
  const router = useRouter();
  // --- STATE MANAGEMENT (Penyimpanan Data di UI) ---
  
  // Menyimpan daftar laporan warga dari API
  const [laporan, setLaporan] = useState<Laporan[]>([]);
  // Menyimpan daftar marker manual yang sudah ada di database
  const [manualMarkers, setManualMarkers] = useState<ManualMarker[]>([]);
  // Status loading untuk menampilkan animasi loading
  const [loading, setLoading] = useState(true);
  // Kontrol buka/tutup sub-menu laporan di sidebar
  const [showLaporanSub, setShowLaporanSub] = useState(false);

  // Controls collapse state of sidebar cards
  const [openCard, setOpenCard] = useState<"laporan" | "kecamatan" | "pos" | null>("laporan");

  // Kecamatan list state
  const [kecamatans, setKecamatans] = useState<any[]>([]);
  const [loadingKecamatan, setLoadingKecamatan] = useState(true);
  const [kecamatanSearch, setKecamatanSearch] = useState("");

  // Peringatan Dini list state
  const [peringatanDini, setPeringatanDini] = useState<any[]>([]);
  const [loadingPeringatan, setLoadingPeringatan] = useState(true);

  // State untuk memunculkan notifikasi melayang (Toast)
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);
  const [clickedCoord, setClickedCoord] = useState<[number, number] | null>(null);
  const [panToCoord, setPanToCoord] = useState<[number, number] | null>(null);

  // State mounted untuk React Portals agar tidak SSR crash
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  // Fungsi untuk memicu munculnya notifikasi Toast selama 3 detik
  const showToast = (msg: string, type: "success" | "error" = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  // State untuk custom confirmation modal melayang
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    type: "danger" | "warning" | "success";
  } | null>(null);

  const triggerConfirm = (
    title: string,
    message: string,
    onConfirm: () => void,
    type: "danger" | "warning" | "success" = "warning"
  ) => {
    setConfirmModal({
      isOpen: true,
      title,
      message,
      onConfirm: () => {
        onConfirm();
        setConfirmModal(null);
      },
      type,
    });
  };

  const [loadingMarkers, setLoadingMarkers] = useState(true);

  // --- DATA FETCHING (Mengambil Data dari Database) ---

  // Mengambil laporan warga (Pengaduan)
  const fetchLaporan = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get("/api/admin/laporan", { params: { per_page: 200 } });
      const data = res.data?.data || res.data;
      // Pastikan data yang masuk adalah array agar tidak error saat di-loop (.map)
      setLaporan(Array.isArray(data) ? data : []);
    } catch {
      setLaporan([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Mengambil marker bencana (Titik & Garis)
  const fetchMarkers = useCallback(async () => {
    setLoadingMarkers(true);
    try {
      const res = await api.get("/api/admin/peta-marker");
      const data = res.data?.data || res.data;
      setManualMarkers(Array.isArray(data) ? data : []);
    } catch {
      setManualMarkers([]);
    } finally {
      setLoadingMarkers(false);
    }
  }, []);

  // Mengambil data Kecamatan
  const fetchKecamatans = useCallback(async () => {
    setLoadingKecamatan(true);
    try {
      const res = await api.get("/api/kecamatan", { params: { all: true } });
      const data = res.data?.data || res.data;
      setKecamatans(Array.isArray(data) ? data : []);
    } catch {
      setKecamatans([]);
    } finally {
      setLoadingKecamatan(false);
    }
  }, []);

  // Mengambil data Peringatan Dini
  const fetchPeringatanDini = useCallback(async () => {
    setLoadingPeringatan(true);
    try {
      const res = await api.get("/api/peringatan-dini", { params: { per_page: 200 } });
      const data = res.data?.data || res.data;
      setPeringatanDini(Array.isArray(data) ? data : (data?.data || []));
    } catch {
      setPeringatanDini([]);
    } finally {
      setLoadingPeringatan(false);
    }
  }, []);

  const handleRefreshAll = useCallback(async () => {
    try {
      await Promise.all([
        fetchLaporan(),
        fetchMarkers(),
        fetchKecamatans(),
        fetchPeringatanDini()
      ]);
      showToast("Data peta bencana berhasil dimuat ulang!");
    } catch {
      showToast("Gagal memuat ulang data bencana", "error");
    }
  }, [fetchLaporan, fetchMarkers, fetchKecamatans, fetchPeringatanDini]);

  // Menjalankan fetch data secara otomatis saat halaman pertama kali dibuka
  useEffect(() => { 
    fetchLaporan(); 
    fetchMarkers(); 
    fetchKecamatans(); 
    fetchPeringatanDini();
  }, [fetchLaporan, fetchMarkers, fetchKecamatans, fetchPeringatanDini]);

  // Hanya marker manual yang tampil di peta
  const allMarkers: MarkerData[] = useMemo(() => manualMarkers
    .filter((m) => {
      if (m.tipe_marker === "garis") return m.path_data && m.path_data.length > 1;
      const lat = Number(m.latitude);
      const lng = Number(m.longitude);
      return Number.isFinite(lat) && Number.isFinite(lng);
    })
    .map((m) => ({
      id: m.id,
      lat: Number(m.latitude),
      lng: Number(m.longitude),
      label: m.label || m.kategori,
      kategori: m.kategori,
      source: (m.source || "manual") as any,
      tipe_marker: m.tipe_marker,
      path_data: m.path_data || undefined,
      tingkat_bahaya: m.tingkat_bahaya || "sedang",
      radius: m.radius || undefined,
      status: m.status || undefined,
      kapasitas: m.kapasitas || undefined,
      terisi: m.terisi || undefined,
    })), [manualMarkers]);

  const filteredKecamatans = useMemo(() => {
    return kecamatans.filter((k) =>
      (k.nama || "").toLowerCase().includes(kecamatanSearch.toLowerCase())
    );
  }, [kecamatans, kecamatanSearch]);

  const dynamicLayers = useMemo(() => {
    const layers = [
      { id: "border", label: "Batas Wilayah Jember", dot: "bg-red-900/80 border border-red-850" }
    ];
    
    const categoriesOnMap = new Set<string>();
    manualMarkers.forEach((m) => {
      if (m.source === "pos_pengungsian") {
        categoriesOnMap.add("POS PENGUNGSIAN");
      } else if (m.kategori) {
        categoriesOnMap.add(m.kategori.toUpperCase());
      }
    });

    categoriesOnMap.forEach((cat) => {
      let dotColor = "bg-gray-500";
      if (cat.includes("BANJIR")) dotColor = "bg-blue-500";
      else if (cat.includes("GEMPA")) dotColor = "bg-red-500";
      else if (cat.includes("LONGSOR")) dotColor = "bg-orange-500";
      else if (cat.includes("KEBAKARAN")) dotColor = "bg-red-700";
      else if (cat.includes("CUACA")) dotColor = "bg-yellow-500";
      else if (cat.includes("PENGUNGSIAN") || cat.includes("POS")) dotColor = "bg-purple-500";

      layers.push({
        id: cat,
        label: cat,
        dot: dotColor
      });
    });

    return layers;
  }, [manualMarkers]);

  const posPengungsianList = useMemo(() => {
    return manualMarkers.filter(m => m.source === "pos_pengungsian" || m.kategori?.toUpperCase().replace(/ /g, "_") === "POS_PENGUNGSIAN");
  }, [manualMarkers]);

  const laporanWithCoords = laporan.filter((l) => {
    const lat = Number(l.latitude);
    const lng = Number(l.longitude);
    return Number.isFinite(lat) && Number.isFinite(lng) && (lat !== 0 || lng !== 0);
  });

  // --- INTERACTION LOGIC (Logika Interaksi User) ---

  // Memindahkan koordinat dari laporan warga (sidebar kiri) ke form halaman baru
  const useCoordFromLaporan = (l: Laporan) => {
    const lat = Number(l.latitude);
    const lng = Number(l.longitude);
    
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) return;

    if (lat < -8.55 || lat > -7.85 || lng < 113.10 || lng > 114.15) {
      showToast("Laporan warga berada di luar wilayah Jember!", "error");
      return;
    }

    const guessedKategori = (l.jenis_bencana || "").toUpperCase().replace(/ /g, "_").includes("BANJIR") ? "BANJIR"
      : (l.jenis_bencana || "").toUpperCase().replace(/ /g, "_").includes("GEMPA") ? "GEMPA BUMI"
      : (l.jenis_bencana || "").toUpperCase().includes("LONGSOR") ? "TANAH LONGSOR"
      : (l.jenis_bencana || "").toUpperCase().includes("KEBAKARAN") ? "KEBAKARAN"
      : (l.jenis_bencana || "").toUpperCase().includes("CUACA") ? "CUACA EKSTREM"
      : "UMUM";

    const labelVal = `${l.jenis_bencana || "Laporan"} - ${l.kecamatan?.nama || l.alamat_lengkap || ""}`.trim();

    router.push(`/admin/peta-bencana/create?lat=${lat.toFixed(7)}&lng=${lng.toFixed(7)}&kategori=${guessedKategori}&label=${encodeURIComponent(labelVal)}`);
  };

  const handleMapEditMarker = (id: string | number) => {
    router.push(`/admin/peta-bencana/edit/${id}`);
  };

  const handleMapDeleteMarker = (id: string | number) => {
    removeManualMarker(id.toString());
  };

  const removeManualMarker = async (id: string) => {
    triggerConfirm(
      "Hapus Marker Bencana",
      "Apakah Anda yakin ingin menghapus penanda bencana ini? Penanda yang dihapus akan langsung hilang dari peta publik selamanya.",
      async () => {
        try {
          await api.delete(`/api/admin/peta-marker/${id}`);
          setManualMarkers((prev) => prev.filter((m) => m.id !== id));
          showToast("Marker berhasil dihapus");
        } catch {
          showToast("Gagal menghapus marker", "error");
        }
      },
      "danger"
    );
  };

  const quickVerifyLaporan = async (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    triggerConfirm(
      "Verifikasi Laporan",
      "Apakah Anda yakin ingin memverifikasi laporan bencana dari warga ini? Laporan yang diverifikasi akan otomatis tampil secara instan di peta publik.",
      async () => {
        try {
          await api.put(`/api/admin/laporan/${id}/status`, { status: "diverifikasi" });
          showToast("Laporan berhasil diverifikasi!");
          await fetchLaporan();
          await fetchMarkers();
        } catch {
          showToast("Gagal memverifikasi laporan", "error");
        }
      },
      "success"
    );
  };

  const quickRejectLaporan = async (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    triggerConfirm(
      "Tolak Laporan Warga",
      "Apakah Anda yakin ingin menolak laporan ini? Laporan yang ditolak akan disembunyikan dan tidak akan ditampilkan di halaman peta.",
      async () => {
        try {
          await api.put(`/api/admin/laporan/${id}/status`, { status: "ditolak" });
          showToast("Laporan berhasil ditolak!");
          await fetchLaporan();
        } catch {
          showToast("Gagal menolak laporan", "error");
        }
      },
      "danger"
    );
  };

  const activeLaporan = useMemo(() => {
    return laporan.filter((l) => l.status === "baru");
  }, [laporan]);

  return (
    <div>
      <PageBreadcrumb pageTitle="Peta Bencana" />

      {/* Stats — semua card */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-6">
        {[
          { icon: <HiOutlineMapPin className="w-5 h-5 text-blue-500" />, bg: "bg-blue-50 dark:bg-blue-500/10", label: "Marker di Peta", value: loadingMarkers ? "-" : manualMarkers.filter(m => m.source === "manual").length },
          { icon: <HiOutlineExclamationTriangle className="w-5 h-5 text-red-500" />, bg: "bg-red-50 dark:bg-red-500/10", label: "Peringatan Aktif", value: loadingPeringatan ? "-" : peringatanDini.filter(p => p.is_active ?? true).length },
          { icon: <HiOutlineHome className="w-5 h-5 text-green-500" />, bg: "bg-green-50 dark:bg-green-500/10", label: "Pos Pengungsian", value: loadingMarkers ? "-" : manualMarkers.filter(m => m.source === "pos_pengungsian" || m.kategori?.toUpperCase().replace(/ /g, "_") === "POS_PENGUNGSIAN").length },
          { icon: <HiOutlineShieldExclamation className="w-5 h-5 text-orange-500" />, bg: "bg-orange-50 dark:bg-orange-500/10", label: "Rawan Tinggi", value: loadingKecamatan ? "-" : kecamatans.filter(k => k.level_rawan === "tinggi").length },
          { icon: <HiOutlineExclamationTriangle className="w-5 h-5 text-yellow-500" />, bg: "bg-yellow-50 dark:bg-yellow-500/10", label: "Laporan Masuk", value: loading ? "-" : laporan.length },
          { icon: <HiOutlineFlag className="w-5 h-5 text-purple-500" />, bg: "bg-purple-50 dark:bg-purple-500/10", label: "Layer Aktif", value: loadingMarkers ? "-" : dynamicLayers.length },
        ].map((s, i) => (
          <div key={i} className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-white/[0.03] flex items-center gap-3">
            <div className={`p-2.5 rounded-xl ${s.bg} shrink-0`}>{s.icon}</div>
            <div>
              <p className="text-xs text-gray-500">{s.label}</p>
              <p className="text-xl font-bold text-gray-800 dark:text-white">{s.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        {/* Map */}
        <div className="xl:col-span-3 order-2 xl:order-1">
          <div className="rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-white/[0.03] overflow-hidden flex flex-col min-h-[620px]">
            {/* Header */}
            <div className="px-5 py-3.5 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <HiOutlineMapPin className="w-5 h-5 text-blue-500" />
                <div>
                  <h3 className="text-sm font-bold text-gray-800 dark:text-white">Peta Bencana Kabupaten Jember</h3>
                  <p className="text-xs text-gray-400">{manualMarkers.length} marker aktif</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleRefreshAll}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-600 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300"
                >
                  <HiOutlineArrowPath className="w-3.5 h-3.5" />
                  Refresh
                </button>
                <Link
                  href="/admin/peta-bencana/create"
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
                >
                  <HiOutlinePlus className="w-3.5 h-3.5" />
                  Tambah Marker
                </Link>
              </div>
            </div>

            {/* Legenda layer */}
            <div className="px-5 py-2 border-b border-gray-100 dark:border-gray-800 flex flex-wrap items-center gap-x-4 gap-y-1 bg-gray-50/50 dark:bg-white/[0.02]">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Layer:</span>
              {dynamicLayers.map((l) => (
                <div key={l.id} className="flex items-center gap-1.5">
                  <span className={`w-2 h-2 rounded-full shrink-0 ${l.dot}`} />
                  <span className="text-xs text-gray-500 dark:text-gray-400">{l.label}</span>
                </div>
              ))}
            </div>

            <div className="flex-1 relative">
              <PetaBencanaMap
                markers={allMarkers}
                clickedCoord={clickedCoord}
                panToCoord={panToCoord}
                onEditMarker={handleMapEditMarker}
                onDeleteMarker={handleMapDeleteMarker}
                onDeselectMarker={() => { setClickedCoord(null); setPanToCoord(null); }}
              />
            </div>
          </div>
        </div>        {/* Sidebar */}
        <div className="xl:col-span-1 order-1 xl:order-2 space-y-4">
          {/* Laporan Warga Card */}
          <div className="rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-white/[0.03] overflow-hidden flex flex-col">
            {/* Card Header */}
            <div
              onClick={() => setOpenCard(openCard === "laporan" ? null : "laporan")}
              className="px-4 py-3 flex items-center justify-between cursor-pointer hover:bg-gray-50/50 dark:hover:bg-gray-900/50 transition-colors shrink-0 border-b border-gray-100 dark:border-gray-800 bg-gray-50/30 dark:bg-transparent"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-orange-50 dark:bg-orange-500/10 flex items-center justify-center shrink-0">
                  <HiOutlineExclamationTriangle className="w-4 h-4 text-orange-500" />
                </div>
                <span className="text-sm font-bold text-gray-800 dark:text-white">Laporan Warga</span>
              </div>
              <div className="shrink-0 pl-1">
                {openCard === "laporan" ? <HiChevronUp className="w-4 h-4 text-gray-500" /> : <HiChevronDown className="w-4 h-4 text-gray-500" />}
              </div>
            </div>

            {/* Scrollable Contents */}
            {openCard === "laporan" && (
              <div className="p-3 space-y-2.5 max-h-[350px] overflow-y-auto transition-all">

                {loading ? (
                  <div className="space-y-3">
                    {Array.from({ length: 3 }).map((_, idx) => (
                      <div key={idx} className="p-3.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-white/[0.02] space-y-2.5 animate-pulse">
                        <div className="flex items-center justify-between">
                          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-24" />
                          <div className="h-2.5 bg-gray-200 dark:bg-gray-700 rounded w-16" />
                        </div>
                        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-32" />
                      </div>
                    ))}
                  </div>
                ) : activeLaporan.length === 0 ? (
                  <p className="text-center text-xs text-gray-400 py-6">Belum ada laporan masuk.</p>
                ) : (
                  activeLaporan.map((l) => {
                    const lat = Number(l.latitude);
                    const lng = Number(l.longitude);
                    const hasCoords = Number.isFinite(lat) && Number.isFinite(lng) && (lat !== 0 || lng !== 0);

                    return (
                      <div 
                        key={l.id} 
                        onClick={() => {
                          if (hasCoords) {
                            useCoordFromLaporan(l);
                          } else {
                            showToast("Laporan ini tidak memiliki koordinat lokasi yang valid.", "error");
                          }
                        }}
                        className={`p-2.5 rounded-xl border transition-all cursor-pointer border-gray-200 dark:border-gray-700/50 bg-white dark:bg-white/[0.02] hover:border-blue-300 hover:bg-blue-50/5`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-gray-800 dark:text-gray-200 leading-tight">
                            {l.jenis_bencana} - {l.kecamatan?.nama || "Umum"}
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            )}
          </div>

          {/* Kecamatan Rawan Card */}
          <div className="rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-white/[0.03] overflow-hidden flex flex-col">
            {/* Card Header */}
            <div
              onClick={() => setOpenCard(openCard === "kecamatan" ? null : "kecamatan")}
              className="px-4 py-3 flex items-center justify-between cursor-pointer hover:bg-gray-50/50 dark:hover:bg-gray-900/50 transition-colors shrink-0 border-b border-gray-100 dark:border-gray-800 bg-gray-50/30 dark:bg-transparent"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center shrink-0">
                  <HiOutlineShieldExclamation className="w-4 h-4 text-blue-500" />
                </div>
                <span className="text-sm font-bold text-gray-800 dark:text-white">Kerawanan Kecamatan</span>
              </div>
              <div className="shrink-0 pl-1">
                {openCard === "kecamatan" ? <HiChevronUp className="w-4 h-4 text-gray-500" /> : <HiChevronDown className="w-4 h-4 text-gray-500" />}
              </div>
            </div>

            {/* Scrollable Contents */}
            {openCard === "kecamatan" && (
              <div className="p-3 flex flex-col gap-2.5 max-h-[400px] overflow-hidden transition-all">
                {/* Search Box */}
                <div className="relative shrink-0">
                  <input
                    type="text"
                    placeholder="Cari kecamatan..."
                    value={kecamatanSearch}
                    onChange={(e) => setKecamatanSearch(e.target.value)}
                    className="w-full rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs text-gray-900 shadow-sm outline-none transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:border-gray-700 dark:bg-gray-900/60 dark:text-gray-100"
                  />
                </div>

                {/* Scrollable List */}
                <div className="flex-1 overflow-y-auto space-y-2 pr-0.5">
                  {loadingKecamatan ? (
                    <div className="space-y-2">
                      {Array.from({ length: 4 }).map((_, idx) => (
                        <div key={idx} className="p-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-white/[0.02] animate-pulse space-y-2">
                          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-28" />
                          <div className="flex gap-1.5">
                            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-12" />
                            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-12" />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : filteredKecamatans.length === 0 ? (
                    <p className="text-center text-xs text-gray-400 py-4">Kecamatan tidak ditemukan.</p>
                  ) : (
                    filteredKecamatans.map((k) => {
                      const lat = Number(k.latitude);
                      const lng = Number(k.longitude);
                      const hasCoords = Number.isFinite(lat) && Number.isFinite(lng);
                      const isSelected = panToCoord && hasCoords && panToCoord[0] === lat && panToCoord[1] === lng;

                      return (
                        <div
                          key={k.id}
                          onClick={() => {
                            if (hasCoords) {
                              setPanToCoord([lat, lng]);
                              setClickedCoord(null);
                            }
                          }}
                          className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
                            isSelected
                              ? "border-blue-500 bg-blue-50/20 dark:bg-blue-950/20 ring-1 ring-blue-500/20 shadow-md"
                              : "border-gray-200 dark:border-gray-700/50 bg-white dark:bg-white/[0.02] hover:border-blue-300 hover:bg-blue-50/5"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-gray-800 dark:text-gray-200 leading-none">
                              {k.nama}
                            </span>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Pos Pengungsian Card */}
          <div className="rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-white/[0.03] overflow-hidden flex flex-col">
            {/* Card Header */}
            <div
              onClick={() => setOpenCard(openCard === "pos" ? null : "pos")}
              className="px-4 py-3 flex items-center justify-between cursor-pointer hover:bg-gray-50/50 dark:hover:bg-gray-900/50 transition-colors shrink-0 border-b border-gray-100 dark:border-gray-800 bg-gray-50/30 dark:bg-transparent"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-purple-50 dark:bg-purple-500/10 flex items-center justify-center shrink-0">
                  <HiOutlineHome className="w-4 h-4 text-purple-500" />
                </div>
                <span className="text-sm font-bold text-gray-800 dark:text-white">Pos Pengungsian</span>
              </div>
              <div className="shrink-0 pl-1">
                {openCard === "pos" ? <HiChevronUp className="w-4 h-4 text-gray-500" /> : <HiChevronDown className="w-4 h-4 text-gray-500" />}
              </div>
            </div>

            {/* Scrollable Contents */}
            {openCard === "pos" && (
              <div className="p-3 flex flex-col gap-2.5 max-h-[350px] overflow-hidden transition-all">
                <div className="flex-1 overflow-y-auto space-y-2 pr-0.5">
                  {loadingMarkers ? (
                    <div className="space-y-2">
                      {Array.from({ length: 3 }).map((_, idx) => (
                        <div key={idx} className="p-3 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-white/[0.02] animate-pulse space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-32" />
                            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-full w-12" />
                          </div>
                          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-24" />
                          <div className="flex gap-1.5">
                            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-12" />
                            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-12" />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : posPengungsianList.length === 0 ? (
                    <p className="text-center text-xs text-gray-400 py-4">Belum ada pos pengungsian.</p>
                  ) : (
                    posPengungsianList.map((p) => {
                      const lat = Number(p.latitude);
                      const lng = Number(p.longitude);
                      const hasCoords = Number.isFinite(lat) && Number.isFinite(lng);
                      const isSelected = panToCoord && hasCoords && panToCoord[0] === lat && panToCoord[1] === lng;

                      return (
                        <div
                          key={p.id}
                          onClick={() => {
                            if (hasCoords) {
                              setPanToCoord([lat, lng]);
                              setClickedCoord(null);
                            }
                          }}
                          className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
                            isSelected
                              ? "border-blue-500 bg-blue-50/20 dark:bg-blue-950/20 ring-1 ring-blue-500/20 shadow-md"
                              : "border-gray-200 dark:border-gray-700/50 bg-white dark:bg-white/[0.02] hover:border-blue-300 hover:bg-blue-50/5"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-gray-800 dark:text-gray-200 leading-tight">
                              {p.label || p.kategori}
                            </span>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Toast Notification - Portaled to Body to escape z-index boundaries */}
      {mounted && toast && typeof window !== "undefined" && createPortal(
        <div className={`fixed top-6 right-6 z-[99999] px-6 py-3 rounded-2xl shadow-2xl border flex items-center gap-3 animate-in fade-in slide-in-from-top-4 duration-300 ${
          toast.type === "success" 
            ? "bg-emerald-500 border-emerald-400 text-white" 
            : "bg-red-500 border-red-400 text-white"
        }`}>
          {toast.type === "success" ? <HiOutlineCheck className="w-5 h-5" /> : <HiOutlineExclamationTriangle className="w-5 h-5" />}
          <span className="font-bold text-sm">{toast.msg}</span>
        </div>,
        document.body
      )}

      {/* Custom Confirmation Dialog - Portaled to Body to cover the entire page including the header */}
      {mounted && confirmModal && confirmModal.isOpen && typeof window !== "undefined" && createPortal(
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/45 backdrop-blur-[2px] animate-in fade-in duration-150">
          <div 
            className="w-full max-w-sm bg-white dark:bg-gray-950 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-xl p-5 overflow-hidden animate-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Simple Info */}
            <div className="mb-4">
              <h4 className="text-sm font-bold text-gray-800 dark:text-white mb-1.5 flex items-center gap-1.5">
                {confirmModal.type === "danger" ? "❌ " : confirmModal.type === "success" ? "✅ " : "⚠️ "}
                {confirmModal.title}
              </h4>
              <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                {confirmModal.message}
              </p>
            </div>

            {/* Simple Actions */}
            <div className="flex items-center justify-end gap-2 text-xs">
              <button
                type="button"
                onClick={() => setConfirmModal(null)}
                className="px-3.5 py-2 font-medium text-gray-500 hover:text-gray-700 bg-gray-50 border border-gray-200 rounded-lg dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-750"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={confirmModal.onConfirm}
                className={`px-3.5 py-2 font-bold text-white rounded-lg transition-colors ${
                  confirmModal.type === "danger"
                    ? "bg-red-500 hover:bg-red-650"
                    : confirmModal.type === "success"
                    ? "bg-emerald-500 hover:bg-emerald-650"
                    : "bg-blue-600 hover:bg-blue-700"
                }`}
              >
                Lanjutkan
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
