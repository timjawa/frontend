// ===================== BERITA PAGE DATA =====================

export interface BeritaItem {
  id: string | number;
  title: string;
  excerpt: string;
  date: string;
  category: string;
  categoryColor: string;
  image: string;
  source: string;
  featured?: boolean;
}

export const beritaCategories = [
  "Semua",
  "Banjir",
  "Gempa Bumi",
  "Tanah Longsor",
  "Cuaca Ekstrem",
  "Kebakaran",
  "Logistik",
];

export const beritaHero: BeritaItem = {
  id: 0,
  title:
    "Waspada Luapan Sungai Bedadung, Warga Bantaran Diminta Siaga Satu",
  excerpt:
    "Intensitas hujan yang tinggi di kawasan hulu menyebabkan debit air Sungai Bedadung meningkat drastis. BPBD Jember telah mensiagakan personel di..",
  date: "19 Oktober 2024",
  category: "PERINGATAN DINI",
  categoryColor: "bg-red-600",
  image: "/news/hero-flood.png",
  source: "Pusdalops BPBD",
  featured: true,
};

export const beritaList: BeritaItem[] = [
  {
    id: 1,
    title:
      "Akses Jalan Menuju Rembangan Tertutup Material Longsor",
    excerpt:
      "Tim gabungan sedang berupaya membersihkan material tanah dan potion bongkar yang menutuap akses selama Pembersihan pagi ini.",
    date: "2 jam yang lalu",
    category: "TANAH LONGSOR",
    categoryColor: "bg-amber-600",
    image: "/news/landslide.png",
    source: "Radar Jember",
  },
  {
    id: 2,
    title:
      "BMKG Prediksi Angin Kencang di Wilayah Pesisir Selatan Jember",
    excerpt:
      "Nelayan dihimbau untuk tidak melaut sementara sektor kelautan yang berpotensi rawan hingga tiga hari ke depan.",
    date: "5 jam yang lalu",
    category: "CUACA EKSTREM",
    categoryColor: "bg-blue-600",
    image: "/news/strong-wind.png",
    source: "BMKG Official",
  },
  {
    id: 3,
    title:
      "Simulasi Mitigasi Gempa Bumi di Sekolah Menengah Pertama Jember",
    excerpt:
      "Murid pelajaran keselamatan siswa dalam menghadapi potensi gempa bumi melalui simulasi evakuasi mandiri yang rutin dilaksanakan.",
    date: "",
    category: "GEMPA BUMI",
    categoryColor: "bg-indigo-600",
    image: "/news/earthquake-drill.png",
    source: "Jember Siaga",
  },
  {
    id: 4,
    title:
      "Update Cuaca: Hujan Ringan Merata di Seluruh Kecamatan",
    excerpt:
      "Pemantauan terkini mengindikasikan awan mendung menyelimuti seluruh wilayah Jember hingga kawah Argopuro.",
    date: "10 Okt 2024",
    category: "BANJIR",
    categoryColor: "bg-cyan-600",
    image: "/news/weather-rain.png",
    source: "Siaga News",
  },
  {
    id: 5,
    title:
      "Penyuluhan Pencegahan Karhutla di Wilayah Hutan Lindung",
    excerpt:
      "Relawan Jember Siaga bersama Perhutani melakukan sosialisasi pencegahan di sekitar hutan untuk tidak membakar lahan.",
    date: "11 Okt 2024",
    category: "KEBAKARAN",
    categoryColor: "bg-orange-600",
    image: "/news/strong-wind.png",
    source: "Media Jember",
  },
  {
    id: 6,
    title:
      "BPBD Pastikan Stok Logistik Bencana Cukup Untuk Akhir Tahun",
    excerpt:
      "Persediaan sembako, selimut, dan tenda darurat telah didistribusikan ke gudang-gudang kecamatan bencana.",
    date: "10 Okt 2024",
    category: "LOGISTIK",
    categoryColor: "bg-teal-600",
    image: "/news/landslide.png",
    source: "Humas Pemkab",
  },
];
