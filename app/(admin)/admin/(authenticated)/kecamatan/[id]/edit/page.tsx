"use client";

import React, { useState, useEffect } from "react";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import Link from "next/link";
import { HiOutlineArrowLeft, HiOutlineCheck } from "react-icons/hi2";
import { useRouter } from "next/navigation";

export default function EditKecamatanPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  
  // Initialize with mock data to simulate an edit
  const [formData, setFormData] = useState({
    nama: "Gumukmas",
    kode_wilayah: "35.09.04.2001",
    latitude: "-8.3000",
    longitude: "113.4500",
    elevasi: "10",
    level_rawan: "tinggi",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Form Data Updated:", formData);
    // TODO: Connect to backend API PUT request
    router.push("/admin/kecamatan");
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <PageBreadcrumb pageTitle="Edit Kecamatan" className="mb-0" />
        <Link
          href="/admin/kecamatan"
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
        >
          <HiOutlineArrowLeft className="w-4 h-4" />
          Kembali
        </Link>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-white/[0.03]">
        <div className="px-6 py-5 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">
          <div>
            <h3 className="text-base font-semibold text-gray-900 dark:text-white">
              Form Edit Kecamatan
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              Perbarui informasi wilayah kecamatan (ID: {params.id}).
            </p>
          </div>
        </div>

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
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all dark:bg-gray-800/50 dark:border-gray-700 dark:text-white"
              />
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
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all dark:bg-gray-800/50 dark:border-gray-700 dark:text-white"
              />
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
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all dark:bg-gray-800/50 dark:border-gray-700 dark:text-white"
              />
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
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all dark:bg-gray-800/50 dark:border-gray-700 dark:text-white"
              />
            </div>

            {/* Elevasi */}
            <div className="space-y-2">
              <label htmlFor="elevasi" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Elevasi (mdpl) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                id="elevasi"
                name="elevasi"
                value={formData.elevasi}
                onChange={handleChange}
                required
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all dark:bg-gray-800/50 dark:border-gray-700 dark:text-white"
              />
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
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all dark:bg-gray-800/50 dark:border-gray-700 dark:text-white appearance-none"
              >
                <option value="rendah">Rendah (Hijau)</option>
                <option value="sedang">Sedang (Kuning)</option>
                <option value="tinggi">Tinggi (Merah)</option>
              </select>
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
              className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-blue-600 rounded-xl hover:bg-blue-700 active:scale-95 transition-all shadow-sm shadow-blue-200"
            >
              <HiOutlineCheck className="w-4 h-4" />
              Perbarui Data
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
