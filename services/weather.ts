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
 * Mengambil ringkasan harian cuaca per kecamatan.
 * Data berupa rata-rata suhu dan total curah hujan per hari per kecamatan.
 * 
 * @returns Data array ringkasan harian
 */
export const fetchForecastSummary = async () => {
  try {
    const response = await api.get(`/api/weather/forecast-summary`);
    return response.data;
  } catch (error) {
    console.error(`Gagal mengambil ringkasan cuaca harian:`, error);
    throw error;
  }
};
