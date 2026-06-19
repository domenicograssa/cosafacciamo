import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import CookieBanner from "@/components/ui/CookieBanner";
import { LanguageProvider } from "@/lib/i18n/LanguageContext";
import FooterClient from "@/components/layout/FooterClient";

export const metadata: Metadata = {
  title: "moesco — Scopri eventi e attività vicino a te",
  description: "Eventi, esperienze e attività ad Alcamo, Castellammare del Golfo, San Vito Lo Capo e dintorni.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="it" className="h-full">
      <body className="min-h-full flex flex-col bg-gray-50">
        <LanguageProvider>
          <Navbar />
          <main className="flex-1">{children}</main>
          <FooterClient />
          <CookieBanner />
        </LanguageProvider>
      </body>
    </html>
  );
}
