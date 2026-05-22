"use client";

import { useState, use, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import DatePicker from "@/components/ui/DatePicker";
import { allKecamatanNames } from "@/data/prediksiCuacaData";
import { fetchWeatherByDate } from "@/services/weather";
import { HiArrowTopRightOnSquare } from "react-icons/hi2";

// Helper to map weather description to icon
const mapConditionToIcon = (description: string) => {
  const desc = description?.toLowerCase() || '';
  if (desc.includes('petir') || desc.includes('thunder')) return 'thunderstorm';
  if (desc.includes('hujan lebat') || desc.includes('heavy rain')) return 'rain';
  if (desc.includes('hujan') || desc.includes('rain')) return 'light-rain';
  if (desc.includes('cerah berawan') || desc.includes('partly')) return 'partly-cloudy';
  if (desc.includes('berawan') || desc.includes('cloud')) return 'cloudy';
  if (desc.includes('cerah') || desc.includes('clear') || desc.includes('sunny')) return 'sunny';
  if (desc.includes('kabut') || desc.includes('asap') || desc.includes('fog')) return 'cloudy';
  return 'partly-cloudy';
};

const mapConditionToSvg = (description: string) => {
  const desc = description?.toLowerCase() || '';
  if (desc.includes('petir') || desc.includes('thunder')) return 'hujan-petir.svg';
  if (desc.includes('hujan lebat') || desc.includes('heavy rain')) return 'hujan-lebat.svg';
  if (desc.includes('hujan sedang') || desc.includes('moderate rain')) return 'hujan-sedang.svg';
  if (desc.includes('hujan') || desc.includes('rain')) return 'hujan-ringan.svg';
  if (desc.includes('cerah berawan') || desc.includes('partly')) return 'cerah-berawan.svg';
  if (desc.includes('berawan') || desc.includes('cloud')) return 'berawan.svg';
  if (desc.includes('cerah') || desc.includes('clear') || desc.includes('sunny')) return 'cerah.svg';
  return 'cerah-berawan.svg';
};

const arahAnginMap: Record<string, { label: string; arrow: string }> = {
  N: { label: "Utara", arrow: "↓" },
  NNE: { label: "Utara Timur Laut", arrow: "↙" },
  NE: { label: "Timur Laut", arrow: "↙" },
  ENE: { label: "Timur Timur Laut", arrow: "↙" },
  E: { label: "Timur", arrow: "←" },
  ESE: { label: "Timur Tenggara", arrow: "↖" },
  SE: { label: "Tenggara", arrow: "↖" },
  SSE: { label: "Selatan Tenggara", arrow: "↖" },
  S: { label: "Selatan", arrow: "↑" },
  SSW: { label: "Selatan Barat Daya", arrow: "↗" },
  SW: { label: "Barat Daya", arrow: "↗" },
  WSW: { label: "Barat Barat Daya", arrow: "↗" },
  W: { label: "Barat", arrow: "→" },
  WNW: { label: "Barat Barat Laut", arrow: "↘" },
  NW: { label: "Barat Laut", arrow: "↘" },
  NNW: { label: "Utara Barat Laut", arrow: "↘" },
};

const getWindDirectionInfo = (dir: string) => {
  if (!dir) return { label: "Barat", arrow: "→" };
  const upperDir = dir.toUpperCase().trim();
  if (arahAnginMap[upperDir]) return arahAnginMap[upperDir];
  
  if (upperDir.includes("UTARA")) return { label: dir, arrow: "↓" };
  if (upperDir.includes("TIMUR LAUT")) return { label: dir, arrow: "↙" };
  if (upperDir.includes("TIMUR")) return { label: dir, arrow: "←" };
  if (upperDir.includes("TENGGARA")) return { label: dir, arrow: "↖" };
  if (upperDir.includes("SELATAN")) return { label: dir, arrow: "↑" };
  if (upperDir.includes("BARAT DAYA")) return { label: dir, arrow: "↗" };
  if (upperDir.includes("BARAT")) return { label: dir, arrow: "→" };
  if (upperDir.includes("BARAT LAUT")) return { label: dir, arrow: "↘" };
  return { label: dir, arrow: "→" };
};

const getVisibilityText = (vis: any) => {
  if (vis === undefined || vis === null) return "> 10 km";
  const num = parseFloat(vis);
  if (isNaN(num)) return vis.toString();
  if (num >= 1000) return `${(num / 1000).toFixed(0)} km`;
  return `${num} m`;
};

export default function KecamatanDetailPage({
  params,
}: {
  params: Promise<{ kecamatan: string }>;
}) {
  const resolvedParams = use(params);
  const kecamatanSlug = decodeURIComponent(resolvedParams.kecamatan);

  // Capitalize properly
  const kecamatanName =
    allKecamatanNames.find(
      (k) => k.toLowerCase() === kecamatanSlug.toLowerCase()
    ) || kecamatanSlug;

  // Date picker
  const todayStr = new Date().toISOString().split("T")[0];
  const [selectedDate, setSelectedDate] = useState(todayStr);

  const minDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
  const maxDate = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];

  const [isLoading, setIsLoading] = useState(true);
  const [weatherData, setWeatherData] = useState<any[]>([]);
  const [dataSource, setDataSource] = useState<string>("");

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        const res = await fetchWeatherByDate(selectedDate);
        const allData = res?.data || {};
        
        // Find data for this specific kecamatan
        // API returns grouped data, we just find the matching key (case-insensitive)
        const key = Object.keys(allData).find(k => k.toLowerCase() === kecamatanName.toLowerCase());
        setWeatherData(key ? allData[key] : []);
        setDataSource(res?.source || "");
      } catch (error) {
        console.error("Gagal memuat data detail kecamatan:", error);
        setWeatherData([]);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, [selectedDate, kecamatanName]);

  // Generate warning text based on data
  const generateWarning = (data: any[]) => {
    if (!data || data.length === 0) return "Tidak ada data cuaca untuk hari ini.";
    
    let maxHujan = 0;
    let maxSuhu = 0;
    
    data.forEach(item => {
      const curah = parseFloat(item.curah_hujan) || 0;
      const suhu = parseFloat(item.suhu) || 0;
      if (curah > maxHujan) maxHujan = curah;
      if (suhu > maxSuhu) maxSuhu = suhu;
    });

    if (maxHujan > 10) {
      return `Prakiraan cuaca menunjukkan potensi hujan sedang hingga lebat di wilayah Kecamatan ${kecamatanName}. Masyarakat diimbau untuk tetap waspada.`;
    } else if (maxHujan > 0) {
      return `Prakiraan cuaca menunjukkan potensi hujan ringan di wilayah Kecamatan ${kecamatanName}. Sediakan payung jika beraktivitas di luar.`;
    } else if (maxSuhu > 33) {
      return `Cuaca diperkirakan sangat cerah dan panas mencapai ${maxSuhu}°C di wilayah Kecamatan ${kecamatanName}. Jangan lupa jaga hidrasi tubuh.`;
    } else {
      return `Cuaca diperkirakan cerah hingga berawan di wilayah Kecamatan ${kecamatanName}. Kondisi aman untuk beraktivitas.`;
    }
  };

  const warningText = isLoading ? "Memuat data cuaca..." : generateWarning(weatherData);

  // Other kecamatan (exclude current)
  const otherKecamatan = allKecamatanNames.filter(
    (k) => k.toLowerCase() !== kecamatanName.toLowerCase()
  );

  // Find current weather prediction closest to current time
  const getClosestWeatherItem = () => {
    if (!weatherData || weatherData.length === 0) return null;
    const now = new Date();
    const todayStr = now.toISOString().split("T")[0];
    const isToday = selectedDate === todayStr;

    if (!isToday) {
      // Find closest to 12:00 (midday)
      let closestItem = weatherData[0];
      let minDiff = Infinity;
      weatherData.forEach(item => {
        const timeStr = item.waktu_lokal || item.waktu || "";
        const d = new Date(timeStr);
        if (!isNaN(d.getTime())) {
          const hour = d.getHours();
          const diff = Math.abs(hour - 12);
          if (diff < minDiff) {
            minDiff = diff;
            closestItem = item;
          }
        }
      });
      return closestItem;
    }

    let closestItem = weatherData[0];
    let minDiff = Infinity;
    const currentHour = now.getHours();

    weatherData.forEach(item => {
      const timeStr = item.waktu_lokal || item.waktu || "";
      const d = new Date(timeStr);
      if (!isNaN(d.getTime())) {
        const hour = d.getHours();
        const diff = Math.abs(hour - currentHour);
        if (diff < minDiff) {
          minDiff = diff;
          closestItem = item;
        }
      }
    });

    return closestItem;
  };

  const currentCuaca = getClosestWeatherItem();

  return (
    <>
      <Navbar />
      <main className="flex-1" style={{ backgroundColor: '#F3F8FF' }}>
        {/* Hero */}
        <section className="pt-36 pb-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-8">
              <h1 className="text-2xl md:text-3xl font-bold text-primary leading-tight">
                Prediksi Cuaca Kecamatan{" "}
                <span className="text-secondary">{kecamatanName}</span>
              </h1>
              <p className="text-slate-600 max-w-2xl mx-auto text-[15px] leading-relaxed mt-3 min-h-[44px]">
                {warningText}
              </p>
            </div>

            {isLoading ? (
              <div
                className="relative rounded-2xl overflow-hidden shadow-sm border border-slate-100 max-w-4xl mx-auto animate-pulse"
                style={{ backgroundColor: "#DFEAF6" }}
              >
                {/* Shield watermarks */}
                <Image src="/icons/shield.svg" alt="" width={120} height={120} className="absolute -top-5 -left-5 pointer-events-none select-none" aria-hidden="true" />
                <Image src="/icons/shield.svg" alt="" width={140} height={140} className="absolute -bottom-6 -right-6 pointer-events-none select-none" aria-hidden="true" />

                <div className="relative z-10 p-8 md:p-10 flex flex-col md:flex-row items-center gap-8">
                  <div className="w-28 h-28 md:w-36 md:h-36 bg-primary/5 rounded-full flex-shrink-0" />
                  <div className="flex-1 space-y-4 w-full">
                    <div className="h-4 bg-primary/8 rounded w-1/4" />
                    <div className="h-7 bg-primary/8 rounded w-3/5" />
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
                      <div className="h-11 bg-white/40 rounded-xl" />
                      <div className="h-11 bg-white/40 rounded-xl" />
                      <div className="h-11 bg-white/40 rounded-xl" />
                      <div className="h-11 bg-white/40 rounded-xl" />
                    </div>
                  </div>
                </div>
              </div>
            ) : currentCuaca ? (
              <div
                className="relative rounded-2xl overflow-hidden shadow-sm border border-slate-100 max-w-4xl mx-auto transition-shadow duration-300 hover:shadow-md"
                style={{ backgroundColor: "#DFEAF6" }}
              >
                {/* Shield watermarks at corners */}
                <Image
                  src="/icons/shield.svg"
                  alt=""
                  width={120}
                  height={120}
                  className="absolute -top-5 -left-5 pointer-events-none select-none"
                  aria-hidden="true"
                />
                <Image
                  src="/icons/shield.svg"
                  alt=""
                  width={140}
                  height={140}
                  className="absolute -bottom-6 -right-6 pointer-events-none select-none"
                  aria-hidden="true"
                />

                <div className="relative z-10 p-8 md:p-10 flex flex-col md:flex-row items-center justify-between gap-6 md:gap-10">
                  {/* Kiri: Weather Icon */}
                  <div className="flex-shrink-0 group">
                    <Image
                      src={`/icons/${mapConditionToSvg(currentCuaca.deskripsi_cuaca)}`}
                      alt={currentCuaca.deskripsi_cuaca || "Cuaca"}
                      width={160}
                      height={160}
                      className="w-32 h-32 md:w-40 md:h-40 object-contain drop-shadow-lg transition-transform duration-500 group-hover:scale-105"
                      priority
                    />
                  </div>

                  {/* Kanan: Info & Parameter */}
                  <div className="flex-1 w-full text-center md:text-left space-y-3">
                    <div className="space-y-1">
                      <span className="text-[11px] font-bold text-primary/50 uppercase tracking-[0.2em] block">SAAT INI</span>
                      <h2 className="text-xl sm:text-2xl md:text-[28px] font-bold text-primary leading-snug">
                        {currentCuaca.deskripsi_cuaca || "Cerah Berawan"}
                        <span className="text-base md:text-lg font-normal text-primary/60 ml-3">
                          di {kecamatanName}
                        </span>
                      </h2>
                    </div>

                    {/* Grid Parameter */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                      {/* Kelembapan */}
                      <div className="flex items-center gap-2.5 bg-white/50 backdrop-blur-sm border border-white/70 rounded-xl px-3.5 py-2.5 transition-all duration-200 hover:bg-white/70">
                        <img src="/icons/water-icon.svg" alt="" className="w-[18px] h-[18px] object-contain opacity-70" />
                        <span className="text-[13px] text-primary/70 font-medium">
                          Kelembapan: <strong className="text-primary font-bold">{currentCuaca.kelembapan ?? "0"}%</strong>
                        </span>
                      </div>

                      {/* Kecepatan Angin */}
                      <div className="flex items-center gap-2.5 bg-white/50 backdrop-blur-sm border border-white/70 rounded-xl px-3.5 py-2.5 transition-all duration-200 hover:bg-white/70">
                        <img src="/icons/wind-icon.svg" alt="" className="w-[18px] h-[18px] object-contain opacity-70" />
                        <span className="text-[13px] text-primary/70 font-medium">
                          Kecepatan Angin: <strong className="text-primary font-bold">{currentCuaca.kecepatan_angin ?? "0"} km/jam</strong>
                        </span>
                      </div>

                      {/* Jarak Pandang */}
                      <div className="flex items-center gap-2.5 bg-white/50 backdrop-blur-sm border border-white/70 rounded-xl px-3.5 py-2.5 transition-all duration-200 hover:bg-white/70">
                        <img src="/icons/eye-icon.svg" alt="" className="w-[18px] h-[18px] object-contain opacity-70" />
                        <span className="text-[13px] text-primary/70 font-medium">
                          Jarak Pandang: <strong className="text-primary font-bold">{getVisibilityText(currentCuaca.visibilitas)}</strong>
                        </span>
                      </div>

                      {/* Arah Angin */}
                      <div className="flex items-center gap-2.5 bg-white/50 backdrop-blur-sm border border-white/70 rounded-xl px-3.5 py-2.5 transition-all duration-200 hover:bg-white/70">
                        <img src="/icons/compass-icon.svg" alt="" className="w-[18px] h-[18px] object-contain opacity-70" />
                        <span className="text-[13px] text-primary/70 font-medium flex items-center gap-1">
                          Arah Angin dari: <strong className="text-primary font-bold">{getWindDirectionInfo(currentCuaca.arah_angin).label}</strong>
                          <span className="text-primary/60 font-bold ml-0.5">{getWindDirectionInfo(currentCuaca.arah_angin).arrow}</span>
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div
                className="relative rounded-2xl overflow-hidden shadow-sm border border-slate-100 max-w-4xl mx-auto"
                style={{ backgroundColor: "#DFEAF6" }}
              >
                <Image src="/icons/shield.svg" alt="" width={120} height={120} className="absolute -top-5 -left-5 pointer-events-none select-none" aria-hidden="true" />
                <Image src="/icons/shield.svg" alt="" width={140} height={140} className="absolute -bottom-6 -right-6 pointer-events-none select-none" aria-hidden="true" />
                <div className="relative z-10 p-10 text-center text-primary/60">
                  Tidak ada data prakiraan cuaca saat ini.
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Hourly Forecast */}
        <section className="py-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-bold text-primary mb-6">
              Prediksi Cuaca Kecamatan {kecamatanName}
            </h2>

            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6">
              <div className="flex items-center gap-3">
                <DatePicker
                  id="kecamatan-date-picker"
                  value={selectedDate}
                  onChange={(val) => setSelectedDate(val)}
                  minDate={minDate}
                  maxDate={maxDate}
                  disableDarkMode={true}
                />
              </div>
              <span className="text-xs text-slate-400 font-medium">
                Sumber: BMKG
              </span>
            </div>

            <div className="rounded-2xl border border-border bg-white shadow-sm overflow-hidden">
              {/* Table header bar */}
              <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                <h3 className="text-base font-bold text-primary">
                  Rincian Prakiraan Per Jam
                </h3>
                <span className="text-xs text-slate-400">
                  {weatherData.length} data
                </span>
              </div>

              {isLoading ? (
                <div className="flex items-center justify-center py-16 text-slate-400">
                  <svg className="animate-spin h-5 w-5 mr-2 text-slate-300" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Memuat data cuaca...
                </div>
              ) : weatherData.length === 0 ? (
                <div className="flex items-center justify-center py-16 text-slate-400">
                  Data tidak tersedia untuk tanggal ini.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-100">
                        <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">Waktu</th>
                        <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">Kondisi</th>
                        <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">Suhu / Lembap</th>
                        <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">Curah Hujan</th>
                        <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">Angin</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {weatherData.map((data, idx) => {
                        const timeStr = data.waktu_lokal || data.waktu || "";
                        const d = new Date(timeStr);
                        const isValidDate = !isNaN(d.getTime());
                        const jam = isValidDate
                          ? d.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }).replace(".", ":")
                          : "00:00";

                        const curahHujan = parseFloat(data.curah_hujan) || 0;
                        const hujanBadge = curahHujan === 0
                          ? { color: "bg-green-50 text-green-700 border-green-200", label: "Tidak Hujan" }
                          : curahHujan < 5
                          ? { color: "bg-blue-50 text-blue-700 border-blue-200", label: "Ringan" }
                          : curahHujan < 20
                          ? { color: "bg-amber-50 text-amber-700 border-amber-200", label: "Sedang" }
                          : { color: "bg-red-50 text-red-700 border-red-200", label: "Lebat" };

                        const windInfo = getWindDirectionInfo(data.arah_angin);

                        return (
                          <tr key={idx} className="hover:bg-slate-50/70 transition-colors">
                            <td className="px-6 py-4">
                              <p className="font-semibold text-primary">{jam} WIB</p>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <Image
                                  src={`/icons/${mapConditionToSvg(data.deskripsi_cuaca)}`}
                                  alt={data.deskripsi_cuaca || ""}
                                  width={32}
                                  height={32}
                                  className="w-8 h-8 object-contain"
                                />
                                <span className="text-sm font-medium text-slate-700">{data.deskripsi_cuaca || "-"}</span>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <p className="font-bold text-primary">{data.suhu ?? "-"}°C</p>
                              <p className="text-xs text-slate-500 mt-1">Lembap: {data.kelembapan ?? "-"}%</p>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex flex-col items-start gap-1">
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${hujanBadge.color}`}>
                                  {curahHujan.toFixed(1)} mm
                                </span>
                                {data.cloud_cover != null && (
                                  <p className="text-xs text-slate-500 mt-0.5">Awan: {data.cloud_cover}%</p>
                                )}
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <p className="text-sm font-semibold text-primary">
                                {data.kecepatan_angin ?? "-"} <span className="text-xs font-normal text-slate-500">km/j</span>
                              </p>
                              <p className="text-xs text-slate-500 mt-1">{windInfo.label}</p>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Kecamatan Lainnya */}
        <section className="py-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-bold text-primary mb-6">
              Kecamatan Lainnya
            </h2>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {otherKecamatan.map((kec) => (
                <Link
                  key={kec}
                  href={`/prediksi-cuaca/${encodeURIComponent(kec.toLowerCase())}`}
                  className="flex items-center justify-between gap-2 bg-white border border-slate-100 rounded-xl px-4 py-3.5 text-sm font-semibold text-secondary hover:shadow-md hover:border-secondary/30 transition-all duration-200 group"
                >
                  <span>{kec}</span>
                  <HiArrowTopRightOnSquare className="text-secondary/40 group-hover:text-secondary text-base flex-shrink-0 transition-colors" />
                </Link>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
