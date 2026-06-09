// src/lib/profileConfig.js

export const PROFILES = {
  dys: {
    label: 'DYS',
    font: { name: 'Arial', size: 16, bold: false, italic: false },
    lineSpacing: 1.5,
    align: 'left',
    bgColor: 'FFF8E7',      // crème pastel
    textColor: '1A1A1A',
    maxBullets: null,
    highContrast: false,
    boldKeywords: false,
    claudeModel: 'claude-haiku-4-5-20251001',
    claudePrompt: `Tu adaptes un texte de présentation pour des apprenants dyslexiques (FWB).
Règles :
- Phrases courtes (max 15 mots)
- Une idée par bullet point
- Supprime le jargon et les mots rares
- Garde le sens original
- Retourne uniquement le texte reformulé, sans introduction ni commentaire
- Format : liste de bullet points séparés par des sauts de ligne`,
  },

  tdah: {
    label: 'TDAH',
    font: { name: 'Arial', size: 16, bold: false, italic: false },
    lineSpacing: 1.5,
    align: 'left',
    bgColor: 'FFFFFF',
    textColor: '111111',
    maxBullets: 3,
    highContrast: true,
    boldKeywords: true,
    claudeModel: 'claude-haiku-4-5-20251001',
    claudePrompt: `Tu adaptes un texte de présentation pour des apprenants avec TDAH (FWB).
Règles :
- Maximum 3 points essentiels par slide
- Supprime toutes les informations secondaires
- Met en gras les mots-clés en entourant le mot de **astérisques**
- Phrases très courtes, percutantes
- Un message principal par slide
- Retourne uniquement les bullet points (max 3), sans introduction ni commentaire
- Format : liste de bullet points séparés par des sauts de ligne`,
  },

  direct: {
    label: 'PPTX direct',
    font: { name: 'Calibri', size: 18, bold: false, italic: false },
    lineSpacing: 1.15,
    align: 'left',
    bgColor: 'FFFFFF',
    textColor: '000000',
    maxBullets: null,
    highContrast: false,
    boldKeywords: false,
    claudeModel: null,   // pas d'IA — conversion directe
    claudePrompt: null,
  },

  falc: {
    label: 'FALC',
    font: { name: 'Arial', size: 14, bold: false, italic: false },
    titleFont: { name: 'Arial', size: 18, bold: true },
    lineSpacing: 1.5,
    align: 'left',
    bgColor: 'FFFFFF',
    textColor: '000000',
    titleColor: '2E5090',
    maxBullets: null,
    highContrast: false,
    boldKeywords: false,
    claudeModel: 'claude-sonnet-4-6',
    claudePrompt: `Tu traduis un texte de présentation en FALC (Facile À Lire et à Comprendre) pour des apprenants avec déficience cognitive légère (contexte FWB).

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
  },
}

/**
 * @param {string} profileId - 'dys' | 'tdah' | 'falc'
 * @param {object} overrides - propriétés à fusionner (optionnel)
 * @returns {object} profil complet
 */
export function getProfile(profileId, overrides = {}) {
  if (!PROFILES[profileId]) throw new Error(`Profil inconnu : ${profileId}`)
  const base = PROFILES[profileId]
  return {
    ...base,
    ...overrides,
    font: { ...base.font, ...(overrides.font ?? {}) },
  }
}
