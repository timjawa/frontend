import React from "react";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import AdminBadge from "@/components/admin/ui/AdminBadge";
import Link from "next/link";
import { HiOutlineArrowLeft, HiOutlinePencil } from "react-icons/hi2";

export default function DetailBeritaPage({ params }: { params: { id: string } }) {
  // Dummy data
  const berita = {
    id: params.id,
    title: "Banjir Bandang di Desa Kalibaru, Ratusan Rumah Terendam Air",
    slug: "banjir-bandang-di-desa-kalibaru-ratusan-rumah-terendam-air",
    coverImage: "https://placehold.co/800x400/e2e8f0/1e293b?text=Foto+Banjir",
    content: `
      Banjir bandang melanda Desa Kalibaru setelah hujan deras mengguyur wilayah tersebut selama lebih dari 8 jam tanpa henti. Ratusan rumah dilaporkan terendam banjir dengan ketinggian air bervariasi antara 50 sentimeter hingga 1,5 meter.
      
      Tim gabungan dari BPBD, SAR, dan relawan setempat saat ini sedang berupaya melakukan evakuasi terhadap warga yang terjebak di rumah mereka. Beberapa perahu karet telah diturunkan untuk menjangkau area-area yang sulit diakses.

      Pemerintah daerah telah menyiapkan beberapa titik pengungsian dan posko dapur umum. Masyarakat diimbau untuk tetap waspada mengingat potensi hujan susulan yang masih tinggi dalam beberapa hari ke depan menurut prakiraan BMKG.
    `,
    teaser: "Hujan deras selama 8 jam memicu banjir bandang di Desa Kalibaru, menyebabkan ratusan rumah terendam dan warga harus dievakuasi.",
    tags: ["Banjir", "Bencana Alam", "Kalibaru", "Evakuasi"],
    category: "Banjir",
    status: "Published",
    source: "Laporan Tim Lapangan BPBD",
    viewsCount: 1245,
    author: "Budi Santoso",
    publishedAt: "23 April 2026 09:30 WIB",
    updatedAt: "24 April 2026 14:15 WIB",
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <PageBreadcrumb pageTitle="Detail Berita" />
        <div className="flex gap-3">
          <Link
            href="/admin/berita"
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
          >
            <HiOutlineArrowLeft className="w-4 h-4" />
            Kembali
          </Link>
          <Link
            href={`/admin/berita/${params.id}/edit`}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
          >
            <HiOutlinePencil className="w-4 h-4" />
            Edit Berita
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Konten Utama */}
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-white/[0.03]">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              {berita.title}
            </h1>
            
            <div className="mb-6 rounded-xl overflow-hidden border border-gray-200">
              <img
                src={berita.coverImage}
                alt={berita.title}
                className="w-full h-auto object-cover max-h-[400px]"
              />
            </div>

            <div className="mb-6">
              <h3 className="text-sm font-semibold text-gray-500 mb-2 uppercase tracking-wider">Ringkasan (Teaser)</h3>
              <p className="text-gray-700 dark:text-gray-300 italic border-l-4 border-blue-500 pl-4 py-1">
                {berita.teaser}
              </p>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-gray-500 mb-2 uppercase tracking-wider">Isi Berita</h3>
              <div className="text-gray-800 dark:text-gray-200 leading-relaxed whitespace-pre-line">
                {berita.content}
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar Info */}
        <div className="space-y-6">
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-white/[0.03]">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 border-b border-gray-100 pb-3">
              Informasi Berita
            </h3>
            
            <div className="space-y-4">
              <div>
                <span className="block text-xs font-medium text-gray-500 mb-1">Status</span>
                <AdminBadge variant={berita.status === 'Published' ? 'success' : 'default'} dot>
                  {berita.status}
                </AdminBadge>
              </div>

              <div>
                <span className="block text-xs font-medium text-gray-500 mb-1">Kategori</span>
                <span className="inline-flex px-2.5 py-1 rounded-md text-sm font-medium bg-blue-50 text-blue-700 border border-blue-100">
                  {berita.category}
                </span>
              </div>

              <div>
                <span className="block text-xs font-medium text-gray-500 mb-1">Tags</span>
                <div className="flex flex-wrap gap-2">
                  {berita.tags.map((tag, idx) => (
                    <span key={idx} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <span className="block text-xs font-medium text-gray-500 mb-1">Slug</span>
                <p className="text-sm text-gray-800 dark:text-gray-200 break-all">{berita.slug}</p>
              </div>

              <div>
                <span className="block text-xs font-medium text-gray-500 mb-1">Sumber Berita</span>
                <p className="text-sm text-gray-800 dark:text-gray-200">{berita.source}</p>
              </div>
              
              <div>
                <span className="block text-xs font-medium text-gray-500 mb-1">Jumlah Views</span>
                <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">{berita.viewsCount} kali</p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-white/[0.03]">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 border-b border-gray-100 pb-3">
              Riwayat Publikasi
            </h3>
            
            <div className="space-y-4">
              <div>
                <span className="block text-xs font-medium text-gray-500 mb-1">Dibuat Oleh</span>
                <p className="text-sm text-gray-800 dark:text-gray-200 font-medium">{berita.author}</p>
              </div>

              <div>
                <span className="block text-xs font-medium text-gray-500 mb-1">Waktu Publikasi</span>
                <p className="text-sm text-gray-800 dark:text-gray-200">{berita.publishedAt}</p>
              </div>

              <div>
                <span className="block text-xs font-medium text-gray-500 mb-1">Pembaruan Terakhir</span>
                <p className="text-sm text-gray-800 dark:text-gray-200">{berita.updatedAt}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
