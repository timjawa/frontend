import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { getImageUrl, getBaseUrl } from "@/lib/api";
import ShareButton from "@/components/berita/ShareButton";

import { cache } from "react";

const getBeritaData = cache(async (id: string) => {
  try {
    const res = await fetch(`${getBaseUrl()}/api/berita/${id}`, { cache: "no-store" });
    if (!res.ok) return null;
    const json = await res.json();
    return json.berita || json.data || json;
  } catch (error) {
    console.error("Error fetching berita detail:", error);
    return null;
  }
});

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const news = await getBeritaData(id);

  if (!news) {
    return {
      title: "Berita Tidak Ditemukan",
    };
  }

  return {
    title: `${news.judul} | Warta Siaga Jember`,
    description: news.ringkasan || "Berita selengkapnya di Warta Siaga Jember.",
  };
}

export default async function BeritaDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const news = await getBeritaData(id);

  if (!news) {
    notFound();
  }

  const categoryColors: Record<string, string> = {
    'BANJIR': 'bg-cyan-600',
    'GEMPA BUMI': 'bg-indigo-600',
    'TANAH LONGSOR': 'bg-amber-600',
    'CUACA EKSTREM': 'bg-blue-600',
    'KEBAKARAN': 'bg-orange-600',
    'LOGISTIK': 'bg-teal-600',
    'PERINGATAN DINI': 'bg-red-600'
  };

  const cat = (news.kategori || "UMUM").toUpperCase();
  const categoryColorClass = categoryColors[cat] || "bg-[#7a0000]";
  const imageUrl = getImageUrl(news.foto_cover);
  const formattedDate = news.created_at ? new Date(news.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : "Baru saja";
  const source = news.sumber || "Admin";

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1 bg-[#F9FAFB] pt-[88px] pb-16">
        <article className="max-w-[800px] mx-auto px-4 sm:px-6 mt-8 md:mt-12">
          {/* Title */}
          <h1 className="text-3xl md:text-[32px] font-extrabold text-slate-900 leading-[1.1] mb-6 tracking-tight">
            {news.judul}
          </h1>

          {/* Hero Image */}
          <figure className="mb-10 w-full relative group">
            <div className="absolute top-4 right-4 z-20">
              <ShareButton />
            </div>
            <div className="relative w-full aspect-[21/9] rounded-2xl overflow-hidden mb-4 bg-slate-100 shadow-sm">
              <Image
                src={imageUrl}
                alt={news.judul}
                fill
                className="object-cover"
                priority
              />
            </div>
            {source && (
              <figcaption className="text-center text-[12px] font-medium text-slate-500 px-4 md:px-12 leading-relaxed">
                Ilustrasi kondisi terkait: {news.judul}. (Sumber:{" "}
                <a href={source} target="_blank" rel="noopener noreferrer" className="text-blue-500 underline">
                  {source}
                </a>
                )
              </figcaption>
            )}
          </figure>

          {/* Content */}
          <div className="prose prose-lg prose-slate max-w-none">
            {news.ringkasan && (
              <div className="mb-10 text-[20px] font-medium text-slate-900 border-l-4 border-[#7a0000] pl-6 py-4 bg-slate-50/80 leading-relaxed italic rounded-r-xl">
                {news.ringkasan}
              </div>
            )}

            <div className="space-y-8 text-[18px] md:text-[19px] leading-[1.9] text-slate-800 text-justify font-normal">
              {news.konten?.split('\n').filter((p: string) => p.trim() !== '').map((para: string, i: number) => (
                <p key={i} className="m-0 indent-8 md:indent-12 first:indent-0">
                  {para.trim()}
                </p>
              ))}
            </div>
          </div>


        </article>
      </main>
      <Footer />
    </div>
  );
}
