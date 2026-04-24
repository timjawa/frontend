import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "Blank Page | Jember Siaga Admin",
  description: "Halaman kosong untuk pengembangan fitur baru",
};

export default function BlankPage() {
  return (
    <div>
      <PageBreadcrumb pageTitle="Blank Page" />
      <div className="min-h-screen rounded-2xl border border-gray-200 bg-white px-5 py-7 dark:border-gray-800 dark:bg-white/[0.03] xl:px-10 xl:py-12">
        <div className="mx-auto w-full max-w-[630px] text-center">
          <h3 className="mb-4 font-semibold text-gray-800 text-theme-xl dark:text-white/90 sm:text-2xl">
            Halaman Kosong
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 sm:text-base">
            Mulai tambahkan konten ke dalam grid atau panel. Anda bisa
            menggunakan berbagai kombinasi grid dan komponen yang tersedia.
          </p>
        </div>
      </div>
    </div>
  );
}
