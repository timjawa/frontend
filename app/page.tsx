import dynamic from "next/dynamic";
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import WeatherCards from "@/components/WeatherCards";
import InfoBanner from "@/components/InfoBanner";

// Lazy load below-the-fold sections for performance
const WeatherTable = dynamic(() => import("@/components/WeatherTable"), {
  loading: () => (
    <div className="py-10 text-center text-slate-400">Memuat data cuaca...</div>
  ),
});
const EarlyWarning = dynamic(() => import("@/components/EarlyWarning"));
const ActionCards = dynamic(() => import("@/components/ActionCards"));
const ReportSection = dynamic(() => import("@/components/ReportSection"));
const NewsSection = dynamic(() => import("@/components/NewsSection"));
const Footer = dynamic(() => import("@/components/Footer"));

export default function Home() {
  return (
    <>
      <Navbar />
      <main className="flex-1">
        <HeroSection />
        <WeatherCards />
        <InfoBanner />
        <WeatherTable />
        <EarlyWarning />
        <ActionCards />
        <ReportSection />
        <NewsSection />
      </main>
      <Footer />
    </>
  );
}
