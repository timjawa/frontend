import Link from "next/link";
import { HiCalendar, HiTag, HiArrowRight } from "react-icons/hi2";
import { fetchBerita, Berita } from "@/services/berita";
import { getImageUrl } from "@/lib/api";

export default async function NewsSection() {
  let newsList: Berita[] = [];
  try {
    // Ambil 6 berita terbaru
    const res = await fetchBerita({ per_page: 6 });
    newsList = res.data || [];
  } catch (error) {
    console.error("Gagal memuat berita", error);
  }

  // Tampilan grid menyesuaikan jumlah data agar tetap proporsional saat datanya sedikit
  const gridClass = 
    newsList.length === 1 ? "flex justify-center" : 
    newsList.length === 2 ? "grid md:grid-cols-2 max-w-4xl mx-auto gap-6" : 
    "grid sm:grid-cols-2 lg:grid-cols-3 gap-6";


  return (
    <section className="py-12 relative" style={{ backgroundColor: '#F3F8FF' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-primary mb-2">
              Berita & Update Terkini
            </h2>
            <p className="text-slate-500 text-sm max-w-2xl">
              Informasi terbaru mengenai kejadian, edukasi, dan berita terkini di wilayah Jember
            </p>
          </div>
          <Link
            href="/berita"
            className="hidden md:flex items-center gap-2 text-secondary hover:text-primary text-sm font-semibold transition-colors group"
          >
            Lihat Semua
            <HiArrowRight className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {newsList.length === 0 ? (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-12 text-center shadow-sm border border-slate-100 max-w-2xl mx-auto">
            <div className="w-20 h-20 bg-primary/5 rounded-full flex items-center justify-center mx-auto mb-5">
              <span className="text-4xl opacity-40">📰</span>
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">Belum Ada Berita</h3>
            <p className="text-slate-500 text-sm max-w-md mx-auto">
              Saat ini belum ada data berita yang dipublikasikan.
            </p>
          </div>
        ) : (
          <div className={gridClass}>
            {newsList.map((item) => (
              <div 
                key={item.id} 
                className={`group bg-white rounded-2xl overflow-hidden border border-slate-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col ${newsList.length === 1 ? 'w-full max-w-md' : 'w-full'}`}
              >
                {/* Image Cover */}
                <div className="h-52 bg-gradient-to-br from-primary/10 to-secondary/10 relative overflow-hidden flex-shrink-0">
                  {item.foto_cover ? (
                    <img 
                      src={getImageUrl(item.foto_cover)} 
                      alt={item.judul} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-6xl opacity-20 group-hover:scale-110 transition-transform duration-500">📰</span>
                    </div>
                  )}
                </div>
                
                {/* Content */}
                <div className="p-6 flex flex-col flex-1">
                  <h3 className="font-bold text-slate-800 text-lg leading-snug mb-3 line-clamp-2 hover:text-secondary transition-colors">
                    <Link href={`/berita/${item.slug || item.id}`}>
                      {item.judul}
                    </Link>
                  </h3>
                  
                  <p className="text-sm text-slate-600 mb-5 line-clamp-3 flex-1 leading-relaxed">
                    {item.ringkasan || item.konten.replace(/<[^>]*>?/gm, '').substring(0, 120) + '...'}
                  </p>
                  
                  {/* Tags */}
                  {item.tags && item.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-5">
                      {item.tags.slice(0, 3).map(tag => (
                        <span key={tag.id} className="inline-flex items-center gap-1.5 bg-slate-50 border border-slate-100 text-slate-600 px-2.5 py-1 rounded-md text-[10px] font-medium">
                          <HiTag className="text-secondary/70" />
                          {tag.tag}
                        </span>
                      ))}
                      {item.tags.length > 3 && (
                        <span className="inline-flex items-center gap-1 bg-slate-50 border border-slate-100 text-slate-600 px-2 py-1 rounded-md text-[10px] font-medium">
                          +{item.tags.length - 3}
                        </span>
                      )}
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between text-xs text-slate-500 mt-auto pt-4 border-t border-slate-100/80">
                    <div className="flex items-center gap-1.5">
                      <HiCalendar className="text-sm text-primary/60" />
                      <span>{new Date(item.dibuat_pada).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                    </div>
                    {item.author && (
                      <span className="font-medium bg-slate-50 px-2 py-1 rounded-md">{item.author.name}</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Mobile View All Button */}
        <div className="mt-8 text-center md:hidden">
          <Link
            href="/berita"
            className="inline-flex items-center justify-center gap-2 w-full bg-white text-primary border border-primary/20 px-6 py-3 rounded-xl font-semibold text-sm shadow-sm"
          >
            Lihat Semua Berita
          </Link>
        </div>
      </div>
    </section>
  );
}
