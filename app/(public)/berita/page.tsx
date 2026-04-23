import type { Metadata } from "next";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import BeritaContent from "@/components/berita/BeritaContent";

export const metadata: Metadata = {
  title: "Warta Siaga Jember - Berita & Informasi Terkini | Jember Siaga",
  description:
    "Dapatkan informasi terkini seputar bencana, cuaca, dan kebencanaan di Kabupaten Jember. Berita terupdate dari sumber terpercaya.",
};

export default function BeritaPage() {
  return (
    <>
      <Navbar />
      <main className="flex-1 pt-[88px]">
        <BeritaContent />
      </main>
      <Footer />
    </>
  );
}
