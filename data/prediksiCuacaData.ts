// Dummy data for Prediksi Cuaca page - All 31 Kecamatan in Kabupaten Jember

export interface WeatherSlot {
  suhu: string;
  kelembapan: string;
  angin: string;
  cuaca: string;
  icon: string;
}

export interface KecamatanPrediction {
  kecamatan: string;
  slot1: WeatherSlot; // 06:00
  slot2: WeatherSlot; // 12:00
  slot3: WeatherSlot; // 18:00
  slot4: WeatherSlot; // 19:00
  slot5: WeatherSlot; // 00:00
}

const weatherConditions = [
  { cuaca: "Cerah", icon: "sunny" },
  { cuaca: "Cerah Berawan", icon: "partly-cloudy" },
  { cuaca: "Berawan", icon: "cloudy" },
  { cuaca: "Hujan Ringan", icon: "light-rain" },
  { cuaca: "Hujan Sedang", icon: "rain" },
  { cuaca: "Hujan Lebat", icon: "thunderstorm" },
  { cuaca: "Awan Rintik", icon: "light-rain" },
];

// Generate variation for each kecamatan
function generateSlot(
  baseTemp: number,
  offset: number,
  condIndex: number
): WeatherSlot {
  const temp = baseTemp + offset;
  const cond = weatherConditions[condIndex % weatherConditions.length];
  const humidity = 55 + condIndex * 5 + offset;
  const windSpeed = 5 + ((condIndex + offset) % 15);
  return {
    suhu: `${temp}°C`,
    kelembapan: `${Math.min(humidity, 95)}%`,
    angin: `${windSpeed} km/h`,
    cuaca: cond.cuaca,
    icon: cond.icon,
  };
}

