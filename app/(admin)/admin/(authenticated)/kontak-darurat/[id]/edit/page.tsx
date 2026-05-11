"use client";

import React, { useState, useEffect, useCallback } from "react";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import Link from "next/link";
import { HiOutlineArrowLeft, HiOutlineCheck } from "react-icons/hi2";
import { useRouter, useParams } from "next/navigation";

const getApiBase = () => typeof window !== 'undefined' ? `${window.location.protocol}//${window.location.hostname}:8000/api` : (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api");

export default function EditKontakDaruratPage() {
  const router = useRouter();
  const { id } = useParams();

  const [formData, setFormData] = useState({
    nama: "",
    nomor: "",
    kategori: "lainnya",
    keterangan: "",
    is_active: "1",
  });
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState<string | null>(null);

  const fetchDetail = useCallback(async () => {
    try {
      const res = await fetch(`${getApiBase()}/kontak-darurat/${id}`);
      if (!res.ok) throw new Error("Gagal mengambil data kontak darurat.");
      const json = await res.json();
      const data = json.data;

      setFormData({
        nama: data.nama,
        nomor: data.nomor,
        kategori: data.kategori,
        keterangan: data.keterangan || "",
        is_active: data.is_active ? "1" : "0",
      });
    } catch (err: unknown) {
      setServerError(err instanceof Error ? err.message : "Terjadi kesalahan.");
    } finally {
      setInitialLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchDetail();
  }, [fetchDetail]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});
    setServerError(null);

    try {
      const token = localStorage.getItem("auth_token");
      const payload = {
        ...formData,
        is_active: formData.is_active === "1",
      };

      const getCookie = (name: string) => {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) return decodeURIComponent(parts.pop()?.split(';').shift() || '');
        return '';
      };
      const xsrfToken = getCookie('XSRF-TOKEN');

      const res = await fetch(`${getApiBase()}/kontak-darurat/${id}`, {
        method: "PUT",
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
        throw new Error(json.message || "Gagal memperbarui data kontak darurat.");
      }

      router.push("/admin/kontak-darurat");
    } catch (err: unknown) {
      setServerError(err instanceof Error ? err.message : "Terjadi kesalahan.");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrors((prev) => ({ ...prev, [e.target.name]: "" }));
  };

  const inputClass = (field: string) =>
    `w-full px-4 py-2.5 bg-gray-50 border rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all dark:bg-gray-800/50 dark:text-white ${
      errors[field] ? "border-red-400 bg-red-50" : "border-gray-200 dark:border-gray-700"
    }`;

  if (initialLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <PageBreadcrumb pageTitle="Edit Kontak Darurat" className="mb-0" />
        <Link
          href="/admin/kontak-darurat"
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
        >
          <HiOutlineArrowLeft className="w-4 h-4" />
          Kembali
        </Link>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-white/[0.03]">
        <div className="px-6 py-5 border-b border-gray-100 dark:border-gray-800">
          <h3 className="text-base font-semibold text-gray-900 dark:text-white">Form Edit Kontak Darurat</h3>
          <p className="text-sm text-gray-500 mt-1">
            Perbarui data detail untuk nomor kontak penting ini.
          </p>
        </div>

        {serverError && (
          <div className="mx-6 mt-4 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm">
            {serverError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            {/* Nama Instansi */}
            <div className="space-y-2">
              <label htmlFor="nama" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Nama Instansi/Layanan <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="nama"
                name="nama"
                value={formData.nama}
                onChange={handleChange}
                required
                placeholder="Contoh: BPBD Kabupaten Jember"
                className={inputClass("nama")}
              />
              {errors.nama && <p className="text-xs text-red-500">{errors.nama}</p>}
            </div>

            {/* Nomor Telepon */}
            <div className="space-y-2">
              <label htmlFor="nomor" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Nomor Telepon <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="nomor"
                name="nomor"
                value={formData.nomor}
                onChange={handleChange}
                required
                placeholder="Contoh: 112 atau 0331-XXXXXX"
                className={inputClass("nomor")}
              />
              {errors.nomor && <p className="text-xs text-red-500">{errors.nomor}</p>}
            </div>

            {/* Kategori */}
            <div className="space-y-2">
              <label htmlFor="kategori" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Kategori <span className="text-red-500">*</span>
              </label>
              <select
                id="kategori"
                name="kategori"
                value={formData.kategori}
                onChange={handleChange}
                required
                className={`${inputClass("kategori")} appearance-none`}
              >
                <option value="polisi">Polisi</option>
                <option value="pemadam">Pemadam Kebakaran</option>
                <option value="ambulans">Ambulans / Rumah Sakit</option>
                <option value="bpbd">BPBD</option>
                <option value="sar">Tim SAR</option>
                <option value="pln">PLN</option>
                <option value="lainnya">Lainnya</option>
              </select>
              {errors.kategori && <p className="text-xs text-red-500">{errors.kategori}</p>}
            </div>

            {/* Status Aktif */}
            <div className="space-y-2">
              <label htmlFor="is_active" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Status <span className="text-red-500">*</span>
              </label>
              <select
                id="is_active"
                name="is_active"
                value={formData.is_active}
                onChange={handleChange}
                required
                className={`${inputClass("is_active")} appearance-none`}
              >
                <option value="1">Aktif</option>
                <option value="0">Tidak Aktif</option>
              </select>
              {errors.is_active && <p className="text-xs text-red-500">{errors.is_active}</p>}
            </div>

            {/* Keterangan */}
            <div className="space-y-2 md:col-span-2">
              <label htmlFor="keterangan" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Keterangan Tambahan
              </label>
              <textarea
                id="keterangan"
                name="keterangan"
                value={formData.keterangan}
                onChange={handleChange}
                rows={3}
                placeholder="Informasi tambahan terkait layanan ini (opsional)"
                className={inputClass("keterangan")}
              />
              {errors.keterangan && <p className="text-xs text-red-500">{errors.keterangan}</p>}
            </div>

          </div>

          <div className="mt-8 flex items-center justify-end gap-3 pt-6 border-t border-gray-100 dark:border-gray-800">
            <Link
              href="/admin/kontak-darurat"
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
              {loading ? "Menyimpan..." : "Simpan Perubahan"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
