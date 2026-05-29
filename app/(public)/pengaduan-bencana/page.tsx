import type { Metadata } from "next";
import Image from "next/image";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

export const metadata: Metadata = {
  title: "Pengaduan Bencana | Jember Siaga",
  description:
    "Laporkan kejadian bencana di Kabupaten Jember melalui aplikasi mobile Jember Siaga agar informasi dapat diterima lebih cepat dan akurat.",
};

const mobileScreens = [
  {
    src: "/images/mobile/gambar_1.jpg",
    alt: "Tampilan beranda aplikasi mobile Jember Siaga",
    title: "Beranda Siaga",
    description: "Akses peta bencana, pencarian insiden, cuaca, donasi, laporan warga, dan kontak darurat.",
  },
  {
    src: "/images/mobile/gambar_2.jpg",
    alt: "Tampilan fitur pengaduan bencana di aplikasi mobile Jember Siaga",
    title: "Berita Bencana",
    description: "Ikuti informasi terbaru seperti banjir, longsor, dan cuaca ekstrem di Jember.",
  },
  {
    src: "/images/mobile/gambar_3.jpg",
    alt: "Tampilan formulir laporan bencana di aplikasi mobile Jember Siaga",
    title: "Profil Pengguna",
    description: "Pantau jumlah laporan, laporan terverifikasi, dan poin kontribusi pengguna.",
  },
  {
    src: "/images/mobile/gambar_4.jpg",
    alt: "Tampilan detail laporan bencana di aplikasi mobile Jember Siaga",
    title: "Status Laporan",
    description: "Lihat konfirmasi laporan, progres penanganan, dan estimasi respons BPBD.",
  },
];

export default function PengaduanBencanaPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-white">
        <section className="pt-36 pb-10 bg-gradient-to-b from-slate-50 to-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-2xl md:text-3xl font-bold text-primary leading-tight">
                Pengaduan Bencana
              </h1>
              <p className="text-slate-600 max-w-3xl mx-auto text-[15px] leading-relaxed mt-3">
                Laporkan kejadian bencana di sekitar Anda melalui aplikasi
                mobile Jember Siaga. Kirim informasi lokasi, foto, dan detail
                kejadian agar petugas dapat menerima laporan dengan lebih cepat,
                akurat, dan siap ditindaklanjuti.
              </p>
            </div>
          </div>
        </section>

        <section className="pb-14 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8 items-start">
              {mobileScreens.map((screen, index) => (
                <article
                  key={screen.src}
                  className={`group relative overflow-hidden rounded-[28px] border border-slate-200 bg-slate-100 shadow-theme-lg transition-all duration-300 hover:-translate-y-2 hover:border-secondary/40 hover:shadow-theme-xl focus-within:-translate-y-2 focus-within:border-secondary/40 ${
                    index % 2 === 1 ? "lg:mt-10" : ""
                  }`}
                  tabIndex={0}
                >
                  <Image
                    src={screen.src}
                    alt={screen.alt}
                    width={420}
                    height={900}
                    sizes="(min-width: 1024px) 25vw, 50vw"
                    className="h-auto w-full object-cover transition-transform duration-500 group-hover:scale-[1.025] group-focus:scale-[1.025]"
                    priority={screen.src === "/images/mobile/gambar_1.jpg"}
                  />
                  <div className="absolute inset-x-0 bottom-0 translate-y-3 bg-gradient-to-t from-primary-dark/95 via-primary-dark/75 to-transparent px-4 pb-4 pt-16 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100 group-focus:translate-y-0 group-focus:opacity-100">
                    <h2 className="text-sm font-semibold text-white">
                      {screen.title}
                    </h2>
                    <p className="mt-1 text-xs leading-relaxed text-white/80">
                      {screen.description}
                    </p>
                  </div>
                </article>
              ))}
            </div>

            <div className="mt-12 text-center">
              <p className="text-sm font-semibold text-primary">
                Dapatkan di Play Store dan App Store
              </p>
              <div className="mt-5 flex flex-wrap items-center justify-center gap-3 sm:gap-4">
                <div className="relative block h-[48px] w-[160px] overflow-hidden rounded-lg">
                  <Image
                    src="/images/playstore.png"
                    alt="Dapatkan di Google Play"
                    fill
                    className="object-cover scale-[1.1]"
                  />
                </div>
                <div className="relative block h-[48px] w-[160px] overflow-hidden rounded-lg">
                  <Image
                    src="/images/appstore.png"
                    alt="Unduh di App Store"
                    fill
                    className="object-cover"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
