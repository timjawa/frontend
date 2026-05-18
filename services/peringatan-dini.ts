import api from '@/lib/api';

/**
 * Mengambil daftar peringatan dini.
 * 
 * @param params Parameter opsional untuk filter (is_active, tingkat_urgensi, search, dll)
 * @returns Data paginasi peringatan dini
 */
export const fetchPeringatanDini = async (params = {}) => {
  try {
    const response = await api.get('/api/peringatan-dini', { params });
    return response.data;
  } catch (error) {
    console.error('Gagal mengambil data peringatan dini:', error);
    throw error;
  }
};
