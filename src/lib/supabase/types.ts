// Tipi generati dallo schema del database
// Aggiornare se lo schema cambia

export type TipoGeoNodo = 'regione' | 'provincia' | 'comune' | 'quartiere'
export type StatoEvento  = 'bozza' | 'in_revisione' | 'approvato' | 'rifiutato' | 'sospeso' | 'scaduto'
export type StatoOrg     = 'in_attesa' | 'approvato' | 'sospeso' | 'rifiutato'
export type RuoloAdmin   = 'superadmin' | 'admin' | 'moderatore'
export type TipoAvviso   = 'nuovo_evento' | 'promemoria' | 'modifica_evento' | 'cancellazione_evento' | 'evento_approvato' | 'evento_rifiutato'

export interface Database {
  public: {
    Tables: {
      geo_nodi: {
        Row: {
          id: string
          parent_id: string | null
          tipo: TipoGeoNodo
          nome: string
          slug: string
          path: string
          codice_istat: string | null
          lat: number | null
          lng: number | null
          attivo: boolean
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['geo_nodi']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['geo_nodi']['Insert']>
      }

      categorie: {
        Row: {
          id: string
          nome: string
          slug: string
          icona: string | null
          colore: string | null
          ordinamento: number
          attiva: boolean
        }
        Insert: Omit<Database['public']['Tables']['categorie']['Row'], 'id'>
        Update: Partial<Database['public']['Tables']['categorie']['Insert']>
      }

      organizzatori: {
        Row: {
          id: string
          nome: string
          slug: string
          email: string
          telefono: string | null
          sito_web: string | null
          descrizione: string | null
          logo_url: string | null
          stato: StatoOrg
          note_interne: string | null
          approvato_da: string | null
          approvato_il: string | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['organizzatori']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['organizzatori']['Insert']>
      }

      eventi: {
        Row: {
          id: string
          organizzatore_id: string
          geo_nodo_id: string
          titolo: string
          slug: string
          descrizione: string | null
          descrizione_breve: string | null
          immagine_copertina: string | null
          luogo_nome: string | null
          indirizzo: string | null
          lat: number | null
          lng: number | null
          data_inizio: string
          data_fine: string | null
          tutto_il_giorno: boolean
          gratuito: boolean
          prezzo_min: number | null
          prezzo_max: number | null
          url_biglietti: string | null
          stato: StatoEvento
          note_revisione: string | null
          revisore_id: string | null
          revisionato_il: string | null
          pubblicato_il: string | null
          metadata: Record<string, unknown>
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['eventi']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['eventi']['Insert']>
      }

      eventi_categorie: {
        Row: { evento_id: string; categoria_id: string }
        Insert: Database['public']['Tables']['eventi_categorie']['Row']
        Update: never
      }

      utenti: {
        Row: {
          id: string
          email: string | null
          nome: string | null
          avatar_url: string | null
          provider: string | null
          provider_id: string | null
          notifiche_email: boolean
          notifiche_push: boolean
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['utenti']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['utenti']['Insert']>
      }

      preferiti: {
        Row: { utente_id: string; evento_id: string; created_at: string }
        Insert: Omit<Database['public']['Tables']['preferiti']['Row'], 'created_at'>
        Update: never
      }

      avvisi: {
        Row: {
          id: string
          utente_id: string
          tipo: TipoAvviso
          titolo: string
          messaggio: string | null
          evento_id: string | null
          letto: boolean
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['avvisi']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['avvisi']['Insert']>
      }

      utenti_admin: {
        Row: {
          id: string
          email: string
          nome: string | null
          ruolo: RuoloAdmin
          attivo: boolean
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['utenti_admin']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['utenti_admin']['Insert']>
      }
    }
  }
}

// Tipi con JOIN — usati nelle query con select annidato
export type EventoConRelazioni = Database['public']['Tables']['eventi']['Row'] & {
  geo_nodi: Database['public']['Tables']['geo_nodi']['Row']
  organizzatori: Pick<Database['public']['Tables']['organizzatori']['Row'], 'id' | 'nome' | 'slug' | 'logo_url'>
  categorie: Database['public']['Tables']['categorie']['Row'][]
}

export type AttivitaRow = {
  id: string
  geo_nodo_id: string
  titolo: string
  slug: string
  descrizione_breve: string | null
  descrizione: string | null
  quando: string | null
  target: string | null
  gratuito: boolean
  durata: string | null
  livello: 'facile' | 'medio' | 'esperto' | null
  fonte_url: string | null
  immagine_copertina: string | null
  stato: 'bozza' | 'pubblicato' | 'archiviato'
  metadata: Record<string, unknown>
  created_at: string
  updated_at: string
}

export type AttivitaConRelazioni = AttivitaRow & {
  geo_nodi: Database['public']['Tables']['geo_nodi']['Row']
  categorie: Database['public']['Tables']['categorie']['Row'][]
}
