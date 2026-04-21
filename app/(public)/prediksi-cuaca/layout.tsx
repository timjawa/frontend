import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Prediksi Cuaca Jember - Jember Siaga",
  description:
    "Prakiraan cuaca seluruh kecamatan di Kabupaten Jember. Data cuaca terkini meliputi suhu, kelembapan, kecepatan angin, dan kondisi cuaca untuk kesiapsiagaan bencana.",
};

export default function PrediksiCuacaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
