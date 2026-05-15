import api from "../lib/api";

export interface LaporanStats {
  total: number;
  baru: number;
  diverifikasi: number;
  ditolak: number;
  selesai: number;
}

export interface UserStats {
  total: number;
  aktif: number;
  admin: number;
  masyarakat: number;
}

export interface KecamatanStats {
  tinggi: number;
  sedang: number;
  rendah: number;
}

export interface PeringatanDini {
  id: string;
  kecamatan_id: string;
  dibuat_oleh: string;
  deskripsi: string;
  tingkat_urgensi: "rendah" | "sedang" | "tinggi" | "kritis";
  berlaku_hingga: string | null;
  created_at: string;
  kecamatan: {
    id: string;
    nama: string;
  };
  pembuat: {
    id: string;
    name: string;
  } | null;
}

export interface PaginatedResponse<T> {
  current_page: number;
  data: T[];
  total: number;
  per_page: number;
  last_page: number;
}

export async function fetchLaporanStats(): Promise<LaporanStats> {
  const response = await api.get("/api/admin/laporan/stats");
  return response.data;
}

export async function fetchUserStats(): Promise<UserStats> {
  const response = await api.get("/api/admin/pengguna/stats");
  return response.data;
}

export async function fetchKecamatanStats(): Promise<KecamatanStats> {
  const response = await api.get("/api/kecamatan/stats");
  return response.data;
}

export async function fetchPeringatanDini(params?: Record<string, any>): Promise<PaginatedResponse<PeringatanDini>> {
  const response = await api.get("/api/peringatan-dini", { params });
  return response.data;
}
