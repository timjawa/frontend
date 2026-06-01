"use client";
import React, { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  HiOutlineMap,
  HiOutlineCloud,
  HiOutlineBellAlert,
  HiOutlineHomeModern,
  HiOutlineUsers,
  HiOutlineDocumentText,
  HiOutlineChatBubbleLeftRight,
  HiOutlineNewspaper,
  HiOutlineQuestionMarkCircle,
  HiOutlinePhone,
  HiOutlineMapPin,
  HiOutlinePlus,
  HiOutlinePencil,
  HiOutlineHeart,
  HiOutlineBanknotes,
  HiOutlineArrowPathRoundedSquare,
  HiMagnifyingGlass,
} from "react-icons/hi2";
import { GridIcon } from "@/icons";
import { useAuth } from "@/context/AuthContext";

type CommandItem = {
  id: string;
  label: string;
  description?: string;
  path: string;
  icon: React.ReactNode;
  keywords: string[];
  category: string;
  superAdminOnly?: boolean; // Jika true, hanya super_admin yang bisa melihat
};

const allCommands: CommandItem[] = [
  // Dashboard
  {
    id: "dashboard",
    label: "Dashboard",
    description: "Halaman utama admin",
    path: "/admin/dashboard",
    icon: <GridIcon />,
    keywords: ["dashboard", "beranda", "home", "utama"],
    category: "Monitoring",
  },
  // Peta Bencana
  {
    id: "peta-bencana",
    label: "Peta Bencana",
    description: "Visualisasi peta bencana Jember",
    path: "/admin/peta-bencana",
    icon: <HiOutlineMap className="w-5 h-5" />,
    keywords: ["peta", "bencana", "map", "visualisasi"],
    category: "Monitoring",
  },
  // Pos Pengungsian
  {
    id: "pos-pengungsian",
    label: "Pos Pengungsian",
    description: "Daftar pos pengungsian",
    path: "/admin/pos-pengungsian",
    icon: <HiOutlineHomeModern className="w-5 h-5" />,
    keywords: ["pos", "pengungsian", "shelter", "daftar"],
    category: "Monitoring",
  },
  {
    id: "tambah-pos-pengungsian",
    label: "Tambah Pos Pengungsian",
    description: "Tambah data pos pengungsian baru",
    path: "/admin/pos-pengungsian/create",
    icon: <HiOutlinePlus className="w-5 h-5" />,
    keywords: ["tambah", "pos", "pengungsian", "baru", "create"],
    category: "Monitoring",
  },
  // Peringatan Dini
  {
    id: "peringatan-dini",
    label: "Peringatan Dini",
    description: "Daftar peringatan dini bencana",
    path: "/admin/peringatan-dini",
    icon: <HiOutlineBellAlert className="w-5 h-5" />,
    keywords: ["peringatan", "dini", "alert", "warning", "bencana"],
    category: "Monitoring",
  },
  {
    id: "tambah-peringatan-dini",
    label: "Tambah Peringatan Dini",
    description: "Buat peringatan dini baru",
    path: "/admin/peringatan-dini/create",
    icon: <HiOutlinePlus className="w-5 h-5" />,
    keywords: ["tambah", "peringatan", "dini", "baru", "create"],
    category: "Monitoring",
  },
  // Cuaca
  {
    id: "cuaca-realtime",
    label: "Cuaca Realtime",
    description: "Data cuaca terkini",
    path: "/admin/cuaca/realtime",
    icon: <HiOutlineCloud className="w-5 h-5" />,
    keywords: ["cuaca", "realtime", "weather", "terkini"],
    category: "Monitoring",
  },
  {
    id: "prediksi-cuaca",
    label: "Prediksi Cuaca",
    description: "Prakiraan cuaca ke depan",
    path: "/admin/cuaca/prediksi",
    icon: <HiOutlineCloud className="w-5 h-5" />,
    keywords: ["cuaca", "prediksi", "prakiraan", "forecast"],
    category: "Monitoring",
  },
  // Pengaduan
  {
    id: "pengaduan",
    label: "Manajemen Pengaduan",
    description: "Kelola laporan pengaduan masyarakat",
    path: "/admin/pengaduan",
    icon: <HiOutlineChatBubbleLeftRight className="w-5 h-5" />,
    keywords: ["pengaduan", "komplain", "laporan", "masyarakat", "kelola"],
    category: "Operasional",
  },
  // Laporan
  {
    id: "laporan",
    label: "Laporan",
    description: "Laporan bencana yang masuk",
    path: "/admin/laporan",
    icon: <HiOutlineDocumentText className="w-5 h-5" />,
    keywords: ["laporan", "bencana", "report"],
    category: "Operasional",
  },
  // Donasi
  {
    id: "kampanye-donasi",
    label: "Kampanye Donasi",
    description: "Kelola kampanye donasi bencana",
    path: "/admin/donasi/kampanye",
    icon: <HiOutlineHeart className="w-5 h-5" />,
    keywords: ["donasi", "kampanye", "bantuan", "dana", "fundraising"],
    category: "Donasi",
  },
  {
    id: "tambah-kampanye-donasi",
    label: "Tambah Kampanye Donasi",
    description: "Buat kampanye donasi baru",
    path: "/admin/donasi/kampanye/create",
    icon: <HiOutlinePlus className="w-5 h-5" />,
    keywords: ["tambah", "donasi", "kampanye", "baru", "create", "bantuan"],
    category: "Donasi",
  },
  {
    id: "transaksi-donasi",
    label: "Transaksi Donasi",
    description: "Pantau pembayaran donasi",
    path: "/admin/donasi/transaksi",
    icon: <HiOutlineBanknotes className="w-5 h-5" />,
    keywords: ["donasi", "transaksi", "pembayaran", "midtrans", "donatur", "bayar"],
    category: "Donasi",
  },
  {
    id: "penyaluran-donasi",
    label: "Penyaluran Donasi",
    description: "Kelola penyaluran dana donasi",
    path: "/admin/donasi/penyaluran",
    icon: <HiOutlineArrowPathRoundedSquare className="w-5 h-5" />,
    keywords: ["donasi", "penyaluran", "disalurkan", "transparansi", "dana"],
    category: "Donasi",
  },
  {
    id: "tambah-penyaluran-donasi",
    label: "Tambah Penyaluran Donasi",
    description: "Catat penyaluran dana donasi",
    path: "/admin/donasi/penyaluran/create",
    icon: <HiOutlinePlus className="w-5 h-5" />,
    keywords: ["tambah", "donasi", "penyaluran", "baru", "create", "transparansi"],
    category: "Donasi",
  },
  // Berita
  {
    id: "berita",
    label: "Berita",
    description: "Daftar berita dan informasi publik",
    path: "/admin/berita",
    icon: <HiOutlineNewspaper className="w-5 h-5" />,
    keywords: ["berita", "informasi", "news", "publik"],
    category: "Informasi Publik",
    superAdminOnly: true,
  },
  {
    id: "tambah-berita",
    label: "Tambah Berita",
    description: "Tulis berita baru",
    path: "/admin/berita/create",
    icon: <HiOutlinePlus className="w-5 h-5" />,
    keywords: ["tambah", "berita", "tulis", "baru", "create"],
    category: "Informasi Publik",
    superAdminOnly: true,
  },
  // FAQ
  {
    id: "faq",
    label: "FAQ",
    description: "Pertanyaan yang sering diajukan",
    path: "/admin/faq",
    icon: <HiOutlineQuestionMarkCircle className="w-5 h-5" />,
    keywords: ["faq", "pertanyaan", "jawaban", "tanya"],
    category: "Informasi Publik",
    superAdminOnly: true,
  },
  {
    id: "tambah-faq",
    label: "Tambah FAQ",
    description: "Tambah pertanyaan & jawaban baru",
    path: "/admin/faq/create",
    icon: <HiOutlinePlus className="w-5 h-5" />,
    keywords: ["tambah", "faq", "pertanyaan", "baru", "create"],
    category: "Informasi Publik",
    superAdminOnly: true,
  },
  // Kontak Darurat
  {
    id: "kontak-darurat",
    label: "Kontak Darurat",
    description: "Daftar kontak darurat",
    path: "/admin/kontak-darurat",
    icon: <HiOutlinePhone className="w-5 h-5" />,
    keywords: ["kontak", "darurat", "telepon", "emergency"],
    category: "Informasi Publik",
    superAdminOnly: true,
  },
  {
    id: "tambah-kontak-darurat",
    label: "Tambah Kontak Darurat",
    description: "Tambah kontak darurat baru",
    path: "/admin/kontak-darurat/create",
    icon: <HiOutlinePlus className="w-5 h-5" />,
    keywords: ["tambah", "kontak", "darurat", "baru", "create"],
    category: "Informasi Publik",
    superAdminOnly: true,
  },
  // Kecamatan
  {
    id: "kecamatan",
    label: "Data Kecamatan",
    description: "Daftar kecamatan di Jember",
    path: "/admin/kecamatan",
    icon: <HiOutlineMapPin className="w-5 h-5" />,
    keywords: ["kecamatan", "wilayah", "data", "daftar"],
    category: "Data",
    superAdminOnly: true,
  },
  {
    id: "tambah-kecamatan",
    label: "Tambah Kecamatan",
    description: "Tambah data kecamatan baru",
    path: "/admin/kecamatan/create",
    icon: <HiOutlinePlus className="w-5 h-5" />,
    keywords: ["tambah", "kecamatan", "baru", "create"],
    category: "Data",
    superAdminOnly: true,
  },
  // Pengguna
  {
    id: "pengguna",
    label: "Pengguna JESI",
    description: "Manajemen pengguna aplikasi JESI",
    path: "/admin/pengguna",
    icon: <HiOutlineUsers className="w-5 h-5" />,
    keywords: ["pengguna", "user", "jesi", "akun", "manajemen"],
    category: "Data",
    superAdminOnly: true,
  },
  {
    id: "tambah-admin",
    label: "Tambah Admin BPBD",
    description: "Tambah akun admin BPBD baru",
    path: "/admin/pengguna/create",
    icon: <HiOutlinePlus className="w-5 h-5" />,
    keywords: ["tambah", "admin", "bpbd", "pengguna", "baru", "create"],
    category: "Data",
    superAdminOnly: true,
  },
  // Profil
  {
    id: "profil",
    label: "Profil Saya",
    description: "Edit profil dan pengaturan akun",
    path: "/admin/profile",
    icon: <HiOutlinePencil className="w-5 h-5" />,
    keywords: ["profil", "profile", "akun", "edit", "pengaturan", "sandi", "password"],
    category: "Akun",
  },
];

