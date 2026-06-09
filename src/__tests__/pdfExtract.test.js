import { describe, it, expect, vi } from 'vitest'

// Mock pdfjs-dist avant l'import du module pour éviter les erreurs DOMMatrix/canvas
vi.mock('pdfjs-dist', () => ({
  default: {},
  GlobalWorkerOptions: { workerSrc: '' },
  getDocument: vi.fn(),
}))
vi.mock('pdfjs-dist/build/pdf.worker.min.mjs?url', () => ({ default: '' }))

import { extractTextItems, pageToImageDataUrl } from '../lib/pdfExtract.js'

describe('extractTextItems', () => {
  it('convertit les items PDF.js en format normalisé', () => {
    const rawItems = [
      { str: 'Titre', transform: [12, 0, 0, 12, 50, 700], width: 60, height: 14 },
      { str: '', transform: [12, 0, 0, 12, 0, 0], width: 0, height: 0 }, // vide à ignorer
    ]
    const viewport = { width: 800, height: 600 }
    const result = extractTextItems(rawItems, viewport)
    expect(result).toHaveLength(1)
    expect(result[0].text).toBe('Titre')
    expect(result[0]).toHaveProperty('x')
    expect(result[0]).toHaveProperty('y')
    expect(result[0]).toHaveProperty('fontSize')
  })

  it('ignore les items avec texte vide ou whitespace', () => {
    const rawItems = [
      { str: '   ', transform: [12, 0, 0, 12, 50, 700], width: 10, height: 12 },
    ]
    const viewport = { width: 800, height: 600 }
    expect(extractTextItems(rawItems, viewport)).toHaveLength(0)
  })
})

describe('pageToImageDataUrl', () => {
  it('retourne une chaîne data URL', async () => {
    // Mock canvas
    const mockCanvas = {
      width: 0,
      height: 0,
      getContext: vi.fn(() => ({ scale: vi.fn() })),
      toDataURL: vi.fn(() => 'data:image/png;base64,abc'),
    }
    const mockPage = {
      getViewport: vi.fn(() => ({ width: 800, height: 600, scale: 1 })),
      render: vi.fn(() => ({ promise: Promise.resolve() })),
    }
    vi.stubGlobal('document', { createElement: vi.fn(() => mockCanvas) })
    const result = await pageToImageDataUrl(mockPage, 1.5)
    expect(result).toMatch(/^data:image\/png/)
  })
})
