"use client";

import React, { useEffect, useState } from "react";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import AdminBadge from "@/components/admin/ui/AdminBadge";
import Link from "next/link";
import { HiOutlineArrowLeft } from "react-icons/hi2";
import api from "@/lib/api";

interface FAQDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function FAQDetailPage({ params }: FAQDetailPageProps) {
  const unwrappedParams = React.use(params);
  const [faqData, setFaqData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFaq = async () => {
       try {
         const response = await api.get(`/api/faq/${unwrappedParams.id}`);
         if (response.data.success) {
           setFaqData(response.data.data);
         } else {
           setError("Data tidak ditemukan");
         }
       } catch (err) {
         setError("Gagal mengambil data");
       } finally {
         setLoading(false);
       }
    };
    fetchFaq();
  }, [unwrappedParams.id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !faqData) {
     return <div className="p-6 text-center text-red-500">{error || "Data tidak ditemukan"}</div>;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <PageBreadcrumb pageTitle="Detail FAQ" className="mb-0" />
        <div className="flex gap-3">
          <Link
            href="/admin/faq"
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
          >
            <HiOutlineArrowLeft className="w-4 h-4" />
            Kembali
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Konten Utama */}
        <div className="lg:col-span-2">
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-white/[0.03] h-full flex flex-col">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              {faqData.pertanyaan}
            </h1>
            
            <div className="flex-grow flex flex-col">
              <h3 className="text-sm font-semibold text-gray-500 mb-2 uppercase tracking-wider">Jawaban</h3>
              <div className="text-gray-800 dark:text-gray-200 leading-relaxed whitespace-pre-line bg-blue-50/50 dark:bg-blue-900/10 p-5 rounded-xl border border-blue-100 dark:border-blue-900/30 flex-grow">
                {faqData.jawaban}
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar Info */}
        <div className="space-y-6">
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-white/[0.03]">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 border-b border-gray-100 pb-3">
              Informasi FAQ
            </h3>
            
            <div className="space-y-4">
              <div>
                <span className="block text-xs font-medium text-gray-500 mb-1">Status</span>
                <AdminBadge variant={faqData.is_active ? 'success' : 'danger'} dot>
                  {faqData.is_active ? 'Aktif' : 'Tidak Aktif'}
                </AdminBadge>
              </div>

              <div>
                <span className="block text-xs font-medium text-gray-500 mb-1">Kategori</span>
                <span className="inline-flex px-2.5 py-1 rounded-md text-sm font-medium bg-blue-50 text-blue-700 border border-blue-100 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-300">
                  {faqData.kategori}
                </span>
              </div>

              <div>
                <span className="block text-xs font-medium text-gray-500 mb-1">Urutan Tampil</span>
                <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">{faqData.urutan}</p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-white/[0.03]">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 border-b border-gray-100 pb-3">
              Riwayat Pembaruan
            </h3>
            
            <div className="space-y-4">
              <div>
                <span className="block text-xs font-medium text-gray-500 mb-1">Dibuat Pada</span>
                <p className="text-sm text-gray-800 dark:text-gray-200">
                  {faqData.dibuat_pada ? `${new Date(faqData.dibuat_pada).toLocaleString('id-ID', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })} WIB` : '-'}
                </p>
              </div>

              <div>
                <span className="block text-xs font-medium text-gray-500 mb-1">Pembaruan Terakhir</span>
                <p className="text-sm text-gray-800 dark:text-gray-200">
                  {faqData.updated_at ? `${new Date(faqData.updated_at).toLocaleString('id-ID', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })} WIB` : '-'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