function scoreMatch(item: CommandItem, query: string): number {
  const q = query.toLowerCase().trim();
  if (!q) return 1;
  const labelLower = item.label.toLowerCase();
  const descLower = (item.description || "").toLowerCase();
  const keywordsJoined = item.keywords.join(" ").toLowerCase();

  if (labelLower === q) return 100;
  if (labelLower.startsWith(q)) return 90;
  if (keywordsJoined.includes(q)) return 80;
  if (labelLower.includes(q)) return 70;
  if (descLower.includes(q)) return 50;

  // Partial word matches
  const words = q.split(" ");
  const matchedWords = words.filter(
    (w) => labelLower.includes(w) || keywordsJoined.includes(w)
  );
  if (matchedWords.length === words.length) return 60;
  if (matchedWords.length > 0) return 30;

  return 0;
}

const categoryColors: Record<string, string> = {
  Monitoring: "text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-500/10",
  Operasional: "text-emerald-600 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-500/10",
  "Informasi Publik": "text-purple-600 bg-purple-50 dark:text-purple-400 dark:bg-purple-500/10",
  Donasi: "text-rose-600 bg-rose-50 dark:text-rose-400 dark:bg-rose-500/10",
  Data: "text-orange-600 bg-orange-50 dark:text-orange-400 dark:bg-orange-500/10",
  Akun: "text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-700",
};

