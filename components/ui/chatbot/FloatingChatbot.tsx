"use client";

import { useState, useEffect, useRef } from "react";
import { sendGrokMessage, GrokMessage } from "@/services/grokChat";
import ToggleButton from "./ToggleButton";
import Image from "next/image";

// ─── Types ───────────────────────────────────────────────────────────────────

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  loading?: boolean;
}

// ─── Quick Actions ────────────────────────────────────────────────────────────

type MenuState = "main" | "sub-cuaca" | "sub-prediksi-hari" | "sub-prediksi" | "sub-kontak";

const MAIN_OPTIONS = [
  { id: "cuaca", label: "Cuaca hari ini", text: "" },
  { id: "peringatan", label: "Peringatan aktif", text: "Apa saja peringatan dini bencana yang aktif sekarang di Jember?" },
  { id: "prediksi", label: "Prediksi cuaca", text: "" },
  { id: "pos", label: "Pos pengungsian", text: "Di mana saja lokasi pos pengungsian di Kabupaten Jember?" },
  { id: "kontak", label: "Kontak darurat", text: "" },
  { id: "lapor", label: "Cara lapor bencana", text: "Bagaimana cara melaporkan bencana melalui aplikasi Jember Siaga?" },
];

const KECAMATAN_LIST = [
  "Ajung", "Ambulu", "Arjasa", "Balung", "Bangsalsari", "Gumukmas", "Jelbuk", "Jenggawah", 
  "Jombang", "Kalisat", "Kaliwates", "Kencong", "Ledokombo", "Mayang", "Mumbulsari", "Pakusari", 
  "Panti", "Patrang", "Puger", "Rambipuji", "Semboro", "Silo", "Sukorambi", "Sukowono", 
  "Sumberbaru", "Sumberjambe", "Sumbersari", "Tanggul", "Tempurejo", "Umbulsari", "Wuluhan"
];

const KONTAK_LIST = [
  "BPBD Jember",
  "Pemadam Kebakaran (Damkar)",
  "Kepolisian / Polres",
  "Rumah Sakit / Ambulans",
  "Tim SAR / Basarnas",
  "PMI Jember",
  "PLN (Gangguan Listrik)",
  "Call Center 112"
];

// ─── Bot Typing Indicator ─────────────────────────────────────────────────────

function TypingDots() {
  return (
    <div className="flex items-center gap-1 px-3 py-2.5">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="w-2 h-2 rounded-full bg-[#1f2a56]/40 animate-bounce"
          style={{ animationDelay: `${i * 0.15}s` }}
        />
      ))}
    </div>
  );
}

// ─── Single Message Bubble ────────────────────────────────────────────────────

