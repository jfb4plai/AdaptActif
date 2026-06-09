// api/remove-bg.js
// Deux appels Gemini en parallèle :
// 1. gemini-2.5-flash-image  → efface le texte, retourne fond propre
// 2. gemini-2.5-flash        → OCR structuré avec positions box_2d

const BASE = 'https://generativelanguage.googleapis.com/v1beta/models'

async function fetchWithRetry(url, options, maxRetries = 4) {
  const delays = [2000, 4000, 8000, 16000]
  for (let i = 0; i < maxRetries; i++) {
    try {
      const res = await fetch(url, options)
      const text = await res.text()
      if (!res.ok) {
        const err = JSON.parse(text)
        if (res.status === 429 && i < maxRetries - 1) {
          await new Promise((r) => setTimeout(r, delays[i]))
          continue
        }
        throw new Error(err.error?.message || `HTTP ${res.status}`)
      }
      return JSON.parse(text)
    } catch (e) {
      if (i === maxRetries - 1) throw e
      await new Promise((r) => setTimeout(r, 2000))
    }
  }
}

async function removeTextFromImage(base64, mimeType, apiKey) {
  const url = `${BASE}/gemini-2.0-flash-exp:generateContent?key=${apiKey}`
  const payload = {
    contents: [{
      parts: [
        { text: 'Remove all text, labels, and numbers from this image while perfectly preserving the background colors, shapes, and visual elements. Return only the cleaned image.' },
        { inlineData: { mimeType, data: base64 } },
      ],
    }],
    generationConfig: { responseModalities: ['IMAGE'] },
  }
  const data = await fetchWithRetry(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  const part = data.candidates?.[0]?.content?.parts?.find((p) => p.inlineData)
  if (!part) throw new Error('Gemini image model did not return an image')
  return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`
}

async function ocrWithPositions(base64, mimeType, apiKey) {
  const url = `${BASE}/gemini-2.5-flash:generateContent?key=${apiKey}`
  const payload = {
    contents: [{
      parts: [
        {
          text: `Analyze this presentation slide image and extract ALL text blocks with their exact positions.
For each text block return:
- text: exact text content (preserve line breaks with \\n)
- box_2d: bounding box [ymin, xmin, ymax, xmax] in 0-1000 coordinate system
- font_size_pt: estimated font size in points
- font_weight: "normal" or "bold"
- font_style: "normal" or "italic"
- text_align: "left", "center", or "right"
- color: hex color WITHOUT # (e.g. "000000")
Return a JSON array only, no explanation.`,
        },
        { inlineData: { mimeType, data: base64 } },
      ],
    }],
    generationConfig: {
      responseMimeType: 'application/json',
      responseSchema: {
        type: 'ARRAY',
        items: {
          type: 'OBJECT',
          properties: {
            text: { type: 'STRING' },
            box_2d: { type: 'ARRAY', items: { type: 'NUMBER' }, minItems: 4, maxItems: 4 },
            font_size_pt: { type: 'NUMBER' },
            font_weight: { type: 'STRING' },
            font_style: { type: 'STRING' },
            text_align: { type: 'STRING' },
            color: { type: 'STRING' },
          },
        },
      },
    },
  }
  const data = await fetchWithRetry(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  const raw = data.candidates?.[0]?.content?.parts?.[0]?.text ?? '[]'
  try { return JSON.parse(raw) } catch { return [] }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { imageDataUrl } = req.body
  if (!imageDataUrl) return res.status(400).json({ error: 'imageDataUrl requis' })

  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) {
    return res.status(200).json({ imageDataUrl, textBlocks: [], fallback: true })
  }

  const match = imageDataUrl.match(/^data:image\/(\w+);base64,(.+)$/)
  if (!match) return res.status(400).json({ error: 'Format imageDataUrl invalide' })
  const mimeType = `image/${match[1]}`
  const base64 = match[2]

  // Deux appels en parallèle comme NBLM2PPTX
  const [bgResult, ocrResult] = await Promise.allSettled([
    removeTextFromImage(base64, mimeType, apiKey),
    ocrWithPositions(base64, mimeType, apiKey),
  ])

  const cleanImageDataUrl = bgResult.status === 'fulfilled'
    ? bgResult.value
    : imageDataUrl  // fallback : image originale

  const textBlocks = ocrResult.status === 'fulfilled'
    ? ocrResult.value
    : []

  return res.status(200).json({
    imageDataUrl: cleanImageDataUrl,
    textBlocks,
    fallback: bgResult.status === 'rejected',
  })
}
