"use client";

import React, { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { HiOutlineCheckCircle, HiOutlineExclamationTriangle } from "react-icons/hi2";
import InputField from "./input/InputField";
import TextArea from "./input/TextArea";
import FileInput from "./input/FileInput";
import Select from "./Select";
import Radio from "./input/Radio";
import Label from "./Label";
import AdminButton from "@/components/admin/ui/AdminButton";
import api from "@/lib/api";

// Removed ReactQuill - using textarea instead for React 19 compatibility

interface BeritaFormData {
  title: string;
  slug: string;
  category: string;
  teaser: string;
  content: string;
  coverImage: File | null;
  source: string;
  tags: string;
  status: 'draft' | 'published' | 'archived';
}

interface BeritaFormProps {
  isEdit?: boolean;
  initialData?: any;
}

const BeritaForm: React.FC<BeritaFormProps> = ({ isEdit = false, initialData }) => {
  const [formData, setFormData] = useState<BeritaFormData>({
    title: initialData?.title || "",
    slug: initialData?.slug || "",
    category: initialData?.category || "",
    teaser: initialData?.teaser || "",
    content: initialData?.content || "",
    coverImage: null,
    source: initialData?.source || "",
    tags: initialData?.tags || "",
    status: initialData?.status || "draft"
  });

  const [mounted, setMounted] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const showToast = (msg: string, type: "success" | "error" = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const [dragActive, setDragActive] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(initialData?.coverImage || null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Category options
  const categoryOptions = [
    { value: "umum", label: "Umum" },
    { value: "banjir", label: "Banjir" },
    { value: "longsor", label: "Longsor" },
    { value: "kebakaran", label: "Kebakaran" },
    { value: "angin_kencang", label: "Angin Kencang" },
    { value: "gempa", label: "Gempa" },
    { value: "cuaca", label: "Cuaca" }
  ];

  // Status options for radio buttons
  const statusOptions = [
    { value: "draft", label: "Draft" },
    { value: "published", label: "Published" },
    { value: "archived", label: "Archived" }
  ];


  // Auto-generate slug from title
  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  // Handle title change and auto-generate slug
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const title = e.target.value;
    setFormData(prev => ({
      ...prev,
      title,
      slug: generateSlug(title)
    }));
  };

  // Handle slug manual change
  const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      slug: e.target.value
    }));
  };

  // Handle file input change
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData(prev => ({
        ...prev,
        coverImage: file
      }));

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Drag and drop handlers
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
      if (file.type.startsWith('image/')) {
        setFormData(prev => ({
          ...prev,
          coverImage: file
        }));

        // Create preview
        const reader = new FileReader();
        reader.onloadend = () => {
          setPreviewImage(reader.result as string);
        };
        reader.readAsDataURL(file);
      }
    }
  };

  const handleInputChange = (field: keyof BeritaFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // Kita pakai FormData karena mungkin ada file gambar
      const submitData = new FormData();
      submitData.append('judul', formData.title);
      submitData.append('slug', formData.slug);
      submitData.append('kategori', formData.category);
      submitData.append('ringkasan', formData.teaser);
      submitData.append('konten', formData.content);
      submitData.append('sumber', formData.source);
      submitData.append('tags', formData.tags);
      submitData.append('status', formData.status);

      // Jika ada file gambar baru yang diupload
      if (formData.coverImage instanceof File) {
        submitData.append('foto_cover', formData.coverImage);
      }

      let url = '/api/berita';

      // Jika mode Edit, ubah URL dan tambahkan _method = PUT
      if (isEdit && initialData?.id) {
        url = `/api/berita/${initialData.id}`;
        submitData.append('_method', 'PUT');
      }

      // Menggunakan api dari lib/api.ts agar cookie Sanctum terkirim (Authenticated)
      await api.post(url, submitData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      showToast(`Berita berhasil ${isEdit ? 'diperbarui' : 'ditambahkan'}!`, "success");
      
      // Delay redirect to let user see premium toast transition
      setTimeout(() => {
        window.location.href = '/admin/berita'; // Redirect ke halaman list
      }, 1200);

    } catch (error: any) {
      console.error('API Error:', error);
      let errorMessage = 'Terjadi kesalahan pada server.';

      if (error.response && error.response.data) {
        errorMessage = error.response.data.message || 'Periksa kembali isian Anda.';
      }
      showToast(`Gagal: ${errorMessage}`, "error");
    }
  };

  const onButtonClick = () => {
    inputRef.current?.click();
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Judul Berita */}
      <div>
        <Label htmlFor="title">Judul Berita *</Label>
        <InputField
          id="title"
          name="title"
          placeholder="Masukkan judul berita"
          defaultValue={formData.title}
          onChange={handleTitleChange}
        />
      </div>

      {/* Slug */}
      <div>
        <Label htmlFor="slug">Slug</Label>
        <InputField
          id="slug"
          name="slug"
          placeholder="Slug akan otomatis terisi"
          defaultValue={formData.slug}
          onChange={handleSlugChange}
          hint="Slug akan otomatis dibuat dari judul berita"
        />
      </div>

      {/* Kategori */}
      <div>
        <Label htmlFor="category">Kategori *</Label>
        <Select
          options={categoryOptions}
          placeholder="Pilih kategori"
          onChange={(value) => handleInputChange('category', value)}
          defaultValue={formData.category}
        />
      </div>

      {/* Sumber Berita */}
      <div>
        <Label htmlFor="source">Sumber Berita</Label>
        <InputField
          id="source"
          name="source"
          placeholder="Masukkan sumber berita (URL atau nama sumber)"
          defaultValue={formData.source}
          onChange={(e) => handleInputChange('source', e.target.value)}
        />
      </div>

      {/* Tags */}
      <div>
        <Label htmlFor="tags">Tags</Label>
        <InputField
          id="tags"
          name="tags"
          placeholder="Masukkan tags (pisahkan dengan koma)"
          defaultValue={formData.tags}
          onChange={(e) => handleInputChange('tags', e.target.value)}
          hint="Contoh: bencana, alam, darurat"
        />
      </div>

      {/* Status Publikasi */}
      <div>
        <Label>Status Publikasi</Label>
        <div className="space-y-3">
          {statusOptions.map((option) => (
            <Radio
              key={option.value}
              id={`status-${option.value}`}
              name="status"
              value={option.value}
              checked={formData.status === option.value}
              onChange={(value) => handleInputChange('status', value as 'draft' | 'published' | 'archived')}
              label={option.label}
            />
          ))}
        </div>
      </div>

      {/* Foto Cover */}
      <div className="md:col-span-2">
        <Label>Foto Cover</Label>
        <div
          className={`relative border-2 border-dashed rounded-lg p-6 text-center transition-colors ${dragActive
              ? "border-brand-500 bg-brand-50 dark:bg-brand-500/10"
              : "border-gray-300 dark:border-gray-700"
            }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />

          {previewImage ? (
            <div className="space-y-4">
              <img
                src={previewImage}
                alt="Preview"
                className="mx-auto max-h-48 rounded-lg object-contain"
              />
              <button
                type="button"
                onClick={onButtonClick}
                className="text-sm text-brand-600 hover:text-brand-700 dark:text-brand-400 font-medium"
              >
                Ganti gambar
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
                  onClick={onButtonClick}
                  className="text-sm text-brand-600 hover:text-brand-700 dark:text-brand-400 font-medium"
                >
                  Klik untuk upload
                </button>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  atau drag and drop
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  PNG, JPG, GIF (maks. 10MB)
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Ringkasan (Teaser) */}
      <div className="md:col-span-2">
        <Label htmlFor="teaser">Ringkasan (Teaser)</Label>
        <TextArea
          placeholder="Masukkan ringkasan berita"
          rows={3}
          value={formData.teaser}
          onChange={(value) => handleInputChange('teaser', value)}
        />
      </div>

      {/* Isi Berita dengan Textarea (sementara) */}
      <div className="md:col-span-2">
        <Label htmlFor="content">Isi Berita *</Label>
        <TextArea
          placeholder="Tulis isi berita di sini..."
          rows={8}
          value={formData.content}
          onChange={(value) => handleInputChange('content', value)}
          hint="Anda dapat menggunakan format text biasa. Rich text editor akan segera hadir."
        />
      </div>
      </div>

      {/* Submit Button */}
      <div className="mt-8 flex justify-end space-x-3 pt-6 border-t border-gray-100 dark:border-gray-800">
        <AdminButton
          type="button"
          variant="outline"
          onClick={() => window.history.back()}
        >
          Batal
        </AdminButton>
        <AdminButton
          type="submit"
          variant="secondary"
        >
          {isEdit ? "Perbarui Berita" : "Simpan Berita"}
        </AdminButton>
      </div>

      {/* Toast Notification - Portaled to Body */}
      {mounted && toast && typeof window !== "undefined" && createPortal(
        <div className={`fixed bottom-8 left-1/2 -translate-x-1/2 z-[99999] px-6 py-3 rounded-2xl shadow-2xl border flex items-center gap-3 animate-in fade-in slide-in-from-bottom-4 duration-300 ${
          toast.type === "success" 
            ? "bg-emerald-500 border-emerald-400 text-white" 
            : "bg-red-500 border-red-400 text-white"
        }`}>
          {toast.type === "success" ? <HiOutlineCheckCircle className="w-5 h-5 shrink-0" /> : <HiOutlineExclamationTriangle className="w-5 h-5 shrink-0" />}
          <span className="font-bold text-sm">{toast.msg}</span>
        </div>,
        document.body
      )}
    </form>
  );
};

export default BeritaForm;
