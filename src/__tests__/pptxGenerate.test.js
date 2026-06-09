// src/__tests__/pptxGenerate.test.js
import { describe, it, expect, vi } from 'vitest'
import { parseAdaptedText, buildSlideContent } from '../lib/pptxGenerate.js'
import { getProfile } from '../lib/profileConfig.js'

describe('parseAdaptedText', () => {
  it('découpe le texte en bullet points sur les sauts de ligne', () => {
    const text = 'Point un\nPoint deux\nPoint trois'
    expect(parseAdaptedText(text)).toEqual(['Point un', 'Point deux', 'Point trois'])
  })

  it('supprime les lignes vides', () => {
    const text = 'Point un\n\nPoint deux'
    expect(parseAdaptedText(text)).toEqual(['Point un', 'Point deux'])
  })

  it('supprime les tirets/puces en début de ligne', () => {
    const text = '- Point un\n• Point deux\n* Point trois'
    expect(parseAdaptedText(text)).toEqual(['Point un', 'Point deux', 'Point trois'])
  })
})

describe('buildSlideContent', () => {
  it('retourne un objet avec bgImage et bullets pour DYS', () => {
    const profile = getProfile('dys')
    const slide = {
      cleanImageDataUrl: 'data:image/png;base64,abc',
      adaptedText: 'Phrase courte\nDeuxième point',
    }
    const result = buildSlideContent(slide, profile)
    expect(result.bgImage).toBe('data:image/png;base64,abc')
    expect(result.bullets).toHaveLength(2)
    expect(result.bullets[0]).toBe('Phrase courte')
  })

  it('profil TDAH : limite à maxBullets bullets', () => {
    const profile = getProfile('tdah')
    const slide = {
      cleanImageDataUrl: 'data:image/png;base64,abc',
      adaptedText: 'Un\nDeux\nTrois\nQuatre\nCinq',
    }
    const result = buildSlideContent(slide, profile)
    expect(result.bullets.length).toBeLessThanOrEqual(3)
  })
})
