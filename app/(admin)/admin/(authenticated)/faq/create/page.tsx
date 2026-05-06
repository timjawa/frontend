import React from "react";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import FAQForm from "@/components/form/FAQForm";

export default function CreateFAQPage() {
  return (
    <div>
      <PageBreadcrumb pageTitle="Tambah FAQ" className="mb-0" />
      <div className="rounded-2xl border border-gray-200 bg-white px-5 py-7 dark:border-gray-800 dark:bg-white/[0.03] xl:px-10 xl:py-12">
        <div className="mx-auto w-full max-w-4xl">
          <h3 className="mb-6 text-2xl font-semibold text-gray-800 dark:text-white/90 sm:text-3xl">
            Form Tambah FAQ
          </h3>
          <FAQForm />
        </div>
      </div>
    </div>
  );
}
