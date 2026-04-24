import React from "react";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";

export default function BeritaPage() {
  return (
    <div>
      <PageBreadcrumb pageTitle="Manajemen Berita" />
      <div className="min-h-screen rounded-2xl border border-gray-200 bg-white px-5 py-7 dark:border-gray-800 dark:bg-white/[0.03] xl:px-10 xl:py-12">
        <div className="mx-auto w-full max-w-[630px] text-center">
          <h3 className="mb-4 text-2xl font-semibold text-gray-800 dark:text-white/90 sm:text-3xl">
            Daftar Berita
          </h3>
          <p className="mb-6 text-sm text-gray-500 dark:text-gray-400">
            Halaman ini digunakan untuk mengelola berita.
          </p>
        </div>
      </div>
    </div>
  );
}
