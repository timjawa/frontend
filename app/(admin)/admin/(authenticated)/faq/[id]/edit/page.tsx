"use client";

import React, { useEffect, useState, use } from "react";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import FAQForm from "@/components/form/FAQForm";
import api from "@/lib/api";

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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div>
      <PageBreadcrumb pageTitle="Edit FAQ" className="mb-0" />
      <div className="rounded-2xl border border-gray-200 bg-white px-5 py-7 dark:border-gray-800 dark:bg-white/[0.03] xl:px-10 xl:py-12">
        <div className="mx-auto w-full max-w-4xl">
          <h3 className="mb-6 text-2xl font-semibold text-gray-800 dark:text-white/90 sm:text-3xl">
            Form Edit FAQ
          </h3>
          {error ? (
             <div className="p-4 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm mb-6">
                {error}
             </div>
          ) : (
            <>
              <p className="text-sm text-gray-500 mb-6 -mt-4">
                Perbarui informasi pertanyaan umum (ID: {id}).
              </p>
              <FAQForm isEdit={true} initialData={initialData} id={id} />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
