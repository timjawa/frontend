"use client";

import React, { useState, useEffect } from "react";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import Link from "next/link";
import { HiOutlineArrowLeft, HiOutlineCheck, HiOutlineExclamationTriangle, HiMapPin } from "react-icons/hi2";
import { useRouter, useParams } from "next/navigation";
import api from "@/lib/api";
import MapPicker from "@/components/ui/map/MapPicker";

export default function EditPosPengungsiPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const id = params.id;

  const [formData, setFormData] = useState({
    nama: "",
    kecamatan_id: "",
    alamat: "",
    latitude: "",
    longitude: "",
    kapasitas: "",
    terisi: "0",
    penanggung_jawab: "",
    telepon: "",
    fasilitas: "",
    status: "standby",
    is_active: true,
  });
  
  const [kecamatanList, setKecamatanList] = useState<any[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [loadingSubmit, setLoadingSubmit] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);

  useEffect(() => {
    // Fetch kecamatan for dropdown
    const fetchKecamatan = async () => {
      try {
        const res = await api.get("/api/kecamatan", { params: { per_page: 100 } });
        setKecamatanList(res.data.data || []);
      } catch (err) {
        console.error("Failed to fetch kecamatan", err);
      }
    };
    fetchKecamatan();
  }, []);

  useEffect(() => {
    if (!id) return;
    const fetchData = async () => {
      setLoadingData(true);
      setFetchError(null);
      try {
        const res = await api.get(`/api/pos-pengungsian/${id}`);
        const p = res.data;
        setFormData({
          nama: p.nama ?? "",
          kecamatan_id: p.kecamatan_id ?? "",
          alamat: p.alamat ?? "",
          latitude: p.latitude != null ? String(p.latitude) : "",
          longitude: p.longitude != null ? String(p.longitude) : "",
          kapasitas: p.kapasitas != null ? String(p.kapasitas) : "",
          terisi: p.terisi != null ? String(p.terisi) : "0",
          penanggung_jawab: p.penanggung_jawab ?? "",
          telepon: p.telepon ?? "",
          fasilitas: Array.isArray(p.fasilitas) ? p.fasilitas.join(", ") : (p.fasilitas || ""),
          status: p.status ?? "standby",
          is_active: p.is_active ?? true,
        });
      } catch (err: any) {
        setFetchError(err.response?.data?.message || "Gagal memuat data pos pengungsian.");
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
      const payload = {
        ...formData,
        latitude: parseFloat(formData.latitude) || 0,
        longitude: parseFloat(formData.longitude) || 0,
        kapasitas: parseInt(formData.kapasitas) || 0,
        terisi: parseInt(formData.terisi) || 0,
        fasilitas: formData.fasilitas ? formData.fasilitas.split(",").map((s) => s.trim()).filter(Boolean) : [],
      };

      await api.put(`/api/pos-pengungsian/${id}`, payload);
      router.push("/admin/pos-pengungsian");
    } catch (err: any) {
      if (err.response?.status === 422) {
        const errs: Record<string, string> = {};
        if (err.response.data.errors) {
          for (const key in err.response.data.errors) {
            errs[key] = err.response.data.errors[key][0];
          }
        }
        setErrors(errs);
      } else {
        setServerError(err.response?.data?.message || "Gagal memperbarui data pos pengungsian.");
      }
    } finally {
      setLoadingSubmit(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const value = e.target.type === "checkbox" ? (e.target as HTMLInputElement).checked : e.target.value;
    setFormData({ ...formData, [e.target.name]: value });
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
          <PageBreadcrumb pageTitle="Edit Pos Pengungsian" className="mb-0" />
          <Link
            href="/admin/pos-pengungsian"
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
        <PageBreadcrumb pageTitle="Edit Pos Pengungsian" className="mb-0" />
        <Link
          href="/admin/pos-pengungsian"
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
        >
          <HiOutlineArrowLeft className="w-4 h-4" />
          Kembali
        </Link>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-white/[0.03]">
        <div className="px-6 py-5 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">
          <div>
            <h3 className="text-base font-semibold text-gray-900 dark:text-white">Form Edit Pos Pengungsian</h3>
            <p className="text-sm text-gray-500 mt-1">
              Perbarui informasi pos pengungsian (ID:{" "}
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
              {/* Nama Pos */}
              <div className="space-y-2">
                <label htmlFor="nama" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Nama Pos <span className="text-red-500">*</span>
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

              {/* Kecamatan */}
              <div className="space-y-2">
                <label htmlFor="kecamatan_id" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Kecamatan
                </label>
                <select
                  id="kecamatan_id"
                  name="kecamatan_id"
                  value={formData.kecamatan_id}
                  onChange={handleChange}
                  className={`${inputClass("kecamatan_id")} appearance-none`}
                >
                  <option value="">-- Pilih Kecamatan (Opsional) --</option>
                  {kecamatanList.map((kec) => (
                    <option key={kec.id} value={kec.id}>{kec.nama}</option>
                  ))}
                </select>
                {errors.kecamatan_id && <p className="text-xs text-red-500">{errors.kecamatan_id}</p>}
              </div>
              
              {/* Alamat */}
              <div className="space-y-2 md:col-span-2">
                <label htmlFor="alamat" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Alamat
                </label>
                <input
                  type="text"
                  id="alamat"
                  name="alamat"
                  value={formData.alamat}
                  onChange={handleChange}
                  className={inputClass("alamat")}
                />
                {errors.alamat && <p className="text-xs text-red-500">{errors.alamat}</p>}
              </div>

              {/* Coordinate Selection (Map + Inputs) */}
              <div className="md:col-span-2 space-y-4 rounded-xl border border-blue-100 bg-blue-50/30 p-5 dark:bg-blue-900/10 dark:border-blue-800/30">
                <div className="flex items-center gap-2 mb-2">
                  <HiMapPin className="w-5 h-5 text-blue-500" />
                  <h4 className="font-semibold text-gray-800 dark:text-gray-200">Perbarui Titik Koordinat Pos</h4>
                </div>
                <p className="text-sm text-gray-500 mb-4">
                  Geser marker atau klik pada peta untuk menyesuaikan lokasi pos pengungsian.
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
              
              {/* Kapasitas */}
              <div className="space-y-2">
                <label htmlFor="kapasitas" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Kapasitas <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  id="kapasitas"
                  name="kapasitas"
                  value={formData.kapasitas}
                  onChange={handleChange}
                  required
                  className={inputClass("kapasitas")}
                />
                {errors.kapasitas && <p className="text-xs text-red-500">{errors.kapasitas}</p>}
              </div>

              {/* Terisi */}
              <div className="space-y-2">
                <label htmlFor="terisi" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Terisi (Orang)
                </label>
                <input
                  type="number"
                  id="terisi"
                  name="terisi"
                  value={formData.terisi}
                  onChange={handleChange}
                  className={inputClass("terisi")}
                />
                {errors.terisi && <p className="text-xs text-red-500">{errors.terisi}</p>}
              </div>
              
              {/* Penanggung Jawab */}
              <div className="space-y-2">
                <label htmlFor="penanggung_jawab" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Penanggung Jawab
                </label>
                <input
                  type="text"
                  id="penanggung_jawab"
                  name="penanggung_jawab"
                  value={formData.penanggung_jawab}
                  onChange={handleChange}
                  className={inputClass("penanggung_jawab")}
                />
                {errors.penanggung_jawab && <p className="text-xs text-red-500">{errors.penanggung_jawab}</p>}
              </div>

              {/* Telepon */}
              <div className="space-y-2">
                <label htmlFor="telepon" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Telepon
                </label>
                <input
                  type="text"
                  id="telepon"
                  name="telepon"
                  value={formData.telepon}
                  onChange={handleChange}
                  className={inputClass("telepon")}
                />
                {errors.telepon && <p className="text-xs text-red-500">{errors.telepon}</p>}
              </div>

              {/* Status */}
              <div className="space-y-2">
                <label htmlFor="status" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Status Pos
                </label>
                <select
                  id="status"
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className={`${inputClass("status")} appearance-none`}
                >
                  <option value="standby">Standby (Siaga)</option>
                  <option value="aktif">Aktif (Menerima Pengungsi)</option>
                  <option value="penuh">Penuh (Kapasitas Maksimal)</option>
                  <option value="tutup">Tutup (Tidak Beroperasi)</option>
                </select>
                {errors.status && <p className="text-xs text-red-500">{errors.status}</p>}
              </div>
              
              {/* Is Active */}
              <div className="space-y-2 flex flex-col justify-center mt-2 md:mt-6">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    name="is_active"
                    checked={formData.is_active}
                    onChange={handleChange}
                    className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Tampilkan Pos Ini</span>
                </label>
              </div>

              {/* Fasilitas */}
              <div className="space-y-2 md:col-span-2">
                <label htmlFor="fasilitas" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Fasilitas <span className="text-xs text-gray-400 font-normal">(Pisahkan dengan koma)</span>
                </label>
                <input
                  type="text"
                  id="fasilitas"
                  name="fasilitas"
                  value={formData.fasilitas}
                  onChange={handleChange}
                  className={inputClass("fasilitas")}
                />
                {errors.fasilitas && <p className="text-xs text-red-500">{errors.fasilitas}</p>}
              </div>
            </div>
          )}

          <div className="mt-8 flex items-center justify-end gap-3 pt-6 border-t border-gray-100 dark:border-gray-800">
            <Link
              href="/admin/pos-pengungsian"
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
