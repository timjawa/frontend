import React from "react";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import BeritaForm from "@/components/form/BeritaForm";

export default function CreateBeritaPage() {
  return (
    <div>
      <PageBreadcrumb pageTitle="Tambah Berita" className="mb-0" />
      <div className="rounded-2xl border border-gray-200 bg-white px-5 py-7 dark:border-gray-800 dark:bg-white/[0.03] xl:px-10 xl:py-12">
        <div className="mx-auto w-full max-w-4xl">
          <h3 className="mb-6 text-2xl font-semibold text-gray-800 dark:text-white/90 sm:text-3xl">
            Form Tambah Berita
          </h3>
          <BeritaForm />
        </div>
      </div>
    </div>
  );
}