export const allKecamatanPredictions: KecamatanPrediction[] = [
  {
    kecamatan: "Ajung",
    slot1: { suhu: "24°C", kelembapan: "78%", angin: "8 km/h", cuaca: "Cerah", icon: "sunny" },
    slot2: { suhu: "31°C", kelembapan: "65%", angin: "12 km/h", cuaca: "Cerah Berawan", icon: "partly-cloudy" },
    slot3: { suhu: "29°C", kelembapan: "72%", angin: "10 km/h", cuaca: "Berawan", icon: "cloudy" },
    slot4: { suhu: "26°C", kelembapan: "80%", angin: "7 km/h", cuaca: "Hujan Ringan", icon: "light-rain" },
    slot5: { suhu: "23°C", kelembapan: "85%", angin: "5 km/h", cuaca: "Hujan Sedang", icon: "rain" },
  },
  {
    kecamatan: "Ambulu",
    slot1: { suhu: "23°C", kelembapan: "80%", angin: "10 km/h", cuaca: "Berawan", icon: "cloudy" },
    slot2: { suhu: "30°C", kelembapan: "68%", angin: "14 km/h", cuaca: "Cerah Berawan", icon: "partly-cloudy" },
    slot3: { suhu: "28°C", kelembapan: "74%", angin: "11 km/h", cuaca: "Berawan", icon: "cloudy" },
    slot4: { suhu: "25°C", kelembapan: "82%", angin: "8 km/h", cuaca: "Hujan Ringan", icon: "light-rain" },
    slot5: { suhu: "22°C", kelembapan: "87%", angin: "6 km/h", cuaca: "Hujan Sedang", icon: "rain" },
  },
  {
    kecamatan: "Arjasa",
    slot1: { suhu: "22°C", kelembapan: "82%", angin: "7 km/h", cuaca: "Cerah Berawan", icon: "partly-cloudy" },
    slot2: { suhu: "29°C", kelembapan: "70%", angin: "11 km/h", cuaca: "Cerah", icon: "sunny" },
    slot3: { suhu: "27°C", kelembapan: "76%", angin: "9 km/h", cuaca: "Berawan", icon: "cloudy" },
    slot4: { suhu: "24°C", kelembapan: "84%", angin: "6 km/h", cuaca: "Hujan Ringan", icon: "light-rain" },
    slot5: { suhu: "21°C", kelembapan: "88%", angin: "4 km/h", cuaca: "Hujan Sedang", icon: "rain" },
  },
  {
    kecamatan: "Balung",
    slot1: { suhu: "24°C", kelembapan: "76%", angin: "9 km/h", cuaca: "Cerah", icon: "sunny" },
    slot2: { suhu: "32°C", kelembapan: "62%", angin: "13 km/h", cuaca: "Cerah Berawan", icon: "partly-cloudy" },
    slot3: { suhu: "30°C", kelembapan: "70%", angin: "10 km/h", cuaca: "Berawan", icon: "cloudy" },
    slot4: { suhu: "27°C", kelembapan: "78%", angin: "7 km/h", cuaca: "Hujan Ringan", icon: "light-rain" },
    slot5: { suhu: "23°C", kelembapan: "84%", angin: "5 km/h", cuaca: "Hujan Sedang", icon: "rain" },
  },
  {
    kecamatan: "Bangsalsari",
    slot1: { suhu: "23°C", kelembapan: "79%", angin: "8 km/h", cuaca: "Berawan", icon: "cloudy" },
    slot2: { suhu: "30°C", kelembapan: "66%", angin: "12 km/h", cuaca: "Cerah Berawan", icon: "partly-cloudy" },
    slot3: { suhu: "28°C", kelembapan: "73%", angin: "10 km/h", cuaca: "Berawan", icon: "cloudy" },
    slot4: { suhu: "25°C", kelembapan: "81%", angin: "7 km/h", cuaca: "Hujan Ringan", icon: "light-rain" },
    slot5: { suhu: "22°C", kelembapan: "86%", angin: "5 km/h", cuaca: "Hujan Sedang", icon: "rain" },
  },
  {
    kecamatan: "Gumukmas",
    slot1: { suhu: "24°C", kelembapan: "77%", angin: "11 km/h", cuaca: "Cerah Berawan", icon: "partly-cloudy" },
    slot2: { suhu: "31°C", kelembapan: "64%", angin: "15 km/h", cuaca: "Cerah", icon: "sunny" },
    slot3: { suhu: "29°C", kelembapan: "71%", angin: "12 km/h", cuaca: "Berawan", icon: "cloudy" },
    slot4: { suhu: "26°C", kelembapan: "79%", angin: "8 km/h", cuaca: "Hujan Ringan", icon: "light-rain" },
    slot5: { suhu: "23°C", kelembapan: "85%", angin: "6 km/h", cuaca: "Hujan Sedang", icon: "rain" },
  },
  {
    kecamatan: "Jelbuk",
    slot1: { suhu: "21°C", kelembapan: "84%", angin: "6 km/h", cuaca: "Cerah", icon: "sunny" },
    slot2: { suhu: "28°C", kelembapan: "72%", angin: "10 km/h", cuaca: "Cerah Berawan", icon: "partly-cloudy" },
    slot3: { suhu: "26°C", kelembapan: "78%", angin: "8 km/h", cuaca: "Berawan", icon: "cloudy" },
    slot4: { suhu: "23°C", kelembapan: "86%", angin: "5 km/h", cuaca: "Berawan", icon: "cloudy" },
    slot5: { suhu: "20°C", kelembapan: "90%", angin: "4 km/h", cuaca: "Hujan Ringan", icon: "light-rain" },
  },
  {
    kecamatan: "Jenggawah",
    slot1: { suhu: "24°C", kelembapan: "76%", angin: "9 km/h", cuaca: "Cerah", icon: "sunny" },
    slot2: { suhu: "31°C", kelembapan: "63%", angin: "13 km/h", cuaca: "Cerah Berawan", icon: "partly-cloudy" },
    slot3: { suhu: "29°C", kelembapan: "71%", angin: "10 km/h", cuaca: "Berawan", icon: "cloudy" },
    slot4: { suhu: "26°C", kelembapan: "79%", angin: "7 km/h", cuaca: "Hujan Ringan", icon: "light-rain" },
    slot5: { suhu: "23°C", kelembapan: "85%", angin: "5 km/h", cuaca: "Hujan Sedang", icon: "rain" },
  },
  {
    kecamatan: "Jombang",
    slot1: { suhu: "25°C", kelembapan: "74%", angin: "10 km/h", cuaca: "Cerah", icon: "sunny" },
    slot2: { suhu: "33°C", kelembapan: "60%", angin: "14 km/h", cuaca: "Cerah", icon: "sunny" },
    slot3: { suhu: "31°C", kelembapan: "68%", angin: "11 km/h", cuaca: "Cerah Berawan", icon: "partly-cloudy" },
    slot4: { suhu: "27°C", kelembapan: "76%", angin: "8 km/h", cuaca: "Berawan", icon: "cloudy" },
    slot5: { suhu: "24°C", kelembapan: "82%", angin: "5 km/h", cuaca: "Hujan Ringan", icon: "light-rain" },
  },
  {
    kecamatan: "Kalisat",
    slot1: { suhu: "23°C", kelembapan: "80%", angin: "7 km/h", cuaca: "Cerah Berawan", icon: "partly-cloudy" },
    slot2: { suhu: "30°C", kelembapan: "67%", angin: "11 km/h", cuaca: "Cerah", icon: "sunny" },
    slot3: { suhu: "28°C", kelembapan: "74%", angin: "9 km/h", cuaca: "Berawan", icon: "cloudy" },
    slot4: { suhu: "25°C", kelembapan: "82%", angin: "6 km/h", cuaca: "Hujan Ringan", icon: "light-rain" },
    slot5: { suhu: "22°C", kelembapan: "88%", angin: "4 km/h", cuaca: "Hujan Sedang", icon: "rain" },
  },
  {
    kecamatan: "Kaliwates",
    slot1: { suhu: "25°C", kelembapan: "73%", angin: "9 km/h", cuaca: "Cerah", icon: "sunny" },
    slot2: { suhu: "32°C", kelembapan: "61%", angin: "13 km/h", cuaca: "Cerah Berawan", icon: "partly-cloudy" },
    slot3: { suhu: "30°C", kelembapan: "69%", angin: "10 km/h", cuaca: "Berawan", icon: "cloudy" },
    slot4: { suhu: "27°C", kelembapan: "77%", angin: "7 km/h", cuaca: "Hujan Ringan", icon: "light-rain" },
    slot5: { suhu: "24°C", kelembapan: "83%", angin: "5 km/h", cuaca: "Hujan Sedang", icon: "rain" },
  },
  {
    kecamatan: "Kencong",
    slot1: { suhu: "24°C", kelembapan: "78%", angin: "10 km/h", cuaca: "Cerah", icon: "sunny" },
    slot2: { suhu: "31°C", kelembapan: "65%", angin: "14 km/h", cuaca: "Cerah Berawan", icon: "partly-cloudy" },
    slot3: { suhu: "29°C", kelembapan: "72%", angin: "11 km/h", cuaca: "Berawan", icon: "cloudy" },
    slot4: { suhu: "26°C", kelembapan: "80%", angin: "8 km/h", cuaca: "Hujan Ringan", icon: "light-rain" },
    slot5: { suhu: "23°C", kelembapan: "86%", angin: "5 km/h", cuaca: "Hujan Lebat", icon: "thunderstorm" },
  },
  {
    kecamatan: "Ledokombo",
    slot1: { suhu: "21°C", kelembapan: "85%", angin: "6 km/h", cuaca: "Berawan", icon: "cloudy" },
    slot2: { suhu: "27°C", kelembapan: "73%", angin: "10 km/h", cuaca: "Cerah Berawan", icon: "partly-cloudy" },
    slot3: { suhu: "25°C", kelembapan: "79%", angin: "8 km/h", cuaca: "Berawan", icon: "cloudy" },
    slot4: { suhu: "23°C", kelembapan: "87%", angin: "5 km/h", cuaca: "Hujan Ringan", icon: "light-rain" },
    slot5: { suhu: "20°C", kelembapan: "91%", angin: "4 km/h", cuaca: "Hujan Sedang", icon: "rain" },
  },
  {
    kecamatan: "Mayang",
    slot1: { suhu: "23°C", kelembapan: "79%", angin: "8 km/h", cuaca: "Cerah Berawan", icon: "partly-cloudy" },
    slot2: { suhu: "30°C", kelembapan: "66%", angin: "12 km/h", cuaca: "Cerah", icon: "sunny" },
    slot3: { suhu: "28°C", kelembapan: "73%", angin: "9 km/h", cuaca: "Berawan", icon: "cloudy" },
    slot4: { suhu: "25°C", kelembapan: "81%", angin: "7 km/h", cuaca: "Hujan Ringan", icon: "light-rain" },
    slot5: { suhu: "22°C", kelembapan: "87%", angin: "5 km/h", cuaca: "Hujan Sedang", icon: "rain" },
  },
  {
    kecamatan: "Mumbulsari",
    slot1: { suhu: "24°C", kelembapan: "77%", angin: "9 km/h", cuaca: "Cerah", icon: "sunny" },
    slot2: { suhu: "31°C", kelembapan: "64%", angin: "13 km/h", cuaca: "Cerah Berawan", icon: "partly-cloudy" },
    slot3: { suhu: "29°C", kelembapan: "71%", angin: "10 km/h", cuaca: "Berawan", icon: "cloudy" },
    slot4: { suhu: "26°C", kelembapan: "79%", angin: "7 km/h", cuaca: "Hujan Ringan", icon: "light-rain" },
    slot5: { suhu: "23°C", kelembapan: "85%", angin: "5 km/h", cuaca: "Hujan Sedang", icon: "rain" },
  },
  {
    kecamatan: "Pakusari",
    slot1: { suhu: "23°C", kelembapan: "80%", angin: "7 km/h", cuaca: "Berawan", icon: "cloudy" },
    slot2: { suhu: "30°C", kelembapan: "67%", angin: "11 km/h", cuaca: "Cerah Berawan", icon: "partly-cloudy" },
    slot3: { suhu: "28°C", kelembapan: "74%", angin: "9 km/h", cuaca: "Hujan Ringan", icon: "light-rain" },
    slot4: { suhu: "25°C", kelembapan: "82%", angin: "6 km/h", cuaca: "Hujan Sedang", icon: "rain" },
    slot5: { suhu: "22°C", kelembapan: "88%", angin: "4 km/h", cuaca: "Hujan Ringan", icon: "light-rain" },
  },
  {
    kecamatan: "Panti",
    slot1: { suhu: "22°C", kelembapan: "83%", angin: "6 km/h", cuaca: "Cerah", icon: "sunny" },
    slot2: { suhu: "28°C", kelembapan: "71%", angin: "10 km/h", cuaca: "Cerah Berawan", icon: "partly-cloudy" },
    slot3: { suhu: "26°C", kelembapan: "77%", angin: "8 km/h", cuaca: "Berawan", icon: "cloudy" },
    slot4: { suhu: "24°C", kelembapan: "85%", angin: "5 km/h", cuaca: "Hujan Ringan", icon: "light-rain" },
    slot5: { suhu: "21°C", kelembapan: "90%", angin: "4 km/h", cuaca: "Hujan Sedang", icon: "rain" },
  },
  {
    kecamatan: "Patrang",
    slot1: { suhu: "24°C", kelembapan: "75%", angin: "9 km/h", cuaca: "Cerah", icon: "sunny" },
    slot2: { suhu: "31°C", kelembapan: "63%", angin: "13 km/h", cuaca: "Cerah Berawan", icon: "partly-cloudy" },
    slot3: { suhu: "29°C", kelembapan: "70%", angin: "10 km/h", cuaca: "Berawan", icon: "cloudy" },
    slot4: { suhu: "26°C", kelembapan: "78%", angin: "7 km/h", cuaca: "Hujan Ringan", icon: "light-rain" },
    slot5: { suhu: "23°C", kelembapan: "84%", angin: "5 km/h", cuaca: "Hujan Sedang", icon: "rain" },
  },
  {
    kecamatan: "Puger",
    slot1: { suhu: "25°C", kelembapan: "74%", angin: "12 km/h", cuaca: "Cerah", icon: "sunny" },
    slot2: { suhu: "32°C", kelembapan: "62%", angin: "16 km/h", cuaca: "Cerah", icon: "sunny" },
    slot3: { suhu: "30°C", kelembapan: "69%", angin: "13 km/h", cuaca: "Cerah Berawan", icon: "partly-cloudy" },
    slot4: { suhu: "27°C", kelembapan: "77%", angin: "9 km/h", cuaca: "Berawan", icon: "cloudy" },
    slot5: { suhu: "24°C", kelembapan: "83%", angin: "6 km/h", cuaca: "Hujan Ringan", icon: "light-rain" },
  },
  {
    kecamatan: "Rambipuji",
    slot1: { suhu: "24°C", kelembapan: "77%", angin: "8 km/h", cuaca: "Cerah", icon: "sunny" },
    slot2: { suhu: "31°C", kelembapan: "64%", angin: "12 km/h", cuaca: "Cerah Berawan", icon: "partly-cloudy" },
    slot3: { suhu: "29°C", kelembapan: "71%", angin: "10 km/h", cuaca: "Berawan", icon: "cloudy" },
    slot4: { suhu: "26°C", kelembapan: "79%", angin: "7 km/h", cuaca: "Hujan Ringan", icon: "light-rain" },
    slot5: { suhu: "23°C", kelembapan: "85%", angin: "5 km/h", cuaca: "Hujan Sedang", icon: "rain" },
  },
  {
    kecamatan: "Semboro",
    slot1: { suhu: "24°C", kelembapan: "78%", angin: "9 km/h", cuaca: "Cerah Berawan", icon: "partly-cloudy" },
    slot2: { suhu: "30°C", kelembapan: "66%", angin: "13 km/h", cuaca: "Cerah", icon: "sunny" },
    slot3: { suhu: "28°C", kelembapan: "73%", angin: "10 km/h", cuaca: "Berawan", icon: "cloudy" },
    slot4: { suhu: "25°C", kelembapan: "81%", angin: "7 km/h", cuaca: "Hujan Ringan", icon: "light-rain" },
    slot5: { suhu: "22°C", kelembapan: "87%", angin: "5 km/h", cuaca: "Hujan Sedang", icon: "rain" },
  },
  {
    kecamatan: "Silo",
    slot1: { suhu: "20°C", kelembapan: "86%", angin: "5 km/h", cuaca: "Berawan", icon: "cloudy" },
    slot2: { suhu: "26°C", kelembapan: "74%", angin: "9 km/h", cuaca: "Cerah Berawan", icon: "partly-cloudy" },
    slot3: { suhu: "24°C", kelembapan: "80%", angin: "7 km/h", cuaca: "Berawan", icon: "cloudy" },
    slot4: { suhu: "22°C", kelembapan: "88%", angin: "5 km/h", cuaca: "Hujan Ringan", icon: "light-rain" },
    slot5: { suhu: "19°C", kelembapan: "92%", angin: "3 km/h", cuaca: "Hujan Sedang", icon: "rain" },
  },
  {
    kecamatan: "Sukorambi",
    slot1: { suhu: "23°C", kelembapan: "80%", angin: "7 km/h", cuaca: "Cerah", icon: "sunny" },
    slot2: { suhu: "29°C", kelembapan: "68%", angin: "11 km/h", cuaca: "Cerah Berawan", icon: "partly-cloudy" },
    slot3: { suhu: "27°C", kelembapan: "75%", angin: "9 km/h", cuaca: "Berawan", icon: "cloudy" },
    slot4: { suhu: "24°C", kelembapan: "83%", angin: "6 km/h", cuaca: "Hujan Ringan", icon: "light-rain" },
    slot5: { suhu: "21°C", kelembapan: "89%", angin: "4 km/h", cuaca: "Hujan Sedang", icon: "rain" },
  },
  {
    kecamatan: "Sukowono",
    slot1: { suhu: "22°C", kelembapan: "82%", angin: "7 km/h", cuaca: "Cerah Berawan", icon: "partly-cloudy" },
    slot2: { suhu: "29°C", kelembapan: "69%", angin: "11 km/h", cuaca: "Cerah", icon: "sunny" },
    slot3: { suhu: "27°C", kelembapan: "76%", angin: "8 km/h", cuaca: "Berawan", icon: "cloudy" },
    slot4: { suhu: "24°C", kelembapan: "84%", angin: "6 km/h", cuaca: "Hujan Ringan", icon: "light-rain" },
    slot5: { suhu: "21°C", kelembapan: "89%", angin: "4 km/h", cuaca: "Hujan Sedang", icon: "rain" },
  },
  {
    kecamatan: "Sumberbaru",
    slot1: { suhu: "24°C", kelembapan: "76%", angin: "10 km/h", cuaca: "Cerah", icon: "sunny" },
    slot2: { suhu: "31°C", kelembapan: "63%", angin: "14 km/h", cuaca: "Cerah Berawan", icon: "partly-cloudy" },
    slot3: { suhu: "29°C", kelembapan: "70%", angin: "11 km/h", cuaca: "Berawan", icon: "cloudy" },
    slot4: { suhu: "26°C", kelembapan: "78%", angin: "7 km/h", cuaca: "Hujan Ringan", icon: "light-rain" },
    slot5: { suhu: "23°C", kelembapan: "84%", angin: "5 km/h", cuaca: "Hujan Sedang", icon: "rain" },
  },
  {
    kecamatan: "Sumberjambe",
    slot1: { suhu: "20°C", kelembapan: "87%", angin: "5 km/h", cuaca: "Berawan", icon: "cloudy" },
    slot2: { suhu: "26°C", kelembapan: "75%", angin: "9 km/h", cuaca: "Cerah Berawan", icon: "partly-cloudy" },
    slot3: { suhu: "24°C", kelembapan: "81%", angin: "7 km/h", cuaca: "Hujan Ringan", icon: "light-rain" },
    slot4: { suhu: "22°C", kelembapan: "89%", angin: "5 km/h", cuaca: "Hujan Ringan", icon: "light-rain" },
    slot5: { suhu: "19°C", kelembapan: "93%", angin: "3 km/h", cuaca: "Hujan Lebat", icon: "thunderstorm" },
  },
  {
    kecamatan: "Sumbersari",
    slot1: { suhu: "25°C", kelembapan: "74%", angin: "9 km/h", cuaca: "Cerah", icon: "sunny" },
    slot2: { suhu: "32°C", kelembapan: "61%", angin: "13 km/h", cuaca: "Cerah Berawan", icon: "partly-cloudy" },
    slot3: { suhu: "30°C", kelembapan: "69%", angin: "10 km/h", cuaca: "Berawan", icon: "cloudy" },
    slot4: { suhu: "27°C", kelembapan: "77%", angin: "7 km/h", cuaca: "Hujan Ringan", icon: "light-rain" },
    slot5: { suhu: "24°C", kelembapan: "83%", angin: "5 km/h", cuaca: "Hujan Sedang", icon: "rain" },
  },
  {
    kecamatan: "Tanggul",
    slot1: { suhu: "23°C", kelembapan: "80%", angin: "8 km/h", cuaca: "Berawan", icon: "cloudy" },
    slot2: { suhu: "29°C", kelembapan: "68%", angin: "12 km/h", cuaca: "Cerah Berawan", icon: "partly-cloudy" },
    slot3: { suhu: "27°C", kelembapan: "75%", angin: "9 km/h", cuaca: "Hujan Ringan", icon: "light-rain" },
    slot4: { suhu: "24°C", kelembapan: "83%", angin: "6 km/h", cuaca: "Hujan Sedang", icon: "rain" },
    slot5: { suhu: "21°C", kelembapan: "89%", angin: "4 km/h", cuaca: "Hujan Lebat", icon: "thunderstorm" },
  },
  {
    kecamatan: "Tempurejo",
    slot1: { suhu: "22°C", kelembapan: "83%", angin: "7 km/h", cuaca: "Cerah Berawan", icon: "partly-cloudy" },
    slot2: { suhu: "28°C", kelembapan: "71%", angin: "11 km/h", cuaca: "Cerah", icon: "sunny" },
    slot3: { suhu: "26°C", kelembapan: "77%", angin: "8 km/h", cuaca: "Berawan", icon: "cloudy" },
    slot4: { suhu: "24°C", kelembapan: "85%", angin: "6 km/h", cuaca: "Hujan Ringan", icon: "light-rain" },
    slot5: { suhu: "21°C", kelembapan: "90%", angin: "4 km/h", cuaca: "Hujan Sedang", icon: "rain" },
  },
  {
    kecamatan: "Umbulsari",
    slot1: { suhu: "24°C", kelembapan: "77%", angin: "9 km/h", cuaca: "Cerah", icon: "sunny" },
    slot2: { suhu: "31°C", kelembapan: "64%", angin: "13 km/h", cuaca: "Cerah Berawan", icon: "partly-cloudy" },
    slot3: { suhu: "29°C", kelembapan: "71%", angin: "10 km/h", cuaca: "Berawan", icon: "cloudy" },
    slot4: { suhu: "26°C", kelembapan: "79%", angin: "7 km/h", cuaca: "Hujan Ringan", icon: "light-rain" },
    slot5: { suhu: "23°C", kelembapan: "85%", angin: "5 km/h", cuaca: "Hujan Lebat", icon: "thunderstorm" },
  },
  {
    kecamatan: "Wuluhan",
    slot1: { suhu: "24°C", kelembapan: "76%", angin: "10 km/h", cuaca: "Cerah", icon: "sunny" },
    slot2: { suhu: "31°C", kelembapan: "63%", angin: "14 km/h", cuaca: "Cerah Berawan", icon: "partly-cloudy" },
    slot3: { suhu: "29°C", kelembapan: "70%", angin: "11 km/h", cuaca: "Berawan", icon: "cloudy" },
    slot4: { suhu: "26°C", kelembapan: "78%", angin: "7 km/h", cuaca: "Hujan Ringan", icon: "light-rain" },
    slot5: { suhu: "23°C", kelembapan: "84%", angin: "5 km/h", cuaca: "Hujan Sedang", icon: "rain" },
  },
];

