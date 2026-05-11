"use client";

import React, { useState } from "react";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import Link from "next/link";
import { HiOutlineArrowLeft, HiOutlineCheck } from "react-icons/hi2";
import { useRouter } from "next/navigation";

const getApiBase = () => typeof window !== 'undefined' ? `${window.location.protocol}//${window.location.hostname}:8000/api` : (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api");

export default function CreateKecamatanPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    nama: "",
    kode_wilayah: "",
    latitude: "",
    longitude: "",
    elevasi: "",
    level_rawan: "rendah",
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
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
      };
      if (formData.elevasi !== "") {
        payload.elevasi = parseFloat(formData.elevasi);
      }

      const getCookie = (name: string) => {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) return decodeURIComponent(parts.pop()?.split(';').shift() || '');
        return '';
      };
      const xsrfToken = getCookie('XSRF-TOKEN');

      const res = await fetch(`${getApiBase()}/kecamatan`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          "X-XSRF-TOKEN": xsrfToken,
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(payload),
      });

      if (res.status === 422) {
        const json = await res.json();
        const errs: Record<string, string> = {};
        if (json.errors) {
          for (const key in json.errors) {
            errs[key] = json.errors[key][0];
          }
        }
        setErrors(errs);
        return;
      }

      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        throw new Error(json.message || "Gagal menyimpan data kecamatan.");
      }

      router.push("/admin/kecamatan");
    } catch (err: unknown) {
      setServerError(err instanceof Error ? err.message : "Terjadi kesalahan.");
    } finally {
      setLoading(false);
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

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <PageBreadcrumb pageTitle="Tambah Kecamatan" className="mb-0" />
        <Link
          href="/admin/kecamatan"
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
        >
          <HiOutlineArrowLeft className="w-4 h-4" />
          Kembali
        </Link>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-white/[0.03]">
        <div className="px-6 py-5 border-b border-gray-100 dark:border-gray-800">
          <h3 className="text-base font-semibold text-gray-900 dark:text-white">Form Tambah Kecamatan</h3>
          <p className="text-sm text-gray-500 mt-1">
            Masukkan data detail untuk menambahkan kecamatan baru ke dalam sistem.
          </p>
        </div>

        {serverError && (
          <div className="mx-6 mt-4 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm">
            {serverError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-6">
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
                placeholder="Contoh: Gumukmas"
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
                placeholder="Contoh: 35.09.04.2001"
                className={inputClass("kode_wilayah")}
              />
              {errors.kode_wilayah && <p className="text-xs text-red-500">{errors.kode_wilayah}</p>}
            </div>

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
                placeholder="-8.3000000"
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
                placeholder="113.4500000"
                className={inputClass("longitude")}
              />
              {errors.longitude && <p className="text-xs text-red-500">{errors.longitude}</p>}
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
                placeholder="Contoh: 10.00"
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

          <div className="mt-8 flex items-center justify-end gap-3 pt-6 border-t border-gray-100 dark:border-gray-800">
            <Link
              href="/admin/kecamatan"
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
