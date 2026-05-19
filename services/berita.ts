import { apiFetch } from './api';

export interface BeritaTag {
  id: string;
  berita_id: string;
  tag: string;
}

export interface Berita {
  id: string;
  judul: string;
  slug: string;
  konten: string;
  ringkasan: string | null;
  foto_cover: string | null;
  kategori: string | null;
  sumber: string | null;
  status: string;
  views_count: number;
  dibuat_pada: string;
  dipublikasi_pada: string | null;
  updated_at: string;
  author?: {
    id: number;
    name: string;
  };
  tags?: BeritaTag[];
}

export interface BeritaResponse {
  current_page: number;
  data: Berita[];
  first_page_url: string;
  from: number;
  last_page: number;
  last_page_url: string;
  links: any[];
  next_page_url: string | null;
  path: string;
  per_page: number;
  prev_page_url: string | null;
  to: number;
  total: number;
}

export async function fetchBerita(params?: {
  page?: number;
  per_page?: number;
  search?: string;
  kategori?: string;
}): Promise<BeritaResponse> {
  const query = new URLSearchParams();
  if (params?.page) query.append('page', params.page.toString());
  if (params?.per_page) query.append('per_page', params.per_page.toString());
  if (params?.search) query.append('search', params.search);
  if (params?.kategori) query.append('kategori', params.kategori);

  const queryString = query.toString() ? `?${query.toString()}` : '';
  
  return apiFetch<BeritaResponse>(`/berita${queryString}`, {
    cache: 'no-store', // Always fetch latest for accurate data
  });
}
