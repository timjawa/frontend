"use client";

import React, { useState, useEffect } from "react";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import Link from "next/link";
import { HiOutlineArrowLeft, HiOutlineCheck } from "react-icons/hi2";
import { useRouter } from "next/navigation";

const getApiBase = () => process.env.NEXT_PUBLIC_API_URL || (typeof window !== 'undefined' && ["localhost", "127.0.0.1"].includes(window.location.hostname) ? `${window.location.protocol}//${window.location.hostname}:8000/api` : "https://api.jembersiaga.my.id/api");

interface Kecamatan {
  id: string;
  nama: string;
}

export default function CreatePeringatanDiniPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    kecamatan_id: "",
    deskripsi: "",
    tingkat_urgensi: "",
    is_active: "",
  });
  const [kecamatanList, setKecamatanList] = useState<Kecamatan[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetchingKecamatan, setFetchingKecamatan] = useState(true);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState<string | null>(null);

  useEffect(() => {
    const fetchKecamatan = async () => {
      try {
        const res = await fetch(`${getApiBase()}/kecamatan?per_page=100`);
        if (res.ok) {
          const json = await res.json();
          setKecamatanList(json.data || []);
        }
      } catch (err) {
        console.error("Gagal mengambil data kecamatan:", err);
      } finally {
        setFetchingKecamatan(false);
      }
    };
    fetchKecamatan();
  }, []);

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

      const res = await fetch(`${getApiBase()}/peringatan-dini`, {
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
        throw new Error(json.message || "Gagal menyimpan data peringatan dini.");
      }

      router.push("/admin/peringatan-dini");
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

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <PageBreadcrumb pageTitle="Tambah Peringatan Dini" className="mb-0" />
        <Link
          href="/admin/peringatan-dini"
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
        >
          <HiOutlineArrowLeft className="w-4 h-4" />
          Kembali
        </Link>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-white/[0.03]">
        <div className="px-6 py-5 border-b border-gray-100 dark:border-gray-800">
          <h3 className="text-base font-semibold text-gray-900 dark:text-white">Form Tambah Peringatan Dini</h3>
          <p className="text-sm text-gray-500 mt-1">
            Berikan informasi mengenai potensi bahaya atau peringatan dini untuk masyarakat.
          </p>
        </div>

        {serverError && (
          <div className="mx-6 mt-4 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm">
            {serverError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            {/* Kecamatan */}
            <div className="space-y-2">
              <label htmlFor="kecamatan_id" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Kecamatan <span className="text-red-500">*</span>
              </label>
              <select
                id="kecamatan_id"
                name="kecamatan_id"
                value={formData.kecamatan_id}
                onChange={handleChange}
                required
                disabled={fetchingKecamatan}
                className={`${inputClass("kecamatan_id")} appearance-none`}
              >
                {fetchingKecamatan ? (
                  <option value="">Memuat data...</option>
                ) : (
                  <>
                    <option value="">Pilih kecamatan</option>
                    {kecamatanList.map((kec) => (
                      <option key={kec.id} value={kec.id}>
                        {kec.nama}
                      </option>
                    ))}
                  </>
                )}
              </select>
              {errors.kecamatan_id && <p className="text-xs text-red-500">{errors.kecamatan_id}</p>}
            </div>

            {/* Tingkat Urgensi */}
            <div className="space-y-2">
              <label htmlFor="tingkat_urgensi" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Tingkat Urgensi <span className="text-red-500">*</span>
              </label>
              <select
                id="tingkat_urgensi"
                name="tingkat_urgensi"
                value={formData.tingkat_urgensi}
                onChange={handleChange}
                required
                className={`${inputClass("tingkat_urgensi")} appearance-none`}
              >
                <option value="">Pilih tingkat urgensi</option>
                <option value="rendah">Rendah (Informasi Awal)</option>
                <option value="sedang">Sedang (Waspada)</option>
                <option value="tinggi">Tinggi (Siaga)</option>
                <option value="kritis">Kritis (Awas / Bahaya)</option>
              </select>
              {errors.tingkat_urgensi && <p className="text-xs text-red-500">{errors.tingkat_urgensi}</p>}
            </div>

            {/* Status Aktif */}
            <div className="space-y-2">
              <label htmlFor="is_active" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Status Peringatan
              </label>
              <select
                id="is_active"
                name="is_active"
                value={formData.is_active}
                onChange={handleChange}
                required
                className={`${inputClass("is_active")} appearance-none`}
              >
                <option value="">Pilih status peringatan</option>
                <option value="1">Aktif (ditampilkan)</option>
                <option value="0">Tidak Aktif (disembunyikan)</option>
              </select>
              <p className="text-xs text-gray-500">Peringatan hanya ditampilkan jika statusnya aktif.</p>
              {errors.is_active && <p className="text-xs text-red-500">{errors.is_active}</p>}
            </div>

            {/* Deskripsi */}
            <div className="space-y-2 md:col-span-2">
              <label htmlFor="deskripsi" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Deskripsi Peringatan <span className="text-red-500">*</span>
              </label>
              <textarea
                id="deskripsi"
                name="deskripsi"
                value={formData.deskripsi}
                onChange={handleChange}
                required
                rows={4}
                placeholder="Deskripsikan dengan jelas potensi bahaya dan tindakan yang dianjurkan untuk masyarakat."
                className={inputClass("deskripsi")}
              />
              {errors.deskripsi && <p className="text-xs text-red-500">{errors.deskripsi}</p>}
            </div>

          </div>

          <div className="mt-8 flex items-center justify-end gap-3 pt-6 border-t border-gray-100 dark:border-gray-800">
            <Link
              href="/admin/peringatan-dini"
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
              {loading ? "Menyimpan..." : "Simpan Peringatan"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
