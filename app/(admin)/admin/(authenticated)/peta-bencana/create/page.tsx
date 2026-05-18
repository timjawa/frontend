"use client";

import React, { useState, useEffect, useRef } from "react";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { HiOutlineArrowLeft, HiOutlineCheck, HiOutlineMapPin, HiOutlineTrash } from "react-icons/hi2";
import api from "@/lib/api";
import dynamic from "next/dynamic";

const CreateMapPicker = dynamic<{
  latitude: number | string;
  longitude: number | string;
  tipeMarker: "titik" | "garis";
  pathPoints: [number, number][];
  onMapClick: (lat: number, lng: number) => void;
  className?: string;
}>(
  () => import("./CreateMapPickerComponent"),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-[400px] bg-gray-100 animate-pulse rounded-xl flex items-center justify-center text-gray-400 text-sm border border-gray-200 dark:bg-gray-800 dark:border-gray-700">
        Memuat Peta...
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
  { value: "rendah", label: "Rendah" },
  { value: "sedang", label: "Sedang" },
  { value: "tinggi", label: "Tinggi" },
  { value: "kritis", label: "KRITIS" },
];

export default function CreatePetaMarkerPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    label: "",
    kategori: "BANJIR",
    tingkat_bahaya: "sedang",
    tipe_marker: "titik" as "titik" | "garis",
    latitude: "",
    longitude: "",
  });
  const [pathPoints, setPathPoints] = useState<[number, number][]>([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const lat = params.get("lat");
      const lng = params.get("lng");
      const kategori = params.get("kategori");
      const label = params.get("label");

      if (lat && lng) {
        const isBanjir = kategori === "BANJIR";
        
        setFormData((prev) => ({
          ...prev,
          latitude: isBanjir ? "" : lat,
          longitude: isBanjir ? "" : lng,
          kategori: kategori || prev.kategori,
          label: label || prev.label,
          tipe_marker: isBanjir ? "garis" : "titik",
        }));

        if (isBanjir) {
          setPathPoints([[parseFloat(lat), parseFloat(lng)]]);
        }
      }
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});
    setServerError(null);

    const lat = parseFloat(formData.latitude);
    const lng = parseFloat(formData.longitude);

    // Form validation
    const errs: Record<string, string> = {};
    if (formData.tipe_marker === "titik") {
      if (isNaN(lat) || isNaN(lng)) {
        errs.latitude = "Koordinat latitude dan longitude wajib ditentukan.";
      } else if (lat < -8.55 || lat > -7.85 || lng < 113.10 || lng > 114.15) {
        errs.latitude = "Koordinat harus berada di dalam Kabupaten Jember!";
      }
    } else {
      if (pathPoints.length < 2) {
        errs.path = "Garis bencana minimal harus memiliki 2 titik koordinat.";
      } else {
        const isOutside = pathPoints.some(([plat, plng]) => 
          plat < -8.55 || plat > -7.85 || plng < 113.10 || plng > 114.15
        );
        if (isOutside) {
          errs.path = "Ada titik jalur di luar Kabupaten Jember!";
        }
      }
    }

    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      setLoading(false);
      return;
    }

    try {
      const finalLat = formData.tipe_marker === "garis" ? pathPoints[0][0] : lat;
      const finalLng = formData.tipe_marker === "garis" ? pathPoints[0][1] : lng;

      const payload = {
        latitude: finalLat,
        longitude: finalLng,
        tipe_marker: formData.tipe_marker,
        path_data: formData.tipe_marker === "garis" ? pathPoints : null,
        label: formData.label.trim() || null,
        kategori: formData.kategori,
        tingkat_bahaya: formData.tingkat_bahaya,
      };

      await api.post("/api/admin/peta-marker", payload);
      router.push("/admin/peta-bencana");
    } catch (err: any) {
      console.error(err);
      setServerError(err.response?.data?.message || "Gagal menyimpan marker bencana. Silakan coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    setFormData((prev) => {
      const updates = { ...prev, [name]: value };
      
      // Auto-switch tipe_marker ke "garis" jika kategori BANJIR
      if (name === "kategori" && value === "BANJIR" && prev.tipe_marker !== "garis") {
        updates.tipe_marker = "garis";
        
        // Pindahkan lat/lng yang sudah ada ke pathPoints sebagai titik awal
        if (prev.latitude && prev.longitude) {
          setPathPoints([[parseFloat(prev.latitude), parseFloat(prev.longitude)]]);
          updates.latitude = "";
          updates.longitude = "";
        }
      }

      // Auto-switch tipe_marker ke "titik" jika kategori POS PENGUNGSIAN
      if (name === "kategori" && value === "POS PENGUNGSIAN" && prev.tipe_marker !== "titik") {
        updates.tipe_marker = "titik";
        const hasPath = pathPoints.length > 0;
        updates.latitude = hasPath ? pathPoints[0][0].toFixed(7) : prev.latitude;
        updates.longitude = hasPath ? pathPoints[0][1].toFixed(7) : prev.longitude;
        setPathPoints([]);
      }
      
      return updates;
    });
    
    setErrors((prev) => ({ ...prev, [name]: "", path: "" }));
  };

  const handleMapClick = (lat: number, lng: number) => {
    if (lat < -8.55 || lat > -7.85 || lng < 113.10 || lng > 114.15) {
      setErrors((prev) => ({ ...prev, latitude: "Koordinat di luar Kabupaten Jember!" }));
      return;
    }

    if (formData.tipe_marker === "titik") {
      setFormData((prev) => ({
        ...prev,
        latitude: lat.toFixed(7),
        longitude: lng.toFixed(7),
      }));
      setErrors((prev) => ({ ...prev, latitude: "", longitude: "" }));
    } else {
      setPathPoints((prev) => [...prev, [lat, lng]]);
      setErrors((prev) => ({ ...prev, path: "" }));
    }
  };

  const removeLastPoint = () => {
    setPathPoints((prev) => prev.slice(0, -1));
  };

  const clearAllPoints = () => {
    setPathPoints([]);
  };

  const inputClass = (field: string) =>
    `w-full px-4 py-2.5 bg-gray-50 border rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-500 dark:bg-gray-800/50 dark:text-white dark:disabled:bg-gray-800 dark:disabled:text-gray-500 ${
      errors[field] ? "border-red-400 bg-red-50 dark:bg-red-950/10" : "border-gray-200 dark:border-gray-700"
    }`;

  return (
    <div className="pb-10">
      <div className="flex items-center justify-between mb-6">
        <PageBreadcrumb pageTitle="Tambah Marker Bencana" className="mb-0" />
        <Link
          href="/admin/peta-bencana"
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300"
        >
          <HiOutlineArrowLeft className="w-4 h-4" />
          Kembali
        </Link>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-white/[0.03] overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-100 dark:border-gray-800">
          <h3 className="text-base font-semibold text-gray-900 dark:text-white">Form Tambah Marker Bencana</h3>
          <p className="text-sm text-gray-500 mt-1">
            Gunakan form di bawah untuk membuat marker bencana baru langsung ke peta.
          </p>
        </div>

        {serverError && (
          <div className="mx-6 mt-4 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-650 text-sm dark:bg-red-950/20 dark:border-red-900/50 dark:text-red-400">
            {serverError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* Input fields */}
            <div className="space-y-5">
              {/* Nama/Label Kejadian */}
              <div className="space-y-2">
                <label htmlFor="label" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Label/Nama Kejadian Bencana <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="label"
                  name="label"
                  value={formData.label}
                  onChange={handleChange}
                  required
                  placeholder="Contoh: Banjir Bandang Sungai Bedadung"
                  className={inputClass("label")}
                />
                {errors.label && <p className="text-xs text-red-500">{errors.label}</p>}
              </div>

              {/* Kategori Bencana */}
              <div className="space-y-2">
                <label htmlFor="kategori" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Kategori Bencana <span className="text-red-500">*</span>
                </label>
                <select
                  id="kategori"
                  name="kategori"
                  value={formData.kategori}
                  onChange={handleChange}
                  required
                  className={inputClass("kategori")}
                >
                  {KATEGORI_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
                {errors.kategori && <p className="text-xs text-red-500">{errors.kategori}</p>}
              </div>

              {/* Tingkat Bahaya */}
              <div className="space-y-2">
                <label htmlFor="tingkat_bahaya" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Tingkat Kerawanan / Bahaya <span className="text-red-500">*</span>
                </label>
                <select
                  id="tingkat_bahaya"
                  name="tingkat_bahaya"
                  value={formData.tingkat_bahaya}
                  onChange={handleChange}
                  required
                  className={inputClass("tingkat_bahaya")}
                >
                  {BAHAYA_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
                {errors.tingkat_bahaya && <p className="text-xs text-red-500">{errors.tingkat_bahaya}</p>}
              </div>

              {/* Tipe Marker */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Tipe Penanda <span className="text-red-500">*</span>
                </label>
                <div className="flex gap-4">
                   <label className="flex items-center gap-2 cursor-pointer text-sm font-medium text-gray-700 dark:text-gray-300">
                    <input
                      type="radio"
                      name="tipe_marker"
                      value="titik"
                      checked={formData.tipe_marker === "titik"}
                      onChange={() => {
                        setFormData((prev) => {
                          const hasPath = pathPoints.length > 0;
                          return {
                            ...prev,
                            tipe_marker: "titik",
                            latitude: hasPath ? pathPoints[0][0].toFixed(7) : prev.latitude,
                            longitude: hasPath ? pathPoints[0][1].toFixed(7) : prev.longitude,
                          };
                        });
                        setPathPoints([]);
                      }}
                      className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                    />
                    Titik Tunggal
                  </label>
                  <label className={`flex items-center gap-2 text-sm font-medium ${formData.kategori === "POS PENGUNGSIAN" ? "opacity-40 cursor-not-allowed text-gray-400" : "cursor-pointer text-gray-700 dark:text-gray-300"}`}>
                    <input
                      type="radio"
                      name="tipe_marker"
                      value="garis"
                      disabled={formData.kategori === "POS PENGUNGSIAN"}
                      checked={formData.tipe_marker === "garis"}
                      onChange={() => {
                        setFormData((prev) => {
                          const lat = parseFloat(prev.latitude);
                          const lng = parseFloat(prev.longitude);
                          if (Number.isFinite(lat) && Number.isFinite(lng)) {
                            setPathPoints([[lat, lng]]);
                          }
                          return {
                            ...prev,
                            tipe_marker: "garis",
                            latitude: "",
                            longitude: "",
                          };
                        });
                      }}
                      className="w-4 h-4 text-blue-600 focus:ring-blue-500 disabled:cursor-not-allowed"
                    />
                    Garis / Jalur Bencana
                  </label>
                </div>
                {formData.kategori === "POS PENGUNGSIAN" && (
                  <p className="text-[11px] text-purple-600 dark:text-purple-400 font-medium italic mt-1.5">
                    * Pos Pengungsian selalu bertipe Titik Tunggal (berdasarkan koordinat).
                  </p>
                )}
              </div>

              {/* Latitude & Longitude inputs (Only for single point) */}
              {formData.tipe_marker === "titik" ? (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="latitude" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Latitude
                    </label>
                    <input
                      type="number"
                      step="any"
                      id="latitude"
                      name="latitude"
                      value={formData.latitude}
                      onChange={handleChange}
                      placeholder="Contoh: -8.1724"
                      className={inputClass("latitude")}
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="longitude" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Longitude
                    </label>
                    <input
                      type="number"
                      step="any"
                      id="longitude"
                      name="longitude"
                      value={formData.longitude}
                      onChange={handleChange}
                      placeholder="Contoh: 113.7000"
                      className={inputClass("longitude")}
                    />
                  </div>
                  {errors.latitude && <p className="text-xs text-red-500 col-span-2">{errors.latitude}</p>}
                </div>
              ) : (
                /* Garis Points Management */
                <div className="space-y-3 p-4 bg-gray-50 dark:bg-gray-800/40 rounded-2xl border border-gray-100 dark:border-gray-800">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-gray-600 dark:text-gray-300">
                      Daftar Koordinat Jalur ({pathPoints.length} titik)
                    </span>
                    {pathPoints.length > 0 && (
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={removeLastPoint}
                          className="px-2.5 py-1 text-[11px] font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-all dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300"
                        >
                          Hapus Terakhir
                        </button>
                        <button
                          type="button"
                          onClick={clearAllPoints}
                          className="px-2.5 py-1 text-[11px] font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-all dark:bg-red-950/20 dark:text-red-400"
                        >
                          Hapus Semua
                        </button>
                      </div>
                    )}
                  </div>
                  {pathPoints.length === 0 ? (
                    <p className="text-xs text-gray-400 italic">Klik pada peta di sebelah kanan untuk menambahkan titik koordinat garis bencana secara berurutan.</p>
                  ) : (
                    <div className="max-h-[150px] overflow-y-auto space-y-1 text-xs font-mono text-gray-600 custom-scrollbar dark:text-gray-400">
                      {pathPoints.map((pt, idx) => (
                        <div key={idx} className="flex justify-between items-center py-1 border-b border-gray-200/50 dark:border-gray-800/50">
                          <span>Titik {idx + 1}: {pt[0].toFixed(6)}, {pt[1].toFixed(6)}</span>
                          <button
                            type="button"
                            onClick={() => setPathPoints(p => p.filter((_, i) => i !== idx))}
                            className="text-red-500 hover:text-red-700 transition-colors p-0.5"
                          >
                            <HiOutlineTrash className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  {errors.path && <p className="text-xs text-red-500 mt-2">{errors.path}</p>}
                </div>
              )}
            </div>

            {/* Map Picker */}
            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                <HiOutlineMapPin className="w-4 h-4 text-blue-500" />
                Peta Koordinat (Klik untuk menentukan koordinat)
              </label>
              
              <div className="rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm">
                <CreateMapPicker
                  latitude={formData.latitude}
                  longitude={formData.longitude}
                  tipeMarker={formData.tipe_marker}
                  pathPoints={pathPoints}
                  onMapClick={handleMapClick}
                />
              </div>
              <p className="text-[11px] text-gray-400 italic leading-relaxed">
                {formData.tipe_marker === "titik" 
                  ? "Klik atau geser marker untuk menentukan koordinat lokasi."
                  : "Klik berurutan pada peta untuk menggambar garis rute bencana."}
              </p>
            </div>

          </div>

          {/* Form Actions */}
          <div className="mt-8 flex items-center justify-end gap-3 pt-6 border-t border-gray-100 dark:border-gray-800">
            <Link
              href="/admin/peta-bencana"
              className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300"
            >
              Batal
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-2 px-6 py-2.5 text-sm font-semibold text-white bg-blue-600 rounded-xl hover:bg-blue-700 active:scale-95 transition-all shadow-sm shadow-blue-200 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              ) : (
                <HiOutlineCheck className="w-4 h-4" />
              )}
              {loading ? "Menyimpan..." : "Simpan Marker"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
