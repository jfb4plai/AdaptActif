import { GoogleGenerativeAI } from '@google/generative-ai'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { imageDataUrl } = req.body
  if (!imageDataUrl) {
    return res.status(400).json({ error: 'imageDataUrl requis' })
  }

  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) {
    return res.status(500).json({ error: 'GEMINI_API_KEY non configurée' })
  }

  // Extraire base64 depuis data URL
  const base64Match = imageDataUrl.match(/^data:image\/(\w+);base64,(.+)$/)
  if (!base64Match) {
    return res.status(400).json({ error: 'Format imageDataUrl invalide' })
  }
  const mimeType = `image/${base64Match[1]}`
  const base64Data = base64Match[2]

  try {
    const genai = new GoogleGenerativeAI(apiKey)
    const model = genai.getGenerativeModel({ model: 'gemini-2.5-flash' })

    const result = await model.generateContent([
      {
        inlineData: { mimeType, data: base64Data },
      },
      `Remove all text from this presentation slide image.
Keep the background, shapes, colors, and visual elements exactly as they are.
Return ONLY the image with text removed, reconstructing the background behind where text was.
The output must be a clean background image without any text, letters, numbers, or labels.`,
    ])

    const response = result.response
    const candidates = response.candidates
    if (!candidates?.[0]?.content?.parts?.[0]?.inlineData) {
      // Gemini ne retourne pas toujours une image — fallback : image originale
      return res.status(200).json({ imageDataUrl, fallback: true })
    }

    const { mimeType: outMime, data: outData } =
      candidates[0].content.parts[0].inlineData
    return res.status(200).json({
      imageDataUrl: `data:${outMime};base64,${outData}`,
      fallback: false,
    })
  } catch (err) {
    console.error('remove-bg error:', err.message)
    // Fallback : retourner l'image originale plutôt que bloquer
    return res.status(200).json({ imageDataUrl, fallback: true, error: err.message })
  }
}
