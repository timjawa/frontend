"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
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
  "UMUM",
];

const BAHAYA_OPTIONS = [
  { value: "rendah", label: "Rendah", color: "text-green-600", bg: "bg-green-50 border-green-200" },
  { value: "sedang", label: "Sedang", color: "text-yellow-600", bg: "bg-yellow-50 border-yellow-200" },
  { value: "tinggi", label: "Tinggi", color: "text-orange-600", bg: "bg-orange-50 border-orange-200" },
  { value: "kritis", label: "KRITIS", color: "text-red-600", bg: "bg-red-50 border-red-200" },
];

const peringatanAktif = [
  { id: "wd1", kecamatan: "Gumukmas", deskripsi: "Potensi banjir akibat curah hujan tinggi di hulu sungai", tingkat_urgensi: "tinggi" as const },
  { id: "wd2", kecamatan: "Kalisat", deskripsi: "Longsor di jalur utama, akses jalan terganggu", tingkat_urgensi: "kritis" as const },
  { id: "wd3", kecamatan: "Ambulu", deskripsi: "Gelombang pasang, warga pesisir diminta waspada", tingkat_urgensi: "sedang" as const },
];

const posPengungsian = [
  { id: "p1", nama: "Gedung Serbaguna Gumukmas", kecamatan: "Gumukmas", kapasitas: 500, terisi: 320, status: "aktif" as const },
  { id: "p2", nama: "SDN 1 Ambulu", kecamatan: "Ambulu", kapasitas: 300, terisi: 0, status: "standby" as const },
  { id: "p3", nama: "Balai Desa Kalisat", kecamatan: "Kalisat", kapasitas: 200, terisi: 200, status: "penuh" as const },
  { id: "p4", nama: "GOR Jember", kecamatan: "Jember", kapasitas: 1000, terisi: 0, status: "standby" as const },
];

const kecamatanRawan = [
  { nama: "Gumukmas", level_rawan: "tinggi" as const },
  { nama: "Ambulu", level_rawan: "sedang" as const },
  { nama: "Kalisat", level_rawan: "tinggi" as const },
  { nama: "Arjasa", level_rawan: "rendah" as const },
  { nama: "Jenggawah", level_rawan: "sedang" as const },
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

const LAYER_INFO = [
  { id: "l1", label: "Zona Rawan Bencana", dot: "bg-red-500", color: "text-red-500" },
  { id: "l2", label: "Titik Banjir Aktif", dot: "bg-blue-500", color: "text-blue-500" },
  { id: "l3", label: "Pos Pengungsian", dot: "bg-green-500", color: "text-green-500" },
  { id: "l4", label: "Jalur Evakuasi", dot: "bg-yellow-400", color: "text-yellow-500" },
  { id: "l5", label: "Pos Pemantauan", dot: "bg-purple-500", color: "text-purple-500" },
];

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
};

const inputClass =
  "w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 shadow-sm outline-none transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:border-gray-700 dark:bg-gray-900/60 dark:text-gray-100 dark:focus:border-blue-400 dark:focus:ring-blue-500/20";
const labelClass = "block text-xs font-semibold text-gray-600 dark:text-gray-300 mb-1.5";

