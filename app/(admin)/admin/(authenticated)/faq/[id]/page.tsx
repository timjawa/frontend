import React from "react";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import AdminBadge from "@/components/admin/ui/AdminBadge";
import Link from "next/link";
import { HiOutlineArrowLeft, HiOutlinePencil } from "react-icons/hi2";

interface FAQDetailPageProps {
  params: {
    id: string;
  };
}

export default function FAQDetailPage({ params }: FAQDetailPageProps) {
  // Mock data - dalam implementasi nyata, data akan diambil dari API
  const faqData = {
    id: params.id,
    question: "Bagaimana cara melaporkan keadaan darurat?",
    answer: "Untuk melaporkan keadaan darurat, Anda dapat menghubungi call center 24 jam kami di nomor 112 atau menggunakan aplikasi mobile yang tersedia. Pastikan untuk menyertakan informasi lengkap seperti lokasi, jenis keadaan darurat, dan kontak yang dapat dihubungi. Tim kami akan merespon secepat mungkin sesuai dengan tingkat urgensi yang dilaporkan.",
    category: "Umum",
    order: 1,
    isActive: true,
    createdAt: "23 April 2024 10:30 WIB",
    updatedAt: "23 April 2024 10:30 WIB"
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <PageBreadcrumb pageTitle="Detail FAQ" />
        <div className="flex gap-3">
          <Link
            href="/admin/faq"
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
          >
            <HiOutlineArrowLeft className="w-4 h-4" />
            Kembali
          </Link>
          <Link
            href={`/admin/faq/${params.id}/edit`}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
          >
            <HiOutlinePencil className="w-4 h-4" />
            Edit FAQ
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Konten Utama */}
        <div className="lg:col-span-2">
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-white/[0.03] h-full flex flex-col">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              {faqData.question}
            </h1>
            
            <div className="flex-grow flex flex-col">
              <h3 className="text-sm font-semibold text-gray-500 mb-2 uppercase tracking-wider">Jawaban</h3>
              <div className="text-gray-800 dark:text-gray-200 leading-relaxed whitespace-pre-line bg-blue-50/50 dark:bg-blue-900/10 p-5 rounded-xl border border-blue-100 dark:border-blue-900/30 flex-grow">
                {faqData.answer}
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
                <AdminBadge variant={faqData.isActive ? 'success' : 'danger'} dot>
                  {faqData.isActive ? 'Aktif' : 'Tidak Aktif'}
                </AdminBadge>
              </div>

              <div>
                <span className="block text-xs font-medium text-gray-500 mb-1">Kategori</span>
                <span className="inline-flex px-2.5 py-1 rounded-md text-sm font-medium bg-blue-50 text-blue-700 border border-blue-100 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-300">
                  {faqData.category}
                </span>
              </div>

              <div>
                <span className="block text-xs font-medium text-gray-500 mb-1">Urutan Tampil</span>
                <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">{faqData.order}</p>
              </div>

              <div>
                <span className="block text-xs font-medium text-gray-500 mb-1">ID FAQ</span>
                <p className="text-sm text-gray-800 dark:text-gray-200 break-all">#{faqData.id}</p>
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
                <p className="text-sm text-gray-800 dark:text-gray-200">{faqData.createdAt}</p>
              </div>

              <div>
                <span className="block text-xs font-medium text-gray-500 mb-1">Pembaruan Terakhir</span>
                <p className="text-sm text-gray-800 dark:text-gray-200">{faqData.updatedAt}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
