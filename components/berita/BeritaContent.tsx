"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { HiArrowRight } from "react-icons/hi2";
import type { BeritaItem } from "@/data/beritaData";
import api, { getImageUrl } from "@/lib/api";

function mapBerita(b: any): BeritaItem {
  return {
    id: b.id,
    title: b.judul,
    excerpt: b.ringkasan || "",
    date: "", // Tanggal dihapus
    category: "",
    categoryColor: "",
    image: getImageUrl(b.foto_cover),
    source: "", // Admin/Source dihapus
  };
}

// ─── Hero Card ──────────────────────────────────────────────────────────
function HeroCard({ item }: { item: BeritaItem }) {
  const [imgLoaded, setImgLoaded] = useState(false);
  return (
    <Link
      href={`/berita/${item.id}`}
      className="relative w-full rounded-2xl overflow-hidden group cursor-pointer mb-12 block"
    >
      <div className={`relative h-[320px] sm:h-[400px] md:h-[480px] w-full bg-slate-200 ${!imgLoaded ? 'animate-pulse' : ''}`}>
        <Image
          src={item.image}
          alt={item.title}
          fill
          className="object-cover transition-transform duration-700 group-hover:scale-105"
          priority
          onLoad={() => setImgLoaded(true)}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
      </div>
      <div className="absolute inset-0 flex flex-col justify-end p-6 md:p-10">
        <h2 className="text-white text-2xl md:text-4xl font-bold leading-tight mb-4 max-w-3xl drop-shadow-lg">
          {item.title}
        </h2>
        <p className="text-white/80 text-sm md:text-base leading-relaxed max-w-2xl line-clamp-2">
          {item.excerpt}
        </p>
      </div>
    </Link>
  );
}

// ─── News Card ────────────────────────────────────────────────────────────
function NewsCard({ item }: { item: BeritaItem }) {
  const [imgLoaded, setImgLoaded] = useState(false);
  return (
    <Link
      href={`/berita/${item.id}`}
      className="group bg-white rounded-2xl overflow-hidden border border-slate-100 hover:shadow-xl transition-all duration-300 cursor-pointer flex flex-col"
    >
      <div className={`relative h-56 overflow-hidden bg-slate-200 ${!imgLoaded ? 'animate-pulse' : ''}`}>
        <Image
          src={item.image}
          alt={item.title}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-110"
          loading="lazy"
          onLoad={() => setImgLoaded(true)}
        />
      </div>
      <div className="p-5 flex flex-col flex-1">
        <h3 className="font-bold text-[#0088A8] text-[18px] leading-tight mb-3 group-hover:text-cyan-700 transition-colors line-clamp-2">
          {item.title}
        </h3>
        <p className="text-slate-600 text-[14px] leading-relaxed mb-1 line-clamp-3 flex-1">
          {item.excerpt}
        </p>
      </div>
    </Link>
  );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────
function SkeletonHero() {
  return <div className="h-[480px] w-full bg-slate-200 rounded-2xl animate-pulse mb-12" />;
}

function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl overflow-hidden border border-slate-100 animate-pulse flex flex-col">
      <div className="h-56 bg-slate-200" />
      <div className="p-5 flex-1"></div>
    </div>
  );
}

interface BeritaContentProps {
  initialHero?: BeritaItem | null;
  initialNews?: BeritaItem[];
  initialLastPage?: number;
}

// ═══════════════════  MAIN CONTENT  ═══════════════════
export default function BeritaContent({
  initialHero = null,
  initialNews = [],
  initialLastPage = 1,
}: BeritaContentProps) {
  const [displayedNews, setDisplayedNews] = useState<BeritaItem[]>(initialNews);
  const [heroNews, setHeroNews] = useState<BeritaItem | null>(initialHero);
  const [loading, setLoading] = useState(!initialHero && initialNews.length === 0);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(1 < initialLastPage);
  const [page, setPage] = useState(1);

  const sentinelRef = useRef<HTMLDivElement>(null);

  const fetchPage = useCallback(async (pageNum: number, isInitial = false) => {
    if (isInitial) {
      setLoading(true);
    } else {
      setLoadingMore(true);
    }

    try {
      // Pada halaman pertama, ambil 7 item (1 untuk Hero, 6 untuk list grid)
      // Pada halaman selanjutnya, cukup ambil 6 item
      const limit = pageNum === 1 ? 7 : 6;

      const res = await api.get("/api/berita", {
        params: {
          page: pageNum,
          per_page: limit,
        }
      });

      const resData = res.data;

      // Ambil data array dari pagination Laravel
      let rawData: any[] = [];
      if (Array.isArray(resData)) {
        rawData = resData;
      } else if (Array.isArray(resData.data)) {
        rawData = resData.data;
      } else if (Array.isArray(resData.data?.data)) {
        rawData = resData.data.data;
      }

      const mapped = rawData.map(mapBerita);
      const lastPage = resData.last_page || 1;
      const currentPage = resData.current_page || pageNum;

      if (pageNum === 1) {
        if (mapped.length > 0) {
          setHeroNews(mapped[0]);
          setDisplayedNews(mapped.slice(1));
        } else {
          setHeroNews(null);
          setDisplayedNews([]);
        }
      } else {
        setDisplayedNews((prev) => [...prev, ...mapped]);
      }

      setPage(currentPage);
      setHasMore(currentPage < lastPage);
    } catch (err) {
      console.error("Error fetching berita:", err);
    } finally {
      if (isInitial) {
        setLoading(false);
      } else {
        setLoadingMore(false);
      }
    }
  }, []);

  // Ambil halaman pertama saat komponen dimuat (hanya jika data awal kosong)
  useEffect(() => {
    if (!initialHero && initialNews.length === 0) {
      fetchPage(1, true);
    }
  }, [fetchPage, initialHero, initialNews.length]);

  // Fungsi loadMore dipanggil ketika user melakukan scroll ke bawah
  const loadMore = useCallback(() => {
    if (loadingMore || !hasMore) return;
    fetchPage(page + 1, false);
  }, [loadingMore, hasMore, page, fetchPage]);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loadingMore) loadMore();
      },
      { rootMargin: "200px" }
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasMore, loadingMore, loadMore]);

  return (
    <section className="flex-1 pt-4 pb-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {loading ? (
          <>
            <SkeletonHero />
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
              {Array.from({ length: 3 }).map((_, i) => <SkeletonCard key={i} />)}
            </div>
          </>
        ) : (
          <>
            {heroNews && <HeroCard item={heroNews} />}

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
              {displayedNews.map((news) => (
                <NewsCard key={news.id} item={news} />
              ))}
              {loadingMore && Array.from({ length: 3 }).map((_, i) => <SkeletonCard key={`sk-${i}`} />)}
            </div>
          </>
        )}

        <div ref={sentinelRef} className="h-10 mt-6" aria-hidden="true" />
      </div>
    </section>
  );
}
