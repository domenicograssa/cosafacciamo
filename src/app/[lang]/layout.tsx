import type { Metadata, Viewport } from "next";
import ShellSito, { metadataSito } from "@/components/layout/ShellSito";
import { langDaParams } from "@/lib/i18n/getLang";

// Layout radice delle pagine pubbliche. La lingua è il segmento [lang]:
// il middleware riscrive /eventi in /it/eventi (l'indirizzo visibile resta
// /eventi) e serve /en/eventi così com'è. Vedi ShellSito per il perché.

// Le due lingue vengono generate in anticipo. Altri valori non arrivano mai
// qui: il middleware riscrive /fr/x in /it/fr/x, che finisce nel [...resto]
// e dà 404. (Niente dynamicParams = false: varrebbe anche per le schede
// [slug] e bloccherebbe gli eventi pubblicati dopo il deploy.)
export function generateStaticParams() {
  return [{ lang: 'it' }, { lang: 'en' }]
}

type Props = { params: Promise<{ lang: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  return metadataSito(await langDaParams(params))
}

// Colore della barra di sistema quando il sito gira come app installata.
export const viewport: Viewport = {
  themeColor: '#1B2653',
}

export default async function RootLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}>) {
  const lang = await langDaParams(params)
  return <ShellSito lang={lang}>{children}</ShellSito>
}
