"use client";

import React, { useState, useEffect } from "react";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import Link from "next/link";
import { HiOutlineArrowLeft, HiOutlineCheck, HiMapPin } from "react-icons/hi2";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import MapPicker from "@/components/ui/map/MapPicker";

export default function CreatePosPengungsiPage() {
  const router = useRouter();
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
    status: "",
    is_active: true,
  });
  
  const [kecamatanList, setKecamatanList] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});
    setServerError(null);

    const latitude = parseFloat(formData.latitude);
    const longitude = parseFloat(formData.longitude);

    if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
      setErrors({
        latitude: "Tentukan titik koordinat melalui peta.",
        longitude: "Tentukan titik koordinat melalui peta.",
      });
      setLoading(false);
      return;
    }

    try {
      const payload = {
        ...formData,
        latitude,
        longitude,
        kapasitas: parseInt(formData.kapasitas) || 0,
        terisi: parseInt(formData.terisi) || 0,
        fasilitas: formData.fasilitas ? formData.fasilitas.split(",").map((s) => s.trim()).filter(Boolean) : [],
      };

      await api.post("/api/pos-pengungsian", payload);
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
        setServerError(err.response?.data?.message || "Gagal menyimpan data pos pengungsian.");
      }
    } finally {
      setLoading(false);
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

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <PageBreadcrumb pageTitle="Tambah Pos Pengungsian" className="mb-0" />
        <Link
          href="/admin/pos-pengungsian"
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
        >
          <HiOutlineArrowLeft className="w-4 h-4" />
          Kembali
        </Link>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-white/[0.03]">
        <div className="px-6 py-5 border-b border-gray-100 dark:border-gray-800">
          <h3 className="text-base font-semibold text-gray-900 dark:text-white">Form Tambah Pos Pengungsian</h3>
          <p className="text-sm text-gray-500 mt-1">
            Masukkan detail pos pengungsian baru ke dalam sistem.
          </p>
        </div>

        {serverError && (
          <div className="mx-6 mt-4 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm">
            {serverError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-6">
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
                placeholder="Masukkan nama pos"
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
                placeholder="Masukkan alamat lengkap pos"
                className={inputClass("alamat")}
              />
              {errors.alamat && <p className="text-xs text-red-500">{errors.alamat}</p>}
            </div>

            {/* Coordinate Selection (Map + Inputs) */}
            <div className="md:col-span-2 space-y-4 rounded-xl border border-blue-100 bg-blue-50/30 p-5 dark:bg-blue-900/10 dark:border-blue-800/30">
              <div className="flex items-center gap-2 mb-2">
                <HiMapPin className="w-5 h-5 text-blue-500" />
                <h4 className="font-semibold text-gray-800 dark:text-gray-200">Pilih Titik Koordinat Pos</h4>
              </div>
              <p className="text-sm text-gray-500 mb-4">
                Geser marker atau klik pada peta untuk menentukan lokasi pos pengungsian. Koordinat di bawah akan terisi otomatis.
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
                      disabled
                      required
                      placeholder="Geser map/klik pada peta"
                      className={`${inputClass("latitude")} disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-500 disabled:ring-0 dark:disabled:bg-gray-800 dark:disabled:text-gray-400`}
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
                      disabled
                      required
                      placeholder="Geser map/klik pada peta"
                      className={`${inputClass("longitude")} disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-500 disabled:ring-0 dark:disabled:bg-gray-800 dark:disabled:text-gray-400`}
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
                placeholder="Contoh: 500"
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
                placeholder="Contoh: 50"
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
                placeholder="Masukkan nama penanggung jawab"
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
                placeholder="Masukkan nomor telepon"
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
                required
                className={`${inputClass("status")} appearance-none`}
              >
                <option value="">Pilih status pos</option>
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
                placeholder="Contoh: toilet, dapur umum, tenaga medis, genset"
                className={inputClass("fasilitas")}
              />
              {errors.fasilitas && <p className="text-xs text-red-500">{errors.fasilitas}</p>}
            </div>
          </div>

          <div className="mt-8 flex items-center justify-end gap-3 pt-6 border-t border-gray-100 dark:border-gray-800">
            <Link
              href="/admin/pos-pengungsian"
              className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors"
            >
              Batal
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-blue-600 rounded-xl hover:bg-blue-700 active:scale-95 transition-all shadow-sm shadow-blue-200 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              ) : (
                <HiOutlineCheck className="w-4 h-4" />
              )}
              {loading ? "Menyimpan..." : "Simpan Data"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
