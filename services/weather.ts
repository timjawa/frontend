import api from '@/lib/api';

/**
 * Mengambil data prakiraan cuaca (dari API BMKG) yang telah dicache di database backend.
 * Data berupa prakiraan cuaca per 3 jam.
 * 
 * @returns Data array prakiraan cuaca per kecamatan
 */
export const fetchWeatherForecast = async () => {
  try {
    const response = await api.get(`/api/weather/forecast`);
    return response.data;
  } catch (error) {
    console.error(`Gagal mengambil data cuaca BMKG dari backend:`, error);
    throw error;
  }
};

/**
 * Mengambil data cuaca real-time (dari OpenWeather API) yang telah dicache di database backend.
 * 
 * @returns Data array cuaca realtime per kecamatan
 */
export const fetchRealtimeWeather = async () => {
  try {
    const response = await api.get(`/api/weather/realtime`);
    return response.data;
  } catch (error) {
    console.error(`Gagal mengambil data cuaca realtime dari backend:`, error);
    throw error;
  }
};

/**
 * Memperbarui data cuaca real-time secara manual (dari OpenWeather API)
 * dan mengarsipkan data sebelumnya ke histori_cuaca.
 * Memerlukan autentikasi admin (Sanctum session).
 * 
 * @returns Response object
 */
export const refreshRealtimeWeather = async () => {
  try {
    const response = await api.post(`/api/weather/refresh`);
    return response.data;
  } catch (error) {
    console.error(`Gagal merefresh data cuaca realtime dari backend:`, error);
    throw error;
  }
};

/**
 * Memperbarui data prakiraan cuaca secara manual (dari API BMKG).
 * Memerlukan autentikasi admin (Sanctum session).
 * 
 * @returns Response object dengan data flat (tidak di-group)
 */
export const refreshForecastWeather = async () => {
  try {
    const response = await api.post(`/api/weather/refresh-forecast`);
    return response.data;
  } catch (error) {
    console.error(`Gagal merefresh data prakiraan cuaca dari backend:`, error);
    throw error;
  }
};

/**
 * Mengambil data riwayat cuaca dari tabel historical_cuaca.
 * Data berupa rata-rata suhu dan curah hujan per hari per kecamatan (7 hari terakhir).
 * 
 * @returns Data object { [kecamatan]: { tanggal, suhu_avg, hujan_avg }[] }
 */
export const fetchHistoricalWeather = async () => {
  try {
    const response = await api.get(`/api/weather/historical`);
    return response.data;
  } catch (error) {
    console.error(`Gagal mengambil data riwayat cuaca:`, error);
    throw error;
  }
};

/**
 * Mengambil data cuaca berdasarkan tanggal.
 * Otomatis memilih sumber data:
 * - Tanggal hari ini / ke depan → dari tabel perkiraan_cuaca (BMKG forecast)
 * - Tanggal kemarin / ke belakang → dari tabel historical_cuaca (data riwayat)
 * 
 * @param date - Format YYYY-MM-DD
 * @returns Data grouped per kecamatan dengan format yang sama
 */
export const fetchWeatherByDate = async (date: string) => {
  try {
    const response = await api.get(`/api/weather/by-date`, { params: { date } });
    return response.data;
  } catch (error) {
    console.error(`Gagal mengambil data cuaca untuk tanggal ${date}:`, error);
    throw error;
  }
};
