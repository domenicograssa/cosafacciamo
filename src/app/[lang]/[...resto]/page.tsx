import { notFound } from 'next/navigation'

// Qualunque indirizzo pubblico che non corrisponde a una pagina: mostra la
// pagina «non trovata» dentro il layout del sito (menu e piè di pagina).
export default function PaginaInesistente() {
  notFound()
}
