"use client";

import React, { useEffect, useState } from "react";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import BeritaForm from "@/components/form/BeritaForm";
import api from "@/lib/api";

export default function EditBeritaPage({ params }: { params: Promise<{ id: string }> }) {
  const unwrappedParams = React.use(params);
  const id = unwrappedParams.id;
  const [initialData, setInitialData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const STORAGE_URL = 'http://192.168.0.194:8000/storage/uploads/berita/';

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

        // Helper untuk foto (preview)
        const coverImageUrl = data.foto_cover 
          ? (data.foto_cover.startsWith('http') 
              ? data.foto_cover 
              : (data.foto_cover.includes('/') 
                  ? `http://localhost:8000/storage/${data.foto_cover.replace(/^\//, '')}`
                  : `${STORAGE_URL}${data.foto_cover}`))
          : null;

        // Map field dari backend ke field yang dibutuhkan BeritaForm
        setInitialData({
          id: data.id,
          title: data.judul,
          slug: data.slug,
          category: data.kategori,
          teaser: data.teaser,
          content: data.isi,
          coverImage: coverImageUrl,
          source: data.sumber,
          tags: tagsString,
          status: data.status,
        });
      } catch (err) {
        console.error(err);
        alert("Gagal memuat data berita.");
      } finally {
        setLoading(false);
      }
    };

    fetchBerita();
  }, [id]);

  if (loading) {
    return (
      <div>
        <PageBreadcrumb pageTitle="Edit Berita" className="mb-0" />
        <p className="mt-4 px-5">Memuat data berita...</p>
      </div>
    );
  }

  return (
    <div>
      <PageBreadcrumb pageTitle="Edit Berita" className="mb-0" />
      <div className="rounded-2xl border border-gray-200 bg-white px-5 py-7 dark:border-gray-800 dark:bg-white/[0.03] xl:px-10 xl:py-12">
        <div className="mx-auto w-full max-w-4xl">
          <h3 className="mb-6 text-2xl font-semibold text-gray-800 dark:text-white/90 sm:text-3xl">
            Form Edit Berita
          </h3>
          <p className="text-sm text-gray-500 mb-6 -mt-4">
            Perbarui informasi artikel berita (ID: {id}).
          </p>
          {initialData && (
            <BeritaForm isEdit={true} initialData={initialData} />
          )}
        </div>
      </div>
    </div>
  );
}
