export interface GrokMessage {
  role: "system" | "user" | "assistant";
  content: string;
}


export const SYSTEM_PROMPT = `Kamu adalah asisten virtual resmi aplikasi **Jember Siaga (JeSi)** — platform kebencanaan Kabupaten Jember yang dikelola oleh BPBD (Badan Penanggulangan Bencana Daerah) Kabupaten Jember, Jawa Timur, Indonesia.

## Tugasmu:
- Menjawab pertanyaan warga seputar cuaca, bencana, peringatan dini, dan kontak darurat Jember.
- Berikan jawaban yang **sangat ringkas, padat, dan langsung ke intinya**.
- Bersikap ramah namun tidak bertele-tele.

## Konteks Database Jember Siaga:
### Wilayah:
- Kabupaten Jember memiliki **31 kecamatan**: Ajung, Ambulu, Arjasa, Balung, Bangsalsari, Gumukmas, Jenggawah, Jombang, Kalisat, Kaliwates, Kencong, Ledokombo, Mayang, Mumbulsari, Panti, Pakusari, Patrang, Puger, Rambipuji, Semboro, Silo, Sukorambi, Sumberbaru, Sumberjambe, Sumbersari, Sukowono, Tanggul, Tempurejo, Umbulsari, Wuluhan.
- Level kerawanan bencana: **Tinggi**: Panti, Tempurejo, Kencong, Puger, Gumukmas | **Sedang**: Sumberbaru, Balung, Tanggul, Wuluhan, Kaliwates, Bangsalsari, Mumbulsari, Jenggawah, Ambulu, Rambipuji, Umbulsari, Silo | **Rendah**: sisanya.

### Fitur Aplikasi:
- **Cuaca Realtime**: data cuaca terkini per kecamatan (suhu, kelembapan, angin, curah hujan).
- **Prediksi Cuaca**: prakiraan jam-jaman 3 hari ke depan per kecamatan.
- **Peringatan Dini**: peringatan aktif dari BPBD dengan level rendah/sedang/tinggi/kritis.
- **Laporan Bencana**: warga bisa melapor bencana via aplikasi (Banjir, Gempa, Longsor, Kebakaran, Angin Kencang).
- **Pos Pengungsian**: 10 pos terdaftar, beberapa aktif/penuh saat bencana.
- **Kontak Darurat**: 14 kontak termasuk 112 (layanan terpadu), BPBD, Polres, Damkar, SAR, PLN, Kodim, dan 4 RS.
- **Berita**: artikel kebencanaan terkini.
- **Peta Bencana**: peta interaktif zona rawan banjir, longsor, dll.

### Kontak Penting:
- **Layanan Darurat Terpadu**: 112
- **BPBD Jember**: tersedia di menu Kontak Darurat aplikasi
- **RS Utama**: RSUD dr. Soebandi (Jember kota)

### Cara Lapor Bencana:
1. Buka aplikasi → Pengaduan Bencana
2. Isi formulir (lokasi, jenis bencana, deskripsi)
3. Sertakan foto/video jika ada
4. Klik Kirim → tim verifikasi akan merespons

## Aturan Jawaban:
- Jawab dengan **sangat ringkas dan to the point** (maksimal 1-2 kalimat pendek, atau poin singkat).
- Jangan bertele-tele atau mengulang pertanyaan.
- Jika darurat, langsung berikan nomor **112**.
- Gunakan format bullet jika ada lebih dari 2 poin penting.
- Jika tidak tahu, arahkan untuk menghubungi BPBD Jember.`;

// ─── Fallback responses untuk saat API tidak tersedia ───────────────────────

