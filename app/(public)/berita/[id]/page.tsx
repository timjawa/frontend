import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import { HiUser } from "react-icons/hi2";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { getImageUrl } from "@/lib/api";


const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://192.168.0.194:8000";

async function getBeritaData(id: string) {
  try {
    const res = await fetch(`${backendUrl}/api/berita/${id}`, { cache: "no-store" });
    if (!res.ok) return null;
    const json = await res.json();
    return json.berita || json.data || json;
  } catch (error) {
    console.error("Error fetching berita detail:", error);
    return null;
  }
}

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
          {/* Category Badge */}
          <div className="mb-5">
            <span className={`${categoryColorClass} text-white text-[10px] font-bold px-3 py-1 rounded shadow-sm inline-block tracking-widest uppercase`}>
              {news.kategori || "Umum"}
            </span>
          </div>

          {/* Title */}
          <h1 className="text-3xl md:text-[44px] font-bold text-slate-900 leading-[1.1] mb-8 tracking-tight">
            {news.judul}
          </h1>

          {/* Author & Date Section */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 mb-8 border-b border-slate-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center overflow-hidden">
                <HiUser className="text-slate-500 text-xl" />
              </div>
              <div className="flex flex-col justify-center">
                <p className="text-[13px] font-bold text-slate-900 leading-tight">{source}</p>
                <p className="text-[12px] text-slate-500 leading-tight mt-0.5 font-medium">{formattedDate}</p>
              </div>
            </div>
            <div className="flex items-center gap-4 mt-4 sm:mt-0">
            </div>
          </div>

          {/* Hero Image */}
          <figure className="mb-10 w-full relative">
            <div className="relative w-full aspect-[21/9] rounded-2xl overflow-hidden mb-4 bg-slate-100">
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
                Ilustrasi kondisi terkait: {news.judul}. (Foto: {source})
              </figcaption>
            )}
          </figure>

          {/* Content */}
          <div className="prose prose-lg prose-slate max-w-none text-slate-800 text-[15px] leading-[1.8] font-medium">
            {news.ringkasan && (
              <p className="mb-6 text-[17px] font-semibold text-slate-900 border-l-4 border-slate-900 pl-4 py-1 bg-slate-50">
                {news.ringkasan}
              </p>
            )}
            
            <div className="whitespace-pre-wrap">
              {news.konten}
            </div>
          </div>

          {/* Komentar Section */}
          <div className="mt-16 pt-10 border-t border-slate-200">
            <h3 className="text-xl font-bold text-slate-900 mb-6">Komentar</h3>
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
              <textarea
                className="w-full h-24 bg-[#F8FAFC] rounded-xl p-4 resize-none outline-none text-sm text-slate-700 placeholder:text-slate-400 focus:ring-2 focus:ring-slate-900"
                placeholder="Tulis pendapat Anda tentang berita ini..."
              ></textarea>
              <div className="flex justify-end mt-3">
                <button className="bg-[#0F172A] hover:bg-slate-800 text-white text-xs font-semibold px-6 py-3 rounded-full transition-colors">
                  Kirim Komentar
                </button>
              </div>
            </div>
          </div>
        </article>
      </main>
      <Footer />
    </div>
  );
}
