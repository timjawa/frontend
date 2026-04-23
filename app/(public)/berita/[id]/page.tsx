import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import { HiShare, HiOutlineBookmark } from "react-icons/hi2";
import { HiUser } from "react-icons/hi2";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { beritaHero, beritaList } from "@/data/beritaData";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const allNews = [beritaHero, ...beritaList];
  const news = allNews.find((n) => n.id.toString() === id);

  if (!news) {
    return {
      title: "Berita Tidak Ditemukan",
    };
  }

  return {
    title: `${news.title} | Warta Siaga Jember`,
    description: news.excerpt,
  };
}

export default async function BeritaDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const allNews = [beritaHero, ...beritaList];
  const news = allNews.find((n) => n.id.toString() === id);

  if (!news) {
    notFound();
  }

  const categoryColorClass = news.categoryColor || "bg-[#7a0000]";

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1 bg-[#F9FAFB] pt-[88px] pb-16">
        <article className="max-w-[800px] mx-auto px-4 sm:px-6 mt-8 md:mt-12">
          {/* Category Badge */}
          <div className="mb-5">
            <span className={`${categoryColorClass} text-white text-[10px] font-bold px-3 py-1 rounded shadow-sm inline-block tracking-widest uppercase`}>
              {news.category}
            </span>
          </div>

          {/* Title */}
          <h1 className="text-3xl md:text-[44px] font-bold text-slate-900 leading-[1.1] mb-8 tracking-tight">
            {news.title}
          </h1>

          {/* Author & Date Section */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 mb-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center overflow-hidden">
                <HiUser className="text-slate-500 text-xl" />
              </div>
              <div className="flex flex-col justify-center">
                <p className="text-[13px] font-bold text-slate-900 leading-tight">{news.source}</p>
                <p className="text-[12px] text-slate-500 leading-tight mt-0.5 font-medium">{news.date || "Baru saja"}</p>
              </div>
            </div>
            <div className="flex items-center gap-4 mt-4 sm:mt-0">
              <button className="flex items-center justify-center text-slate-400 hover:text-slate-900 transition-colors">
                <HiShare className="text-[20px]" />
              </button>
              <button className="flex items-center justify-center text-slate-400 hover:text-slate-900 transition-colors">
                <HiOutlineBookmark className="text-[20px]" />
              </button>
            </div>
          </div>

          {/* Hero Image */}
          <figure className="mb-10 w-full relative">
            <div className="relative w-full aspect-[21/9] rounded-2xl overflow-hidden mb-4">
              <Image
                src={news.image}
                alt={news.title}
                fill
                className="object-cover"
                priority
              />
            </div>
            <figcaption className="text-center text-[12px] font-medium text-slate-500 px-4 md:px-12 leading-relaxed">
              Ilustrasi kondisi terkait: {news.title}. (Foto: {news.source})
            </figcaption>
          </figure>

          {/* Content */}
          <div className="prose prose-lg prose-slate max-w-none text-slate-800 text-[15px] leading-[1.8] font-medium">
            <p className="mb-6 text-[17px] font-semibold text-slate-900">
              {news.excerpt}
            </p>
            <p className="mb-8">
              Pihak Badan Penanggulangan Bencana Daerah (BPBD) setempat bersama tim gabungan terus melakukan pemantauan intensif terkait kejadian ini. Masyarakat dihimbau untuk tetap tenang namun selalu waspada terhadap perkembangan situasi terbaru. Upaya penanganan berkelanjutan dipastikan telah dikoordinasikan dengan instansi terkait untuk meminimalisir dampak yang lebih besar.
            </p>

            {/* Blockquote */}
            <div className="bg-[#F8FAFC] border-l-4 border-slate-900 px-6 py-6 my-10 rounded-r-2xl">
              <p className="text-[17px] font-bold italic text-slate-900 mb-3 leading-snug tracking-tight">
                "Kami sudah menurunkan personel dan peralatan yang dibutuhkan. Prioritas pertama kami adalah memastikan kelancaran aktivitas warga serta tidak ada korban."
              </p>
              <p className="text-[13px] font-bold text-slate-500">
                — Perwakilan {news.source}
              </p>
            </div>

            <p className="mb-6">
              Saat ini tim teknis di lapangan sedang melakukan asesmen lebih lanjut. Dukungan logistik dan relawan juga telah disiapkan di posko terdekat untuk memberikan bantuan yang diperlukan secepat mungkin. Terus pantau portal Jember Siaga untuk pembaruan informasi yang akurat dan terpercaya.
            </p>
          </div>

          {/* Komentar Section */}
          <div className="mt-16 pt-10">
            <h3 className="text-xl font-bold text-slate-900 mb-6">Komentar</h3>
            <div className="bg-white rounded-2xl p-4 shadow-sm">
              <textarea
                className="w-full h-24 bg-[#F8FAFC] rounded-xl p-4 resize-none outline-none text-sm text-slate-700 placeholder:text-slate-400"
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
