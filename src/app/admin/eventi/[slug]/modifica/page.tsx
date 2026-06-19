import { notFound } from 'next/navigation'
import { createAdminClient } from '@/lib/supabase/server'
import FormModificaEvento from '@/components/admin/FormModificaEvento'

export default async function ModificaEventoPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const sb = await createAdminClient()

  const [{ data: evento }, { data: comuniRaw }, { data: categorieRaw }, { data: catEvento }] = await Promise.all([
    sb.from('eventi').select('*').eq('slug', slug).maybeSingle(),
    sb.from('geo_nodi').select('id, nome').eq('tipo', 'comune').order('nome'),
    sb.from('categorie').select('id, nome, icona').eq('attiva', true).order('ordinamento'),
    sb.from('eventi').select('id, eventi_categorie(categoria_id)').eq('slug', slug).maybeSingle(),
  ])

  if (!evento) notFound()

  const comuni = (comuniRaw ?? []) as { id: string; nome: string }[]
  const categorie = (categorieRaw ?? []) as { id: string; nome: string; icona: string | null }[]
  const categorieSelezionate = (
    (catEvento as unknown as { eventi_categorie: { categoria_id: string }[] } | null)
      ?.eventi_categorie ?? []
  ).map((c: { categoria_id: string }) => c.categoria_id)

  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <a href="/admin" className="hover:text-amber-600">Dashboard</a>
        <span>›</span>
        <a href="/admin/eventi" className="hover:text-amber-600">Eventi</a>
        <span>›</span>
        <a href={`/admin/eventi/${slug}`} className="hover:text-amber-600 truncate max-w-[180px]">{evento.titolo}</a>
        <span>›</span>
        <span className="text-gray-900 font-medium">Modifica</span>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h1 className="text-xl font-extrabold text-gray-900 mb-6">Modifica evento</h1>
        <FormModificaEvento
          evento={evento}
          slugEvento={slug}
          comuni={comuni}
          categorie={categorie}
          categorieSelezionate={categorieSelezionate}
        />
      </div>
    </div>
  )
}