function MessageBubble({ msg }: { msg: ChatMessage }) {
  const isUser = msg.role === "user";

  // Render markdown-like formatting: **bold**, bullet lists
  const renderContent = (text: string) => {
    const lines = text.split("\n");
    return lines.map((line, i) => {
      const boldLine = line.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
      if (line.startsWith("- ") || line.startsWith("• ")) {
        return (
          <li
            key={i}
            className="ml-3 list-disc"
            dangerouslySetInnerHTML={{ __html: boldLine.slice(2) }}
          />
        );
      }
      if (line.trim() === "") return <div key={i} className="h-1.5" />;
      return (
        <p key={i} dangerouslySetInnerHTML={{ __html: boldLine }} />
      );
    });
  };

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"} mb-2`}>
      {!isUser && (
        <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mr-2 mt-0.5 overflow-hidden border border-slate-200 bg-white">
          <Image src="/images/chat/jesi-avatar.png" alt="Jesi" width={28} height={28} className="object-cover" />
        </div>
      )}
      <div
        className={`
          max-w-[80%] px-3 py-2.5 rounded-2xl text-[12.5px] leading-relaxed shadow-sm
          ${isUser
            ? "bg-[#1f2a56] text-white rounded-br-sm"
            : "bg-white text-slate-700 rounded-bl-sm border border-slate-100"
          }
        `}
      >
        {msg.loading ? (
          <TypingDots />
        ) : (
          <div className="space-y-0.5">{renderContent(msg.content)}</div>
        )}
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function FloatingChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [menuState, setMenuState] = useState<MenuState>("main");
  const [selectedDay, setSelectedDay] = useState<string>("");
  const [history, setHistory] = useState<GrokMessage[]>([]);
  const [dbKontak, setDbKontak] = useState<{ id: string; nama: string }[]>([]);
  const [bottomOffset, setBottomOffset] = useState(32);
  const [windowOffset, setWindowOffset] = useState(88);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (isOpen && wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  useEffect(() => {
    const footer = document.querySelector("footer");
    if (!footer) return;

    const update = () => {
      const footerRect = footer.getBoundingClientRect();
      const viewportH = window.innerHeight;

      if (footerRect.top < viewportH) {
        // footer is visible
        const overlap = viewportH - footerRect.top;
        setBottomOffset(overlap + 16);
        setWindowOffset(overlap + 16 + 56 + 16); // offset + button height + gap
      } else {
        setBottomOffset(32);
        setWindowOffset(88);
      }
    };

    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update, { passive: true });
    // setTimeout to run after initial render layout
    setTimeout(update, 100);

    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  // Fetch db kontak
  useEffect(() => {
    const fetchKontak = async () => {
      try {
        const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";
        const res = await fetch(`${baseUrl}/kontak-darurat?per_page=100`);
        if (res.ok) {
          const json = await res.json();
          if (json.data) {
            setDbKontak(
              json.data
                .filter((k: any) => k.is_active)
                .map((k: any) => ({ id: k.id, nama: k.nama }))
            );
          }
        }
      } catch (err) {
        console.error("Gagal mengambil data kontak darurat", err);
      }
    };
    fetchKontak();
  }, []);

  // Welcome message on first open
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([
        {
          id: "welcome",
          role: "assistant",
          content: "Halo! 👋 \nSaya **SiJesi**, \nAsisten Virtual Jember Siaga.\n\nSaya siap membantu Anda dengan informasi cuaca, bencana, dan keselamatan di Kabupaten Jember. Silakan pilih pertanyaan dari opsi di bawah ini yaa... 😊",
        },
      ]);
    }
  }, [isOpen, messages.length]);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) setIsOpen(false);
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [isOpen]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content: text.trim(),
    };
    const loadingMsg: ChatMessage = {
      id: `loading-${Date.now()}`,
      role: "assistant",
      content: "",
      loading: true,
    };

    setMessages((prev) => [...prev, userMsg, loadingMsg]);
    setIsLoading(true);

    const newHistory: GrokMessage[] = [
      ...history,
      { role: "user", content: text.trim() },
    ];

    try {
      const reply = await sendGrokMessage(newHistory);
      const botMsg: ChatMessage = {
        id: `bot-${Date.now()}`,
        role: "assistant",
        content: reply,
      };
      setMessages((prev) => [...prev.filter((m) => !m.loading), botMsg]);
      setHistory([...newHistory, { role: "assistant", content: reply }]);
    } catch {
      setMessages((prev) => [
        ...prev.filter((m) => !m.loading),
        {
          id: `err-${Date.now()}`,
          role: "assistant",
          content: "Maaf, terjadi kesalahan saat menghubungi server. Silakan coba lagi.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickAction = (text: string) => {
    sendMessage(text);
  };

  const showQuickActions = !isLoading;

  return (
    <div ref={wrapperRef}>
      <ToggleButton isOpen={isOpen} onClick={() => setIsOpen((p) => !p)} bottomOffset={bottomOffset} />

      {isOpen && (
        <div
          className="fixed z-40 flex flex-col rounded-2xl shadow-2xl overflow-hidden bg-white transition-all duration-300"
          style={{
            bottom: `${windowOffset}px`,
            right: "2.5rem",
            width: "22rem",
            height: "540px",
            fontFamily: "Poppins, Inter, system-ui, sans-serif",
            animation: "slideUp 0.25s cubic-bezier(0.34,1.56,0.64,1)",
          }}
        >
          <style>{`
            @keyframes slideUp {
              from { opacity: 0; transform: translateY(20px) scale(0.95); }
              to   { opacity: 1; transform: translateY(0) scale(1); }
            }
            .chat-scrollbar::-webkit-scrollbar { width: 4px; }
            .chat-scrollbar::-webkit-scrollbar-track { background: transparent; }
            .chat-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 99px; }
          `}</style>

          {/* ── Header ── */}
          <div className="flex-shrink-0 bg-[#1f2a56] px-4 py-3 flex items-center gap-3">
            <div className="relative flex-shrink-0">
              <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center overflow-hidden border-2 border-white shadow-sm">
                <Image src="/images/chat/jesi-avatar.png" alt="Jesi Avatar" width={40} height={40} className="object-cover" />
              </div>
              <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 border-2 border-[#1f2a56] rounded-full" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-white text-sm leading-tight">SiJesi</p>
              <p className="text-[9px] text-blue-100 leading-tight">
                {isLoading ? "Sedang mengetik..." : "Online"}
              </p>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-white/20 transition-colors flex-shrink-0"
              aria-label="Tutup chat"
            >
              <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* ── Messages Area ── */}
          <div className="flex-1 overflow-y-auto chat-scrollbar bg-[#F0F6FF] px-3 py-3">
            {messages.map((msg) => (
              <MessageBubble key={msg.id} msg={msg} />
            ))}

            {/* Quick Action Chips */}
            {showQuickActions && (
              <div className="mt-4 border-t border-slate-200/60 pt-4">
                {menuState === "main" ? (
                  <>
                    <p className="text-[11px] font-medium text-slate-500 mb-3 text-center">Pilih topik pertanyaan:</p>
                    <div className="grid grid-cols-2 gap-2">
                      {MAIN_OPTIONS.map((opt) => (
                        <button
                          key={opt.id}
                          onClick={() => {
                            if (opt.id === "cuaca") setMenuState("sub-cuaca");
                            else if (opt.id === "prediksi") setMenuState("sub-prediksi-hari");
                            else if (opt.id === "kontak") setMenuState("sub-kontak");
                            else handleQuickAction(opt.text!);
                          }}
                          className="group flex flex-col justify-center text-left text-[11px] leading-snug font-medium px-3 py-2.5 rounded-lg bg-white border border-slate-200 text-slate-600 hover:border-[#1f2a56] hover:shadow-sm hover:text-[#1f2a56] transition-all duration-200"
                        >
                          <span className="block">{opt.label}</span>
                        </button>
                      ))}
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex items-center justify-between mb-3">
                      <button onClick={() => {
                        if (menuState === "sub-prediksi") setMenuState("sub-prediksi-hari");
                        else setMenuState("main");
                      }} className="text-[10px] text-slate-400 hover:text-[#1f2a56] flex items-center gap-1 font-medium transition-colors">
                        <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
                        Kembali
                      </button>
                      <p className="text-[11px] font-medium text-slate-500 text-right flex-1">
                        {menuState === "sub-prediksi-hari" ? "Pilih Hari:" :
                         menuState === "sub-kontak" ? "Pilih Kontak:" :
                         `Pilih Wilayah (${menuState === "sub-cuaca" ? "Cuaca" : "Prediksi"}):`}
                      </p>
                    </div>
                    <div className="grid grid-cols-2 gap-2 max-h-[200px] overflow-y-auto chat-scrollbar pr-1 pb-4">
                      {menuState === "sub-prediksi-hari" ? (
                        ["Hari ini", "Besok", "Lusa"].map((hari) => (
                          <button
                            key={hari}
                            onClick={() => {
                              setSelectedDay(hari.toLowerCase());
                              setMenuState("sub-prediksi");
                            }}
                            className="col-span-2 group flex flex-col justify-center text-center text-[11px] leading-snug font-medium px-3 py-2.5 rounded-lg bg-white border border-slate-200 text-slate-600 hover:border-[#1f2a56] hover:shadow-sm hover:text-[#1f2a56] transition-all duration-200"
                          >
                            <span className="block font-semibold">{hari}</span>
                          </button>
                        ))
                      ) : (
                        <>
                          {(menuState === "sub-cuaca" || menuState === "sub-prediksi" || menuState === "sub-kontak") && (
                            <button
                              onClick={() => {
                                const query = menuState === "sub-kontak" 
                                  ? "Berikan semua nomor kontak darurat penting di Kabupaten Jember."
                                  : menuState === "sub-cuaca" 
                                    ? "Bagaimana kondisi cuaca hari ini secara keseluruhan di Kabupaten Jember?" 
                                    : `Bagaimana prediksi cuaca untuk ${selectedDay} secara keseluruhan di Kabupaten Jember?`;
                                handleQuickAction(query);
                                setMenuState("main");
                              }}
                              className="col-span-2 group flex flex-col justify-center text-center text-[11px] leading-snug font-medium px-3 py-2.5 rounded-lg bg-blue-50 border border-blue-200 text-[#1f2a56] hover:bg-blue-100 hover:border-blue-300 transition-all duration-200"
                            >
                              <span className="block">{menuState === "sub-kontak" ? "Seluruh Kontak Darurat Jember" : "Ringkasan Keseluruhan Jember"}</span>
                            </button>
                          )}
                          
                          {menuState === "sub-kontak" ? (
                            dbKontak.length > 0 ? (
                              dbKontak.map((kontak) => (
                                <button
                                  key={kontak.id}
                                  onClick={() => {
                                    handleQuickAction(`Berikan informasi kontak darurat untuk ${kontak.nama} di Kabupaten Jember.`);
                                    setMenuState("main");
                                  }}
                                  className="group flex flex-col justify-center text-left text-[11px] leading-snug font-medium px-3 py-2.5 rounded-lg bg-white border border-slate-200 text-slate-600 hover:border-[#1f2a56] hover:shadow-sm hover:text-[#1f2a56] transition-all duration-200"
                                >
                                  <span className="block">{kontak.nama}</span>
                                </button>
                              ))
                            ) : (
                              KONTAK_LIST.map((kontak) => (
                                <button
                                  key={kontak}
                                  onClick={() => {
                                    handleQuickAction(`Berikan informasi kontak darurat untuk ${kontak} di Kabupaten Jember.`);
                                    setMenuState("main");
                                  }}
                                  className="group flex flex-col justify-center text-left text-[11px] leading-snug font-medium px-3 py-2.5 rounded-lg bg-white border border-slate-200 text-slate-600 hover:border-[#1f2a56] hover:shadow-sm hover:text-[#1f2a56] transition-all duration-200"
                                >
                                  <span className="block">{kontak}</span>
                                </button>
                              ))
                            )
                          ) : (
                            KECAMATAN_LIST.map((kec) => (
                              <button
                                key={kec}
                                onClick={() => {
                                  const base = menuState === "sub-cuaca" ? "Bagaimana kondisi cuaca hari ini" : `Bagaimana prediksi cuaca untuk ${selectedDay}`;
                                  handleQuickAction(`${base} di Kecamatan ${kec}, Kabupaten Jember?`);
                                  setMenuState("main");
                                }}
                                className="group flex flex-col justify-center text-left text-[11px] leading-snug font-medium px-3 py-2.5 rounded-lg bg-white border border-slate-200 text-slate-600 hover:border-[#1f2a56] hover:shadow-sm hover:text-[#1f2a56] transition-all duration-200"
                              >
                                <span className="block">Kec. {kec}</span>
                              </button>
                            ))
                          )}
                        </>
                      )}
                    </div>
                  </>
                )}
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* ── Footer ── */}
          <div className="flex-shrink-0 bg-white border-t border-slate-100 px-3 py-2.5">
            <p className="text-[10px] text-slate-400 text-center">
              Ditenagai oleh Grok AI
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
