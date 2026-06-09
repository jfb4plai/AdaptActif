// src/lib/pptxGenerate.js
import PptxGenJS from 'pptxgenjs'

/**
 * Parse le texte adapté en bullet points
 * @param {string} text
 * @returns {string[]}
 */
export function parseAdaptedText(text) {
  return text
    .split('\n')
    .map((line) => line.trim().replace(/^[-•*]\s*/, ''))
    .filter((line) => line.length > 0)
}

/**
 * Prépare le contenu d'une slide pour pptxgenjs
 * @param {{ cleanImageDataUrl, adaptedText }} slide
 * @param {object} profile - résultat de getProfile()
 * @returns {{ bgImage, bullets }}
 */
export function buildSlideContent(slide, profile) {
  let bullets = parseAdaptedText(slide.adaptedText)
  if (profile.maxBullets) {
    bullets = bullets.slice(0, profile.maxBullets)
  }
  return { bgImage: slide.cleanImageDataUrl, bullets }
}

/**
 * Génère un fichier PPTX pour un profil donné
 * @param {Array<{ cleanImageDataUrl, adaptedText, width, height }>} slides
 * @param {object} profile - résultat de getProfile()
 * @param {string} profileLabel - ex: 'DYS'
 * @returns {Promise<void>} déclenche le téléchargement
 */
export async function generatePptx(slides, profile, profileLabel) {
  const pptx = new PptxGenJS()
  pptx.defineLayout({ name: 'WIDESCREEN', width: 13.33, height: 7.5 })
  pptx.layout = 'WIDESCREEN'

  for (const slide of slides) {
    const { bgImage, bullets } = buildSlideContent(slide, profile)
    const s = pptx.addSlide()

    // Fond image (pleine slide)
    s.addImage({
      data: bgImage,
      x: 0,
      y: 0,
      w: '100%',
      h: '100%',
    })

    // Zone texte adaptée
    const textOptions = {
      x: 0.5,
      y: 1.0,
      w: 12.0,
      h: 5.5,
      fontFace: profile.font.name,
      fontSize: profile.font.size,
      color: profile.textColor,
      align: profile.align,
      lineSpacingMultiple: profile.lineSpacing,
      bullet: true,
      wrap: true,
    }

    if (bullets.length > 0) {
      s.addText(
        bullets.map((b) => ({
          text: b,
          options: { bullet: true },
        })),
        textOptions
      )
    }
  }

  await pptx.writeFile({ fileName: `AdaptActif_${profileLabel}.pptx` })
}
