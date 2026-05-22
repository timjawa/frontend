export interface FloodPredictionRow {
  cuaca_id: string;
  kecamatan_id: string;
  kecamatan_nama: string;
  fetched_at: string | null;
  suhu: number | null;
  kelembapan: number | null;
  curah_hujan: number;
  tekanan_udara: number | null;
  kecepatan_angin: number | null;
  cloud_cover: number | null;
  elevasi: number | null;
  level_rawan: "rendah" | "sedang" | "tinggi";
  jumlah_laporan_banjir_7_hari: number;
  probabilitas_banjir: number;
  probabilitas_tidak_banjir: number;
  threshold: number;
  prediksi: 0 | 1;
  label: "banjir" | "tidak banjir";
  kategori_risiko: "rendah" | "sedang" | "tinggi" | "kritis";
}

export interface FloodPredictionSummary {
  total_kecamatan: number;
  prediksi_banjir: number;
  probabilitas_rata_rata: number;
  probabilitas_maksimum: number;
  risiko: Record<"rendah" | "sedang" | "tinggi" | "kritis", number>;
  terakhir_diperbarui: string | null;
}

export interface FloodPredictionResponse {
  status: "success";
  source: "database";
  generated_at: string;
  threshold: number;
  summary: FloodPredictionSummary;
  data: FloodPredictionRow[];
}

export const getPredictionApiBaseUrl = () => {
  if (process.env.NEXT_PUBLIC_PREDICTION_API_URL) {
    return process.env.NEXT_PUBLIC_PREDICTION_API_URL.replace(/\/$/, "");
  }

  if (typeof window !== "undefined" && ["localhost", "127.0.0.1"].includes(window.location.hostname)) {
    return `${window.location.protocol}//${window.location.hostname}:8010`;
  }

  return "https://abinugroh00-prediksi-banjir.hf.space";
};

export async function fetchRealtimeFloodPredictions(): Promise<FloodPredictionResponse> {
  const response = await fetch(`${getPredictionApiBaseUrl()}/predict/realtime`, {
    method: "GET",
    headers: {
      Accept: "application/json",
    },
    cache: "no-store",
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(detail || `Gagal mengambil prediksi banjir (${response.status})`);
  }

  return response.json();
}
