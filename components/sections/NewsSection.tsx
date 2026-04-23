import { newsData } from "@/data/dummyData";
import Link from "next/link";
import { HiArrowRight, HiCalendar } from "react-icons/hi2";

export default function NewsSection() {
  const featured = newsData.filter((n) => n.featured);
  const regular = newsData.filter((n) => !n.featured);

  return (
    <section className="py-12 bg-surface">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-primary">
            Berita
          </h2>
          <Link
            href="/berita"
            className="flex items-center gap-1 text-secondary hover:text-primary text-sm font-semibold transition-colors group"
          >
            Lihat Semua
            <HiArrowRight className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Featured News - 2 columns */}
        <div className="grid md:grid-cols-2 gap-5 mb-5">
          {featured.map((news) => (
            <Link
              key={news.id}
              href={`/berita/${news.id}`}
              className="group bg-white rounded-2xl overflow-hidden border border-border hover:shadow-lg transition-all duration-300"
            >
              <div className="h-48 bg-gradient-to-br from-primary/20 to-secondary/20 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                <div className="absolute top-3 left-3">
                  <span className="bg-secondary text-white text-xs font-semibold px-3 py-1 rounded-full">
                    {news.category}
                  </span>
                </div>
                {/* Placeholder pattern */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-6xl opacity-20">📰</span>
                </div>
              </div>
              <div className="p-5">
                <h3 className="font-bold text-primary text-base leading-snug mb-3 group-hover:text-secondary transition-colors line-clamp-2">
                  {news.title}
                </h3>
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <HiCalendar />
                  <span>{news.date}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Regular News - 4 columns */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {regular.map((news) => (
            <Link
              key={news.id}
              href={`/berita/${news.id}`}
              className="group bg-white rounded-xl overflow-hidden border border-border hover:shadow-md transition-all duration-300"
            >
              <div className="h-32 bg-gradient-to-br from-slate-100 to-slate-200 relative overflow-hidden">
                <div className="absolute top-2 left-2">
                  <span className="bg-primary/80 text-white text-[10px] font-semibold px-2 py-0.5 rounded-full">
                    {news.category}
                  </span>
                </div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-4xl opacity-15">📰</span>
                </div>
              </div>
              <div className="p-3.5">
                <h3 className="font-semibold text-primary text-sm leading-snug mb-2 group-hover:text-secondary transition-colors line-clamp-2">
                  {news.title}
                </h3>
                <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                  <HiCalendar className="text-xs" />
                  <span>{news.date}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