export default function PetaBencanaPage() {
  // --- STATE MANAGEMENT (Penyimpanan Data di UI) ---
  
  // Menyimpan daftar laporan warga dari API
  const [laporan, setLaporan] = useState<Laporan[]>([]);
  // Menyimpan daftar marker manual yang sudah ada di database
  const [manualMarkers, setManualMarkers] = useState<ManualMarker[]>([]);
  // Status loading untuk menampilkan animasi loading
  const [loading, setLoading] = useState(true);
  // Kontrol buka/tutup form tambah marker
  const [showAddForm, setShowAddForm] = useState(false);
  // Kontrol buka/tutup sub-menu laporan di sidebar
  const [showLaporanSub, setShowLaporanSub] = useState(false);
  // Koordinat yang baru saja diklik user di peta (titik hijau)
  const [clickedCoord, setClickedCoord] = useState<[number, number] | null>(null);

  // Data yang sedang diketik di dalam form (input teks, select, dll)
  const [form, setForm] = useState<{
    lat: string;
    lng: string;
    kategori: string;
    label: string;
    tingkat_bahaya: string;
    tipe_marker: "titik" | "garis" | "area";
  }>({ 
    lat: "", 
    lng: "", 
    kategori: "BANJIR", 
    label: "", 
    tingkat_bahaya: "sedang",
    tipe_marker: "titik"
  });

  // Khusus mode GARIS: menyimpan urutan titik-titik yang diklik
  const [pathPoints, setPathPoints] = useState<[number, number][]>([]);
  // Pesan error jika input form tidak valid
  const [formError, setFormError] = useState("");
  // Status keberhasilan simpan data (opsional)
  const [formSuccess, setFormSuccess] = useState(false);
  // State untuk memunculkan notifikasi melayang (Toast)
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);

  // Fungsi untuk memicu munculnya notifikasi Toast selama 3 detik
  const showToast = (msg: string, type: "success" | "error" = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };
  const [editingId, setEditingId] = useState<string | null>(null);

  const [loadingMarkers, setLoadingMarkers] = useState(false);
  const [savingMarker, setSavingMarker] = useState(false);

  // --- DATA FETCHING (Mengambil Data dari Database) ---

  // Mengambil laporan warga (Pengaduan)
  const fetchLaporan = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get("/api/admin/pengaduan", { params: { per_page: 200 } });
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

  // Menjalankan fetch data secara otomatis saat halaman pertama kali dibuka
  useEffect(() => { fetchLaporan(); fetchMarkers(); }, [fetchLaporan, fetchMarkers]);

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
      source: "manual" as const,
      tipe_marker: m.tipe_marker,
      path_data: m.path_data || undefined,
    })), [manualMarkers]);

  const laporanWithCoords = laporan.filter((l) => {
    const lat = Number(l.latitude);
    const lng = Number(l.longitude);
    return Number.isFinite(lat) && Number.isFinite(lng) && (lat !== 0 || lng !== 0);
  });

  // --- INTERACTION LOGIC (Logika Interaksi User) ---

  // Fungsi saat user klik area kosong di peta (untuk mode TITIK)
  const handleMapClick = (lat: number, lng: number) => {
    setClickedCoord([lat, lng]); // Simpan koordinat yang diklik
    // Masukkan koordinat ke dalam input form otomatis
    setForm((prev) => ({ ...prev, lat: lat.toFixed(7), lng: lng.toFixed(7) }));
    if (!showAddForm) setShowAddForm(true); // Tampilkan form jika belum terbuka
  };

  // Memindahkan koordinat dari laporan warga (sidebar kiri) ke form
  const useCoordFromLaporan = (l: Laporan) => {
    const lat = Number(l.latitude);
    const lng = Number(l.longitude);
    
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) return;

    setForm((prev) => ({
      ...prev,
      lat: lat.toFixed(7),
      lng: lng.toFixed(7),
      // Coba tebak kategori dari judul jenis_bencana laporan
      kategori: (l.jenis_bencana || "").toUpperCase().replace(/ /g, "_").includes("BANJIR") ? "BANJIR"
        : (l.jenis_bencana || "").toUpperCase().replace(/ /g, "_").includes("GEMPA") ? "GEMPA BUMI"
        : (l.jenis_bencana || "").toUpperCase().includes("LONGSOR") ? "TANAH LONGSOR"
        : (l.jenis_bencana || "").toUpperCase().includes("KEBAKARAN") ? "KEBAKARAN"
        : (l.jenis_bencana || "").toUpperCase().includes("CUACA") ? "CUACA EKSTREM"
        : "UMUM",
      label: `${l.jenis_bencana || "Laporan"} - ${l.kecamatan?.nama || l.alamat_lengkap || ""}`.trim(),
    }));
    setClickedCoord([lat, lng]);
    setShowAddForm(true);
  };

  const switchTipeMarker = (tipe: "titik" | "garis" | "area") => {
    setForm(p => ({ ...p, tipe_marker: tipe }));
    setFormError("");
    // Reset data koordinat draf saat pindah mode agar tidak tumpang tindih
    if (tipe === "titik") {
      setPathPoints([]); // Hapus draf garis
    } else {
      setClickedCoord(null); // Hapus penanda titik hijau
    }
  };

  const handleEditMarker = (m: ManualMarker) => {
    setEditingId(m.id);
    setForm({
      lat: m.latitude.toString(),
      lng: m.longitude.toString(),
      kategori: m.kategori,
      label: m.label || "",
      tingkat_bahaya: m.tingkat_bahaya,
      tipe_marker: m.tipe_marker || "titik",
    });
    setPathPoints(m.path_data || []);
    setClickedCoord([m.latitude, m.longitude]);
    setShowAddForm(true);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setForm({ lat: "", lng: "", kategori: "BANJIR", label: "", tingkat_bahaya: "sedang", tipe_marker: "titik" });
    setPathPoints([]);
    setClickedCoord(null);
  };

  const handleAddMarker = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    const lat = Number(form.lat);
    const lng = Number(form.lng);
    
    // Validasi dasar
    if (form.tipe_marker === "titik") {
      if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
        setFormError("Latitude dan longitude harus berupa angka valid.");
        return;
      }
    } else if (form.tipe_marker === "garis") {
      if (pathPoints.length < 2) {
        setFormError("Garis jalan minimal harus memiliki 2 titik. Klik pada peta untuk menambahkan titik.");
        return;
      }
    }

    setSavingMarker(true);
    
    // Ambil koordinat pertama sebagai anchor jika tipe garis
    const firstPoint = pathPoints[0];
    const finalLat = (form.tipe_marker === "garis" && firstPoint) ? firstPoint[0] : lat;
    const finalLng = (form.tipe_marker === "garis" && firstPoint) ? firstPoint[1] : lng;

    const payload = {
      latitude: finalLat,
      longitude: finalLng,
      tipe_marker: form.tipe_marker,
      path_data: form.tipe_marker === "garis" ? pathPoints : null,
      label: form.label.trim() || null,
      kategori: form.kategori,
      tingkat_bahaya: form.tingkat_bahaya,
    };

    try {
      if (editingId) {
        await api.put(`/api/admin/peta-marker/${editingId}`, payload);
      } else {
        await api.post("/api/admin/peta-marker", payload);
      }
      await fetchMarkers();
      setForm({ lat: "", lng: "", kategori: "BANJIR", label: "", tingkat_bahaya: "sedang", tipe_marker: "titik" });
      setPathPoints([]);
      setClickedCoord(null);
      setEditingId(null);
      showToast(editingId ? "Marker berhasil diperbarui!" : "Marker baru berhasil ditambahkan!");
    } catch {
      setFormError("Gagal menyimpan marker. Coba lagi.");
      showToast("Gagal menyimpan data", "error");
    } finally {
      setSavingMarker(false);
    }
  };

  const removeManualMarker = async (id: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus marker ini?")) return;
    try {
      await api.delete(`/api/admin/peta-marker/${id}`);
      setManualMarkers((prev) => prev.filter((m) => m.id !== id));
      if (editingId === id) cancelEdit();
      showToast("Marker berhasil dihapus");
    } catch {
      showToast("Gagal menghapus marker", "error");
    }
  };

  return (
    <div>
      <PageBreadcrumb pageTitle="Peta Bencana" />

      {/* Stats — semua card */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-6">
        {[
          { icon: <HiOutlineMapPin className="w-5 h-5 text-blue-500" />, bg: "bg-blue-50 dark:bg-blue-500/10", label: "Marker di Peta", value: manualMarkers.length },
          { icon: <HiOutlineExclamationTriangle className="w-5 h-5 text-red-500" />, bg: "bg-red-50 dark:bg-red-500/10", label: "Peringatan Aktif", value: peringatanAktif.length },
          { icon: <HiOutlineHome className="w-5 h-5 text-green-500" />, bg: "bg-green-50 dark:bg-green-500/10", label: "Pos Pengungsian", value: posPengungsian.length },
          { icon: <HiOutlineShieldExclamation className="w-5 h-5 text-orange-500" />, bg: "bg-orange-50 dark:bg-orange-500/10", label: "Rawan Tinggi", value: kecamatanRawan.filter(k => k.level_rawan === "tinggi").length },
          { icon: <HiOutlineExclamationTriangle className="w-5 h-5 text-yellow-500" />, bg: "bg-yellow-50 dark:bg-yellow-500/10", label: "Laporan Masuk", value: laporan.length },
          { icon: <HiOutlineFlag className="w-5 h-5 text-purple-500" />, bg: "bg-purple-50 dark:bg-purple-500/10", label: "Layer Aktif", value: LAYER_INFO.length },
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
                  <p className="text-xs text-gray-400">{manualMarkers.length} marker aktif · klik peta untuk pilih koordinat</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={fetchLaporan}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-600 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300"
                >
                  <HiOutlineArrowPath className="w-3.5 h-3.5" />
                  Refresh
                </button>
                <button
                  onClick={() => setShowAddForm((v) => !v)}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
                >
                  <HiOutlinePlus className="w-3.5 h-3.5" />
                  Tambah Marker
                </button>
              </div>
            </div>

            {/* Legenda layer */}
            <div className="px-5 py-2 border-b border-gray-100 dark:border-gray-800 flex flex-wrap items-center gap-x-4 gap-y-1 bg-gray-50/50 dark:bg-white/[0.02]">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Layer:</span>
              {LAYER_INFO.map((l) => (
                <div key={l.id} className="flex items-center gap-1.5">
                  <span className={`w-2 h-2 rounded-full shrink-0 ${l.dot}`} />
                  <span className="text-xs text-gray-500 dark:text-gray-400">{l.label}</span>
                </div>
              ))}
            </div>

            <div className="flex-1 relative">
              <PetaBencanaMap
                markers={allMarkers}
                onMapClick={handleMapClick}
                clickedCoord={form.tipe_marker === "titik" ? clickedCoord : null}
                isDrawingLine={form.tipe_marker === "garis"}
                currentLinePoints={pathPoints}
                onLinePointsChange={setPathPoints}
              />
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="xl:col-span-1 order-1 xl:order-2 space-y-4">

          {/* Form Tambah Marker */}
          {showAddForm && (
            <div className="rounded-2xl border border-blue-200 bg-blue-50/60 dark:border-blue-800 dark:bg-blue-950/20 shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-blue-100 dark:border-blue-800/50 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <HiOutlinePlus className="w-4 h-4 text-blue-600" />
                  <span className="text-sm font-bold text-gray-800 dark:text-white">
                    {editingId ? "Edit Marker" : "Tambah Marker"}
                  </span>
                </div>
                <button
                  onClick={editingId ? cancelEdit : () => { setShowAddForm(false); setClickedCoord(null); setFormError(""); }}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <HiOutlineXMark className="w-4 h-4" />
                </button>
              </div>
              <form onSubmit={handleAddMarker} className="p-4 space-y-3">
                {editingId && (
                  <div className="p-2 bg-blue-100 dark:bg-blue-900/40 border border-blue-200 dark:border-blue-800 rounded-lg flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold text-blue-800 dark:text-blue-300">MODE EDIT AKTIF</span>
                    <button type="button" onClick={cancelEdit} className="text-[10px] font-bold text-red-600 hover:underline">Batal</button>
                  </div>
                )}
                
                {/* Tipe Selector */}
                <div className="grid grid-cols-2 gap-2 p-1 bg-white/50 dark:bg-gray-800/40 rounded-xl border border-gray-200 dark:border-gray-700">
                  <button
                    type="button"
                    onClick={() => switchTipeMarker("titik")}
                    className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${form.tipe_marker === "titik" ? "bg-blue-600 text-white shadow-sm" : "text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700"}`}
                  >
                    Titik (Marker)
                  </button>
                  <button
                    type="button"
                    onClick={() => switchTipeMarker("garis")}
                    className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${form.tipe_marker === "garis" ? "bg-blue-600 text-white shadow-sm" : "text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700"}`}
                  >
                    Garis Jalan
                  </button>
                </div>

                {!editingId && (
                  <p className="text-xs text-blue-700 dark:text-blue-300 bg-blue-100 dark:bg-blue-900/40 rounded-lg px-3 py-2">
                    {form.tipe_marker === "titik" 
                      ? "💡 Klik di peta atau gunakan tombol Tandai dari laporan."
                      : "💡 Klik berurutan pada peta untuk menggambar jalur jalan yang banjir."
                    }
                  </p>
                )}

                {form.tipe_marker === "titik" ? (
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className={labelClass}>Latitude</label>
                      <input type="number" step="any" placeholder="-8.1845" value={form.lat} onChange={(e) => setForm((p) => ({ ...p, lat: e.target.value }))} className={inputClass} required />
                    </div>
                    <div>
                      <label className={labelClass}>Longitude</label>
                      <input type="number" step="any" placeholder="113.6681" value={form.lng} onChange={(e) => setForm((p) => ({ ...p, lng: e.target.value }))} className={inputClass} required />
                    </div>
                  </div>
                ) : (
                  <div className="p-3 border border-dashed border-blue-200 dark:border-blue-800 rounded-xl bg-blue-50/30 dark:bg-blue-900/10">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-bold text-gray-500 uppercase">Titik Jalur: {pathPoints.length}</span>
                      {pathPoints.length > 0 && (
                        <button type="button" onClick={() => setPathPoints([])} className="text-[10px] text-red-500 font-bold hover:underline">Reset Jalur</button>
                      )}
                    </div>
                    {pathPoints.length === 0 ? (
                      <p className="text-[11px] text-gray-400 italic">Belum ada titik. Silakan klik pada peta.</p>
                    ) : (
                      <div className="max-h-24 overflow-y-auto space-y-1 pr-1">
                        {pathPoints.map((p, idx) => (
                          <div key={idx} className="text-[10px] font-mono text-gray-500 flex items-center justify-between">
                            <span>Point {idx + 1}: {p[0].toFixed(5)}, {p[1].toFixed(5)}</span>
                            <button type="button" onClick={() => setPathPoints(prev => prev.filter((_, i) => i !== idx))} className="text-red-400 hover:text-red-600">×</button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
                <div>
                  <label className={labelClass}>Kategori Bencana</label>
                  <select value={form.kategori} onChange={(e) => setForm((p) => ({ ...p, kategori: e.target.value }))} className={inputClass}>
                    {KATEGORI_OPTIONS.map((k) => <option key={k} value={k}>{k}</option>)}
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Tingkat Bahaya</label>
                  <div className="grid grid-cols-2 gap-2">
                    {BAHAYA_OPTIONS.map((b) => (
                      <button
                        key={b.value}
                        type="button"
                        onClick={() => setForm((p) => ({ ...p, tingkat_bahaya: b.value }))}
                        className={`px-3 py-2 rounded-xl border text-xs font-bold transition-all ${
                          form.tingkat_bahaya === b.value
                            ? `${b.bg} ${b.color} shadow-sm scale-[1.02]`
                            : "border-gray-200 bg-white text-gray-500 hover:border-gray-300"
                        }`}
                      >
                        {b.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className={labelClass}>Label / Keterangan (opsional)</label>
                  <input type="text" placeholder="Contoh: Titik banjir Sungai X" value={form.label} onChange={(e) => setForm((p) => ({ ...p, label: e.target.value }))} className={inputClass} />
                </div>
                {formError && <p className="text-xs text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 rounded-lg px-3 py-2">{formError}</p>}
                <button 
                  type="submit" 
                  disabled={savingMarker} 
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 text-sm font-bold text-white bg-blue-600 rounded-2xl hover:bg-blue-700 active:scale-[0.98] transition-all shadow-lg shadow-blue-500/25 disabled:opacity-60 disabled:cursor-not-allowed group"
                >
                  {savingMarker ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Memproses...
                    </>
                  ) : (
                    <>
                      {editingId ? <HiOutlineCheck className="w-5 h-5" /> : <HiOutlinePlus className="w-5 h-5" />}
                      <span className="tracking-wide">{editingId ? "Simpan Perubahan" : "Tambahkan ke Peta"}</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          )}

          {/* Daftar Marker Manual */}
          {manualMarkers.length > 0 && (
            <div className="rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-white/[0.03] overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-800 flex items-center gap-2">
                <HiOutlineMapPin className="w-4 h-4 text-green-500" />
                <span className="text-sm font-bold text-gray-800 dark:text-white">Marker di Peta</span>
                <span className="ml-auto text-xs font-semibold text-white bg-green-500 px-1.5 py-0.5 rounded-full">{manualMarkers.length}</span>
              </div>
              <div className="p-3 space-y-2 max-h-52 overflow-y-auto">
                {manualMarkers.map((m) => (
                    <div key={m.id} className="flex items-start justify-between gap-2 p-2.5 bg-gray-50 dark:bg-gray-800/40 rounded-xl border border-gray-100 dark:border-gray-700/50">
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-gray-800 dark:text-gray-200 truncate">{m.label}</p>
                        <p className="text-xs text-gray-500">{m.kategori}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <p className="text-[10px] text-gray-400 font-mono">
                            {m.tipe_marker === "garis" 
                              ? `Jalur (${m.path_data?.length || 0} titik)` 
                              : `${Number(m.latitude).toFixed(5)}, ${Number(m.longitude).toFixed(5)}`
                            }
                          </p>
                          {m.tingkat_bahaya && (
                            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                              m.tingkat_bahaya === "kritis" ? "bg-red-100 text-red-600" :
                              m.tingkat_bahaya === "tinggi" ? "bg-orange-100 text-orange-600" :
                              m.tingkat_bahaya === "sedang" ? "bg-yellow-100 text-yellow-600" :
                              "bg-green-100 text-green-600"
                            }`}>{m.tingkat_bahaya.toUpperCase()}</span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-1 mt-0.5 shrink-0">
                        <button onClick={() => handleEditMarker(m)} className="p-1 text-gray-400 hover:text-blue-500 transition-colors">
                          <HiOutlinePencilSquare className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => removeManualMarker(m.id)} className="p-1 text-gray-400 hover:text-red-500 transition-colors">
                          <HiOutlineXMark className="w-3.5 h-3.5" />
                        </button>
                      </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Layer Info */}
          <div className="rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-white/[0.03] overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-800 flex items-center gap-2">
              <HiOutlineShieldExclamation className="w-4 h-4 text-orange-500" />
              <span className="text-sm font-bold text-gray-800 dark:text-white">Kontrol Layer</span>
            </div>
            <div className="p-4 space-y-2">
              {LAYER_INFO.map((l) => (
                <div key={l.id} className="flex items-center gap-2.5 py-1">
                  <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${l.dot}`} />
                  <span className="text-sm text-gray-700 dark:text-gray-300">{l.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Laporan Masuk — Subcard referensi */}
          <div className="rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-white/[0.03] overflow-hidden">
            <button
              onClick={() => setShowLaporanSub((v) => !v)}
              className="w-full px-5 py-4 flex items-center justify-between border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
            >
              <div className="flex items-center gap-2">
                <HiOutlineExclamationTriangle className="w-4 h-4 text-red-500" />
                <span className="text-sm font-bold text-gray-800 dark:text-white">Laporan Masuk</span>
                {loading
                  ? <span className="ml-1 w-3 h-3 border-2 border-blue-400 border-t-transparent rounded-full animate-spin inline-block" />
                  : <span className="ml-1 text-xs font-semibold text-white bg-red-500 px-1.5 py-0.5 rounded-full">{laporan.length}</span>
                }
              </div>
              {showLaporanSub
                ? <HiChevronUp className="w-4 h-4 text-gray-400" />
                : <HiChevronDown className="w-4 h-4 text-gray-400" />
              }
            </button>

            {showLaporanSub && (
              <div className="p-3 space-y-2 max-h-[380px] overflow-y-auto">
                {/* Hint */}
                <p className="text-[11px] text-gray-400 italic px-1">
                  Klik <b className="text-blue-500">Tandai</b> untuk mengisi koordinat laporan ke form marker.
                </p>
                {loading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : laporan.length === 0 ? (
                  <p className="text-center text-xs text-gray-400 py-6">Belum ada laporan masuk.</p>
                ) : (
                  laporan.map((l) => {
                    const lat = Number(l.latitude);
                    const lng = Number(l.longitude);
                    const hasCoords = Number.isFinite(lat) && Number.isFinite(lng) && (lat !== 0 || lng !== 0);
                    const st = STATUS_BADGE[l.status] ?? { label: l.status, variant: "default" as const };
                    return (
                      <div key={l.id} className="p-3 rounded-xl border border-gray-100 dark:border-gray-700/50 bg-gray-50 dark:bg-gray-800/40">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <span className="text-xs font-semibold text-gray-800 dark:text-gray-200 leading-tight">{l.user?.name || "Anonim"}</span>
                          <AdminBadge variant={st.variant}>{st.label}</AdminBadge>
                        </div>
                        <p className="text-xs text-gray-600 dark:text-gray-400 mb-1.5">{l.jenis_bencana} · {l.kecamatan?.nama || "—"}</p>
                        <div className="flex items-center gap-2">
                          {hasCoords ? (
                            <>
                              <span className="inline-flex items-center gap-1 text-[10px] font-mono text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-900/20 px-1.5 py-0.5 rounded-md border border-green-100 dark:border-green-800">
                                {lat.toFixed(4)}, {lng.toFixed(4)}
                              </span>
                              <button
                                onClick={() => useCoordFromLaporan(l)}
                                className="ml-auto text-[10px] font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 px-2 py-0.5 rounded-md transition-colors flex items-center gap-1"
                              >
                                <HiOutlineMapPin className="w-2.5 h-2.5" />
                                Tandai
                              </button>
                            </>
                          ) : (
                            <span className="text-[10px] text-gray-400 bg-gray-100 dark:bg-gray-700/40 px-1.5 py-0.5 rounded-md border border-gray-200 dark:border-gray-700">
                              Tanpa koordinat
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            )}
          </div>

        </div>
      </div>

      {/* Toast Notification */}
      {toast && (
        <div className={`fixed bottom-8 left-1/2 -translate-x-1/2 z-[9999] px-6 py-3 rounded-2xl shadow-2xl border flex items-center gap-3 animate-in fade-in slide-in-from-bottom-4 duration-300 ${
          toast.type === "success" 
            ? "bg-emerald-500 border-emerald-400 text-white" 
            : "bg-red-500 border-red-400 text-white"
        }`}>
          {toast.type === "success" ? <HiOutlineCheck className="w-5 h-5" /> : <HiOutlineExclamationTriangle className="w-5 h-5" />}
          <span className="font-bold text-sm">{toast.msg}</span>
        </div>
      )}
    </div>
  );
}
