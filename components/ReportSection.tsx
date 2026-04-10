import { reportSteps } from "@/data/dummyData";
import Link from "next/link";
import { WiRain } from "react-icons/wi";
import { HiOutlineMegaphone } from "react-icons/hi2";

export default function ReportSection() {
  return (
    <section className="py-12 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <h2 className="text-2xl md:text-3xl font-bold text-primary mb-2">
            Cara Melaporkan Bencana
          </h2>
          <p className="text-slate-500 text-sm max-w-2xl mx-auto">
            Laporkan kondisi bencana di sekitar Anda untuk membantu penanganan yang lebih cepat
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 items-center">
          {/* Illustration */}
          <div className="relative bg-gradient-to-br from-accent to-accent-dark rounded-2xl p-8 flex items-center justify-center min-h-[320px] overflow-hidden">
            {/* Decorative elements */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-10 left-10">
                <WiRain className="text-primary text-[80px]" />
              </div>
              <div className="absolute bottom-10 right-10">
                <WiRain className="text-primary text-[60px]" />
              </div>
            </div>

            <div className="relative text-center z-10">
              <div className="w-24 h-24 bg-white/80 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                <HiOutlineMegaphone className="text-secondary text-4xl" />
              </div>
              <h3 className="text-xl font-bold text-primary mb-2">
                Laporkan Bencana
              </h3>
              <p className="text-sm text-slate-600 max-w-xs">
                Setiap laporan Anda sangat berharga untuk membantu proses evakuasi dan penanganan bencana
              </p>
            </div>
          </div>

          {/* Steps */}
          <div className="space-y-1">
            {reportSteps.map((step, idx) => (
              <div key={idx} className="flex items-start gap-4 p-4 rounded-xl hover:bg-slate-50 transition-colors group">
                <div className="w-10 h-10 rounded-full bg-secondary text-white flex items-center justify-center font-bold text-sm flex-shrink-0 group-hover:scale-110 transition-transform shadow-md">
                  {step.step}
                </div>
                <div className="pt-1.5">
                  <p className="text-sm text-slate-700 leading-relaxed">
                    {step.text}
                  </p>
                </div>
              </div>
            ))}

            <div className="pt-4 pl-4">
              <Link
                href="/lapor-bencana"
                className="inline-flex items-center gap-2 bg-gradient-to-r from-secondary to-primary text-white px-8 py-3 rounded-xl font-semibold text-sm hover:shadow-lg hover:opacity-90 transition-all duration-200"
              >
                <HiOutlineMegaphone className="text-lg" />
                Lapor Sekarang
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
