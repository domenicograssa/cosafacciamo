import PubblicaForm from '@/components/publish/PubblicaForm'
import { getComuni } from '@/lib/queries/geo'
import { getCategorie } from '@/lib/queries/categorie'

export const metadata = {
  title: 'Pubblica il tuo evento — moesco',
  description: 'Pubblica gratuitamente il tuo evento o la tua attività sul portale moesco',
}

export default async function PubblicaPage({
  searchParams,
}: {
  searchParams: Promise<{ tipo?: string }>
}) {
  const [comuni, categorie, params] = await Promise.all([
    getComuni(),
    getCategorie(),
    searchParams,
  ])
  const tipoIniziale = params?.tipo === 'esperienza' ? 'esperienza' : 'evento'
  return <PubblicaForm comuni={comuni} categorie={categorie} tipoIniziale={tipoIniziale} />
}
