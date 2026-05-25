import Image from "next/image";
import Link from "next/link";

const newReportSteps = [
  {
    title: 'Buka aplikasi JESI, kemudian klik "Lapor".',
    description:
      "Pastikan Anda sudah login dan melengkapi data diri terlebih dahulu sebelum mengirim laporan bencana.",
  },
  {
    title: "Pilih jenis bencana sesuai kondisi di lokasi.",
    description:
      "Pemilihan yang tepat membantu petugas melakukan penanganan dan respons yang lebih cepat.",
  },
  {
    title: "Lengkapi lokasi dan informasi kondisi kejadian.",
    description:
      "Tambahkan lokasi, dokumentasi, dan deskripsi lengkap agar laporan lebih mudah diverifikasi petugas.",
  },
  {
    title: "Periksa kembali laporan anda.",
    description:
      "Tinjau kembali informasi yang telah diisi untuk memastikan laporan akurat sebelum dikirim.",
  },
  {
    title: "Pantau status laporan.",
    description:
      "Lihat perkembangan laporan mulai dari proses verifikasi, peninjauan petugas, hingga penanganan selesai.",
  },
];

export default function ReportSection() {
  return (
    <section className="py-16 md:py-24" style={{ backgroundColor: "#EEF2FF" }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 md:mb-16">
          <h2 className="text-2xl md:text-4xl font-bold text-[#2A4B55] mb-2">
            Cara Melaporkan Bencana
          </h2>
        </div>

        <div className="grid md:grid-cols-2 gap-8 md:gap-16 items-center">
          {/* Illustration Left */}
          <div className="relative w-full aspect-square md:aspect-[4/5] lg:h-[600px] flex justify-center items-center">
            <Image
              src="/icons/lapor_bencana.svg"
              alt="Ilustrasi Lapor Bencana"
              fill
              className="object-contain"
              priority
            />
          </div>

          {/* Steps Right */}
          <div className="flex flex-col justify-center">
            <div className="space-y-6">
              {newReportSteps.map((step, idx) => (
                <div key={idx} className="flex flex-col gap-1.5">
                  <h3 className="text-base font-bold text-slate-800">
                    {step.title}
                  </h3>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    {step.description}
                  </p>
                </div>
              ))}
            </div>

            {/* Store Buttons */}
            <div className="flex flex-wrap items-center gap-4 pt-8">
              <Link href="#" className="hover:opacity-90 transition-opacity block w-[160px] h-[48px] relative overflow-hidden rounded-lg">
                <Image
                  src="/images/playstore.png"
                  alt="Get it on Google Play"
                  fill
                  className="object-cover scale-[1.1]"
                />
              </Link>
              <Link href="#" className="hover:opacity-90 transition-opacity block w-[160px] h-[48px] relative overflow-hidden rounded-lg">
                <Image
                  src="/images/appstore.png"
                  alt="Download on the App Store"
                  fill
                  className="object-cover"
                />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
