"use client";

import React, { useState, useEffect, useRef } from "react";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import api from "@/lib/api";
import type { AxiosError } from "axios";
import {
  HiOutlineCamera,
  HiOutlineUser,
  HiOutlineLockClosed,
  HiOutlineEnvelope,
  HiOutlinePhone,
  HiOutlineMapPin,
  HiOutlineEye,
  HiOutlineEyeSlash,
} from "react-icons/hi2";
import { useAuth } from "@/context/AuthContext";

export default function ProfilePage() {
  const { user, checkAuth } = useAuth();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    no_telepon: "",
    alamat: "",
    old_password: "",
    password: "",
    password_confirmation: "",
  });
  const [visiblePasswords, setVisiblePasswords] = useState({
    old_password: false,
    password: false,
    password_confirmation: false,
  });

  const [fotoPreview, setFotoPreview] = useState<string | null>(null);
  const [fotoFile, setFotoFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        name: user.name || "",
        email: user.email || "",
        no_telepon: user.no_telepon || "",
        alamat: user.alamat || "",
      }));
      if (user.foto_url) {
        setFotoPreview(user.foto_url);
      }
    }
  }, [user]);

  // Auto-hide notification after 3 seconds
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => {
        setMessage(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const togglePasswordVisibility = (field: keyof typeof visiblePasswords) => {
    setVisiblePasswords((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setFotoFile(file);
      setFotoPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const formPayload = new FormData();
      formPayload.append("_method", "PUT");
      formPayload.append("name", formData.name);
      formPayload.append("email", formData.email);
      if (formData.no_telepon) formPayload.append("no_telepon", formData.no_telepon);
      if (formData.alamat) formPayload.append("alamat", formData.alamat);

      if (formData.password) {
        formPayload.append("old_password", formData.old_password);
        formPayload.append("password", formData.password);
        formPayload.append("password_confirmation", formData.password_confirmation);
      }

      if (fotoFile) {
        formPayload.append("foto", fotoFile);
      }

      await api.post("/api/user", formPayload, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      setMessage({ type: "success", text: "Profil berhasil diperbarui!" });
      window.scrollTo({ top: 0, behavior: "smooth" });
      
      // Refresh user context data
      await checkAuth();
      
      // Clear password fields after success
      setFormData((prev) => ({
        ...prev,
        old_password: "",
        password: "",
        password_confirmation: "",
      }));

    } catch (err: unknown) {
      console.error(err);
      const error = err as AxiosError<{ message?: string }>;
      const errorMsg = error.response?.data?.message || "Terjadi kesalahan saat memperbarui profil";
      setMessage({ type: "error", text: errorMsg });
      window.scrollTo({ top: 0, behavior: "smooth" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <PageBreadcrumb pageTitle="Profil Saya" />

      <div className="max-w-4xl mx-auto mt-6 mb-12">
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden">
          <div className="p-6 sm:p-8">
            <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-6">Informasi Akun</h2>

            {message && (
              <div className={`p-4 mb-6 rounded-xl border ${message.type === 'success' ? 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/20 text-emerald-700 dark:text-emerald-400' : 'bg-red-50 dark:bg-red-500/10 border-red-200 dark:border-red-500/20 text-red-700 dark:text-red-400'}`}>
                {message.text}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Photo Upload Section */}
              <div className="flex flex-col sm:flex-row items-center gap-6 pb-6 border-b border-gray-100 dark:border-gray-800">
                <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                  <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-100 dark:bg-gray-800 border-4 border-white dark:border-gray-900 shadow-md flex items-center justify-center">
                    {fotoPreview ? (
                      <img src={fotoPreview} alt="Profile Preview" className="w-full h-full object-cover" />
                    ) : (
                      <HiOutlineUser className="w-10 h-10 text-gray-400 dark:text-gray-500" />
                    )}
                  </div>
                  <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <HiOutlineCamera className="w-6 h-6 text-white" />
                  </div>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept="image/*"
                    className="hidden"
                  />
                </div>
                <div className="text-center sm:text-left">
                  <h3 className="font-semibold text-gray-800 dark:text-gray-200">Foto Profil</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">JPG, JPEG atau PNG. Maksimal 2MB.</p>
                  <button 
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="mt-3 px-4 py-1.5 text-sm font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/10 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-500/20 transition-colors"
                  >
                    Ganti Foto
                  </button>
                </div>
              </div>

              <div className="flex flex-col gap-8">
                {/* Basic Info */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-2">
                    <HiOutlineUser className="w-5 h-5 text-blue-500" />
                    Data Pribadi
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Nama Lengkap</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <HiOutlineUser className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          required
                          className="pl-10 w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900/30 transition-all dark:text-gray-200"
                          placeholder="Masukkan nama lengkap"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Email</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <HiOutlineEnvelope className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          required
                          disabled
                          readOnly
                          className="pl-10 w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 px-4 py-2.5 text-sm outline-none text-gray-500 dark:text-gray-400 cursor-not-allowed"
                          placeholder="contoh@email.com"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Nomor Telepon</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <HiOutlinePhone className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          type="text"
                          name="no_telepon"
                          value={formData.no_telepon}
                          onChange={handleChange}
                          className="pl-10 w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900/30 transition-all dark:text-gray-200"
                          placeholder="Masukkan nomor telepon"
                        />
                      </div>
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Alamat</label>
                      <div className="relative">
                        <div className="absolute top-3 left-3 pointer-events-none">
                          <HiOutlineMapPin className="h-5 w-5 text-gray-400" />
                        </div>
                        <textarea
                          name="alamat"
                          value={formData.alamat}
                          onChange={handleChange}
                          rows={3}
                          className="pl-10 w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900/30 transition-all dark:text-gray-200"
                          placeholder="Masukkan alamat domisili"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="border-t border-gray-100 dark:border-gray-800 pt-6"></div>

                {/* Password Section */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-2">
                    <HiOutlineLockClosed className="w-5 h-5 text-blue-500" />
                    Keamanan
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 pb-2">
                    Kosongkan jika Anda tidak ingin mengubah password.
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Password Lama</label>
                      <div className="relative">
                        <input
                          type={visiblePasswords.old_password ? "text" : "password"}
                          name="old_password"
                          value={formData.old_password}
                          onChange={handleChange}
                          className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-2.5 pr-12 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900/30 transition-all dark:text-gray-200"
                          placeholder="Masukkan password lama"
                        />
                        <button
                          type="button"
                          onClick={() => togglePasswordVisibility("old_password")}
                          className="absolute inset-y-0 right-0 flex w-12 items-center justify-center text-gray-400 transition-colors hover:text-gray-600 dark:hover:text-gray-300"
                          aria-label={visiblePasswords.old_password ? "Sembunyikan password lama" : "Tampilkan password lama"}
                        >
                          {visiblePasswords.old_password ? (
                            <HiOutlineEyeSlash className="h-5 w-5" />
                          ) : (
                            <HiOutlineEye className="h-5 w-5" />
                          )}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Password Baru</label>
                      <div className="relative">
                        <input
                          type={visiblePasswords.password ? "text" : "password"}
                          name="password"
                          value={formData.password}
                          onChange={handleChange}
                          className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-2.5 pr-12 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900/30 transition-all dark:text-gray-200"
                          placeholder="Masukkan password baru"
                        />
                        <button
                          type="button"
                          onClick={() => togglePasswordVisibility("password")}
                          className="absolute inset-y-0 right-0 flex w-12 items-center justify-center text-gray-400 transition-colors hover:text-gray-600 dark:hover:text-gray-300"
                          aria-label={visiblePasswords.password ? "Sembunyikan password baru" : "Tampilkan password baru"}
                        >
                          {visiblePasswords.password ? (
                            <HiOutlineEyeSlash className="h-5 w-5" />
                          ) : (
                            <HiOutlineEye className="h-5 w-5" />
                          )}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Konfirmasi Password Baru</label>
                      <div className="relative">
                        <input
                          type={visiblePasswords.password_confirmation ? "text" : "password"}
                          name="password_confirmation"
                          value={formData.password_confirmation}
                          onChange={handleChange}
                          className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-2.5 pr-12 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900/30 transition-all dark:text-gray-200"
                          placeholder="Ketik ulang password baru"
                        />
                        <button
                          type="button"
                          onClick={() => togglePasswordVisibility("password_confirmation")}
                          className="absolute inset-y-0 right-0 flex w-12 items-center justify-center text-gray-400 transition-colors hover:text-gray-600 dark:hover:text-gray-300"
                          aria-label={visiblePasswords.password_confirmation ? "Sembunyikan konfirmasi password baru" : "Tampilkan konfirmasi password baru"}
                        >
                          {visiblePasswords.password_confirmation ? (
                            <HiOutlineEyeSlash className="h-5 w-5" />
                          ) : (
                            <HiOutlineEye className="h-5 w-5" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-6 mt-6 border-t border-gray-100 dark:border-gray-800 flex justify-end">
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2.5 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 active:scale-95 transition-all disabled:opacity-70 disabled:cursor-not-allowed shadow-sm shadow-blue-200 dark:shadow-none"
                >
                  {loading ? "Menyimpan..." : "Simpan Perubahan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
