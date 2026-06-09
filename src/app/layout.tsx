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
        <footer className="bg-white border-t border-gray-100 py-10 text-sm text-gray-500">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <p className="font-medium text-gray-700">
                <span className="text-amber-500">che facciamo?</span> — Scopri. Partecipa. Vivi il territorio.
              </p>
              <nav className="flex flex-wrap justify-center gap-x-5 gap-y-2">
                <a href="/privacy-policy"        className="hover:text-amber-600 transition-colors">Privacy Policy</a>
                <a href="/cookie-policy"         className="hover:text-amber-600 transition-colors">Cookie Policy</a>
                <a href="/termini-e-condizioni"  className="hover:text-amber-600 transition-colors">Termini e Condizioni</a>
                <a href="/condizioni-organizzatori" className="hover:text-amber-600 transition-colors">Condizioni Organizzatori</a>
                <a href="/contatti"              className="hover:text-amber-600 transition-colors">Contatti</a>
              </nav>
            </div>
            <p className="mt-4 text-xs text-center text-gray-400">
              © 2026 che facciamo? — Gestito da Avv. Domenico Grassa, Foro di Trapani
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
