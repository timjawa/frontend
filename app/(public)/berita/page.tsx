import type { Metadata } from "next";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import BeritaContent from "@/components/berita/BeritaContent";
import { getBaseUrl, getImageUrl } from "@/lib/api";
import type { BeritaItem } from "@/data/beritaData";

export const metadata: Metadata = {
  title: "Warta Siaga Jember - Berita & Informasi Terkini | Jember Siaga",
  description:
    "Dapatkan informasi terkini seputar bencana, cuaca, dan kebencanaan di Kabupaten Jember. Berita terupdate dari sumber terpercaya.",
};

function mapBerita(b: any): BeritaItem {
  return {
    id: b.id,
    title: b.judul,
    excerpt: b.ringkasan || "",
    date: "",
    category: "",
    categoryColor: "",
    image: getImageUrl(b.foto_cover),
    source: "",
  };
}

export default function BeritaPage() {
  return (
    <>
      <Navbar />
      <main className="flex flex-col flex-1 min-h-screen bg-white">
        {/* Hero — consistent with homepage and FAQ: from-slate-50 to-white */}
        <section className="pt-36 pb-4 bg-gradient-to-b from-slate-50 to-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-2xl md:text-3xl font-bold text-[#003B46] leading-tight">
                Berita & Informasi Terkini
              </h1>
              <p className="text-slate-600 max-w-2xl mx-auto text-[15px] leading-relaxed mt-3">
                Dapatkan informasi terkini seputar bencana, cuaca, dan kebencanaan di Kabupaten Jember dari sumber terpercaya.
              </p>
            </div>
          </div>
        </section>

        <BeritaContent 
          initialHero={null}
          initialNews={[]}
          initialLastPage={1}
        />
      </main>
      <Footer />
    </>
  );
}
