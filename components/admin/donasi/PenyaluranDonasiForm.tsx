"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { HiOutlineArrowLeft, HiOutlineCheck } from "react-icons/hi2";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import api from "@/lib/api";

type PenyaluranFormState = {
  kampanye_id: string;
  judul: string;
  deskripsi: string;
  nominal: string;
  penerima: string;
  tanggal_penyaluran: string;
  status: string;
};

type KampanyeOption = { id: string; judul: string };
type ApiError = { response?: { status?: number; data?: { message?: string; errors?: Record<string, string[]> } } };

const emptyForm: PenyaluranFormState = {
  kampanye_id: "",
  judul: "",
  deskripsi: "",
  nominal: "",
  penerima: "",
  tanggal_penyaluran: "",
  status: "draft",
};

const toLocalInput = (value?: string | null) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value.slice(0, 16);
  const offset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 16);
};

export default function PenyaluranDonasiForm({ id }: { id?: string }) {
  const router = useRouter();
  const [form, setForm] = useState<PenyaluranFormState>(emptyForm);
  const [bukti, setBukti] = useState<File | null>(null);
  const [kampanyeList, setKampanyeList] = useState<KampanyeOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(!!id);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState<string | null>(null);

  useEffect(() => {
    api.get("/api/admin/donasi/kampanye", { params: { per_page: 100 } })
      .then((res) => setKampanyeList(res.data.data ?? []))
      .catch(() => setKampanyeList([]));
  }, []);

  useEffect(() => {
    if (!id) return;
    setFetching(true);
    api.get(`/api/admin/donasi/penyaluran/${id}`)
      .then((res) => {
        const data = res.data.data;
        setForm({
          kampanye_id: data.kampanye_id ?? "",
          judul: data.judul ?? "",
          deskripsi: data.deskripsi ?? "",
          nominal: data.nominal ?? "",
          penerima: data.penerima ?? "",
          tanggal_penyaluran: toLocalInput(data.tanggal_penyaluran),
          status: data.status ?? "draft",
        });
      })
      .catch((err: unknown) => setServerError(getApiMessage(err, "Gagal memuat penyaluran donasi.")))
      .finally(() => setFetching(false));
  }, [id]);

  const inputClass = (field: string) =>
    `w-full px-4 py-2.5 bg-gray-50 border rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all dark:bg-gray-800/50 dark:text-white ${
      errors[field] ? "border-red-400 bg-red-50" : "border-gray-200 dark:border-gray-700"
    }`;

  const handleChange = (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm((prev) => ({ ...prev, [event.target.name]: event.target.value }));
    setErrors((prev) => ({ ...prev, [event.target.name]: "" }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setErrors({});
    setServerError(null);

    const payload = new FormData();
    Object.entries(form).forEach(([key, value]) => {
      if (value !== "") payload.append(key, value);
    });
    if (bukti) payload.append("bukti", bukti);

    try {
      const url = id ? `/api/admin/donasi/penyaluran/${id}` : "/api/admin/donasi/penyaluran";
      await api.post(url, payload, { headers: { "Content-Type": "multipart/form-data" } });
      router.push("/admin/donasi/penyaluran");
    } catch (err: unknown) {
      const apiError = err as ApiError;
      if (apiError.response?.status === 422 && apiError.response.data?.errors) {
        const nextErrors: Record<string, string> = {};
        Object.entries(apiError.response.data.errors).forEach(([key, value]) => {
          nextErrors[key] = value[0];
        });
        setErrors(nextErrors);
      } else {
        setServerError(getApiMessage(err, "Gagal menyimpan penyaluran donasi."));
      }
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return <div className="p-8 text-sm text-gray-500">Memuat form penyaluran...</div>;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <PageBreadcrumb pageTitle={id ? "Edit Penyaluran Donasi" : "Tambah Penyaluran Donasi"} className="mb-0" />
        <Link href="/admin/donasi/penyaluran" className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
          <HiOutlineArrowLeft className="w-4 h-4" />
          Kembali
        </Link>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-white/[0.03]">
        <div className="px-6 py-5 border-b border-gray-100 dark:border-gray-800">
          <h3 className="text-base font-semibold text-gray-900 dark:text-white">Data Penyaluran Dana</h3>
          <p className="text-sm text-gray-500 mt-1">Status publish akan tampil sebagai transparansi dana di mobile.</p>
        </div>

        {serverError && <div className="mx-6 mt-4 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm">{serverError}</div>}

        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2 md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Kampanye <span className="text-red-500">*</span></label>
              <select name="kampanye_id" value={form.kampanye_id} onChange={handleChange} className={inputClass("kampanye_id")} required>
                <option value="">Pilih kampanye</option>
                {kampanyeList.map((item) => <option key={item.id} value={item.id}>{item.judul}</option>)}
              </select>
              {errors.kampanye_id && <p className="text-xs text-red-500">{errors.kampanye_id}</p>}
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Judul <span className="text-red-500">*</span></label>
              <input name="judul" value={form.judul} onChange={handleChange} className={inputClass("judul")} required />
              {errors.judul && <p className="text-xs text-red-500">{errors.judul}</p>}
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Penerima <span className="text-red-500">*</span></label>
              <input name="penerima" value={form.penerima} onChange={handleChange} className={inputClass("penerima")} required />
              {errors.penerima && <p className="text-xs text-red-500">{errors.penerima}</p>}
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Nominal <span className="text-red-500">*</span></label>
              <input type="number" name="nominal" value={form.nominal} onChange={handleChange} className={inputClass("nominal")} required min="1" />
              {errors.nominal && <p className="text-xs text-red-500">{errors.nominal}</p>}
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Tanggal Penyaluran <span className="text-red-500">*</span></label>
              <input type="datetime-local" name="tanggal_penyaluran" value={form.tanggal_penyaluran} onChange={handleChange} className={inputClass("tanggal_penyaluran")} required />
              {errors.tanggal_penyaluran && <p className="text-xs text-red-500">{errors.tanggal_penyaluran}</p>}
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Status <span className="text-red-500">*</span></label>
              <select name="status" value={form.status} onChange={handleChange} className={inputClass("status")} required>
                <option value="draft">Draft</option>
                <option value="publish">Publish</option>
              </select>
              {errors.status && <p className="text-xs text-red-500">{errors.status}</p>}
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Bukti Penyaluran</label>
              <input type="file" accept="image/*,.pdf" onChange={(event) => setBukti(event.target.files?.[0] ?? null)} className={inputClass("bukti")} />
              {errors.bukti && <p className="text-xs text-red-500">{errors.bukti}</p>}
            </div>
            <div className="space-y-2 md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Deskripsi <span className="text-red-500">*</span></label>
              <textarea name="deskripsi" value={form.deskripsi} onChange={handleChange} rows={4} className={inputClass("deskripsi")} required />
              {errors.deskripsi && <p className="text-xs text-red-500">{errors.deskripsi}</p>}
            </div>
          </div>

          <div className="mt-8 flex items-center justify-end gap-3 pt-6 border-t border-gray-100 dark:border-gray-800">
            <Link href="/admin/donasi/penyaluran" className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors">Batal</Link>
            <button type="submit" disabled={loading} className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-blue-600 rounded-xl hover:bg-blue-700 active:scale-95 transition-all shadow-sm shadow-blue-200 disabled:opacity-60">
              {loading ? <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> : <HiOutlineCheck className="w-4 h-4" />}
              {loading ? "Menyimpan..." : "Simpan Penyaluran"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function getApiMessage(error: unknown, fallback: string) {
  const apiError = error as ApiError;
  return apiError.response?.data?.message || (error instanceof Error ? error.message : fallback);
}
