import {
  WiDaySunny,
  WiCloudy,
  WiDayCloudy,
  WiRain,
  WiThunderstorm,
  WiDayRainMix,
} from "react-icons/wi";

// ===================== WEATHER DATA =====================
export const weatherStatus = {
  status: "AMAN",
  message: "BELUM ADA INFORMASI PERINGATAN DINI",
  description:
    "Kondisi cuaca di wilayah Kabupaten Jember saat ini dalam keadaan aman. Tidak ada peringatan dini cuaca ekstrem yang dikeluarkan oleh BMKG untuk wilayah ini. Masyarakat dapat melakukan aktivitas seperti biasa dengan tetap memperhatikan perkembangan cuaca.",
  date: "Senin, 30 Maret 2026",
};

export const weatherLocations = [
  {
    id: 1,
    name: "Kaliwates",
    icon: "sunny",
    temp: "32°C",
    condition: "Cerah",
    humidity: "65%",
  },
  {
    id: 2,
    name: "Sumbersari",
    icon: "partly-cloudy",
    temp: "30°C",
    condition: "Berawan Sebagian",
    humidity: "70%",
  },
  {
    id: 3,
    name: "Patrang",
    icon: "cloudy",
    temp: "28°C",
    condition: "Berawan",
    humidity: "75%",
  },
  {
    id: 4,
    name: "Tanggul",
    icon: "light-rain",
    temp: "27°C",
    condition: "Hujan Ringan",
    humidity: "80%",
  },
  {
    id: 5,
    name: "Jombang",
    icon: "sunny",
    temp: "31°C",
    condition: "Cerah",
    humidity: "62%",
  },
  {
    id: 6,
    name: "Ambulu",
    icon: "partly-cloudy",
    temp: "29°C",
    condition: "Berawan Sebagian",
    humidity: "72%",
  },
  {
    id: 7,
    name: "Ajung",
    icon: "cloudy",
    temp: "28°C",
    condition: "Berawan",
    humidity: "74%",
  },
  {
    id: 8,
    name: "Kalisat",
    icon: "light-rain",
    temp: "26°C",
    condition: "Hujan Ringan",
    humidity: "82%",
  },
  {
    id: 9,
    name: "Rambipuji",
    icon: "sunny",
    temp: "31°C",
    condition: "Cerah",
    humidity: "64%",
  },
  {
    id: 10,
    name: "Balung",
    icon: "thunderstorm",
    temp: "25°C",
    condition: "Hujan Petir",
    humidity: "88%",
  },
];

