"use client";

import React, { useEffect, useState } from "react";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import AdminBadge from "@/components/admin/ui/AdminBadge";
import Link from "next/link";
import { HiOutlineArrowLeft, HiOutlinePencil } from "react-icons/hi2";
import api from "@/lib/api";

export default function DetailBeritaPage({ params }: { params: Promise<{ id: string }> }) {
  const unwrappedParams = React.use(params);
  const id = unwrappedParams.id;
  const [berita, setBerita] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const STORAGE_URL = 'http://192.168.0.194:8000/storage/uploads/berita/';

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const res = await api.get(`/api/berita/${id}`);
        const resData = res.data;
        
        const data = resData.berita || resData.data || resData;

        // Helper untuk parse tags (bisa array atau string dipisah koma)
        let parsedTags: string[] = [];
        if (Array.isArray(data.tags)) {
          if (data.tags.length > 0 && typeof data.tags[0] === 'object') {
            parsedTags = data.tags.map((t: any) => t.tag);
          } else {
            parsedTags = data.tags;
          }
        } else if (typeof data.tags === 'string' && data.tags.trim() !== '') {
          parsedTags = data.tags.split(',').map((t: string) => t.trim());
        }

        // Helper untuk foto
        const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://192.168.0.194:8000';
        const coverImageUrl = data.foto_cover 
          ? (data.foto_cover.startsWith('http') 
              ? data.foto_cover 
              : (data.foto_cover.includes('/') 
                  ? `${backendUrl}/storage/${data.foto_cover.replace(/^\//, '')}`
                  : `${STORAGE_URL}${data.foto_cover}`))
          : "https://placehold.co/800x400/e2e8f0/1e293b?text=Tidak+Ada+Foto";

        // Map format backend Laravel ke format UI
        setBerita({
          id: data.id,
          title: data.judul,
          slug: data.slug,
          coverImage: coverImageUrl,
          content: data.konten,
          teaser: data.ringkasan || "-",
          tags: parsedTags,
          category: data.kategori || "Umum",
          status: data.status || "draft",
          source: data.sumber || "-",
          viewsCount: data.views_count || 0,
          author: data.user?.name || "Admin", // Asumsi backend pakai relasi user, jika tidak fallback ke Admin
          publishedAt: data.created_at ? new Date(data.created_at).toLocaleString('id-ID') : "-",
          updatedAt: data.updated_at ? new Date(data.updated_at).toLocaleString('id-ID') : "-",
        });
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchDetail();
  }, [id]);

  if (loading) {
    return (
      <div>
        <PageBreadcrumb pageTitle="Detail Berita" className="mb-0" />
        <p className="mt-4 px-5">Memuat detail berita...</p>
      </div>
    );
  }

  if (!berita) {
    return (
      <div>
        <PageBreadcrumb pageTitle="Detail Berita" className="mb-0" />
        <p className="mt-4 px-5 text-rose-500">Berita tidak ditemukan.</p>
        <Link href="/admin/berita" className="mt-4 inline-block px-5 text-blue-600 hover:underline">
          Kembali ke daftar berita
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <PageBreadcrumb pageTitle="Detail Berita" className="mb-0" />
        <div className="flex gap-3">
          <Link
            href="/admin/berita"
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
          >
            <HiOutlineArrowLeft className="w-4 h-4" />
            Kembali
          </Link>
          <Link
            href={`/admin/berita/${id}/edit`}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
          >
            <HiOutlinePencil className="w-4 h-4" />
            Edit Berita
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Konten Utama */}
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-white/[0.03]">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              {berita.title}
            </h1>
            
            <div className="mb-6 rounded-xl overflow-hidden border border-gray-200">
              <img
                src={berita.coverImage}
                alt={berita.title}
                className="w-full h-auto object-cover max-h-[400px]"
              />
            </div>

            <div className="mb-6">
              <h3 className="text-sm font-semibold text-gray-500 mb-2 uppercase tracking-wider">Ringkasan (Teaser)</h3>
              <p className="text-gray-700 dark:text-gray-300 italic border-l-4 border-blue-500 pl-4 py-1">
                {berita.teaser}
              </p>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-gray-500 mb-2 uppercase tracking-wider">Isi Berita</h3>
              <div className="text-gray-800 dark:text-gray-200 leading-relaxed whitespace-pre-line">
                {berita.content}
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar Info */}
        <div className="space-y-6">
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-white/[0.03]">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 border-b border-gray-100 pb-3">
              Informasi Berita
            </h3>
            
            <div className="space-y-4">
              <div>
                <span className="block text-xs font-medium text-gray-500 mb-1">Status</span>
                <AdminBadge 
                  variant={
                    berita.status === 'published' ? 'success' : 
                    berita.status === 'archived' ? 'info' : 'default'
                  } 
                  dot
                >
                  {berita.status}
                </AdminBadge>
              </div>

              <div>
                <span className="block text-xs font-medium text-gray-500 mb-1">Kategori</span>
                <span className="inline-flex px-2.5 py-1 rounded-md text-sm font-medium bg-blue-50 text-blue-700 border border-blue-100">
                  {berita.category}
                </span>
              </div>

              <div>
                <span className="block text-xs font-medium text-gray-500 mb-1">Tags</span>
                <div className="flex flex-wrap gap-2">
                  {berita.tags.length > 0 ? berita.tags.map((tag: string, idx: number) => (
                    <span key={idx} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                      #{tag}
                    </span>
                  )) : (
                    <span className="text-sm text-gray-400">-</span>
                  )}
                </div>
              </div>

              <div>
                <span className="block text-xs font-medium text-gray-500 mb-1">Slug</span>
                <p className="text-sm text-gray-800 dark:text-gray-200 break-all">{berita.slug}</p>
              </div>

              <div>
                <span className="block text-xs font-medium text-gray-500 mb-1">Sumber Berita</span>
                <p className="text-sm text-gray-800 dark:text-gray-200">{berita.source}</p>
              </div>
              
              <div>
                <span className="block text-xs font-medium text-gray-500 mb-1">Jumlah Views</span>
                <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">{berita.viewsCount} kali</p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-white/[0.03]">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 border-b border-gray-100 pb-3">
              Riwayat Publikasi
            </h3>
            
            <div className="space-y-4">
              <div>
                <span className="block text-xs font-medium text-gray-500 mb-1">Dibuat Oleh</span>
                <p className="text-sm text-gray-800 dark:text-gray-200 font-medium">{berita.author}</p>
              </div>

              <div>
                <span className="block text-xs font-medium text-gray-500 mb-1">Waktu Publikasi</span>
                <p className="text-sm text-gray-800 dark:text-gray-200">{berita.publishedAt}</p>
              </div>

              <div>
                <span className="block text-xs font-medium text-gray-500 mb-1">Pembaruan Terakhir</span>
                <p className="text-sm text-gray-800 dark:text-gray-200">{berita.updatedAt}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