export const timeSlots = [
  { key: "slot1", label: "Pagi", time: "06:00", range: [5, 8] },
  { key: "slot2", label: "Siang", time: "12:00", range: [9, 14] },
  { key: "slot3", label: "Sore", time: "15:00", range: [14, 18] },
  { key: "slot4", label: "Malam", time: "20:00", range: [18, 23] },
  { key: "slot5", label: "Dini Hari", time: "00:00", range: [0, 5] },
];

// ===================== ALL KECAMATAN LIST =====================
export const allKecamatanNames = allKecamatanPredictions.map(
  (p) => p.kecamatan
);

// ===================== HOURLY WEATHER DATA =====================
export interface HourlyWeather {
  jam: string;
  cuaca: string;
  icon: string;
  suhu: string;
  kelembapan: string;
  angin: string;
}

// Generate hourly data for a given kecamatan
export function getHourlyWeather(kecamatan: string): HourlyWeather[] {
  // Seed based on kecamatan name to get consistent but varied data
  const seed = kecamatan
    .split("")
    .reduce((acc, ch) => acc + ch.charCodeAt(0), 0);

  const hours = [
    "01:00", "02:00", "03:00", "04:00", "05:00", "06:00",
    "07:00", "08:00", "09:00", "10:00", "11:00", "12:00",
    "13:00", "14:00", "15:00", "16:00", "17:00", "18:00",
    "19:00", "20:00", "21:00", "22:00", "23:00", "00:00",
  ];

  const conditions: { cuaca: string; icon: string }[] = [
    { cuaca: "Cerah Berawan", icon: "partly-cloudy" },
    { cuaca: "Cerah Berawan", icon: "partly-cloudy" },
    { cuaca: "Cerah Berawan", icon: "partly-cloudy" },
    { cuaca: "Cerah Berawan", icon: "partly-cloudy" },
    { cuaca: "Berawan", icon: "cloudy" },
    { cuaca: "Cerah Berawan", icon: "partly-cloudy" },
    { cuaca: "Cerah Berawan", icon: "partly-cloudy" },
    { cuaca: "Cerah", icon: "sunny" },
    { cuaca: "Cerah", icon: "sunny" },
    { cuaca: "Cerah Berawan", icon: "partly-cloudy" },
    { cuaca: "Cerah Berawan", icon: "partly-cloudy" },
    { cuaca: "Berawan", icon: "cloudy" },
    { cuaca: "Berawan", icon: "cloudy" },
    { cuaca: "Hujan Ringan", icon: "light-rain" },
    { cuaca: "Hujan Ringan", icon: "light-rain" },
    { cuaca: "Hujan Sedang", icon: "rain" },
    { cuaca: "Hujan Ringan", icon: "light-rain" },
    { cuaca: "Berawan", icon: "cloudy" },
    { cuaca: "Hujan Ringan", icon: "light-rain" },
    { cuaca: "Hujan Sedang", icon: "rain" },
    { cuaca: "Hujan Sedang", icon: "rain" },
    { cuaca: "Hujan Ringan", icon: "light-rain" },
    { cuaca: "Berawan", icon: "cloudy" },
    { cuaca: "Cerah Berawan", icon: "partly-cloudy" },
  ];

  // Base temps following natural curve: cool at night, warm midday
  const baseTemps = [
    22, 21, 21, 20, 21, 22, 24, 26, 28, 30, 31, 32,
    33, 32, 31, 30, 29, 28, 27, 26, 25, 24, 23, 22,
  ];

  return hours.map((jam, i) => {
    const tempOffset = (seed % 5) - 2; // -2 to +2 variation
    const condIdx = (i + (seed % 7)) % conditions.length;
    const temp = baseTemps[i] + tempOffset;
    const humidity = 60 + (i > 12 ? 15 : 0) + ((seed + i) % 10);
    const wind = 5 + ((seed + i) % 12);

    return {
      jam,
      cuaca: conditions[condIdx].cuaca,
      icon: conditions[condIdx].icon,
      suhu: `${temp}°C`,
      kelembapan: `${Math.min(humidity, 95)}%`,
      angin: `${wind} km/h`,
    };
  });
}

// Get warning description for a kecamatan
export function getKecamatanWarning(kecamatan: string): string {
  const seed = kecamatan
    .split("")
    .reduce((acc, ch) => acc + ch.charCodeAt(0), 0);

  const warnings = [
    `Peringatan dini potensi hujan sedang hingga lebat yang dapat disertai petir dan angin kencang di wilayah Kecamatan ${kecamatan} beberapa hari kedepan.`,
    `Prakiraan cuaca menunjukkan potensi hujan ringan hingga sedang di wilayah Kecamatan ${kecamatan}. Masyarakat diimbau untuk tetap waspada.`,
    `Cuaca di wilayah Kecamatan ${kecamatan} diprediksi cerah berawan pada pagi hari dan berpotensi hujan ringan pada sore hingga malam hari.`,
    `Kondisi cuaca di Kecamatan ${kecamatan} relatif stabil dengan potensi hujan ringan pada malam hari. Tetap pantau perkembangan cuaca.`,
  ];

  return warnings[seed % warnings.length];
}
