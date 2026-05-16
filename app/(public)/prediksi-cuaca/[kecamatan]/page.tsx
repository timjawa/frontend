"use client";

import { useState, useRef, use, useEffect } from "react";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import DatePicker from "@/components/ui/DatePicker";
import { allKecamatanNames } from "@/data/prediksiCuacaData";
import { fetchWeatherByDate } from "@/services/weather";
import { WeatherIcon } from "@/utils/weatherIcons";
import { HiArrowTopRightOnSquare } from "react-icons/hi2";
import { HiChevronLeft, HiChevronRight } from "react-icons/hi";
import { WiDaySunny, WiCloud } from "react-icons/wi";

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

  // Carousel scroll
  const carouselRef = useRef<HTMLDivElement>(null);
  const scrollCarousel = (direction: "left" | "right") => {
    if (carouselRef.current) {
      const scrollAmount = 240;
      carouselRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  // Other kecamatan (exclude current)
  const otherKecamatan = allKecamatanNames.filter(
    (k) => k.toLowerCase() !== kecamatanName.toLowerCase()
  );

  return (
    <>
      <Navbar />
      <main className="flex-1">
        {/* Hero */}
        <section className="pt-36 pb-8 bg-gradient-to-b from-slate-50 to-white">
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

            <div className="relative bg-gradient-to-br from-accent to-accent-dark rounded-2xl p-10 sm:p-16 overflow-hidden max-w-3xl mx-auto">
              <div className="absolute top-4 right-4 opacity-20">
                <WiCloud className="text-primary text-[100px]" />
              </div>
              <div className="absolute bottom-2 left-8 opacity-15">
                <WiDaySunny className="text-yellow-500 text-[60px]" />
              </div>

              <div className="relative z-10 flex items-center justify-center">
                <div className="relative">
                  <WiDaySunny className="text-yellow-400 text-[80px] sm:text-[120px] animate-pulse" />
                  <WiCloud className="text-slate-300 text-[60px] sm:text-[80px] absolute -top-2 left-10 sm:left-14" />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Hourly Forecast */}
        <section className="py-10 bg-surface">
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
                />
              </div>
              <span className="text-xs text-slate-400 font-medium">
                Sumber: BMKG
              </span>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-border p-6 overflow-hidden min-h-[170px] relative">
              {isLoading ? (
                <div className="absolute inset-0 flex items-center justify-center text-slate-400">
                  Memuat data cuaca...
                </div>
              ) : weatherData.length === 0 ? (
                <div className="absolute inset-0 flex items-center justify-center text-slate-400">
                  Data tidak tersedia untuk tanggal ini.
                </div>
              ) : (
                <div className="relative">
                  <button
                    onClick={() => scrollCarousel("left")}
                    className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-white border border-border rounded-full flex items-center justify-center shadow-md hover:bg-slate-50 transition-colors"
                    aria-label="Scroll left"
                  >
                    <HiChevronLeft className="text-primary text-xl" />
                  </button>

                  <button
                    onClick={() => scrollCarousel("right")}
                    className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-white border border-border rounded-full flex items-center justify-center shadow-md hover:bg-slate-50 transition-colors"
                    aria-label="Scroll right"
                  >
                    <HiChevronRight className="text-primary text-xl" />
                  </button>

                  <div
                    ref={carouselRef}
                    className="flex gap-4 overflow-x-auto hide-scrollbar px-12 py-2 scroll-smooth"
                  >
                    {weatherData.map((data, idx) => {
                      const timeStr = data.waktu_lokal || data.waktu || "";
                      let hour = "00:00";
                      const timeParts = timeStr.includes('T') ? timeStr.split('T') : timeStr.split(' ');
                      if (timeParts.length > 1) {
                        hour = timeParts[1].substring(0, 5);
                      }
                      const iconType = mapConditionToIcon(data.deskripsi_cuaca);
                      
                      return (
                        <HourlyCard
                          key={idx}
                          jam={`${hour} WIB`}
                          icon={iconType}
                          cuaca={data.deskripsi_cuaca || "-"}
                        />
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Kecamatan Lainnya */}
        <section className="py-10 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-bold text-primary mb-6">
              Kecamatan Lainnya
            </h2>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
              {otherKecamatan.map((kec) => (
                <Link
                  key={kec}
                  href={`/prediksi-cuaca/${encodeURIComponent(kec.toLowerCase())}`}
                  className="flex items-center justify-between gap-2 bg-surface border border-border rounded-xl px-4 py-3 text-sm font-medium text-secondary hover:bg-accent/50 hover:border-secondary/30 transition-all duration-200 group"
                >
                  <span>{kec}</span>
                  <HiArrowTopRightOnSquare className="text-secondary/50 group-hover:text-secondary text-sm flex-shrink-0 transition-colors" />
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

function HourlyCard({ jam, icon, cuaca }: { jam: string, icon: string, cuaca: string }) {
  return (
    <div className="flex-shrink-0 w-[140px] bg-surface border border-border rounded-2xl p-4 flex flex-col items-center gap-2 hover:bg-accent/30 hover:border-secondary/20 transition-all duration-200">
      <span className="text-sm font-bold text-primary">{jam}</span>
      <WeatherIcon type={icon} size={48} />
      <span className="text-xs text-slate-500 font-medium text-center leading-tight">
        {cuaca}
      </span>
    </div>
  );
}