// ===================== PREDICTION TABLE =====================
export const weatherPredictions = [
  {
    kecamatan: "Ajung",
    pagi: { suhu: "24°C", cuaca: "Cerah Berawan", icon: "partly-cloudy" },
    siang: { suhu: "32°C", cuaca: "Cerah", icon: "sunny" },
    sore: { suhu: "30°C", cuaca: "Berawan", icon: "cloudy" },
    malam: { suhu: "25°C", cuaca: "Hujan Ringan", icon: "light-rain" },
    dini_hari: { suhu: "22°C", cuaca: "Hujan Sedang", icon: "rain" },
  },
  {
    kecamatan: "Ambulu",
    pagi: { suhu: "23°C", cuaca: "Berawan", icon: "cloudy" },
    siang: { suhu: "31°C", cuaca: "Cerah Berawan", icon: "partly-cloudy" },
    sore: { suhu: "29°C", cuaca: "Berawan", icon: "cloudy" },
    malam: { suhu: "24°C", cuaca: "Hujan Ringan", icon: "light-rain" },
    dini_hari: { suhu: "21°C", cuaca: "Hujan Sedang", icon: "rain" },
  },
  {
    kecamatan: "Jelbuk",
    pagi: { suhu: "22°C", cuaca: "Cerah", icon: "sunny" },
    siang: { suhu: "30°C", cuaca: "Cerah Berawan", icon: "partly-cloudy" },
    sore: { suhu: "28°C", cuaca: "Berawan", icon: "cloudy" },
    malam: { suhu: "23°C", cuaca: "Berawan", icon: "cloudy" },
    dini_hari: { suhu: "20°C", cuaca: "Hujan Ringan", icon: "light-rain" },
  },
  {
    kecamatan: "Kalisat",
    pagi: { suhu: "23°C", cuaca: "Cerah Berawan", icon: "partly-cloudy" },
    siang: { suhu: "31°C", cuaca: "Cerah", icon: "sunny" },
    sore: { suhu: "29°C", cuaca: "Berawan", icon: "cloudy" },
    malam: { suhu: "24°C", cuaca: "Hujan Ringan", icon: "light-rain" },
    dini_hari: { suhu: "21°C", cuaca: "Hujan Sedang", icon: "rain" },
  },
  {
    kecamatan: "Jombang",
    pagi: { suhu: "24°C", cuaca: "Cerah", icon: "sunny" },
    siang: { suhu: "33°C", cuaca: "Cerah", icon: "sunny" },
    sore: { suhu: "30°C", cuaca: "Cerah Berawan", icon: "partly-cloudy" },
    malam: { suhu: "25°C", cuaca: "Berawan", icon: "cloudy" },
    dini_hari: { suhu: "22°C", cuaca: "Hujan Ringan", icon: "light-rain" },
  },
  {
    kecamatan: "Pakusari",
    pagi: { suhu: "23°C", cuaca: "Berawan", icon: "cloudy" },
    siang: { suhu: "30°C", cuaca: "Cerah Berawan", icon: "partly-cloudy" },
    sore: { suhu: "28°C", cuaca: "Hujan Ringan", icon: "light-rain" },
    malam: { suhu: "24°C", cuaca: "Hujan Sedang", icon: "rain" },
    dini_hari: { suhu: "21°C", cuaca: "Hujan Ringan", icon: "light-rain" },
  },
  {
    kecamatan: "Sumbersari",
    pagi: { suhu: "24°C", cuaca: "Cerah Berawan", icon: "partly-cloudy" },
    siang: { suhu: "32°C", cuaca: "Cerah", icon: "sunny" },
    sore: { suhu: "30°C", cuaca: "Berawan", icon: "cloudy" },
    malam: { suhu: "25°C", cuaca: "Hujan Ringan", icon: "light-rain" },
    dini_hari: { suhu: "22°C", cuaca: "Hujan Sedang", icon: "rain" },
  },
  {
    kecamatan: "Tanggul",
    pagi: { suhu: "22°C", cuaca: "Berawan", icon: "cloudy" },
    siang: { suhu: "29°C", cuaca: "Cerah Berawan", icon: "partly-cloudy" },
    sore: { suhu: "27°C", cuaca: "Hujan Ringan", icon: "light-rain" },
    malam: { suhu: "23°C", cuaca: "Hujan Sedang", icon: "rain" },
    dini_hari: { suhu: "20°C", cuaca: "Hujan Lebat", icon: "thunderstorm" },
  },
];