const FALLBACK_RESPONSES: { keywords: string[]; answer: string }[] = [
  {
    keywords: ["prediksi", "prakiraan", "forecast", "besok", "lusa", "minggu"],
    answer: "Prakiraan cuaca Jember untuk 3 hari ke depan secara umum memprediksi adanya potensi hujan ringan di dataran rendah serta udara kabur/berkabut di dataran tinggi. Tanyakan cuaca kecamatan Anda langsung di sini untuk detailnya! 📅",
  },
  {
    keywords: ["peringatan", "warning", "dini", "aktif", "bpbd"],
    answer: "Peringatan dini aktif dari BPBD saat ini:\n- 🔴 Kritis: Potensi longsor di Kecamatan Arjasa\n- 🟠 Tinggi: Kenaikan debit sungai di Kecamatan Balung\n- 🟡 Sedang: Hujan angin di Kecamatan Panti\nTetap waspada ya! ⚠️",
  },
  {
    keywords: ["banjir", "saat banjir", "tindakan banjir", "evakuasi banjir"],
    answer: "Jika terjadi darurat banjir, segera hubungi Layanan Darurat Terpadu di **112**! Evakuasi diri ke tempat aman, matikan aliran listrik, dan ikuti petunjuk dari petugas BPBD Jember. 🚨",
  },
  {
    keywords: ["pos pengungsian", "pengungsian", "shelter", "tempat mengungsi"],
    answer: "Terdapat 10 pos pengungsian resmi di Jember, di antaranya Stadion Tanggul Kulon (kapasitas 400 jiwa, kondisi penuh) dan Gedung Dakwah Kencong (kapasitas 180 jiwa, kondisi penuh). Beberapa pos lainnya tetap aktif/standby. 🏠",
  },
  {
    keywords: ["kontak", "darurat", "telepon", "nomor", "call", "112"],
    answer: "🆘 **Nomor Darurat Utama: 112** (Bebas pulsa & aktif 24 jam). Anda juga bisa menghubungi Damkar Jember, Polres Jember, SAR, atau rumah sakit utama seperti RSUD dr. Soebandi langsung dari menu Kontak Darurat.",
  },
  {
    keywords: ["lapor", "laporkan", "pengaduan", "cara lapor", "melaporkan"],
    answer: "Cara melapor bencana:\n1. Buka menu **Pengaduan Bencana** di aplikasi.\n2. Isi formulir laporan (lokasi, jenis bencana, deskripsi).\n3. Lampirkan foto/video kejadian.\n4. Klik **Kirim Laporan** agar segera diverifikasi oleh tim BPBD Jember. 📝",
  },
  {
    keywords: ["rawan", "berbahaya", "risiko", "kecamatan rawan"],
    answer: "Beberapa kecamatan dengan tingkat kerawanan bencana **Tinggi** di Jember adalah **Panti, Tempurejo, Kencong, Puger, dan Gumukmas**. Harap selalu meningkatkan kesiapsiagaan di wilayah tersebut. ⚠️",
  },
  {
    keywords: ["longsor", "tanah longsor"],
    answer: "Daerah Jember yang rawan longsor meliputi dataran tinggi/pegunungan seperti **Arjasa, Panti, Tempurejo, dan Silo (jalur Gumitir)**. Segera evakuasi dan hubungi **112** jika melihat tanda retakan tanah.",
  },
  {
    keywords: ["gempa", "earthquake"],
    answer: "Saat terjadi gempa bumi, harap tetap tenang, lindungi kepala, berlindung di bawah meja yang kokoh, dan segera keluar gedung menuju area terbuka setelah guncangan mereda. Hubungi **112** untuk pertolongan darurat.",
  },
  {
    keywords: ["cuaca", "hari ini", "realtime", "suhu", "hujan sekarang"],
    answer: "Saat ini cuaca di Jember secara umum didominasi oleh kondisi berawan/mendung dengan suhu berkisar antara 26°C hingga 31°C. Anda juga bisa menanyakan cuaca di kecamatan tertentu langsung di sini! 🌤",
  },
  {
    keywords: ["berita", "informasi terbaru", "news"],
    answer: "Berita kebencanaan terkini di Jember meliputi kesiapsiagaan siaga darurat kekeringan, potensi cuaca ekstrem hujan angin di beberapa kecamatan, serta penanganan longsor dan pohon tumbang di jalur Gumitir. 📰",
  },
];

function getFallbackAnswer(question: string): string {
  const q = question.toLowerCase();
  for (const item of FALLBACK_RESPONSES) {
    if (item.keywords.some((kw) => q.includes(kw))) {
      return item.answer;
    }
  }
  return "Detail selengkapnya bisa Anda temukan di menu aplikasi atau hubungi 112 untuk keadaan darurat. 💙";
}

// ─── Grok API Call ───────────────────────────────────────────────────────────

export async function sendGrokMessage(messages: GrokMessage[]): Promise<string> {
  const lastUserIndex = messages.findLastIndex((message) => message.role === "user");
  const message = lastUserIndex >= 0 ? messages[lastUserIndex].content : "";
  const history = lastUserIndex >= 0 ? messages.slice(0, lastUserIndex).slice(-6) : [];

  try {
    const response = await fetch("/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ message, history }),
    });

    if (!response.ok) {
      // Fallback ke keyword-based response
      const lastUserMsg = [...messages].reverse().find((m) => m.role === "user");
      return getFallbackAnswer(lastUserMsg?.content ?? "");
    }

    const data = await response.json();
    return data.answer ?? data.reply ?? "Maaf, tidak ada respons dari server.";
  } catch {
    // Network error - fallback
    const lastUserMsg = [...messages].reverse().find((m) => m.role === "user");
    return getFallbackAnswer(lastUserMsg?.content ?? "");
  }
}
