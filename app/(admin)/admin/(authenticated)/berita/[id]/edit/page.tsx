"use client";

import React, { useEffect, useState } from "react";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import BeritaForm from "@/components/form/BeritaForm";
import api, { getImageUrl } from "@/lib/api";
import Link from "next/link";
import { HiOutlineArrowLeft, HiOutlineExclamationTriangle } from "react-icons/hi2";

export default function EditBeritaPage({ params }: { params: Promise<{ id: string }> }) {
  const unwrappedParams = React.use(params);
  const id = unwrappedParams.id;
  const [initialData, setInitialData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchBerita = async () => {
      try {
        const res = await api.get(`/api/berita/${id}`);
        const resData = res.data;
        
        // Sesuaikan dengan struktur JSON dari backend (biasanya di dalam "berita")
        const data = resData.berita || resData.data || resData;

        // Parse tags dari array of objects menjadi comma-separated string
        let tagsString = "";
        if (Array.isArray(data.tags)) {
          if (data.tags.length > 0 && typeof data.tags[0] === 'object') {
            tagsString = data.tags.map((t: any) => t.tag).join(', ');
          } else {
            tagsString = data.tags.join(', ');
          }
        } else if (typeof data.tags === 'string') {
          tagsString = data.tags;
        }

        // Helper untuk foto (preview) menggunakan getImageUrl
        const coverImageUrl = data.foto_cover ? getImageUrl(data.foto_cover, 'uploads/berita/') : null;

        // Map field dari backend ke field yang dibutuhkan BeritaForm
        setInitialData({
          id: data.id,
          title: data.judul,
          slug: data.slug,
          category: data.kategori,
          teaser: data.ringkasan,
          content: data.konten,
          coverImage: coverImageUrl,
          source: data.sumber,
          tags: tagsString,
          status: data.status,
        });
      } catch (err) {
        console.error(err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchBerita();
  }, [id]);

  if (loading) {
    return (
      <div>
        <div className="flex items-center justify-between mb-6 animate-pulse">
          <PageBreadcrumb pageTitle="Edit Berita" className="mb-0" />
          <div className="w-24 h-10 bg-gray-200 dark:bg-gray-800 rounded-lg" />
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-white/[0.03] animate-pulse">
          <div className="px-6 py-5 border-b border-gray-100 dark:border-gray-800 space-y-2">
            <div className="h-5 bg-gray-200 dark:bg-gray-800 rounded w-1/4" />
            <div className="h-3 bg-gray-200 dark:bg-gray-800 rounded w-1/3" />
          </div>
          <div className="p-6 space-y-6">
            <div className="space-y-2">
              <div className="h-3 bg-gray-200 dark:bg-gray-800 rounded w-20" />
              <div className="h-10 bg-gray-200 dark:bg-gray-800 rounded-lg w-full" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="h-3 bg-gray-200 dark:bg-gray-800 rounded w-16" />
                <div className="h-10 bg-gray-200 dark:bg-gray-800 rounded-lg w-full" />
              </div>
              <div className="space-y-2">
                <div className="h-3 bg-gray-200 dark:bg-gray-800 rounded w-16" />
                <div className="h-10 bg-gray-200 dark:bg-gray-800 rounded-lg w-full" />
              </div>
            </div>
            <div className="space-y-2">
              <div className="h-3 bg-gray-200 dark:bg-gray-800 rounded w-24" />
              <div className="h-20 bg-gray-200 dark:bg-gray-800 rounded-lg w-full" />
            </div>
            <div className="space-y-2">
              <div className="h-3 bg-gray-200 dark:bg-gray-800 rounded w-20" />
              <div className="h-40 bg-gray-200 dark:bg-gray-800 rounded-lg w-full" />
            </div>
            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-800">
              <div className="w-24 h-10 bg-gray-200 dark:bg-gray-800 rounded-lg" />
              <div className="w-28 h-10 bg-gray-200 dark:bg-gray-800 rounded-lg" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <div className="flex items-center justify-between mb-6">
          <PageBreadcrumb pageTitle="Edit Berita" className="mb-0" />
          <Link
            href="/admin/berita"
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
          >
            <HiOutlineArrowLeft className="w-4 h-4" />
            Kembali
          </Link>
        </div>
        <div className="mt-6 p-4 rounded-xl bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900 text-red-600 text-sm flex items-center gap-3">
          <HiOutlineExclamationTriangle className="w-5 h-5 shrink-0 text-red-500" />
          <span>Gagal memuat data berita. Silakan coba beberapa saat lagi.</span>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <PageBreadcrumb pageTitle="Edit Berita" className="mb-0" />
        <Link
          href="/admin/berita"
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
        >
          <HiOutlineArrowLeft className="w-4 h-4" />
          Kembali
        </Link>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-white/[0.03]">
        <div className="px-6 py-5 border-b border-gray-100 dark:border-gray-800">
          <h3 className="text-base font-semibold text-gray-900 dark:text-white">Form Edit Berita</h3>
          <p className="text-sm text-gray-500 mt-1">
            Perbarui informasi artikel berita (ID: {id}).
          </p>
        </div>
        <div className="p-6">
          {initialData && (
            <BeritaForm isEdit={true} initialData={initialData} />
          )}
        </div>
      </div>
    </div>
  );
}
