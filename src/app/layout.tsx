import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";

export const metadata: Metadata = {
  title: "Che Facciamo? — Scopri eventi e attività vicino a te",
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
        <Navbar />
        <main className="flex-1">{children}</main>
        <footer className="bg-white border-t border-gray-100 py-8 text-center text-sm text-gray-500">
          © 2026 Che Facciamo? — Scopri. Partecipa. Vivi il territorio.
        </footer>
      </body>
    </html>
  );
}
