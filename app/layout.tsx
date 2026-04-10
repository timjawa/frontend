import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Jember Siaga - Informasi Cuaca & Kebencanaan Kabupaten Jember",
  description:
    "Sistem informasi cuaca dan kebencanaan terpadu untuk wilayah Kabupaten Jember. Dapatkan prakiraan cuaca, peringatan dini, dan laporan bencana secara real-time.",
  keywords:
    "jember siaga, cuaca jember, bencana jember, BMKG, peringatan dini, banjir jember",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className="antialiased">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen flex flex-col">{children}</body>
    </html>
  );
}
