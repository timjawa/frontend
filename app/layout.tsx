import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";
import "flatpickr/dist/flatpickr.css";
import { SidebarProvider } from "@/context/SidebarContext";
import { ThemeProvider } from "@/context/ThemeContext";
import { AuthProvider } from "@/context/AuthContext";
import ChatbotWrapper from "@/components/ui/chatbot/ChatbotWrapper";

const outfit = Outfit({
  subsets: ["latin"],
});

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
    <html lang="id" className="antialiased" suppressHydrationWarning>
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
      <body className={`${outfit.className} min-h-screen flex flex-col dark:bg-gray-900`} suppressHydrationWarning>
        <ThemeProvider>
          <AuthProvider>
            <SidebarProvider>{children}</SidebarProvider>
            <ChatbotWrapper />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
