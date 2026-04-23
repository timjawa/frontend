import dynamic from "next/dynamic";
import Navbar from "@/components/layout/Navbar";
import HeroSection from "@/components/sections/HeroSection";
import WeatherCards from "@/components/sections/WeatherCards";
import InfoBanner from "@/components/ui/InfoBanner";

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
