import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { richiestaAutorizzata } from '@/lib/api-auth'

export const dynamic = 'force-dynamic'

// Utility di servizio: forza la rigenerazione di una o più pagine ISR
// (utile quando i dati vengono aggiornati via SQL diretto su Supabase,
// che non passa dalle server action e quindi non chiama mai revalidatePath).
// Uso consigliato (segreto nell'header, non nell'URL):
//   curl -H "Authorization: Bearer $CRON_SECRET" \
//        "https://www.moesco.it/api/revalidate?path=/eventi/slug-evento"
// Il parametro path può essere ripetuto per invalidare più pagine insieme.
// Resta accettato ?secret=<...> per retrocompatibilità (deprecato).
export async function GET(req: NextRequest) {
  if (!richiestaAutorizzata(req)) {
    return NextResponse.json({ ok: false, errore: 'Non autorizzato.' }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const paths = searchParams.getAll('path')
  if (paths.length === 0) {
    return NextResponse.json({ ok: false, errore: 'Nessun parametro "path" fornito.' }, { status: 400 })
  }

  for (const p of paths) {
    if (!p.startsWith('/')) continue
    revalidatePath(p)
  }

  return NextResponse.json({ ok: true, revalidati: paths })
}
