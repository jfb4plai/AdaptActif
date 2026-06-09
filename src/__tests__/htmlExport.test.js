// src/__tests__/htmlExport.test.js
import { describe, it, expect } from 'vitest'
import { buildHtmlExport } from '../lib/htmlExport.js'
import { getProfile } from '../lib/profileConfig.js'

describe('buildHtmlExport', () => {
  it('génère une chaîne HTML valide avec les onglets profils', () => {
    const profileSlides = {
      dys: [
        { cleanImageDataUrl: 'data:image/png;base64,abc', adaptedText: 'Point un\nPoint deux' },
      ],
    }
    const profiles = { dys: getProfile('dys') }
    const html = buildHtmlExport(profileSlides, profiles)
    expect(html).toContain('<!doctype html>')
    expect(html).toContain('DYS')
    expect(html).toContain('Point un')
    expect(html).toContain('data:image/png;base64,abc')
  })

  it('inclut tous les profils fournis', () => {
    const profileSlides = {
      dys: [{ cleanImageDataUrl: 'data:image/png;base64,a', adaptedText: 'A' }],
      tdah: [{ cleanImageDataUrl: 'data:image/png;base64,b', adaptedText: 'B' }],
    }
    const profiles = { dys: getProfile('dys'), tdah: getProfile('tdah') }
    const html = buildHtmlExport(profileSlides, profiles)
    expect(html).toContain('DYS')
    expect(html).toContain('TDAH')
  })
})
