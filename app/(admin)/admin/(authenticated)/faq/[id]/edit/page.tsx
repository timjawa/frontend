import React from "react";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import FAQForm from "@/components/form/FAQForm";

export default function EditFAQPage({ params }: { params: { id: string } }) {
  // Dummy data
  const dummyFAQ = {
    question: "Bagaimana cara melaporkan keadaan darurat?",
    answer: "Anda dapat melaporkan keadaan darurat melalui fitur 'Pengaduan' di aplikasi ini atau menghubungi call center 112 secara langsung.",
    category: "bantuan",
    order: 1,
    isActive: true
  };

  return (
    <div>
      <PageBreadcrumb pageTitle="Edit FAQ" className="mb-0" />
      <div className="rounded-2xl border border-gray-200 bg-white px-5 py-7 dark:border-gray-800 dark:bg-white/[0.03] xl:px-10 xl:py-12">
        <div className="mx-auto w-full max-w-4xl">
          <h3 className="mb-6 text-2xl font-semibold text-gray-800 dark:text-white/90 sm:text-3xl">
            Form Edit FAQ
          </h3>
          <p className="text-sm text-gray-500 mb-6 -mt-4">
            Perbarui informasi pertanyaan umum (ID: {params.id}).
          </p>
          <FAQForm isEdit={true} initialData={dummyFAQ} />
        </div>
      </div>
    </div>
  );
}
