import axios from 'axios';

// Gunakan NEXT_PUBLIC_API_URL dari env, fallback ke localhost:8000 jika tidak ada
const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://192.168.1.101:8000';

/**
 * Mengambil data prakiraan cuaca (dari API BMKG) yang telah dicache di database backend.
 * Data berupa prakiraan cuaca per 3 jam.
 * 
 * @returns Data array prakiraan cuaca per kecamatan
 */
export const fetchWeatherForecast = async () => {
  try {
    const response = await axios.get(`${API_URL}/api/weather/forecast`);
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
    const response = await axios.get(`${API_URL}/api/weather/realtime`);
    return response.data;
  } catch (error) {
    console.error(`Gagal mengambil data cuaca realtime dari backend:`, error);
    throw error;
  }
};
