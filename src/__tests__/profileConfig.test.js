import { describe, it, expect } from 'vitest'
import { getProfile, PROFILES } from '../lib/profileConfig.js'

describe('profileConfig', () => {
  it('retourne les trois profils disponibles', () => {
    expect(Object.keys(PROFILES)).toEqual(['dys', 'tdah', 'falc'])
  })

  it('profil DYS : police Arial, interligne 1.5', () => {
    const p = getProfile('dys')
    expect(p.font.name).toBe('Arial')
    expect(p.lineSpacing).toBe(1.5)
    expect(p.align).toBe('left')
  })

  it('profil TDAH : max 3 bullets, contraste élevé', () => {
    const p = getProfile('tdah')
    expect(p.maxBullets).toBe(3)
    expect(p.highContrast).toBe(true)
  })

  it('profil FALC : Arial 14pt, fond blanc, modèle Sonnet', () => {
    const p = getProfile('falc')
    expect(p.font.size).toBe(14)
    expect(p.bgColor).toBe('FFFFFF')
    expect(p.claudeModel).toBe('claude-sonnet-4-6')
  })

  it('profil inconnu lève une erreur', () => {
    expect(() => getProfile('xyz')).toThrow('Profil inconnu : xyz')
  })

  it('getProfile avec overrides fusionne correctement', () => {
    const p = getProfile('dys', { font: { size: 20 } })
    expect(p.font.size).toBe(20)
    expect(p.font.name).toBe('Arial')
  })
})
