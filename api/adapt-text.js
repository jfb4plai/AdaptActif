import Anthropic from '@anthropic-ai/sdk'

const MODELS = {
  dys: 'claude-haiku-4-5-20251001',
  tdah: 'claude-haiku-4-5-20251001',
  falc: 'claude-sonnet-4-6',
}

const PROMPTS = {
  dys: `Tu adaptes un texte de présentation pour des apprenants dyslexiques (FWB).
Règles :
- Phrases courtes (max 15 mots)
- Une idée par bullet point
- Supprime le jargon et les mots rares
- Garde le sens original
- Retourne uniquement le texte reformulé, sans introduction ni commentaire
- Format : liste de bullet points séparés par des sauts de ligne`,

  tdah: `Tu adaptes un texte de présentation pour des apprenants avec TDAH (FWB).
Règles :
- Maximum 3 points essentiels par slide
- Supprime toutes les informations secondaires
- Mets en gras les mots-clés en les entourant de **astérisques**
- Phrases très courtes, percutantes
- Un message principal par slide
- Retourne uniquement les bullet points (max 3), sans introduction ni commentaire
- Format : liste de bullet points séparés par des sauts de ligne`,

  falc: `Tu traduis un texte de présentation en FALC (Facile À Lire et à Comprendre) pour des apprenants avec déficience cognitive légère (contexte FWB).

RÈGLES ABSOLUES :
1. Phrases maximum 12 mots (compter chaque mot)
2. Ne JAMAIS utiliser de pronoms de reprise : toujours répéter le nom complet (jamais "il", "elle", "l'", "les" renvoyant à un nom)
3. Une seule idée par phrase
4. Structures obligatoires :
   - Définition : "C'est quand on..."
   - Conséquence : "Comme ça..."
   - Action obligatoire : "Il faut..."
   - But : "C'est pour..."
5. Vocabulaire simple, du quotidien, sans jargon
6. Pas d'emojis
7. Présent simple (pas de conditionnel ni subjonctif)
8. Listes à puces pour les énumérations
9. Pas de négations complexes

Retourne uniquement le texte reformulé, sans introduction ni commentaire.
Format : texte adapté avec bullet points si nécessaire, séparés par des sauts de ligne.`,
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  // textBlocks : array de { text, box_2d, font_size_pt, ... }
  // text : fallback texte simple (rétrocompatibilité)
  const { text, textBlocks, profileId } = req.body
  if ((!text && !textBlocks) || !profileId) {
    return res.status(400).json({ error: 'text/textBlocks et profileId requis' })
  }
  if (!PROMPTS[profileId]) {
    return res.status(400).json({ error: `Profil inconnu : ${profileId}` })
  }

  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    return res.status(500).json({ error: 'ANTHROPIC_API_KEY non configurée' })
  }

  try {
    const client = new Anthropic({ apiKey })

    // Mode blocs : adapter chaque bloc séparément en préservant l'index
    if (textBlocks && textBlocks.length > 0) {
      const numbered = textBlocks
        .map((b, i) => `[${i}] ${b.text}`)
        .join('\n---\n')

      const message = await client.messages.create({
        model: MODELS[profileId],
        max_tokens: 2048,
        messages: [{
          role: 'user',
          content: `${PROMPTS[profileId]}

Tu dois adapter CHAQUE bloc de texte numéroté ci-dessous.
Retourne EXACTEMENT le même nombre de blocs, dans le même ordre, au format JSON :
[{"index": 0, "text": "..."}, {"index": 1, "text": "..."}, ...]
Ne fusionne pas les blocs. Ne saute pas de bloc.

Blocs à adapter :
${numbered}`,
        }],
      })

      let adaptedBlocks
      try {
        const raw = message.content[0].text.trim()
        const jsonMatch = raw.match(/\[[\s\S]*\]/)
        adaptedBlocks = JSON.parse(jsonMatch ? jsonMatch[0] : raw)
      } catch {
        // Fallback : retourner les blocs originaux
        adaptedBlocks = textBlocks.map((b, i) => ({ index: i, text: b.text }))
      }

      return res.status(200).json({ adaptedBlocks })
    }

    // Mode texte simple (fallback / profil direct)
    const message = await client.messages.create({
      model: MODELS[profileId],
      max_tokens: 1024,
      messages: [{
        role: 'user',
        content: `${PROMPTS[profileId]}\n\nTexte à adapter :\n${text}`,
      }],
    })

    const adapted = message.content[0].text.trim()
    return res.status(200).json({ adapted })
  } catch (err) {
    console.error('adapt-text error:', err.message)
    return res.status(500).json({ error: err.message })
  }
}
