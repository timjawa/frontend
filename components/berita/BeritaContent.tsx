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
  return (
    <Link
      href={`/berita/${item.id}`}
      className="relative w-full rounded-2xl overflow-hidden group cursor-pointer mb-12 block"
    >
      <div className="relative h-[320px] sm:h-[400px] md:h-[480px] w-full">
        <Image
          src={item.image}
          alt={item.title}
          fill
          className="object-cover transition-transform duration-700 group-hover:scale-105"
          priority
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
  return (
    <Link
      href={`/berita/${item.id}`}
      className="group bg-white rounded-2xl overflow-hidden border border-slate-100 hover:shadow-xl transition-all duration-300 cursor-pointer flex flex-col"
    >
      <div className="relative h-56 overflow-hidden bg-slate-100">
        <Image
          src={item.image}
          alt={item.title}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-110"
          loading="lazy"
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
    <div className="bg-white rounded-2xl overflow-hidden border border-slate-100 animate-pulse">
      <div className="h-56 bg-slate-200" />
      <div className="p-5 space-y-3">
        <div className="h-4 bg-slate-200 rounded w-3/4" />
        <div className="h-3 bg-slate-100 rounded w-full" />
      </div>
    </div>
  );
}

// ═══════════════════  MAIN CONTENT  ═══════════════════
const ITEMS_PER_BATCH = 6;

export default function BeritaContent() {
  const [allNews, setAllNews] = useState<BeritaItem[]>([]);
  const [displayedNews, setDisplayedNews] = useState<BeritaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [batchIndex, setBatchIndex] = useState(1);

  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchBerita = async () => {
      setLoading(true);
      try {
        const res = await api.get("/api/berita", { params: { per_page: 999 } });
        let rawData: any[] = [];
        if (Array.isArray(res.data)) rawData = res.data;
        else if (Array.isArray(res.data?.data)) rawData = res.data.data;
        else if (Array.isArray(res.data?.data?.data)) rawData = res.data.data.data;

        const mapped = rawData
          .filter((b) => !b.status || b.status.toLowerCase() === "published")
          .map(mapBerita)
          .sort((a, b) => (b as any).rawDate - (a as any).rawDate);

        setAllNews(mapped);
        
        const firstBatch = mapped.slice(1, ITEMS_PER_BATCH + 1);
        setDisplayedNews(firstBatch);
        setHasMore(mapped.length > ITEMS_PER_BATCH + 1);
      } catch (err) {
        console.error("Error fetching berita:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchBerita();
  }, []);

  const loadMore = useCallback(() => {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    setTimeout(() => {
      const nextBatch = batchIndex + 1;
      const nextItems = allNews.slice(1, (nextBatch * ITEMS_PER_BATCH) + 1);
      setDisplayedNews(nextItems);
      setBatchIndex(nextBatch);
      setHasMore(nextItems.length < allNews.length - 1);
      setLoadingMore(false);
    }, 600);
  }, [loadingMore, hasMore, batchIndex, allNews]);

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

  if (loading) {
    return (
      <section className="bg-surface min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
          <SkeletonHero />
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {Array.from({ length: 3 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-surface min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        
        <div className="mb-10">
           <h2 className="text-[32px] font-bold text-[#003B46] relative inline-block">
             Berita Terkini
             <span className="absolute -bottom-2 left-0 w-1/2 h-1 bg-[#0088A8] rounded-full"></span>
           </h2>
        </div>

        {allNews.length > 0 && <HeroCard item={allNews[0]} />}

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
          {displayedNews.map((news) => (
            <NewsCard key={news.id} item={news} />
          ))}
          {loadingMore && Array.from({ length: 3 }).map((_, i) => <SkeletonCard key={`sk-${i}`} />)}
        </div>

        <div ref={sentinelRef} className="h-10 mt-6" aria-hidden="true" />
      </div>
    </section>
  );
}