// ===================== ACTION TIPS =====================
export const actionTips = [
  {
    title: "Sebelum Terjadi Banjir",
    icon: "🛡️",
    items: [
      "Kenali tanda-tanda akan datangnya banjir di wilayah Anda",
      "Siapkan tas siaga bencana berisi obat-obatan, dokumen penting, dan makanan",
      "Hafalkan jalur evakuasi dan titik kumpul yang aman",
      "Pastikan saluran air dan drainase di sekitar rumah tidak tersumbat",
      "Simpan nomor darurat yang bisa dihubungi",
    ],
  },
  {
    title: "Ketika Ada Peringatan Banjir",
    icon: "⚠️",
    items: [
      "Pantau informasi cuaca dari BMKG secara berkala",
      "Pindahkan barang berharga ke tempat yang lebih tinggi",
      "Siapkan perlengkapan darurat seperti senter dan pelampung",
      "Isi penuh daya baterai ponsel dan radio",
      "Beritahu keluarga dan tetangga tentang potensi banjir",
    ],
  },
  {
    title: "Saat Terjadi Bencana",
    icon: "🚨",
    items: [
      "Segera evakuasi ke tempat yang lebih tinggi dan aman",
      "Jangan berjalan atau mengemudi melalui aliran air banjir",
      "Hindari menyentuh peralatan listrik jika dalam keadaan basah",
      "Ikuti arahan petugas dan posko evakuasi",
      "Hubungi layanan darurat jika memerlukan pertolongan",
    ],
  },
  {
    title: "Sesudah Terjadi Bencana",
    icon: "🔄",
    items: [
      "Pastikan kondisi rumah aman sebelum kembali memasuki",
      "Bersihkan rumah dan lingkungan dari sisa-sisa banjir",
      "Periksa instalasi listrik dan gas sebelum digunakan kembali",
      "Waspadai potensi penyakit pasca banjir seperti diare dan leptospirosis",
      "Laporkan kerusakan ke pihak berwenang untuk pendataan",
    ],
  },
  {
    title: "Perhatikan dan Siaga Bencana",
    icon: "👁️",
    items: [
      "Selalu pantau informasi peringatan dini dari BMKG",
      "Ikuti grup informasi kebencanaan di wilayah Anda",
      "Lakukan simulasi evakuasi secara berkala bersama keluarga",
      "Kenali potensi bencana di lingkungan tempat tinggal",
      "Bangun kesadaran bencana di lingkungan masyarakat",
    ],
  },
  {
    title: "Persiapan Sebelum Bencana",
    icon: "📋",
    items: [
      "Buat rencana darurat keluarga dan jalur evakuasi",
      "Siapkan persediaan makanan dan air bersih minimal 3 hari",
      "Pastikan seluruh anggota keluarga tahu tempat berkumpul",
      "Amankan dokumen penting dalam wadah kedap air",
      "Ikuti pelatihan tanggap darurat dari BPBD setempat",
    ],
  },
];

// ===================== REPORT STEPS =====================
export const reportSteps = [
  {
    step: 1,
    text: 'Buka aplikasi Jember Siaga atau kunjungi website kami, lalu pilih menu "Lapor Bencana".',
  },
  {
    step: 2,
    text: 'Isi formulir pelaporan dengan lengkap termasuk lokasi, jenis bencana, dan deskripsi kejadian.',
  },
  {
    step: 3,
    text: "Sertakan foto atau video sebagai bukti pendukung laporan jika memungkinkan.",
  },
  {
    step: 4,
    text: 'Klik tombol "Kirim Laporan" dan tunggu konfirmasi dari tim verifikasi kami.',
  },
  {
    step: 5,
    text: "Tim tanggap darurat akan segera merespons laporan yang telah diverifikasi.",
  },
];

// ===================== NEWS DATA =====================
export const newsData = [
  {
    id: 1,
    title:
      "Cuaca Ekstrem Di Kabupaten Jember, Warga Diminta Waspada Banjir dan Longsor",
    date: "28 Maret 2026",
    category: "Peringatan",
    image: "/news/news1.jpg",
    featured: true,
  },
  {
    id: 2,
    title:
      "BPBD Jember Siagakan Personel Di Titik Rawan Bencana Selama Musim Hujan",
    date: "27 Maret 2026",
    category: "Info",
    image: "/news/news2.jpg",
    featured: true,
  },
  {
    id: 3,
    title:
      "Gubernur Jatim Tinjau Korban Banjir di Jember, Salurkan Bantuan Logistik",
    date: "26 Maret 2026",
    category: "Berita",
    image: "/news/news3.jpg",
    featured: false,
  },
  {
    id: 4,
    title:
      "Cuaca Jakarta Diprediksi Hujan Ringan Hingga Sedang, BMKG Imbau Waspada",
    date: "25 Maret 2026",
    category: "Cuaca",
    image: "/news/news4.jpg",
    featured: false,
  },
  {
    id: 5,
    title:
      "Pelatihan Simulasi Evakuasi Bencana Banjir Digelar di Kecamatan Tanggul",
    date: "24 Maret 2026",
    category: "Kegiatan",
    image: "/news/news5.jpg",
    featured: false,
  },
  {
    id: 6,
    title:
      "Cuaca Cerah Mendominasi Wilayah Jember, Suhu Capai 34 Derajat Celsius",
    date: "23 Maret 2026",
    category: "Cuaca",
    image: "/news/news6.jpg",
    featured: false,
  },
];

