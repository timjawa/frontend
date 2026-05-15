import React from "react";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import FAQForm from "@/components/form/FAQForm";
import Link from "next/link";
import { HiOutlineArrowLeft } from "react-icons/hi2";

export default function CreateFAQPage() {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <PageBreadcrumb pageTitle="Tambah FAQ" className="mb-0" />
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
          <h3 className="text-base font-semibold text-gray-900 dark:text-white">Form Tambah FAQ</h3>
          <p className="text-sm text-gray-500 mt-1">
            Tambahkan informasi pertanyaan umum terbaru.
          </p>
        </div>
        <div className="p-6">
          <FAQForm />
        </div>
      </div>
    </div>
  );
}
