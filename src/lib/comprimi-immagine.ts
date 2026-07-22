// Ridimensiona e comprime un'immagine lato client (max 1600px, JPEG) prima
// dell'upload, per non appesantire lo storage e restare sotto il limite del
// server. Stessa logica usata in PubblicaForm.tsx (form pubblico "Proponi
// evento"), duplicata qui per il form della dashboard organizzatori.
export async function comprimiImmagine(file: File, maxLato = 1600, qualita = 0.82): Promise<Blob> {
  const img = await new Promise<HTMLImageElement>((resolve, reject) => {
    const url = URL.createObjectURL(file)
    const el = new window.Image()
    el.onload = () => { URL.revokeObjectURL(url); resolve(el) }
    el.onerror = () => { URL.revokeObjectURL(url); reject(new Error('Immagine non leggibile')) }
    el.src = url
  })
  const scala = Math.min(1, maxLato / Math.max(img.width, img.height))
  const canvas = document.createElement('canvas')
  canvas.width = Math.round(img.width * scala)
  canvas.height = Math.round(img.height * scala)
  canvas.getContext('2d')!.drawImage(img, 0, 0, canvas.width, canvas.height)
  return await new Promise<Blob>((resolve, reject) =>
    canvas.toBlob(b => (b ? resolve(b) : reject(new Error('Compressione fallita'))), 'image/jpeg', qualita)
  )
}
