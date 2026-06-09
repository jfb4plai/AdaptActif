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
    // Sans clé Gemini : retourner image originale + texte vide
    return res.status(200).json({ imageDataUrl, extractedText: '', fallback: true })
  }

  const base64Match = imageDataUrl.match(/^data:image\/(\w+);base64,(.+)$/)
  if (!base64Match) {
    return res.status(400).json({ error: 'Format imageDataUrl invalide' })
  }
  const mimeType = `image/${base64Match[1]}`
  const base64Data = base64Match[2]

  try {
    const genai = new GoogleGenerativeAI(apiKey)
    // gemini-2.5-flash est un modèle texte — il ne peut pas générer d'image nettoyée.
    // On l'utilise uniquement pour extraire le texte visible sur la slide.
    const model = genai.getGenerativeModel({ model: 'gemini-2.5-flash' })

    const result = await model.generateContent([
      { inlineData: { mimeType, data: base64Data } },
      `Extrait tout le texte visible sur cette diapositive de présentation.
Retourne uniquement le texte, sans introduction ni commentaire.
Préserve la structure : titre en premier, puis les points ou paragraphes, séparés par des sauts de ligne.
Si la slide ne contient pas de texte, retourne une chaîne vide.`,
    ])

    const extractedText = result.response.text().trim()

    return res.status(200).json({
      imageDataUrl,          // image originale conservée (pas de remove-bg réel)
      extractedText,
      fallback: false,
    })
  } catch (err) {
    console.error('extract-text (via remove-bg) error:', err.message)
    return res.status(200).json({ imageDataUrl, extractedText: '', fallback: true, error: err.message })
  }
}
