import PubblicaForm from '@/components/publish/PubblicaForm'
import { getComuni } from '@/lib/queries/geo'
import { getCategorie } from '@/lib/queries/categorie'

export const revalidate = 3600

export const metadata = {
  title: 'Pubblica il tuo evento — che facciamo?',
  description: 'Pubblica gratuitamente il tuo evento sul portale che facciamo?',
}

export default async function PubblicaPage() {
  const [comuni, categorie] = await Promise.all([getComuni(), getCategorie()])
  return <PubblicaForm comuni={comuni} categorie={categorie} />
}
