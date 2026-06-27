import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import CookieBanner from "@/components/ui/CookieBanner";
import { LanguageProvider } from "@/lib/i18n/LanguageContext";
import FooterClient from "@/components/layout/FooterClient";

export const metadata: Metadata = {
  metadataBase: new URL('https://www.moesco.it'),
  title: {
    default: 'Moesco — Eventi, sagre e cose da fare in provincia di Trapani',
    template: '%s | Moesco',
  },
  description: 'Scopri eventi, sagre, concerti, festival, teatro, mercatini e cose da fare in provincia di Trapani.',
  openGraph: {
    siteName: 'Moesco',
    locale: 'it_IT',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
  },
  robots: {
    index: true,
    follow: true,
  },
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
