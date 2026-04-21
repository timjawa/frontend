import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "FAQ - Jember Siaga",
  description:
    "Pertanyaan yang sering diajukan mengenai layanan pada platform Jember Siaga. Temukan jawaban tentang pelaporan bencana, prediksi cuaca, dan fitur lainnya.",
};

export default function FaqLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
