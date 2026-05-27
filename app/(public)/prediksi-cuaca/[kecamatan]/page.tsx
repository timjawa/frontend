"use client";

import { useState, use, useEffect, useMemo, useDeferredValue } from "react";
import Link from "next/link";
import Image from "next/image";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { allKecamatanNames } from "@/data/prediksiCuacaData";
import { fetchWeatherForecast } from "@/services/weather";
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

const tabs = ["Hari Ini", "Besok", "Lusa"];

export default function KecamatanDetailPage({
  params,
}: {
  params: Promise<{ kecamatan: string }>;
}) {
  const resolvedParams = use(params);
  const kecamatanSlug = decodeURIComponent(resolvedParams.kecamatan);

  const kecamatanName =
    allKecamatanNames.find(
      (k) => k.toLowerCase() === kecamatanSlug.toLowerCase()
    ) || kecamatanSlug;

  const [activeTab, setActiveTab] = useState(0);
  const deferredActiveTab = useDeferredValue(activeTab);
  const [isLoading, setIsLoading] = useState(true);
  const [allData, setAllData] = useState<Record<string, any[]>>({});

  // Target date based on active tab
  const targetDateString = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + deferredActiveTab);
    return d.toLocaleDateString('en-CA');
  }, [deferredActiveTab]);

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        const res = await fetchWeatherForecast();
        setAllData(res?.data || {});
      } catch (error) {
        console.error("Gagal memuat data detail kecamatan:", error);
        setAllData({});
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  // Filter weather data for this kecamatan on the target date, sorted by hour
  const weatherData = useMemo(() => {
    const key = Object.keys(allData).find(
      (k) => k.toLowerCase() === kecamatanName.toLowerCase()
    );
    if (!key) return [];
    const forecasts = allData[key] || [];
    return forecasts
      .filter((f: any) => {
        const d = new Date(f.waktu_lokal);
        if (isNaN(d.getTime())) return false;
        return d.toLocaleDateString('en-CA') === targetDateString;
      })
      .sort((a: any, b: any) => {
        return new Date(a.waktu_lokal).getTime() - new Date(b.waktu_lokal).getTime();
      });
  }, [allData, kecamatanName, targetDateString]);

  const isPending = activeTab !== deferredActiveTab;
  const showSkeleton = isLoading || isPending;

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

  const warningText = showSkeleton ? "Memuat data cuaca..." : generateWarning(weatherData);

  // Find current weather prediction closest to current time
  const currentCuaca = useMemo(() => {
    if (!weatherData || weatherData.length === 0) return null;
    const now = new Date();
    const currentHour = now.getHours();
    let closestItem = weatherData[0];
    let minDiff = Infinity;
    weatherData.forEach((item: any) => {
      const d = new Date(item.waktu_lokal);
      if (!isNaN(d.getTime())) {
        const diff = Math.abs(d.getHours() - (activeTab === 0 ? currentHour : 12));
        if (diff < minDiff) {
          minDiff = diff;
          closestItem = item;
        }
      }
    });
    return closestItem;
  }, [weatherData, activeTab]);

  // Other kecamatan (exclude current)
  const otherKecamatan = allKecamatanNames.filter(
    (k) => k.toLowerCase() !== kecamatanName.toLowerCase()
  );

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

            {showSkeleton ? (
              <div
                className="relative rounded-2xl overflow-hidden shadow-sm border border-slate-100 animate-pulse"
                style={{ backgroundColor: "#DFEAF6" }}
              >
                <Image src="/icons/shield.svg" alt="" width={160} height={160} className="absolute -top-6 -left-6 pointer-events-none select-none" aria-hidden="true" />
                <Image src="/icons/shield.svg" alt="" width={180} height={180} className="absolute -bottom-8 -right-8 pointer-events-none select-none" aria-hidden="true" />
                <div className="relative z-10 p-10 md:p-14 flex flex-col md:flex-row items-center gap-10">
                  <div className="w-40 h-40 md:w-52 md:h-52 bg-primary/5 rounded-full flex-shrink-0" />
                  <div className="flex-1 space-y-5 w-full">
                    <div className="h-5 bg-primary/8 rounded w-1/4" />
                    <div className="h-9 bg-primary/8 rounded w-3/5" />
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-3">
                      <div className="h-14 bg-white/40 rounded-xl" />
                      <div className="h-14 bg-white/40 rounded-xl" />
                      <div className="h-14 bg-white/40 rounded-xl" />
                      <div className="h-14 bg-white/40 rounded-xl" />
                    </div>
                  </div>
                </div>
              </div>
            ) : currentCuaca ? (
              <div
                className="relative rounded-2xl overflow-hidden shadow-md border border-slate-100 transition-shadow duration-300 hover:shadow-lg"
                style={{ backgroundColor: "#DFEAF6" }}
              >
                {/* Shield watermarks */}
                <Image src="/icons/shield.svg" alt="" width={160} height={160} className="absolute -top-6 -left-6 pointer-events-none select-none" aria-hidden="true" />
                <Image src="/icons/shield.svg" alt="" width={180} height={180} className="absolute -bottom-8 -right-8 pointer-events-none select-none" aria-hidden="true" />

                <div className="relative z-10 p-10 md:p-14 flex flex-col md:flex-row items-center justify-between gap-8 md:gap-14">
                  {/* Kiri: Weather Icon */}
                  <div className="flex-shrink-0 group">
                    <Image
                      src={`/icons/${mapConditionToSvg(currentCuaca.deskripsi_cuaca)}`}
                      alt={currentCuaca.deskripsi_cuaca || "Cuaca"}
                      width={220}
                      height={220}
                      className="w-44 h-44 md:w-56 md:h-56 object-contain drop-shadow-xl transition-transform duration-500 group-hover:scale-105"
                      priority
                    />
                  </div>

                  {/* Kanan: Info & Parameter */}
                  <div className="flex-1 w-full text-center md:text-left space-y-4">
                    <div className="space-y-1.5">
                      <span className="text-[11px] font-bold text-primary/50 uppercase tracking-[0.2em] block">SAAT INI</span>
                      <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-primary leading-snug">
                        {currentCuaca.deskripsi_cuaca || "Cerah Berawan"}
                      </h2>
                      <p className="text-3xl md:text-4xl font-black text-primary/80 mt-1">
                        {Math.round(currentCuaca.suhu ?? 0)}°C
                      </p>
                    </div>

                    {/* Grid Parameter */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                      {/* Kelembapan */}
                      <div className="flex items-center gap-3 bg-white/50 backdrop-blur-sm border border-white/70 rounded-xl px-4 py-3.5 transition-all duration-200 hover:bg-white/70">
                        <img src="/icons/water-icon.svg" alt="" className="w-5 h-5 object-contain opacity-70" />
                        <span className="text-sm text-primary/70 font-medium">
                          Kelembapan: <strong className="text-primary font-bold">{currentCuaca.kelembapan ?? "0"}%</strong>
                        </span>
                      </div>

                      {/* Kecepatan Angin */}
                      <div className="flex items-center gap-3 bg-white/50 backdrop-blur-sm border border-white/70 rounded-xl px-4 py-3.5 transition-all duration-200 hover:bg-white/70">
                        <img src="/icons/wind-icon.svg" alt="" className="w-5 h-5 object-contain opacity-70" />
                        <span className="text-sm text-primary/70 font-medium">
                          Kecepatan Angin: <strong className="text-primary font-bold">{currentCuaca.kecepatan_angin ?? "0"} km/jam</strong>
                        </span>
                      </div>

                      {/* Jarak Pandang */}
                      <div className="flex items-center gap-3 bg-white/50 backdrop-blur-sm border border-white/70 rounded-xl px-4 py-3.5 transition-all duration-200 hover:bg-white/70">
                        <img src="/icons/eye-icon.svg" alt="" className="w-5 h-5 object-contain opacity-70" />
                        <span className="text-sm text-primary/70 font-medium">
                          Jarak Pandang: <strong className="text-primary font-bold">{getVisibilityText(currentCuaca.visibilitas)}</strong>
                        </span>
                      </div>

                      {/* Arah Angin */}
                      <div className="flex items-center gap-3 bg-white/50 backdrop-blur-sm border border-white/70 rounded-xl px-4 py-3.5 transition-all duration-200 hover:bg-white/70">
                        <img src="/icons/compass-icon.svg" alt="" className="w-5 h-5 object-contain opacity-70" />
                        <span className="text-sm text-primary/70 font-medium flex items-center gap-1">
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
                className="relative rounded-2xl overflow-hidden shadow-sm border border-slate-100"
                style={{ backgroundColor: "#DFEAF6" }}
              >
                <Image src="/icons/shield.svg" alt="" width={160} height={160} className="absolute -top-6 -left-6 pointer-events-none select-none" aria-hidden="true" />
                <Image src="/icons/shield.svg" alt="" width={180} height={180} className="absolute -bottom-8 -right-8 pointer-events-none select-none" aria-hidden="true" />
                <div className="relative z-10 p-14 text-center text-primary/60">
                  Tidak ada data prakiraan cuaca saat ini.
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Hourly Forecast Table */}
        <section className="py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-bold text-primary mb-5">
              Prediksi Cuaca Kecamatan {kecamatanName}
            </h2>

            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
              {/* Day Tabs */}
              <div className="flex gap-2">
                {tabs.map((tab, i) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(i)}
                    className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${activeTab === i
                        ? "bg-[#1f2a56] text-white shadow-md"
                        : "bg-white text-slate-600 hover:bg-slate-100 border border-border"
                      }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
              <span className="text-sm font-semibold text-slate-500">Sumber: BMKG</span>
            </div>

            <div className="rounded-2xl border border-border bg-white shadow-sm overflow-hidden">
              {/* Table header bar */}
              <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                <h3 className="text-base font-bold text-primary">
                  Rincian Prakiraan Per Jam
                </h3>
                <span className="text-xs text-slate-400">
                  {!showSkeleton ? `${weatherData.length} data` : "—"}
                </span>
              </div>

              {showSkeleton ? (
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
                      {Array.from({ length: 8 }).map((_, idx) => (
                        <tr key={idx} className="animate-pulse">
                          <td className="px-6 py-4">
                            <div className="h-4 bg-slate-200 rounded w-20" />
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-slate-200 rounded-full flex-shrink-0" />
                              <div className="h-4 bg-slate-200 rounded w-28" />
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="h-4 bg-slate-200 rounded w-12 mb-2" />
                            <div className="h-3 bg-slate-200 rounded w-20" />
                          </td>
                          <td className="px-6 py-4">
                            <div className="h-5 bg-slate-200 rounded-full w-16 mb-1" />
                          </td>
                          <td className="px-6 py-4">
                            <div className="h-4 bg-slate-200 rounded w-16 mb-2" />
                            <div className="h-3 bg-slate-200 rounded w-20" />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
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
                      {weatherData.map((data: any, idx: number) => {
                        const timeStr = data.waktu_lokal || data.waktu || "";
                        const d = new Date(timeStr);
                        const isValidDate = !isNaN(d.getTime());
                        const jam = isValidDate
                          ? d.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }).replace(".", ":")
                          : "00:00";

                        const curahHujan = parseFloat(data.curah_hujan) || 0;
                        const hujanBadge =
                          curahHujan === 0
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
