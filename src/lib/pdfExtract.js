import * as pdfjsLib from 'pdfjs-dist'

// Worker PDF.js — nécessaire pour le parsing
// Wrapped in try/catch car import.meta.url peut échouer dans l'environnement de test
try {
  pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
    'pdfjs-dist/build/pdf.worker.mjs',
    import.meta.url
  ).toString()
} catch {
  // Environnement de test (Vitest/Node) — le worker n'est pas nécessaire
}

/**
 * Charge un fichier PDF et retourne le document PDF.js
 * @param {File} file
 * @returns {Promise<PDFDocumentProxy>}
 */
export async function loadPdf(file) {
  const arrayBuffer = await file.arrayBuffer()
  return pdfjsLib.getDocument({ data: arrayBuffer }).promise
}

/**
 * Rend une page PDF en data URL PNG
 * @param {PDFPageProxy} page
 * @param {number} scale - résolution (1.5 = bonne qualité)
 * @returns {Promise<string>} data URL
 */
export async function pageToImageDataUrl(page, scale = 1.5) {
  const viewport = page.getViewport({ scale })
  const canvas = document.createElement('canvas')
  canvas.width = viewport.width
  canvas.height = viewport.height
  const ctx = canvas.getContext('2d')
  await page.render({ canvasContext: ctx, viewport }).promise
  return canvas.toDataURL('image/png')
}

/**
 * Extrait les items texte d'une page et les normalise
 * @param {Array} rawItems - items de page.getTextContent()
 * @param {{ width: number, height: number }} viewport
 * @returns {Array<{ text, x, y, fontSize, width }>}
 */
export function extractTextItems(rawItems, viewport) {
  return rawItems
    .filter((item) => item.str.trim().length > 0)
    .map((item) => {
      const [, , , fontSize, tx, ty] = item.transform
      return {
        text: item.str,
        x: tx / viewport.width,            // normalisé 0-1
        y: (viewport.height - ty) / viewport.height,
        fontSize: Math.abs(fontSize),
        width: item.width / viewport.width,
      }
    })
}

/**
 * Pipeline complet : PDF → tableau de slides
 * @param {File} file
 * @returns {Promise<Array<{ imageDataUrl, textItems, width, height }>>}
 */
export async function extractSlides(file) {
  const pdf = await loadPdf(file)
  const slides = []
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i)
    const viewport = page.getViewport({ scale: 1.5 })
    const [imageDataUrl, textContent] = await Promise.all([
      pageToImageDataUrl(page, 1.5),
      page.getTextContent(),
    ])
    slides.push({
      imageDataUrl,
      textItems: extractTextItems(textContent.items, viewport),
      width: viewport.width,
      height: viewport.height,
    })
  }
  return slides
}
