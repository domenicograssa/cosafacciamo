import type { Metadata, Viewport } from "next";
import ShellSito, { metadataSito } from "@/components/layout/ShellSito";

// Layout radice dell'area di servizio (admin, area organizzatori, accesso):
// sempre in italiano. Le pagine pubbliche hanno il loro in src/app/[lang].
export const metadata: Metadata = metadataSito('it')

export const viewport: Viewport = {
  themeColor: '#1B2653',
}

export default function LayoutServizio({ children }: { children: React.ReactNode }) {
  return <ShellSito lang="it">{children}</ShellSito>
}
