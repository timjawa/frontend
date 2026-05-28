"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { HiOutlineArrowLeft, HiOutlineCheck } from "react-icons/hi2";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import api from "@/lib/api";

type KampanyeFormState = {
  judul: string;
  deskripsi: string;
  jenis_bencana: string;
  kecamatan_id: string;
  laporan_bencana_id: string;
  target_donasi: string;
  tanggal_mulai: string;
  tanggal_selesai: string;
  status: string;
};

type KecamatanOption = { id: string; nama: string };
type LaporanOption = { id: string; jenis_bencana: string; alamat_lengkap?: string | null; kecamatan?: { nama: string } | null };
type ApiError = { response?: { status?: number; data?: { message?: string; errors?: Record<string, string[]> } } };

const emptyForm: KampanyeFormState = {
  judul: "",
  deskripsi: "",
  jenis_bencana: "",
  kecamatan_id: "",
  laporan_bencana_id: "",
  target_donasi: "",
  tanggal_mulai: "",
  tanggal_selesai: "",
  status: "draft",
};

const toLocalInput = (value?: string | null) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value.slice(0, 16);
  const offset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 16);
};

export default function KampanyeDonasiForm({ id }: { id?: string }) {
  const router = useRouter();
  const [form, setForm] = useState<KampanyeFormState>(emptyForm);
  const [gambar, setGambar] = useState<File | null>(null);
  const [kecamatanList, setKecamatanList] = useState<KecamatanOption[]>([]);
  const [laporanList, setLaporanList] = useState<LaporanOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(!!id);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState<string | null>(null);

  useEffect(() => {
    const loadOptions = async () => {
      try {
        const [kecamatan, laporan] = await Promise.all([
          api.get("/api/kecamatan", { params: { per_page: 100 } }),
          api.get("/api/admin/laporan", { params: { status: "diverifikasi", per_page: 100 } }),
        ]);
        setKecamatanList(kecamatan.data.data ?? kecamatan.data ?? []);
        setLaporanList(laporan.data.data ?? []);
      } catch {
        setKecamatanList([]);
        setLaporanList([]);
      }
    };

    loadOptions();
  }, []);

  useEffect(() => {
    if (!id) return;

    const loadDetail = async () => {
      setFetching(true);
      try {
        const res = await api.get(`/api/admin/donasi/kampanye/${id}`);
        const data = res.data.data;
        setForm({
          judul: data.judul ?? "",
          deskripsi: data.deskripsi ?? "",
          jenis_bencana: data.jenis_bencana ?? "",
          kecamatan_id: data.kecamatan_id ?? "",
          laporan_bencana_id: data.laporan_bencana_id ?? "",
          target_donasi: data.target_donasi ?? "",
          tanggal_mulai: toLocalInput(data.tanggal_mulai),
          tanggal_selesai: toLocalInput(data.tanggal_selesai),
          status: data.status ?? "draft",
        });
      } catch (err: unknown) {
        setServerError(getApiMessage(err, "Gagal memuat kampanye donasi."));
      } finally {
        setFetching(false);
      }
    };

    loadDetail();
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
    if (gambar) payload.append("gambar", gambar);

    try {
      if (id) {
        await api.post(`/api/admin/donasi/kampanye/${id}`, payload, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      } else {
        await api.post("/api/admin/donasi/kampanye", payload, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }
      router.push("/admin/donasi/kampanye");
    } catch (err: unknown) {
      const apiError = err as ApiError;
      if (apiError.response?.status === 422 && apiError.response.data?.errors) {
        const nextErrors: Record<string, string> = {};
        Object.entries(apiError.response.data.errors).forEach(([key, value]) => {
          nextErrors[key] = value[0];
        });
        setErrors(nextErrors);
      } else {
        setServerError(getApiMessage(err, "Gagal menyimpan kampanye donasi."));
      }
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return <div className="p-8 text-sm text-gray-500">Memuat form kampanye...</div>;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <PageBreadcrumb pageTitle={id ? "Edit Kampanye Donasi" : "Tambah Kampanye Donasi"} className="mb-0" />
        <Link href="/admin/donasi/kampanye" className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
          <HiOutlineArrowLeft className="w-4 h-4" />
          Kembali
        </Link>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-white/[0.03]">
        <div className="px-6 py-5 border-b border-gray-100 dark:border-gray-800">
          <h3 className="text-base font-semibold text-gray-900 dark:text-white">Data Kampanye Donasi</h3>
          <p className="text-sm text-gray-500 mt-1">Kampanye aktif akan tampil di aplikasi mobile dan bisa menerima donasi.</p>
        </div>

        {serverError && <div className="mx-6 mt-4 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm">{serverError}</div>}

        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Judul <span className="text-red-500">*</span></label>
              <input name="judul" value={form.judul} onChange={handleChange} className={inputClass("judul")} required />
              {errors.judul && <p className="text-xs text-red-500">{errors.judul}</p>}
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Jenis Bencana <span className="text-red-500">*</span></label>
              <input name="jenis_bencana" value={form.jenis_bencana} onChange={handleChange} className={inputClass("jenis_bencana")} required placeholder="Banjir, Longsor, Kebakaran" />
              {errors.jenis_bencana && <p className="text-xs text-red-500">{errors.jenis_bencana}</p>}
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Kecamatan</label>
              <select name="kecamatan_id" value={form.kecamatan_id} onChange={handleChange} className={inputClass("kecamatan_id")}>
                <option value="">Pilih kecamatan</option>
                {kecamatanList.map((item) => <option key={item.id} value={item.id}>{item.nama}</option>)}
              </select>
              {errors.kecamatan_id && <p className="text-xs text-red-500">{errors.kecamatan_id}</p>}
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Laporan Terkait</label>
              <select name="laporan_bencana_id" value={form.laporan_bencana_id} onChange={handleChange} className={inputClass("laporan_bencana_id")}>
                <option value="">Tanpa laporan terkait</option>
                {laporanList.map((item) => <option key={item.id} value={item.id}>{item.jenis_bencana} - {item.kecamatan?.nama ?? item.alamat_lengkap ?? "Laporan"}</option>)}
              </select>
              {errors.laporan_bencana_id && <p className="text-xs text-red-500">{errors.laporan_bencana_id}</p>}
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Target Donasi</label>
              <input type="number" name="target_donasi" value={form.target_donasi} onChange={handleChange} className={inputClass("target_donasi")} min="0" />
              {errors.target_donasi && <p className="text-xs text-red-500">{errors.target_donasi}</p>}
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Status <span className="text-red-500">*</span></label>
              <select name="status" value={form.status} onChange={handleChange} className={inputClass("status")} required>
                <option value="draft">Draft</option>
                <option value="aktif">Aktif</option>
                <option value="ditutup">Ditutup</option>
              </select>
              {errors.status && <p className="text-xs text-red-500">{errors.status}</p>}
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Tanggal Mulai <span className="text-red-500">*</span></label>
              <input type="datetime-local" name="tanggal_mulai" value={form.tanggal_mulai} onChange={handleChange} className={inputClass("tanggal_mulai")} required />
              {errors.tanggal_mulai && <p className="text-xs text-red-500">{errors.tanggal_mulai}</p>}
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Tanggal Selesai</label>
              <input type="datetime-local" name="tanggal_selesai" value={form.tanggal_selesai} onChange={handleChange} className={inputClass("tanggal_selesai")} />
              {errors.tanggal_selesai && <p className="text-xs text-red-500">{errors.tanggal_selesai}</p>}
            </div>
            <div className="space-y-2 md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Gambar Kampanye</label>
              <input type="file" accept="image/*" onChange={(event) => setGambar(event.target.files?.[0] ?? null)} className={inputClass("gambar")} />
              {errors.gambar && <p className="text-xs text-red-500">{errors.gambar}</p>}
            </div>
            <div className="space-y-2 md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Deskripsi <span className="text-red-500">*</span></label>
              <textarea name="deskripsi" value={form.deskripsi} onChange={handleChange} rows={5} className={inputClass("deskripsi")} required />
              {errors.deskripsi && <p className="text-xs text-red-500">{errors.deskripsi}</p>}
            </div>
          </div>

          <div className="mt-8 flex items-center justify-end gap-3 pt-6 border-t border-gray-100 dark:border-gray-800">
            <Link href="/admin/donasi/kampanye" className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors">Batal</Link>
            <button type="submit" disabled={loading} className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-blue-600 rounded-xl hover:bg-blue-700 active:scale-95 transition-all shadow-sm shadow-blue-200 disabled:opacity-60">
              {loading ? <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> : <HiOutlineCheck className="w-4 h-4" />}
              {loading ? "Menyimpan..." : "Simpan Kampanye"}
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
