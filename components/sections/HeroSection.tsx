import { weatherStatus } from "@/data/dummyData";
import { WiDaySunny, WiCloud } from "react-icons/wi";
import { HiShieldCheck } from "react-icons/hi2";

export default function HeroSection() {
  return (
    <section className="pt-36 pb-8" style={{ backgroundColor: '#F3F8FF' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-2 gap-6 items-center">
          {/* Left: Status Card */}
          <div className="relative bg-gradient-to-br from-accent to-accent-dark rounded-2xl p-8 overflow-hidden">
            {/* Background decorations */}
            <div className="absolute top-4 right-4 opacity-20">
              <WiCloud className="text-primary text-[100px]" />
            </div>
            <div className="absolute bottom-2 left-8 opacity-15">
              <WiDaySunny className="text-yellow-500 text-[60px]" />
            </div>

            {/* Content */}
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                  <HiShieldCheck className="text-green-600 text-2xl" />
                </div>
                <div>
                  <h2 className="text-3xl font-extrabold text-green-600 tracking-tight">
                    {weatherStatus.status} !
                  </h2>
                </div>
              </div>
              <p className="text-primary font-semibold text-sm mb-2 bg-white/60 inline-block px-3 py-1 rounded-full">
                {weatherStatus.message}
              </p>
              {/* Weather illustration */}
              <div className="mt-6 flex items-center justify-center">
                <div className="relative">
                  <WiDaySunny className="text-yellow-400 text-[80px] animate-pulse" />
                  <WiCloud className="text-slate-300 text-[60px] absolute -top-2 left-10" />
                </div>
              </div>
            </div>
          </div>

          {/* Right: Description */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm text-secondary font-medium">
              <span className="w-2 h-2 bg-secondary rounded-full animate-pulse" />
              {weatherStatus.date}
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-primary leading-tight">
              Informasi Cuaca dan{" "}
              <span className="text-secondary">Kebencanaan</span> Kabupaten
              Jember
            </h1>
            <p className="text-slate-600 leading-relaxed text-[15px]">
              {weatherStatus.description}
            </p>
            <div className="flex flex-wrap gap-3 pt-2">
              <div className="flex items-center gap-2 bg-green-50 text-green-700 px-4 py-2 rounded-full text-sm font-medium">
                <span className="w-2 h-2 bg-green-500 rounded-full" />
                Status: Aman
              </div>
              <div className="flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-full text-sm font-medium">
                <WiDaySunny className="text-lg" />
                Suhu Rata-rata: 29°C
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
