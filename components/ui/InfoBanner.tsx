import { HiShieldCheck } from "react-icons/hi2";

export default function InfoBanner() {
  return (
    <section className="py-3" style={{ backgroundColor: '#F3F8FF' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-[#F0F7FF] border border-[#D9EAFD] rounded-2xl px-6 py-5 flex items-start gap-4">
          <div className="flex-shrink-0">
            <div className="w-12 h-12 bg-[#DCEBFF] rounded-xl flex items-center justify-center">
              <HiShieldCheck className="text-blue-600 text-2xl" />
            </div>
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-[#1B2E4B] mb-1.5">
              Info Cuaca
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Berdasarkan data BMKG, wilayah Kabupaten Jember diprediksi akan mengalami cuaca cerah berawan pada pagi hari dan berpotensi hujan ringan pada sore hingga malam hari. Masyarakat dihimbau untuk selalu membawa payung dan berhati-hati saat berkendara di musim hujan.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
