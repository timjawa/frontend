"use client";

import { useEffect, useState } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import api from "@/lib/api";
import { HiChevronDown } from "react-icons/hi";

interface Faq {
  id: string;
  pertanyaan: string;
  jawaban: string;
  kategori: string;
  is_active: boolean;
}

export default function FaqPage() {
  const [faqs, setFaqs] = useState<Faq[]>([]);
  const [loading, setLoading] = useState(true);
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  useEffect(() => {
    const fetchFaqs = async () => {
      try {
        const response = await api.get("/api/faq");
        if (response.data.success) {
          // Only show active FAQs
          const activeFaqs = response.data.data.filter((f: Faq) => f.is_active);
          setFaqs(activeFaqs);
        }
      } catch (err) {
        console.error("Error fetching FAQs:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchFaqs();
  }, []);

  const toggleFaq = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <>
      <Navbar />
      <main className="flex-1 min-h-screen">
        {/* Hero — consistent with homepage: from-slate-50 to-white */}
        <section className="pt-36 pb-8 bg-gradient-to-b from-slate-50 to-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-2xl md:text-3xl font-bold text-primary leading-tight">
                Frequently Ask Questions
              </h1>
              <p className="text-slate-600 max-w-2xl mx-auto text-[15px] leading-relaxed mt-3">
                Informasi pertanyaan umum yang sering diajukan pengguna mengenai
                layanan pada platform Jember Siaga.
              </p>
            </div>
          </div>
        </section>

        {/* FAQ Accordion — bg-white section, card with rounded-2xl border */}
        <section className="py-10 bg-white">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            {loading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : faqs.length > 0 ? (
              <div className="bg-white rounded-2xl shadow-sm border border-border overflow-hidden">
                {faqs.map((faq, index) => (
                  <div
                    key={faq.id}
                    className={`border-b border-border/50 last:border-b-0 ${
                      openIndex === index ? "bg-surface/50" : ""
                    }`}
                  >
                    {/* Question */}
                    <button
                      onClick={() => toggleFaq(index)}
                      className="w-full flex items-center justify-between px-6 py-5 text-left hover:bg-accent/20 transition-colors duration-200"
                      id={`faq-question-${index}`}
                      aria-expanded={openIndex === index}
                    >
                      <span className="text-sm sm:text-[15px] font-medium text-primary pr-4 leading-relaxed">
                        {faq.pertanyaan}
                      </span>
                      <HiChevronDown
                        className={`text-slate-400 text-xl flex-shrink-0 transition-transform duration-300 ${
                          openIndex === index ? "rotate-180" : ""
                        }`}
                      />
                    </button>

                    {/* Answer */}
                    <div
                      className={`overflow-hidden transition-all duration-300 ease-in-out ${
                        openIndex === index
                          ? "max-h-96 opacity-100"
                          : "max-h-0 opacity-0"
                      }`}
                    >
                      <div className="px-6 pb-5 pt-0">
                        <p className="text-slate-500 text-sm leading-relaxed whitespace-pre-line">
                          {faq.jawaban}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-slate-500">
                Belum ada FAQ yang tersedia saat ini.
              </div>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
