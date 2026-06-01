"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { HiOutlineArrowLeft, HiOutlineCheck, HiOutlineEye, HiOutlineEyeSlash, HiOutlinePhoto } from "react-icons/hi2";
import api from "@/lib/api";

export default function CreatePenggunaPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [visiblePasswords, setVisiblePasswords] = useState({
    password: false,
    password_confirmation: false,
  });

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    password_confirmation: "",
    no_telepon: "",
    alamat: "",
  });

  const [foto, setFoto] = useState<File | null>(null);
  const [fotoPreview, setFotoPreview] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    // Clear error for this field
    if (errors[e.target.name]) {
      setErrors((prev) => ({ ...prev, [e.target.name]: [] }));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFoto(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setFotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      if (errors.foto) {
        setErrors((prev) => ({ ...prev, foto: [] }));
      }
    }
  };

  const togglePasswordVisibility = (field: keyof typeof visiblePasswords) => {
    setVisiblePasswords((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setError(null);

    if (formData.password !== formData.password_confirmation) {
      setErrors({ password_confirmation: ["Konfirmasi password tidak cocok."] });
      return;
    }

    setLoading(true);
    
    const submitData = new FormData();
    submitData.append("name", formData.name);
    submitData.append("email", formData.email);
    submitData.append("password", formData.password);
    submitData.append("password_confirmation", formData.password_confirmation);
    
    if (formData.no_telepon) submitData.append("no_telepon", formData.no_telepon);
    if (formData.alamat) submitData.append("alamat", formData.alamat);
    if (foto) submitData.append("foto", foto);

    try {
      await api.post("/api/admin/pengguna", submitData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      router.push("/admin/pengguna");
    } catch (err: any) {
      if (err.response?.data?.errors) {
        setErrors(err.response.data.errors);
      } else {
        setError(err.response?.data?.message || "Gagal menambahkan admin BPBD.");
      }
    } finally {
      setLoading(false);
    }
  };

  const inputClass = (field: keyof typeof formData | "foto") => `
    w-full px-4 py-2.5 rounded-xl border bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200 outline-none transition-all
    ${
      errors[field] && errors[field].length > 0
        ? "border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-200 dark:border-red-500/50 dark:focus:ring-red-500/20"
        : "border-gray-200 dark:border-gray-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
    }
  `;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <PageBreadcrumb pageTitle="Tambah Admin BPBD" className="mb-0" />
        <Link
          href="/admin/pengguna"
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-600 dark:text-gray-300 bg-white dark:bg-gray-800 border border-slate-200 dark:border-gray-700 rounded-lg hover:bg-slate-50 dark:hover:bg-gray-700 transition-colors"
        >
          <HiOutlineArrowLeft className="w-4 h-4" />
          Kembali
        </Link>
      </div>

      <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-white/[0.03] shadow-sm">
        <div className="p-6">
          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Foto Profil */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Foto Profil <span className="text-gray-400 font-normal">(Opsional)</span>
              </label>
              <div className="flex items-center gap-6">
                <div className="shrink-0">
                  {fotoPreview ? (
                    <img src={fotoPreview} alt="Preview" className="w-20 h-20 rounded-full object-cover border border-gray-200 dark:border-gray-700 shadow-sm" />
                  ) : (
                    <div className="w-20 h-20 rounded-full bg-gray-50 dark:bg-gray-800 border border-dashed border-gray-300 dark:border-gray-600 flex items-center justify-center">
                      <HiOutlinePhoto className="w-8 h-8 text-gray-400" />
                    </div>
                  )}
                </div>
                <div>
                  <input
                    type="file"
                    id="foto"
                    name="foto"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <label
                    htmlFor="foto"
                    className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors"
                  >
                    Pilih Foto
                  </label>
                  <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                    Format: JPG, PNG. Maksimal 5MB.
                  </p>
                  {errors.foto && errors.foto.length > 0 && (
                    <p className="text-xs text-red-500 mt-1">{errors.foto[0]}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Nama Lengkap */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Nama Lengkap <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className={inputClass("name")}
                placeholder="Masukkan nama lengkap"
              />
              {errors.name && errors.name.length > 0 && <p className="text-xs text-red-500 mt-1">{errors.name[0]}</p>}
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className={inputClass("email")}
                placeholder="Masukkan email"
              />
              {errors.email && errors.email.length > 0 && <p className="text-xs text-red-500 mt-1">{errors.email[0]}</p>}
            </div>

            {/* Nomor Telepon */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Nomor Telepon <span className="text-gray-400 font-normal">(Opsional)</span>
              </label>
              <input
                type="text"
                name="no_telepon"
                value={formData.no_telepon}
                onChange={handleChange}
                className={inputClass("no_telepon")}
                placeholder="Contoh: 08123456789"
              />
              {errors.no_telepon && errors.no_telepon.length > 0 && <p className="text-xs text-red-500 mt-1">{errors.no_telepon[0]}</p>}
            </div>

            {/* Alamat */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Alamat <span className="text-gray-400 font-normal">(Opsional)</span>
              </label>
              <textarea
                name="alamat"
                value={formData.alamat}
                onChange={handleChange}
                rows={3}
                className={inputClass("alamat")}
                placeholder="Masukkan alamat lengkap"
              />
              {errors.alamat && errors.alamat.length > 0 && <p className="text-xs text-red-500 mt-1">{errors.alamat[0]}</p>}
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={visiblePasswords.password ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  minLength={8}
                  className={`${inputClass("password")} pr-12`}
                  placeholder="Minimal 8 karakter"
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility("password")}
                  className="absolute inset-y-0 right-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  aria-label={visiblePasswords.password ? "Sembunyikan password" : "Tampilkan password"}
                >
                  {visiblePasswords.password ? (
                    <HiOutlineEyeSlash className="h-5 w-5" />
                  ) : (
                    <HiOutlineEye className="h-5 w-5" />
                  )}
                </button>
              </div>
              {errors.password && errors.password.length > 0 && <p className="text-xs text-red-500 mt-1">{errors.password[0]}</p>}
            </div>

            {/* Konfirmasi Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Konfirmasi Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={visiblePasswords.password_confirmation ? "text" : "password"}
                  name="password_confirmation"
                  value={formData.password_confirmation}
                  onChange={handleChange}
                  required
                  minLength={8}
                  className={`${inputClass("password_confirmation")} pr-12`}
                  placeholder="Ulangi password"
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility("password_confirmation")}
                  className="absolute inset-y-0 right-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  aria-label={visiblePasswords.password_confirmation ? "Sembunyikan konfirmasi password" : "Tampilkan konfirmasi password"}
                >
                  {visiblePasswords.password_confirmation ? (
                    <HiOutlineEyeSlash className="h-5 w-5" />
                  ) : (
                    <HiOutlineEye className="h-5 w-5" />
                  )}
                </button>
              </div>
              {errors.password_confirmation && errors.password_confirmation.length > 0 && <p className="text-xs text-red-500 mt-1">{errors.password_confirmation[0]}</p>}
            </div>

            {/* Submit Button */}
            <div className="md:col-span-2 pt-6 border-t border-gray-100 dark:border-gray-800 flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className="flex items-center gap-2 px-6 py-2.5 text-sm font-semibold text-white bg-blue-600 rounded-xl hover:bg-blue-700 disabled:opacity-50 transition-colors shadow-sm shadow-blue-200 dark:shadow-none"
              >
                <HiOutlineCheck className="w-5 h-5" />
                {loading ? "Menyimpan..." : "Simpan Admin"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
