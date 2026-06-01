"use client";

import React, { useEffect, useState, useRef } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { HiOutlineArrowLeft, HiOutlineCheckCircle, HiOutlineExclamationTriangle } from "react-icons/hi2";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import api, { getImageUrl } from "@/lib/api";

// Import premium UI components
import InputField from "@/components/form/input/InputField";
import TextArea from "@/components/form/input/TextArea";
import Select from "@/components/form/Select";
import Label from "@/components/form/Label";
import AdminButton from "@/components/admin/ui/AdminButton";

type KampanyeFormState = {
  judul: string;
  deskripsi: string;
  jenis_bencana: string;
  kecamatan_id: string;
  laporan_bencana_id: string;
  target_donasi: string;
  tanggal_mulai: string;
  tanggal_selesai: string;
  status: "" | "draft" | "aktif" | "ditutup";
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
  status: "",
};

const toLocalInput = (value?: string | null) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value.slice(0, 16);
  const offset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 16);
};

function SkeletonBox({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse rounded-lg bg-slate-100 dark:bg-gray-700 ${className}`} />;
}

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

  // States for Image Upload Drag & Drop and Preview
  const [dragActive, setDragActive] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Toast Notification State
  const [mounted, setMounted] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const showToast = (msg: string, type: "success" | "error" = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const statusOptions = [
    { value: "draft", label: "Draft" },
    { value: "aktif", label: "Aktif" },
    { value: "ditutup", label: "Ditutup" }
  ];

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
          status: data.status ?? "",
        });
        if (data.gambar) {
          setPreviewImage(getImageUrl(data.gambar));
        }
      } catch (err: unknown) {
        setServerError(getApiMessage(err, "Gagal memuat kampanye donasi."));
      } finally {
        setFetching(false);
      }
    };

    loadDetail();
  }, [id]);

  const handleInputChange = (field: keyof KampanyeFormState, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  // Image upload selection and drag drop handlers
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setGambar(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith("image/")) {
        setGambar(file);
        const reader = new FileReader();
        reader.onloadend = () => {
          setPreviewImage(reader.result as string);
        };
        reader.readAsDataURL(file);
      }
    }
  };

  const triggerUploadClick = () => {
    fileInputRef.current?.click();
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
        showToast("Mohon periksa kembali isian formulir Anda.", "error");
      } else {
        const msg = getApiMessage(err, "Gagal menyimpan kampanye donasi.");
        setServerError(msg);
        showToast(msg, "error");
      }
    } finally {
      setLoading(false);
    }
  };

  // Map lists to select format
  const kecamatanOptions = kecamatanList.map((item) => ({
    value: item.id,
    label: item.nama
  }));

  const laporanOptions = laporanList.map((item) => ({
    value: item.id,
    label: `${item.jenis_bencana} - ${item.kecamatan?.nama ?? item.alamat_lengkap ?? "Laporan"}`
  }));

  if (fetching) {
    return (
      <div>
        <div className="flex items-center justify-between mb-6">
          <PageBreadcrumb pageTitle={id ? "Edit Kampanye Donasi" : "Tambah Kampanye Donasi"} className="mb-0" />
          <Link href="/admin/donasi/kampanye" className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 bg-white dark:bg-gray-800 border border-slate-200 dark:border-gray-700 rounded-lg hover:bg-slate-50 dark:hover:bg-gray-700 transition-colors">
            <HiOutlineArrowLeft className="w-4 h-4" />
            Kembali
          </Link>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-white/[0.03]">
          <div className="px-6 py-5 border-b border-gray-100 dark:border-gray-800">
            <SkeletonBox className="h-5 w-44 mb-2" />
            <SkeletonBox className="h-4 w-96 max-w-full" />
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {Array.from({ length: 8 }).map((_, index) => (
                <div key={index}>
                  <SkeletonBox className="h-4 w-32 mb-2" />
                  <SkeletonBox className="h-11 w-full" />
                  {index === 4 || index === 7 ? <SkeletonBox className="h-3 w-56 mt-2" /> : null}
                </div>
              ))}

              <div className="md:col-span-2">
                <SkeletonBox className="h-4 w-40 mb-2" />
                <SkeletonBox className="h-48 w-full" />
              </div>

              <div className="md:col-span-2">
                <SkeletonBox className="h-4 w-48 mb-2" />
                <SkeletonBox className="h-44 w-full" />
              </div>
            </div>

            <div className="mt-8 flex justify-end gap-3 pt-6 border-t border-gray-100 dark:border-gray-800">
              <SkeletonBox className="h-10 w-20" />
              <SkeletonBox className="h-10 w-40" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <PageBreadcrumb pageTitle={id ? "Edit Kampanye Donasi" : "Tambah Kampanye Donasi"} className="mb-0" />
        <Link href="/admin/donasi/kampanye" className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 bg-white dark:bg-gray-800 border border-slate-200 dark:border-gray-700 rounded-lg hover:bg-slate-50 dark:hover:bg-gray-700 transition-colors">
          <HiOutlineArrowLeft className="w-4 h-4" />
          Kembali
        </Link>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-white/[0.03]">
        <div className="px-6 py-5 border-b border-gray-100 dark:border-gray-800">
          <h3 className="text-base font-semibold text-gray-900 dark:text-white">Data Kampanye Donasi</h3>
          <p className="text-sm text-gray-500 mt-1">Kampanye aktif akan tampil di aplikasi mobile dan bisa menerima donasi secara transparan.</p>
        </div>

        {serverError && (
          <div className="mx-6 mt-4 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-650 text-xs flex items-center gap-2">
            <HiOutlineExclamationTriangle className="w-4 h-4 shrink-0" />
            <span>{serverError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Judul Kampanye */}
            <div>
              <Label htmlFor="judul">Judul Kampanye <span className="text-red-500">*</span></Label>
              <InputField
                id="judul"
                name="judul"
                placeholder="Masukkan judul kampanye donasi"
                defaultValue={form.judul}
                onChange={(e) => handleInputChange("judul", e.target.value)}
                error={errors.judul}
              />
            </div>

            {/* Jenis Bencana */}
            <div>
              <Label htmlFor="jenis_bencana">Jenis Bencana <span className="text-red-500">*</span></Label>
              <InputField
                id="jenis_bencana"
                name="jenis_bencana"
                placeholder="Contoh: Banjir, Tanah Longsor, Kebakaran"
                defaultValue={form.jenis_bencana}
                onChange={(e) => handleInputChange("jenis_bencana", e.target.value)}
                error={errors.jenis_bencana}
              />
            </div>

            {/* Kecamatan */}
            <div>
              <Label htmlFor="kecamatan_id">Kecamatan</Label>
              <Select
                options={kecamatanOptions}
                placeholder="Pilih kecamatan terdampak"
                onChange={(value) => handleInputChange("kecamatan_id", value)}
                defaultValue={form.kecamatan_id}
                error={errors.kecamatan_id}
              />
            </div>

            {/* Laporan Bencana Terkait */}
            <div>
              <Label htmlFor="laporan_bencana_id">Laporan Bencana Terkait</Label>
              <Select
                options={laporanOptions}
                placeholder="Pilih laporan bencana terkait"
                onChange={(value) => handleInputChange("laporan_bencana_id", value)}
                defaultValue={form.laporan_bencana_id}
                error={errors.laporan_bencana_id}
              />
            </div>

            {/* Target Donasi */}
            <div>
              <Label htmlFor="target_donasi">Target Donasi (Rp)</Label>
              <InputField
                id="target_donasi"
                name="target_donasi"
                type="number"
                placeholder="Masukkan nominal target donasi (kosongkan jika tidak dibatasi)"
                defaultValue={form.target_donasi}
                onChange={(e) => handleInputChange("target_donasi", e.target.value)}
                error={errors.target_donasi}
                hint="Isikan angka saja tanpa tanda baca, contoh: 50000000"
              />
            </div>

            {/* Status */}
            <div>
              <Label htmlFor="status">Status Kampanye</Label>
              <Select
                options={statusOptions}
                placeholder="Pilih Status Kampanye"
                onChange={(value) => handleInputChange("status", value as KampanyeFormState["status"])}
                defaultValue={form.status}
                error={errors.status}
              />
              {errors.status && <p className="text-xs text-red-500 mt-1.5">{errors.status}</p>}
            </div>

            {/* Tanggal Mulai */}
            <div>
              <Label htmlFor="tanggal_mulai">Tanggal Mulai <span className="text-red-500">*</span></Label>
              <InputField
                id="tanggal_mulai"
                name="tanggal_mulai"
                type="datetime-local"
                defaultValue={form.tanggal_mulai}
                onChange={(e) => handleInputChange("tanggal_mulai", e.target.value)}
                error={errors.tanggal_mulai}
              />
            </div>

            {/* Tanggal Selesai */}
            <div>
              <Label htmlFor="tanggal_selesai">Tanggal Selesai</Label>
              <InputField
                id="tanggal_selesai"
                name="tanggal_selesai"
                type="datetime-local"
                defaultValue={form.tanggal_selesai}
                onChange={(e) => handleInputChange("tanggal_selesai", e.target.value)}
                error={errors.tanggal_selesai}
                hint="Kosongkan apabila kampanye terus terbuka tanpa batas waktu"
              />
            </div>

            {/* Cover Image Uploader (Matching BeritaForm.tsx drag and drop box) */}
            <div className="md:col-span-2">
              <Label>Gambar Cover Kampanye</Label>
              <div
                className={`relative border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                  dragActive
                    ? "border-brand-500 bg-brand-50 dark:bg-brand-500/10"
                    : "border-gray-300 dark:border-gray-700"
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />

                {previewImage ? (
                  <div className="space-y-4">
                    <div
                      role="img"
                      aria-label="Preview Gambar"
                      className="mx-auto h-48 w-full max-w-xl rounded-lg bg-contain bg-center bg-no-repeat"
                      style={{ backgroundImage: `url(${previewImage})` }}
                    />
                    <button
                      type="button"
                      onClick={triggerUploadClick}
                      className="text-sm text-brand-600 hover:text-brand-700 dark:text-brand-400 font-medium"
                    >
                      Ganti gambar cover
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-800">
                      <svg
                        className="h-6 w-6 text-gray-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                        />
                      </svg>
                    </div>
                    <div>
                      <button
                        type="button"
                        onClick={triggerUploadClick}
                        className="text-sm text-brand-600 hover:text-brand-700 dark:text-brand-400 font-medium"
                      >
                        Klik untuk upload gambar
                      </button>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        atau drag and drop gambar ke area ini
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        PNG, JPG, JPEG, WEBP (maks. 5MB)
                      </p>
                    </div>
                  </div>
                )}
              </div>
              {errors.gambar && <p className="text-xs text-red-500 mt-1.5">{errors.gambar}</p>}
            </div>

            {/* Deskripsi */}
            <div className="md:col-span-2">
              <Label htmlFor="deskripsi">Deskripsi Detail Kampanye <span className="text-red-500">*</span></Label>
              <TextArea
                id="deskripsi"
                placeholder="Tulis penjelasan lengkap detail kampanye donasi, tujuan penggalangan dana, serta peruntukan dana penyaluran di sini..."
                rows={7}
                value={form.deskripsi}
                onChange={(value) => handleInputChange("deskripsi", value)}
                error={errors.deskripsi}
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-8 flex justify-end space-x-3 pt-6 border-t border-gray-100 dark:border-gray-800">
            <AdminButton
              type="button"
              variant="outline"
              onClick={() => router.back()}
            >
              Batal
            </AdminButton>
            <AdminButton
              type="submit"
              variant="secondary"
              loading={loading}
            >
              {id ? "Perbarui Kampanye" : "Simpan Kampanye"}
            </AdminButton>
          </div>
        </form>
      </div>

      {/* Toast Notification - Portaled to Body */}
      {mounted && toast && typeof window !== "undefined" && createPortal(
        <div className={`fixed top-6 right-6 z-[99999] px-6 py-3 rounded-2xl shadow-2xl border flex items-center gap-3 animate-in fade-in slide-in-from-top-4 duration-300 ${
          toast.type === "success" 
            ? "bg-emerald-500 border-emerald-400 text-white" 
            : "bg-red-500 border-red-400 text-white"
        }`}>
          {toast.type === "success" ? <HiOutlineCheckCircle className="w-5 h-5 shrink-0" /> : <HiOutlineExclamationTriangle className="w-5 h-5 shrink-0" />}
          <span className="font-bold text-sm">{toast.msg}</span>
        </div>,
        document.body
      )}
    </div>
  );
}

function getApiMessage(error: unknown, fallback: string) {
  const apiError = error as ApiError;
  return apiError.response?.data?.message || (error instanceof Error ? error.message : fallback);
}
