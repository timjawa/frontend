"use client";

import React, { useState, useEffect } from "react";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import Link from "next/link";
import { HiOutlineArrowLeft, HiOutlineCheck, HiOutlineExclamationTriangle, HiMapPin } from "react-icons/hi2";
import { useRouter, useParams } from "next/navigation";
import MapPicker from "@/components/ui/map/MapPicker";

const getApiBase = () => process.env.NEXT_PUBLIC_API_URL || (typeof window !== 'undefined' && ["localhost", "127.0.0.1"].includes(window.location.hostname) ? `${window.location.protocol}//${window.location.hostname}:8000/api` : "https://api.jembersiaga.my.id/api");

export default function EditKecamatanPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const id = params.id;

  const [formData, setFormData] = useState({
    nama: "",
    kode_wilayah: "",
    latitude: "",
    longitude: "",
    elevasi: "",
    level_rawan: "rendah",
  });

  const [loadingData, setLoadingData] = useState(true);
  const [loadingSubmit, setLoadingSubmit] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);

  // Fetch existing data
  useEffect(() => {
    if (!id) return;
    const fetchData = async () => {
      setLoadingData(true);
      setFetchError(null);
      try {
        const res = await fetch(`${getApiBase()}/kecamatan/${id}`);
        if (!res.ok) throw new Error("Data kecamatan tidak ditemukan.");
        const json = await res.json();
        const k = json.data;
        setFormData({
          nama: k.nama ?? "",
          kode_wilayah: k.kode_wilayah ?? "",
          latitude: k.latitude != null ? String(k.latitude) : "",
          longitude: k.longitude != null ? String(k.longitude) : "",
          elevasi: k.elevasi != null ? String(k.elevasi) : "",
          level_rawan: k.level_rawan ?? "rendah",
        });
      } catch (err: unknown) {
        setFetchError(err instanceof Error ? err.message : "Gagal memuat data.");
      } finally {
        setLoadingData(false);
      }
    };
    fetchData();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoadingSubmit(true);
    setErrors({});
    setServerError(null);

      try {
        const token = localStorage.getItem("auth_token");
        const payload: Record<string, unknown> = {
          nama: formData.nama,
          kode_wilayah: formData.kode_wilayah,
          latitude: parseFloat(formData.latitude),
          longitude: parseFloat(formData.longitude),
          level_rawan: formData.level_rawan,
          elevasi: formData.elevasi !== "" ? parseFloat(formData.elevasi) : null,
        };

        const { default: api } = await import("@/lib/api");
        // token is added automatically via interceptor or withCredentials if cookie based
        if (token) {
           api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        }
        await api.put(`/api/kecamatan/${id}`, payload);

        router.push(`/admin/kecamatan/${id}`);
      } catch (err: any) {
        if (err.response?.status === 422) {
          const json = err.response.data;
          const errs: Record<string, string> = {};
          if (json.errors) {
            for (const key in json.errors) {
              errs[key] = json.errors[key][0];
            }
          }
          setErrors(errs);
          return;
        }

        setServerError(err.response?.data?.message || err.message || "Gagal memperbarui data kecamatan.");
      } finally {
        setLoadingSubmit(false);
      }
    };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrors((prev) => ({ ...prev, [e.target.name]: "" }));
  };

  const inputClass = (field: string) =>
    `w-full px-4 py-2.5 bg-gray-50 border rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all dark:bg-gray-800/50 dark:text-white ${
      errors[field] ? "border-red-400 bg-red-50" : "border-gray-200 dark:border-gray-700"
    }`;

  if (fetchError) {
    return (
      <div>
        <div className="flex items-center justify-between mb-6">
          <PageBreadcrumb pageTitle="Edit Kecamatan" className="mb-0" />
          <Link
            href="/admin/kecamatan"
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
          >
            <HiOutlineArrowLeft className="w-4 h-4" />
            Kembali
          </Link>
        </div>
        <div className="flex flex-col items-center justify-center py-20 text-red-500 gap-3">
          <HiOutlineExclamationTriangle className="w-12 h-12" />
          <p className="text-base font-medium">{fetchError}</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <PageBreadcrumb pageTitle="Edit Kecamatan" className="mb-0" />
        <Link
          href="/admin/kecamatan"
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
        >
          <HiOutlineArrowLeft className="w-4 h-4" />
          Kembali
        </Link>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-white/[0.03]">
        <div className="px-6 py-5 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">
          <div>
            <h3 className="text-base font-semibold text-gray-900 dark:text-white">Form Edit Kecamatan</h3>
            <p className="text-sm text-gray-500 mt-1">
              Perbarui informasi wilayah kecamatan (ID:{" "}
              <span className="font-mono text-xs">{id}</span>).
            </p>
          </div>
        </div>

        {serverError && (
          <div className="mx-6 mt-4 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm">
            {serverError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-6">
          {loadingData ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="space-y-2">
                  <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
                  <div className="h-11 w-full bg-gray-100 rounded-xl animate-pulse" />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

              {/* Nama Kecamatan */}
              <div className="space-y-2">
                <label htmlFor="nama" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Nama Kecamatan <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="nama"
                  name="nama"
                  value={formData.nama}
                  onChange={handleChange}
                  required
                  className={inputClass("nama")}
                />
                {errors.nama && <p className="text-xs text-red-500">{errors.nama}</p>}
              </div>

              {/* Kode Wilayah */}
              <div className="space-y-2">
                <label htmlFor="kode_wilayah" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Kode Wilayah <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="kode_wilayah"
                  name="kode_wilayah"
                  value={formData.kode_wilayah}
                  onChange={handleChange}
                  required
                  className={inputClass("kode_wilayah")}
                />
                {errors.kode_wilayah && <p className="text-xs text-red-500">{errors.kode_wilayah}</p>}
              </div>

              {/* Coordinate Selection (Map + Inputs) */}
              <div className="md:col-span-2 space-y-4 rounded-xl border border-blue-100 bg-blue-50/30 p-5 dark:bg-blue-900/10 dark:border-blue-800/30">
                <div className="flex items-center gap-2 mb-2">
                  <HiMapPin className="w-5 h-5 text-blue-500" />
                  <h4 className="font-semibold text-gray-800 dark:text-gray-200">Perbarui Titik Koordinat</h4>
                </div>
                <p className="text-sm text-gray-500 mb-4">
                  Geser marker atau klik pada peta untuk menyesuaikan lokasi kecamatan.
                </p>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
                  <div className="rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 shadow-sm">
                    <MapPicker
                      latitude={formData.latitude}
                      longitude={formData.longitude}
                      onChange={(lat, lng) => {
                        setFormData(prev => ({
                          ...prev,
                          latitude: lat.toFixed(7),
                          longitude: lng.toFixed(7)
                        }));
                        setErrors(prev => ({ ...prev, latitude: "", longitude: "" }));
                      }}
                    />
                  </div>
                  
                  <div className="space-y-6">
                    {/* Latitude */}
                    <div className="space-y-2">
                      <label htmlFor="latitude" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Latitude <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        step="any"
                        id="latitude"
                        name="latitude"
                        value={formData.latitude}
                        onChange={handleChange}
                        required
                        className={inputClass("latitude")}
                      />
                      {errors.latitude && <p className="text-xs text-red-500">{errors.latitude}</p>}
                    </div>

                    {/* Longitude */}
                    <div className="space-y-2">
                      <label htmlFor="longitude" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Longitude <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        step="any"
                        id="longitude"
                        name="longitude"
                        value={formData.longitude}
                        onChange={handleChange}
                        required
                        className={inputClass("longitude")}
                      />
                      {errors.longitude && <p className="text-xs text-red-500">{errors.longitude}</p>}
                    </div>
                  </div>
                </div>
              </div>

              {/* Elevasi */}
              <div className="space-y-2">
                <label htmlFor="elevasi" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Elevasi (mdpl)
                </label>
                <input
                  type="number"
                  step="any"
                  id="elevasi"
                  name="elevasi"
                  value={formData.elevasi}
                  onChange={handleChange}
                  placeholder="Opsional"
                  className={inputClass("elevasi")}
                />
                {errors.elevasi && <p className="text-xs text-red-500">{errors.elevasi}</p>}
              </div>

              {/* Level Rawan */}
              <div className="space-y-2">
                <label htmlFor="level_rawan" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Tingkat Kerawanan <span className="text-red-500">*</span>
                </label>
                <select
                  id="level_rawan"
                  name="level_rawan"
                  value={formData.level_rawan}
                  onChange={handleChange}
                  required
                  className={`${inputClass("level_rawan")} appearance-none`}
                >
                  <option value="rendah">Rendah (Hijau)</option>
                  <option value="sedang">Sedang (Kuning)</option>
                  <option value="tinggi">Tinggi (Merah)</option>
                </select>
                {errors.level_rawan && <p className="text-xs text-red-500">{errors.level_rawan}</p>}
              </div>
            </div>
          )}

          <div className="mt-8 flex items-center justify-end gap-3 pt-6 border-t border-gray-100 dark:border-gray-800">
            <Link
              href="/admin/kecamatan"
              className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors"
            >
              Batal
            </Link>
            <button
              type="submit"
              disabled={loadingSubmit || loadingData}
              className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-blue-600 rounded-xl hover:bg-blue-700 active:scale-95 transition-all shadow-sm shadow-blue-200 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loadingSubmit ? (
                <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              ) : (
                <HiOutlineCheck className="w-4 h-4" />
              )}
              {loadingSubmit ? "Menyimpan..." : "Perbarui Data"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
