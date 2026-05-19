"use client";

import React, { useEffect, useState, use } from "react";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import FAQForm from "@/components/form/FAQForm";
import api from "@/lib/api";
import Link from "next/link";
import { HiOutlineArrowLeft } from "react-icons/hi2";

export default function EditFAQPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [initialData, setInitialData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFaq = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/api/faq/${id}`);
        if (response.data.success) {
          setInitialData(response.data.data);
        } else {
          setError("Gagal memuat data FAQ");
        }
      } catch (err) {
        console.error("Error fetching FAQ:", err);
        setError("Terjadi kesalahan saat memuat data");
      } finally {
        setLoading(false);
      }
    };

    fetchFaq();
  }, [id]);

  
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <PageBreadcrumb pageTitle="Edit FAQ" className="mb-0" />
        <Link
          href="/admin/faq"
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
        >
          <HiOutlineArrowLeft className="w-4 h-4" />
          Kembali
        </Link>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-white/[0.03]">
        <div className="px-6 py-5 border-b border-gray-100 dark:border-gray-800">
          <h3 className="text-base font-semibold text-gray-900 dark:text-white">Form Edit FAQ</h3>
          <p className="text-sm text-gray-500 mt-1">
            Perbarui informasi pertanyaan umum (ID: {id}).
          </p>
        </div>
        <div className="p-6">
          {loading ? (
             <div className="space-y-6 animate-pulse">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   <div className="space-y-2">
                      <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-1/4"></div>
                      <div className="h-11 bg-gray-200 dark:bg-gray-800 rounded-xl w-full"></div>
                   </div>
                   <div className="space-y-2">
                      <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-1/4"></div>
                      <div className="h-11 bg-gray-200 dark:bg-gray-800 rounded-xl w-full"></div>
                   </div>
                   <div className="md:col-span-2 space-y-2">
                      <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-1/5"></div>
                      <div className="h-6 bg-gray-200 dark:bg-gray-800 rounded-full w-12"></div>
                   </div>
                   <div className="md:col-span-2 space-y-2">
                      <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-1/4"></div>
                      <div className="h-11 bg-gray-200 dark:bg-gray-800 rounded-xl w-full"></div>
                   </div>
                   <div className="md:col-span-2 space-y-2">
                      <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-1/5"></div>
                      <div className="h-32 bg-gray-200 dark:bg-gray-800 rounded-xl w-full"></div>
                   </div>
                </div>
                <div className="mt-8 flex justify-end gap-3 pt-6 border-t border-gray-100 dark:border-gray-800">
                   <div className="h-10 bg-gray-200 dark:bg-gray-800 rounded-xl w-24"></div>
                   <div className="h-10 bg-gray-200 dark:bg-gray-800 rounded-xl w-32"></div>
                </div>
             </div>
          ) : error ? (
             <div className="p-4 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm mb-6">
                {error}
             </div>
          ) : (
            <FAQForm isEdit={true} initialData={initialData} id={id} />
          )}
        </div>
      </div>
    </div>
  );
}