// ===================== EARLY WARNING =====================
export const earlyWarning = {
  active: false,
  title: "Peringatan Dini Cuaca",
  message:
    "Saat ini tidak ada peringatan dini cuaca untuk wilayah Kabupaten Jember. Kondisi cuaca diprediksi normal untuk 24 jam ke depan. Tetap pantau informasi terbaru melalui website dan aplikasi Jember Siaga.",
  level: "normal",
  lastUpdate: "30 Maret 2026, 12:00 WIB",
};

// ===================== NAV LINKS =====================
export const navLinks = [
  { name: "Prediksi Cuaca", href: "/prediksi-cuaca" },
  { name: "Prediksi Banjir", href: "/prediksi-banjir" },
  { name: "Peta Bencana", href: "/peta" },
  { name: "Pengaduan Bencana", href: "/pengaduan-bencana" },
  { name: "Berita", href: "/berita" },
  { name: "FAQ", href: "/faq" },
];

// ===================== FAQ DATA =====================
export const faqData = [
  {
    question:
      "Apakah saya harus membuat akun untuk menggunakan aplikasi Jember Siaga?",
    answer:
      "Ya, pengguna perlu login terlebih dahulu untuk dapat menggunakan fitur-fitur yang tersedia pada aplikasi Jember Siaga. Dengan melakukan login, pengguna dapat mengakses layanan seperti mengirim laporan bencana, melihat riwayat pengaduan, serta menerima informasi yang lebih personal dari aplikasi.",
  },
  {
    question:
      "Bagaimana cara melaporkan bencana melalui aplikasi Jember Siaga?",
    answer:
      "Untuk melaporkan bencana, pengguna dapat membuka aplikasi Jember Siaga kemudian memilih menu Pengaduan Bencana. Setelah itu isi informasi yang diminta seperti lokasi, jenis bencana, dan deskripsi kejadian, lalu kirim laporan agar dapat ditindaklanjuti oleh petugas.",
  },
  {
    question: "Bagaimana cara mengetahui prediksi cuaca di aplikasi?",
    answer:
      "Untuk mengetahui kondisi cuaca, pengguna dapat membuka menu Prediksi Cuaca pada aplikasi. Informasi cuaca akan ditampilkan berdasarkan data terbaru sehingga pengguna dapat mengetahui perkiraan cuaca di wilayahnya.",
  },
  {
    question:
      "Bagaimana cara mengetahui status laporan yang sudah dikirim?",
    answer:
      "Setelah laporan dikirim, pengguna dapat melihat perkembangan atau status laporan melalui menu Riwayat Pengaduan pada aplikasi. Pada menu tersebut akan ditampilkan informasi mengenai proses verifikasi atau penanganan laporan.",
  },
  {
    question:
      "Bagaimana cara menghubungi call center melalui aplikasi?",
    answer:
      "Untuk menghubungi call center, pengguna dapat membuka aplikasi Jember Siaga lalu memilih menu Call Center. Pada menu tersebut akan ditampilkan nomor layanan yang dapat dihubungi sehingga pengguna dapat langsung melakukan panggilan untuk mendapatkan bantuan atau informasi terkait bencana.",
  },
  {
    question:
      "Apakah aplikasi dapat memberikan notifikasi peringatan banjir?",
    answer:
      "Ya, aplikasi Jember Siaga dapat memberikan notifikasi peringatan dini kepada pengguna jika terdapat potensi banjir atau informasi bencana di wilayah sekitar. Notifikasi ini membantu pengguna agar dapat lebih siap menghadapi kemungkinan terjadinya bencana.",
  },
  {
    question:
      "Bagaimana cara mengirim foto saat melakukan pengaduan bencana?",
    answer:
      "Saat mengisi formulir pengaduan bencana, pengguna dapat memilih opsi unggah foto. Pengguna bisa mengambil foto langsung melalui kamera atau memilih gambar dari galeri ponsel sebagai bukti kondisi di lokasi kejadian.",
  },
];

export const getWeatherIcon = (type: string) => {
  switch (type) {
    case "sunny":
      return WiDaySunny;
    case "partly-cloudy":
      return WiDayCloudy;
    case "cloudy":
      return WiCloudy;
    case "light-rain":
      return WiDayRainMix;
    case "rain":
      return WiRain;
    case "thunderstorm":
      return WiThunderstorm;
    default:
      return WiDaySunny;
  }
};
