import { HiInformationCircle } from "react-icons/hi2";

export default function InfoBanner() {
  return (
    <section className="py-3" style={{ backgroundColor: '#F3F8FF' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-secondary to-primary rounded-xl px-5 py-4 flex items-start gap-3 shadow-md">
          <div className="flex-shrink-0 mt-0.5">
            <HiInformationCircle className="text-white text-xl" />
          </div>
          <p className="text-white text-sm leading-relaxed">
            <span className="font-semibold">Info Cuaca:</span> Berdasarkan data
            BMKG, wilayah Kabupaten Jember diprediksi akan mengalami cuaca cerah
            berawan pada pagi hari dan berpotensi hujan ringan pada sore hingga
            malam hari. Masyarakat dihimbau untuk selalu membawa payung dan
            berhati-hati saat berkendara di musim hujan.
          </p>
        </div>
      </div>
    </section>
  );
}