interface CommandPaletteProps {
  inputRef: React.RefObject<HTMLInputElement | null>;
}

export default function CommandPalette({ inputRef }: CommandPaletteProps) {
  const router = useRouter();
  const { user } = useAuth();
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isMac, setIsMac] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const isSuperAdmin = user?.role === "super_admin";

  // Filter commands based on role
  const availableCommands = isSuperAdmin
    ? allCommands
    : allCommands.filter((cmd) => !cmd.superAdminOnly);

  // Detect Mac on client side
  useEffect(() => {
    setIsMac(navigator.platform.toUpperCase().includes("MAC") || navigator.userAgent.includes("Mac"));
  }, []);

  const filteredCommands = query.trim()
    ? availableCommands
        .map((item) => ({ item, score: scoreMatch(item, query) }))
        .filter(({ score }) => score > 0)
        .sort((a, b) => b.score - a.score)
        .map(({ item }) => item)
    : [];

  const navigate = useCallback(
    (path: string) => {
      router.push(path);
      setQuery("");
      setIsOpen(false);
      inputRef.current?.blur();
    },
    [router, inputRef]
  );

  useEffect(() => {
    setActiveIndex(0);
  }, [query]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setActiveIndex((i) => Math.min(i + 1, filteredCommands.length - 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setActiveIndex((i) => Math.max(i - 1, 0));
      } else if (e.key === "Enter") {
        e.preventDefault();
        if (filteredCommands[activeIndex]) {
          navigate(filteredCommands[activeIndex].path);
        }
      } else if (e.key === "Escape") {
        setIsOpen(false);
        setQuery("");
        inputRef.current?.blur();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, filteredCommands, activeIndex, navigate, inputRef]);

  // Close when clicking outside
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        !inputRef.current?.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [inputRef]);

  // Group by category
  const grouped = filteredCommands.reduce<Record<string, CommandItem[]>>(
    (acc, item) => {
      if (!acc[item.category]) acc[item.category] = [];
      acc[item.category].push(item);
      return acc;
    },
    {}
  );

  // Flat list for keyboard navigation index
  let flatIndex = 0;

  return (
    <div className="relative w-full xl:w-[430px]">
      <div className="relative">
        <span className="absolute -translate-y-1/2 left-4 top-1/2 pointer-events-none">
          <HiMagnifyingGlass className="w-5 h-5 text-gray-400 dark:text-gray-500" />
        </span>
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => {
            if (query) setIsOpen(true);
          }}
          placeholder="Search or type command..."
          className="dark:bg-dark-900 h-11 w-full rounded-lg border border-gray-200 bg-transparent py-2.5 pl-12 pr-24 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-800 dark:bg-gray-900 dark:bg-white/[0.03] dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
          autoComplete="off"
        />
        {/* Shortcut hint or clear button */}
        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
          {query ? (
            <button
              type="button"
              onClick={() => { setQuery(""); setIsOpen(false); inputRef.current?.focus(); }}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors p-0.5"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          ) : (
            <div className="flex items-center gap-0.5 pointer-events-none">
              {isMac ? (
                // Mac: tampilkan ⌘K
                <>
                  <kbd className="flex items-center justify-center h-5 min-w-5 px-1 rounded border border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 font-mono text-[11px] font-medium leading-none">
                    ⌘
                  </kbd>
                  <kbd className="flex items-center justify-center h-5 min-w-5 px-1 rounded border border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 font-mono text-[10px] font-medium leading-none">
                    K
                  </kbd>
                </>
              ) : (
                // Windows/Linux: tampilkan Ctrl+K
                <>
                  <kbd className="flex items-center justify-center h-5 min-w-5 px-1 rounded border border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 font-mono text-[10px] font-medium leading-none">
                    Ctrl
                  </kbd>
                  <span className="text-gray-300 dark:text-gray-600 text-xs">+</span>
                  <kbd className="flex items-center justify-center h-5 min-w-5 px-1 rounded border border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 font-mono text-[10px] font-medium leading-none">
                    K
                  </kbd>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {isOpen && filteredCommands.length > 0 && (
        <div
          ref={dropdownRef}
          className="absolute top-[calc(100%+8px)] left-0 w-full min-w-[360px] bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl z-[99999] overflow-hidden"
        >
          <div className="max-h-[420px] overflow-y-auto">
            {Object.entries(grouped).map(([category, items]) => (
              <div key={category}>
                <div className="px-4 py-2 text-[10px] font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500 bg-gray-50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-800">
                  {category}
                </div>
                {items.map((item) => {
                  const currentFlatIndex = flatIndex++;
                  const isActive = currentFlatIndex === activeIndex;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => navigate(item.path)}
                      onMouseEnter={() => setActiveIndex(currentFlatIndex)}
                      className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors ${
                        isActive
                          ? "bg-brand-50 dark:bg-brand-500/10"
                          : "hover:bg-gray-50 dark:hover:bg-gray-800"
                      }`}
                    >
                      <div
                        className={`shrink-0 p-2 rounded-lg ${
                          categoryColors[category] || "text-gray-500 bg-gray-100"
                        }`}
                      >
                        {item.icon}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className={`text-sm font-medium truncate ${isActive ? "text-brand-600 dark:text-brand-400" : "text-gray-800 dark:text-gray-200"}`}>
                          {item.label}
                        </p>
                        {item.description && (
                          <p className="text-xs text-gray-400 dark:text-gray-500 truncate mt-0.5">
                            {item.description}
                          </p>
                        )}
                      </div>
                      <div className={`shrink-0 text-[10px] font-medium px-2 py-0.5 rounded-md ${categoryColors[category] || ""}`}>
                        {category}
                      </div>
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
          <div className="px-4 py-2 border-t border-gray-100 dark:border-gray-800 flex items-center gap-3 text-xs text-gray-400 dark:text-gray-500 bg-gray-50 dark:bg-gray-800/50">
            <span className="flex items-center gap-1"><kbd className="px-1.5 py-0.5 rounded border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 font-mono text-[10px]">↑↓</kbd> navigasi</span>
            <span className="flex items-center gap-1"><kbd className="px-1.5 py-0.5 rounded border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 font-mono text-[10px]">↵</kbd> buka</span>
            <span className="flex items-center gap-1"><kbd className="px-1.5 py-0.5 rounded border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 font-mono text-[10px]">Esc</kbd> tutup</span>
          </div>
        </div>
      )}
    </div>
  );
}
