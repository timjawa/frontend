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
  slot1: WeatherSlot; // 00:00
  slot2: WeatherSlot; // 03:00
  slot3: WeatherSlot; // 06:00
  slot4: WeatherSlot; // 09:00
  slot5: WeatherSlot; // 12:00
  slot6: WeatherSlot; // 15:00
  slot7: WeatherSlot; // 18:00
  slot8: WeatherSlot; // 21:00
}

export const allKecamatanNames = [
  "Ajung", "Ambulu", "Arjasa", "Balung", "Bangsalsari", "Gumukmas", "Jelbuk",
  "Jenggawah", "Jombang", "Kalisat", "Kaliwates", "Kencong", "Ledokombo",
  "Mayang", "Mumbulsari", "Pakusari", "Panti", "Patrang", "Puger", "Rambipuji",
  "Semboro", "Silo", "Sukorambi", "Sukowono", "Sumberbaru", "Sumberjambe",
  "Sumbersari", "Tanggul", "Tempurejo", "Umbulsari", "Wuluhan"
];

export const timeSlots = [
  { key: "slot1", label: "01:00", time: "01:00", range: [0, 3] },
  { key: "slot2", label: "04:00", time: "04:00", range: [3, 6] },
  { key: "slot3", label: "07:00", time: "07:00", range: [6, 9] },
  { key: "slot4", label: "10:00", time: "10:00", range: [9, 12] },
  { key: "slot5", label: "13:00", time: "13:00", range: [12, 15] },
  { key: "slot6", label: "16:00", time: "16:00", range: [15, 18] },
  { key: "slot7", label: "19:00", time: "19:00", range: [18, 21] },
  { key: "slot8", label: "22:00", time: "22:00", range: [21, 24] },
];

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
