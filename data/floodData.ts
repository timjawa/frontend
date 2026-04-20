export type StatusBencana = "danger" | "warning" | "safe";

// Tambah jenis bencana
export type JenisBencana = "banjir" | "longsor" | "kebakaran" | "angin_kencang";

export interface BencanaFeature {
  id: number;
  nama_jalan: string;
  jenis_bencana: JenisBencana;  // ← tambahan baru
  status: StatusBencana;
  tinggi_air?: string;          // ← pakai ? karena tidak semua bencana punya tinggi air
  keterangan: string;           // ← lebih general dari tinggi_air
  diperbarui: string;
  koordinat: [number, number][];
}

export const bencanaData: BencanaFeature[] = [
  {
    id: 1,
    nama_jalan: "Jl. Mastrip",
    jenis_bencana: "banjir",
    status: "danger",
    tinggi_air: "85 cm",
    keterangan: "Banjir parah, jalan tidak bisa dilalui oleh kendaraan jenis apapun",
    diperbarui: "10 menit lalu",
    koordinat: [
      [113.7145696,-8.1583759],
      [113.7155355,-8.1587576],
      [113.7169544,-8.1591772],
      [113.7185007,-8.159671],
      [113.7207779,-8.1604476],
      [113.7221874,-8.1609467],
      [113.7229921,-8.1612561],
      [113.723554,-8.1619902],
      [113.7238102,-8.1625318]
    ],
  },
  {
    id: 2,
    nama_jalan: "Jl. Gajah Mada",
    jenis_bencana: "banjir",
    status: "warning",
    tinggi_air: "40 cm",
    keterangan: "Genangan sedang",
    diperbarui: "5 menit lalu",
    koordinat: [
      [113.7000, -8.1750],
      [113.7040, -8.1755],
      [113.7080, -8.1748],
    ],
  },
  {
    id: 3,
    nama_jalan: "Jl. Kaliurang",
    jenis_bencana: "longsor",    // ← beda jenis
    status: "danger",
    keterangan: "Material longsor menutupi jalan",
    diperbarui: "15 menit lalu",
    koordinat: [
      [113.6990, -8.1800],
      [113.7030, -8.1810],
      [113.7070, -8.1805],
    ],
  },
  {
    id: 4,
    nama_jalan: "Jl. Brawijaya",
    jenis_bencana: "kebakaran",
    status: "warning",
    keterangan: "Kebakaran lahan di sisi jalan",
    diperbarui: "8 menit lalu",
    koordinat: [
      [113.7050, -8.1770],
      [113.7080, -8.1760],
      [113.7110, -8.1750],
    ],
  },
  {
    id: 5,
    nama_jalan: "Jl. Ahmad Yani",
    jenis_bencana: "angin_kencang",
    status: "warning",
    keterangan: "Pohon tumbang, sebagian jalan terhalang",
    diperbarui: "3 menit lalu",
    koordinat: [
      [113.7100, -8.1720],
      [113.7130, -8.1710],
      [113.7160, -8.1700],
    ],
  },
];