"use client";

import React, { useState, useEffect } from "react";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { HiOutlineArrowLeft, HiOutlineCheck, HiOutlineMapPin, HiOutlineTrash, HiOutlineExclamationTriangle } from "react-icons/hi2";
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
  () => import("../../create/CreateMapPickerComponent"),
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

export default function EditPetaMarkerPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;
  
  const [formData, setFormData] = useState({
    label: "",
    kategori: "BANJIR",
    tingkat_bahaya: "sedang",
    tipe_marker: "titik" as "titik" | "garis",
    latitude: "",
    longitude: "",
    radius: "",
  });
  const [pathPoints, setPathPoints] = useState<[number, number][]>([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [toast, setToast] = useState<{show: boolean; message: string; type: "success" | "error"}>({
    show: false,
    message: "",
    type: "success"
  });

  const showToast = (msg: string, type: "success" | "error" = "success") => {
    setToast({ show: true, message: msg, type });
    setTimeout(() => {
      setToast(prev => ({ ...prev, show: false }));
    }, 3000);
  };

  useEffect(() => {
    if (!id) return;

    const fetchMarker = async () => {
      setFetching(true);
      try {
        const res = await api.get(`/api/admin/peta-marker/${id}`);
        const data = res.data?.data || res.data;
        
        setFormData({
          label: data.label || "",
          kategori: data.kategori || "BANJIR",
          tingkat_bahaya: data.tingkat_bahaya || "sedang",
          tipe_marker: data.tipe_marker || "titik",
          latitude: data.latitude ? data.latitude.toString() : "",
          longitude: data.longitude ? data.longitude.toString() : "",
          radius: data.radius ? data.radius.toString() : "",
        });

        if (data.tipe_marker === "garis" && data.path_data) {
          setPathPoints(data.path_data);
        }
      } catch (err: any) {
        showToast("Gagal mengambil data marker. Marker mungkin sudah dihapus.", "error");
      } finally {
        setFetching(false);
      }
    };

    fetchMarker();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    const lat = parseFloat(formData.latitude);
    const lng = parseFloat(formData.longitude);

    const errs: Record<string, string> = {};
    
    if (!formData.label.trim()) {
      errs.label = "Label kejadian wajib diisi.";
    }
    if (!formData.kategori) {
      errs.kategori = "Kategori bencana wajib dipilih.";
    }
    if (!formData.tingkat_bahaya) {
      errs.tingkat_bahaya = "Tingkat kerawanan wajib dipilih.";
    }

    if (formData.tipe_marker === "titik") {
      if (isNaN(lat) || isNaN(lng)) {
        errs.latitude = "Koordinat latitude dan longitude wajib ditentukan.";
      } else if (lat < -8.55 || lat > -7.85 || lng < 113.10 || lng > 114.15) {
        errs.latitude = "Koordinat harus berada di dalam Kabupaten Jember!";
      }

      if (formData.kategori !== "POS PENGUNGSIAN" && (!formData.radius || parseInt(formData.radius) <= 0)) {
        errs.radius = "Radius dampak wajib diisi.";
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
      showToast("Mohon lengkapi semua data yang wajib diisi!", "error");
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
        radius: formData.radius ? parseInt(formData.radius) : null,
      };

      await api.put(`/api/admin/peta-marker/${id}`, payload);
      router.push("/admin/peta-bencana");
    } catch (err: any) {
      console.error(err);
      showToast(err.response?.data?.message || "Gagal menyimpan marker bencana. Silakan coba lagi.", "error");
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

      // Auto-switch tipe_marker ke "titik" jika kategori bukan BANJIR
      if (name === "kategori" && value !== "BANJIR" && prev.tipe_marker !== "titik") {
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

  if (fetching) {
    return (
      <div className="pb-10">
        <div className="flex items-center justify-between mb-6">
          <PageBreadcrumb pageTitle="Edit Marker Bencana" className="mb-0" />
        </div>
        <div className="rounded-2xl border border-gray-200 bg-white shadow-sm flex items-center justify-center p-20 dark:border-gray-800 dark:bg-white/[0.03]">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="pb-10">
      <div className="flex items-center justify-between mb-6">
        <PageBreadcrumb pageTitle="Edit Marker Bencana" className="mb-0" />
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
          <h3 className="text-base font-semibold text-gray-900 dark:text-white">Form Edit Marker Bencana</h3>
          <p className="text-sm text-gray-500 mt-1">
            Ubah data atau titik koordinat marker bencana yang sudah ada.
          </p>
        </div>

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

              {/* Radius Area Bencana */}
              {formData.tipe_marker === "titik" && formData.kategori !== "POS PENGUNGSIAN" && (
                <div className="space-y-2">
                  <label htmlFor="radius" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Radius Dampak / Bahaya (Meter) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    id="radius"
                    name="radius"
                    value={formData.radius}
                    onChange={handleChange}
                    min="1"
                    placeholder="Contoh: 250"
                    className={inputClass("radius")}
                  />
                  {errors.radius && <p className="text-xs text-red-500">{errors.radius}</p>}
                </div>
              )}

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
                  <label className={`flex items-center gap-2 text-sm font-medium ${formData.kategori !== "BANJIR" ? "opacity-40 cursor-not-allowed text-gray-400" : "cursor-pointer text-gray-700 dark:text-gray-300"}`}>
                    <input
                      type="radio"
                      name="tipe_marker"
                      value="garis"
                      disabled={formData.kategori !== "BANJIR"}
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
                {formData.kategori !== "BANJIR" && (
                  <p className="text-[11px] text-red-600 dark:text-red-400 font-medium italic mt-1.5">
                    * Jalur Bencana saat ini hanya tersedia khusus untuk kategori BANJIR.
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
              {loading ? "Menyimpan..." : "Simpan Perubahan"}
            </button>
          </div>
        </form>
      </div>

      {/* Toast Notification */}
      {toast.show && (
        <div className="fixed bottom-4 right-4 z-50 animate-fade-in-up">
          <div className={`flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-lg border ${
            toast.type === "success" 
              ? "bg-white border-green-100 text-green-700 dark:bg-gray-900 dark:border-green-900/30 dark:text-green-400" 
              : "bg-white border-red-100 text-red-700 dark:bg-gray-900 dark:border-red-900/30 dark:text-red-400"
          }`}>
            {toast.type === "success" ? (
              <HiOutlineCheck className="w-5 h-5" />
            ) : (
              <HiOutlineExclamationTriangle className="w-5 h-5" />
            )}
            <span className="text-sm font-medium">{toast.message}</span>
          </div>
        </div>
      )}
    </div>
  );
}
