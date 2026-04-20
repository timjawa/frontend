import { StatusBencana, JenisBencana } from "./floodData";

export interface KecamatanFeature {
  id: number;
  nama: string;
  status: StatusBencana;
  jenis_bencana?: JenisBencana;
  koordinat: [number, number];
  keterangan: string;
}

export const kecamatanData: KecamatanFeature[] = [
  {
    id: 1,
    nama: "Kaliwates",
    status: "warning",
    jenis_bencana: "banjir",
    koordinat: [-8.1833, 113.6233],
    keterangan: "Genangan air mencolok di bantaran sungai",
  },
  {
    id: 2,
    nama: "Sumbersari",
    status: "danger",
    jenis_bencana: "banjir",
    koordinat: [-8.1667, 113.7167],
    keterangan: "Banjir parah, volume sungai bedadung meluap",
  },
  {
    id: 3,
    nama: "Patrang",
    status: "safe",
    koordinat: [-8.1200, 113.7100],
    keterangan: "Kondisi aman, tidak ada laporan cuaca ekstrem",
  },
  {
    id: 4,
    nama: "Tanggul",
    status: "warning",
    jenis_bencana: "angin_kencang",
    koordinat: [-8.1667, 113.4500],
    keterangan: "Waspada pohon tumbang jalur masuk jember",
  },
  {
    id: 5,
    nama: "Jombang",
    status: "safe",
    koordinat: [-8.2667, 113.3167],
    keterangan: "Kondisi sangat kondusif",
  },
  {
    id: 6,
    nama: "Ambulu",
    status: "danger",
    jenis_bencana: "angin_kencang",
    koordinat: [-8.3583, 113.6083],
    keterangan: "Angin kencang dan gelombang tinggi di pantai selatan",
  },
  {
    id: 7,
    nama: "Ajung",
    status: "safe",
    koordinat: [-8.2167, 113.6800],
    keterangan: "Normal dan aman terkendali",
  },
  {
    id: 8,
    nama: "Kalisat",
    status: "warning",
    jenis_bencana: "longsor",
    koordinat: [-8.1167, 113.8000],
    keterangan: "Waspada retakan tanah bukit sekitar",
  },
  {
    id: 9,
    nama: "Jelbuk",
    status: "danger",
    jenis_bencana: "longsor",
    koordinat: [-8.0667, 113.7833],
    keterangan: "Material longsor menutupi bahu jalan utama",
  },
  {
    id: 10,
    nama: "Pakusari",
    status: "safe",
    koordinat: [-8.1500, 113.7667],
    keterangan: "Cuaca cerah dan aman dari potensi bahaya",
  },
  {
    id: 11,
    nama: "Kencong",
    status: "warning",
    jenis_bencana: "banjir",
    koordinat: [-8.2833, 113.3667],
    keterangan: "Debit sungai meluap membasahi lahan pertanian",
  },
  {
    id: 12,
    nama: "Wuluhan",
    status: "safe",
    koordinat: [-8.3500, 113.5333],
    keterangan: "Terpantau stabil hari ini",
  }
];
