"use client";

import React, { useEffect, useState, useRef } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { HiOutlineArrowLeft, HiOutlineCheckCircle, HiOutlineExclamationTriangle, HiOutlineDocumentText } from "react-icons/hi2";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import api, { getImageUrl } from "@/lib/api";

// Import premium UI components
import InputField from "@/components/form/input/InputField";
import TextArea from "@/components/form/input/TextArea";
import Select from "@/components/form/Select";
import Label from "@/components/form/Label";
import AdminButton from "@/components/admin/ui/AdminButton";

type PenyaluranFormState = {
  kampanye_id: string;
  judul: string;
  deskripsi: string;
  nominal: string;
  penerima: string;
  tanggal_penyaluran: string;
  status: "" | "draft" | "publish";
};

type KampanyeOption = { id: string; judul: string; total_terkumpul?: string | number | null; penyaluran_count?: number };
type ApiError = { response?: { status?: number; data?: { message?: string; errors?: Record<string, string[]> } } };

const emptyForm: PenyaluranFormState = {
  kampanye_id: "",
  judul: "",
  deskripsi: "",
  nominal: "",
  penerima: "",
  tanggal_penyaluran: "",
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

export default function PenyaluranDonasiForm({ id }: { id?: string }) {
  const router = useRouter();
  const [form, setForm] = useState<PenyaluranFormState>(emptyForm);
  const [bukti, setBukti] = useState<File | null>(null);
  const [kampanyeList, setKampanyeList] = useState<KampanyeOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(!!id);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState<string | null>(null);

  // States for Document/Image Drag & Drop and Preview
  const [dragActive, setDragActive] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
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

  // Status options for dropdown field
  const statusOptions = [
    { value: "draft", label: "Draft" },
    { value: "publish", label: "Publish" }
  ];

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
        if (data.bukti) {
          if (data.bukti.toLowerCase().endsWith(".pdf")) {
            setFileName(data.bukti.split("/").pop() || "Bukti_Penyaluran.pdf");
          } else {
            setPreviewImage(getImageUrl(data.bukti));
          }
        }
      })
      .catch((err: unknown) => setServerError(getApiMessage(err, "Gagal memuat penyaluran donasi.")))
      .finally(() => setFetching(false));
  }, [id]);

  const handleInputChange = (field: keyof PenyaluranFormState, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const handleKampanyeChange = (value: string) => {
    const selectedCampaign = kampanyeList.find((item) => item.id === value);
    const collectedAmount = selectedCampaign?.total_terkumpul ?? "";

    setForm((prev) => ({
      ...prev,
      kampanye_id: value,
      nominal: collectedAmount === "" ? "" : String(collectedAmount),
    }));
    setErrors((prev) => ({ ...prev, kampanye_id: "", nominal: "" }));
  };

  // Document/Image upload and drag-drop handlers
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setBukti(file);
      setFileName(file.name);
      if (file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setPreviewImage(reader.result as string);
        };
        reader.readAsDataURL(file);
      } else {
        setPreviewImage(null);
      }
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
      setBukti(file);
      setFileName(file.name);
      if (file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setPreviewImage(reader.result as string);
        };
        reader.readAsDataURL(file);
      } else {
        setPreviewImage(null);
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
        showToast("Mohon periksa kembali isian formulir Anda.", "error");
      } else {
        const msg = getApiMessage(err, "Gagal menyimpan penyaluran donasi.");
        setServerError(msg);
        showToast(msg, "error");
      }
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
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
            <SkeletonBox className="h-5 w-48 mb-3" />
            <SkeletonBox className="h-4 w-80 max-w-full" />
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {Array.from({ length: 6 }).map((_, index) => (
                <div key={index} className="space-y-2">
                  <SkeletonBox className="h-4 w-36" />
                  <SkeletonBox className="h-11 w-full" />
                  {index === 1 && <SkeletonBox className="h-3 w-64 max-w-full" />}
                </div>
              ))}

              <div className="md:col-span-2 space-y-2">
                <SkeletonBox className="h-4 w-52" />
                <SkeletonBox className="h-[220px] w-full rounded-lg" />
              </div>

              <div className="md:col-span-2 space-y-2">
                <SkeletonBox className="h-4 w-40" />
                <SkeletonBox className="h-36 w-full rounded-lg" />
              </div>
            </div>

            <div className="mt-8 flex justify-end gap-3 pt-6 border-t border-gray-100 dark:border-gray-800">
              <SkeletonBox className="h-11 w-24" />
              <SkeletonBox className="h-11 w-40" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Map campaigns list to Select options format
  const kampanyeOptions = kampanyeList
    .filter((item) => !item.penyaluran_count || item.id === form.kampanye_id)
    .map((item) => ({
      value: item.id,
      label: item.judul
    }));

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <PageBreadcrumb pageTitle={id ? "Edit Penyaluran Donasi" : "Tambah Penyaluran Donasi"} className="mb-0" />
        <Link href="/admin/donasi/penyaluran" className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 bg-white dark:bg-gray-800 border border-slate-200 dark:border-gray-700 rounded-lg hover:bg-slate-50 dark:hover:bg-gray-700 transition-colors">
          <HiOutlineArrowLeft className="w-4 h-4" />
          Kembali
        </Link>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-white/[0.03]">
        <div className="px-6 py-5 border-b border-gray-100 dark:border-gray-800">
          <h3 className="text-base font-semibold text-gray-900 dark:text-white">Data Penyaluran Dana</h3>
          <p className="text-sm text-gray-500 mt-1">Status publish akan tampil sebagai transparansi dana di mobile.</p>
        </div>

        {serverError && (
          <div className="mx-6 mt-4 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-650 text-xs flex items-center gap-2">
            <HiOutlineExclamationTriangle className="w-4 h-4 shrink-0" />
            <span>{serverError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Kampanye Terkait */}
            <div>
              <Label htmlFor="kampanye_id">Kampanye Donasi Terkait <span className="text-red-500">*</span></Label>
              <Select
                options={kampanyeOptions}
                placeholder="Pilih kampanye donasi terdampak"
                onChange={handleKampanyeChange}
                defaultValue={form.kampanye_id}
                error={errors.kampanye_id}
              />
            </div>

            {/* Nominal Penyaluran */}
            <div>
              <Label htmlFor="nominal">Nominal Bantuan (Rp) <span className="text-red-500">*</span></Label>
              <InputField
                id="nominal"
                name="nominal"
                type="number"
                placeholder="Pilih kampanye untuk mengisi nominal"
                value={form.nominal}
                disabled
                error={errors.nominal}
                hint="Nominal otomatis mengikuti total dana terkumpul dari kampanye terpilih"
              />
            </div>

            {/* Judul Penyaluran */}
            <div>
              <Label htmlFor="judul">Judul Penyaluran <span className="text-red-500">*</span></Label>
              <InputField
                id="judul"
                name="judul"
                placeholder="Masukkan judul/tujuan penyaluran"
                defaultValue={form.judul}
                onChange={(e) => handleInputChange("judul", e.target.value)}
                error={errors.judul}
              />
            </div>

            {/* Penerima Penyaluran */}
            <div>
              <Label htmlFor="penerima">Nama / Pihak Penerima <span className="text-red-500">*</span></Label>
              <InputField
                id="penerima"
                name="penerima"
                placeholder="Masukkan nama penerima bantuan (organisasi/wakil warga)"
                defaultValue={form.penerima}
                onChange={(e) => handleInputChange("penerima", e.target.value)}
                error={errors.penerima}
              />
            </div>

            {/* Status Publikasi */}
            <div>
              <Label>Status Penyaluran</Label>
              <Select
                options={statusOptions}
                placeholder="Pilih status penyaluran"
                onChange={(value) => handleInputChange("status", value as PenyaluranFormState["status"])}
                defaultValue={form.status}
                error={errors.status}
              />
            </div>

            {/* Tanggal Penyaluran */}
            <div>
              <Label htmlFor="tanggal_penyaluran">Tanggal Penyaluran <span className="text-red-500">*</span></Label>
              <InputField
                id="tanggal_penyaluran"
                name="tanggal_penyaluran"
                type="datetime-local"
                defaultValue={form.tanggal_penyaluran}
                onChange={(e) => handleInputChange("tanggal_penyaluran", e.target.value)}
                error={errors.tanggal_penyaluran}
              />
            </div>

            {/* Bukti Penyaluran File Uploader (Matching BeritaForm.tsx drag and drop box) */}
            <div className="md:col-span-2">
              <Label>Bukti Dokumen / Foto Penyaluran</Label>
              <div
                className={`relative border-2 border-dashed rounded-lg p-6 text-center transition-colors min-h-[220px] flex flex-col justify-center ${
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
                  accept="image/*,.pdf"
                  onChange={handleFileChange}
                  className="hidden"
                />

                {previewImage ? (
                  <div className="space-y-2">
                    <div
                      role="img"
                      aria-label="Preview Bukti"
                      className="mx-auto h-24 w-full max-w-xs rounded bg-contain bg-center bg-no-repeat"
                      style={{ backgroundImage: `url(${previewImage})` }}
                    />
                    <button
                      type="button"
                      onClick={triggerUploadClick}
                      className="text-xs text-brand-600 hover:text-brand-700 dark:text-brand-400 font-medium"
                    >
                      Ganti bukti
                    </button>
                  </div>
                ) : fileName ? (
                  <div className="space-y-2">
                    <HiOutlineDocumentText className="w-8 h-8 mx-auto text-blue-500" />
                    <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 truncate max-w-xs mx-auto">{fileName}</p>
                    <button
                      type="button"
                      onClick={triggerUploadClick}
                      className="text-xs text-brand-600 hover:text-brand-700 dark:text-brand-400 font-medium"
                    >
                      Ganti berkas
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="mx-auto flex h-10 w-10 items-center justify-center rounded bg-gray-100 dark:bg-gray-800">
                      <svg
                        className="h-5 w-5 text-gray-400"
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
                        className="text-xs text-brand-600 hover:text-brand-700 font-medium"
                      >
                        Klik untuk upload berkas
                      </button>
                      <p className="text-[10px] text-gray-500 mt-0.5">
                        atau drag & drop (PNG, JPG, PDF)
                      </p>
                    </div>
                  </div>
                )}
              </div>
              {errors.bukti && <p className="text-xs text-red-500 mt-1.5">{errors.bukti}</p>}
            </div>

            {/* Deskripsi Penyaluran */}
            <div className="md:col-span-2">
              <Label htmlFor="deskripsi">Deskripsi Penyaluran <span className="text-red-500">*</span></Label>
              <TextArea
                id="deskripsi"
                placeholder="Tulis penjelasan lengkap perihal penyaluran dana donasi bencana ini, rincian barang bantuan yang diserahkan, serta keterangan pendukung lainnya..."
                rows={6}
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
              {id ? "Perbarui Penyaluran" : "Simpan Penyaluran"}
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
