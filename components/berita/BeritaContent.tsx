"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { HiMagnifyingGlass, HiCalendar, HiUser } from "react-icons/hi2";
import { HiArrowRight, HiChevronLeft, HiChevronRight } from "react-icons/hi2";
import {
  beritaCategories,
  beritaHero,
  beritaList,
} from "@/data/beritaData";
import type { BeritaItem } from "@/data/beritaData";

/* ───────────── Hero Card ───────────── */
function HeroCard({ item }: { item: BeritaItem }) {
  return (
    <Link href={`/berita/${item.id}`} className="relative w-full rounded-2xl overflow-hidden group cursor-pointer mb-10 block">
      {/* Background Image */}
      <div className="relative h-[320px] sm:h-[380px] md:h-[420px] w-full">
        <Image
          src={item.image}
          alt={item.title}
          fill
          className="object-cover transition-transform duration-700 group-hover:scale-105"
          priority
        />
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent" />
      </div>

      {/* Content over image */}
      <div className="absolute inset-0 flex flex-col justify-end p-6 md:p-10">
        {/* Category Badge */}
        <span
          className={`${item.categoryColor} text-white text-xs font-bold px-4 py-1.5 rounded-full w-fit mb-4 uppercase tracking-wider`}
        >
          {item.category}
        </span>

        {/* Title */}
        <h2 className="text-white text-2xl md:text-3xl lg:text-4xl font-bold leading-tight mb-3 max-w-2xl drop-shadow-lg">
          {item.title}
        </h2>

        {/* Excerpt */}
        <p className="text-white/80 text-sm md:text-base leading-relaxed mb-4 max-w-2xl line-clamp-2">
          {item.excerpt}
        </p>

        {/* Meta */}
        <div className="flex items-center gap-4 text-white/60 text-xs md:text-sm">
          <span className="flex items-center gap-1.5">
            <HiCalendar className="text-sm" />
            {item.date}
          </span>
          <span className="flex items-center gap-1.5">
            <HiUser className="text-sm" />
            {item.source}
          </span>
        </div>
      </div>
    </Link>
  );
}

/* ───────────── News Card ───────────── */
function NewsCard({ item }: { item: BeritaItem }) {
  return (
    <Link href={`/berita/${item.id}`} className="group bg-white rounded-2xl overflow-hidden border border-slate-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer flex flex-col">
      {/* Image */}
      <div className="relative h-48 overflow-hidden">
        <Image
          src={item.image}
          alt={item.title}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
        {/* Category + Date row */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
          <span
            className={`${item.categoryColor} text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider`}
          >
            {item.category}
          </span>
          {item.date && (
            <span className="bg-black/40 backdrop-blur-sm text-white text-[10px] px-2.5 py-1 rounded-full">
              {item.date}
            </span>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-5 flex flex-col flex-1">
        <h3 className="font-bold text-primary text-[15px] leading-snug mb-2 group-hover:text-secondary transition-colors line-clamp-2">
          {item.title}
        </h3>
        <p className="text-slate-500 text-xs leading-relaxed mb-4 line-clamp-3 flex-1">
          {item.excerpt}
        </p>
        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-100">
          <span className="text-secondary text-xs font-semibold">
            {item.source}
          </span>
          <span className="flex items-center gap-1 text-secondary text-xs font-semibold group-hover:gap-2 transition-all">
            Baca <HiArrowRight className="text-xs" />
          </span>
        </div>
      </div>
    </Link>
  );
}

/* ───────────── Pagination ───────────── */
function Pagination({
  currentPage,
  totalPages,
  onPageChange,
}: {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}) {
  const getPages = () => {
    const pages: (number | string)[] = [];
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (currentPage > 3) pages.push("...");
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);
      for (let i = start; i <= end; i++) pages.push(i);
      if (currentPage < totalPages - 2) pages.push("...");
      pages.push(totalPages);
    }
    return pages;
  };

  return (
    <div className="flex items-center justify-center gap-2 mt-12">
      <button
        onClick={() => onPageChange(Math.max(1, currentPage - 1))}
        disabled={currentPage === 1}
        className="w-10 h-10 rounded-xl flex items-center justify-center text-slate-400 hover:bg-primary hover:text-white transition-all disabled:opacity-30 disabled:cursor-not-allowed border border-slate-200"
      >
        <HiChevronLeft className="text-lg" />
      </button>
      {getPages().map((page, idx) =>
        typeof page === "string" ? (
          <span key={`dots-${idx}`} className="w-10 h-10 flex items-center justify-center text-slate-400 text-sm">
            {page}
          </span>
        ) : (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            className={`w-10 h-10 rounded-xl flex items-center justify-center font-semibold text-sm transition-all ${
              currentPage === page
                ? "bg-primary text-white shadow-lg shadow-primary/30"
                : "text-slate-500 hover:bg-slate-100 border border-slate-200"
            }`}
          >
            {page}
          </button>
        )
      )}
      <button
        onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
        disabled={currentPage === totalPages}
        className="w-10 h-10 rounded-xl flex items-center justify-center text-slate-400 hover:bg-primary hover:text-white transition-all disabled:opacity-30 disabled:cursor-not-allowed border border-slate-200"
      >
        <HiChevronRight className="text-lg" />
      </button>
    </div>
  );
}

/* ═══════════════════  MAIN CONTENT  ═══════════════════ */
export default function BeritaContent() {
  const [activeCategory, setActiveCategory] = useState("Semua");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  // Filter logic
  const filteredNews = beritaList.filter((news) => {
    const matchCat =
      activeCategory === "Semua" ||
      news.category.toLowerCase().includes(activeCategory.toLowerCase());
    const matchSearch =
      searchQuery === "" ||
      news.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchSearch;
  });

  const totalPages = 12; // dummy total

  return (
    <section className="bg-surface min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        {/* ── Header Row ── */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-6">
          <div>
            <p className="text-secondary text-xs font-bold uppercase tracking-widest mb-1">
              Informasi Terkini
            </p>
            <h1 className="text-3xl md:text-4xl font-extrabold text-primary leading-tight">
              Warta Siaga Jember
            </h1>
          </div>

          {/* Search */}
          <div className="relative w-full md:w-80">
            <HiMagnifyingGlass className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Cari berita bencana..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-3 rounded-xl bg-white border border-slate-200 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-secondary/40 focus:border-secondary transition-all"
            />
          </div>
        </div>

        {/* ── Category Pills ── */}
        <div className="flex flex-wrap gap-2 mb-8">
          {beritaCategories.map((cat) => (
            <button
              key={cat}
              onClick={() => {
                setActiveCategory(cat);
                setCurrentPage(1);
              }}
              className={`px-5 py-2 rounded-full text-sm font-medium transition-all duration-200 border ${
                activeCategory === cat
                  ? "bg-primary text-white border-primary shadow-md shadow-primary/20"
                  : "bg-white text-slate-600 border-slate-200 hover:border-primary hover:text-primary"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* ── Hero Featured Article ── */}
        <HeroCard item={beritaHero} />

        {/* ── News Grid — Row 1 (top 3) ── */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
          {filteredNews.slice(0, 3).map((news) => (
            <NewsCard key={news.id} item={news} />
          ))}
        </div>

        {/* ── News Grid — Row 2 (next 3) ── */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredNews.slice(3, 6).map((news) => (
            <NewsCard key={news.id} item={news} />
          ))}
        </div>

        {/* ── Pagination ── */}
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      </div>
    </section>
  );
}
