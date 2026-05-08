import dynamic from "next/dynamic";
import Navbar from "@/components/layout/Navbar";
import HeroSection from "@/components/sections/HeroSection";
import WeatherCards from "@/components/sections/WeatherCards";
import InfoBanner from "@/components/ui/InfoBanner";
import { fetchRealtimeWeather, fetchWeatherForecast } from "@/services/weather";

// Lazy load below-the-fold sections for performance
const WeatherTable = dynamic(() => import("@/components/sections/WeatherTable"), {
  loading: () => (
    <div className="py-10 text-center text-slate-400">Memuat data cuaca...</div>
  ),
});
const EarlyWarning = dynamic(() => import("@/components/sections/EarlyWarning"));
const ActionCards = dynamic(() => import("@/components/sections/ActionCards"));
const ReportSection = dynamic(() => import("@/components/sections/ReportSection"));
const NewsSection = dynamic(() => import("@/components/sections/NewsSection"));
const Footer = dynamic(() => import("@/components/layout/Footer"));

export default async function Home() {
  let realtimeData = [];
  let forecastData = {};
  
  try {
    const [realtimeRes, forecastRes] = await Promise.all([
      fetchRealtimeWeather(),
      fetchWeatherForecast()
    ]);
    
    realtimeData = realtimeRes?.data || [];
    forecastData = forecastRes?.data || {};
  } catch (error) {
    console.error("Gagal memuat data cuaca di halaman Home", error);
  }

  return (
    <>
      <Navbar />
      <main className="flex-1" style={{ backgroundColor: '#F3F8FF' }}>
        <HeroSection />
        <WeatherCards data={realtimeData} />
        <InfoBanner />
        <WeatherTable data={forecastData} />
        <EarlyWarning />
        <ActionCards />
        <ReportSection />
        <NewsSection />
      </main>
      <Footer />
    </>
  );
}
