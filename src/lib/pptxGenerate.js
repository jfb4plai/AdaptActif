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
    .map((line) => line.trim().replace(/^[-•*#]+\s*/, ''))
    .filter((line) => line.length > 0)
}

/**
 * Génère un fichier PPTX pour un profil donné
 * Layout : image originale à gauche (référence), texte adapté éditable à droite
 * @param {Array<{ cleanImageDataUrl, adaptedText }>} slides
 * @param {object} profile - résultat de getProfile()
 * @param {string} profileLabel - ex: 'DYS'
 * @returns {Promise<void>} déclenche le téléchargement
 */
export async function generatePptx(slides, profile, profileLabel) {
  const pptx = new PptxGenJS()
  pptx.defineLayout({ name: 'WIDESCREEN', width: 13.33, height: 7.5 })
  pptx.layout = 'WIDESCREEN'

  for (const slide of slides) {
    let bullets = parseAdaptedText(slide.adaptedText)
    if (profile.maxBullets) {
      bullets = bullets.slice(0, profile.maxBullets)
    }

    const s = pptx.addSlide()

    // Fond de couleur du profil (pas l'image — évite le surtexte illisible)
    s.background = { color: profile.bgColor ?? 'FFFFFF' }

    // Image originale à gauche — référence visuelle, non éditable
    s.addImage({
      data: slide.cleanImageDataUrl,
      x: 0.2,
      y: 0.2,
      w: 5.8,
      h: 7.1,
    })

    // Ligne de séparation verticale
    s.addShape(pptx.ShapeType.line, {
      x: 6.2,
      y: 0.2,
      w: 0,
      h: 7.1,
      line: { color: 'CCCCCC', width: 1 },
    })

    // En-tête profil
    s.addText(profileLabel, {
      x: 6.4,
      y: 0.2,
      w: 6.7,
      h: 0.45,
      fontFace: profile.font?.name ?? 'Arial',
      fontSize: 10,
      color: '0a9370',
      bold: true,
    })

    // Zone texte adapté — éditable dans PowerPoint
    if (bullets.length > 0) {
      s.addText(
        bullets.map((b) => ({ text: b, options: { bullet: true, breakLine: true } })),
        {
          x: 6.4,
          y: 0.75,
          w: 6.7,
          h: 6.5,
          fontFace: profile.font?.name ?? 'Arial',
          fontSize: profile.font?.size ?? 16,
          color: profile.textColor ?? '1A1A1A',
          align: profile.align ?? 'left',
          lineSpacingMultiple: profile.lineSpacing ?? 1.5,
          valign: 'top',
          wrap: true,
        }
      )
    } else {
      // Slide sans texte extrait (image décorative) — zone vide mais éditable
      s.addText('', {
        x: 6.4,
        y: 0.75,
        w: 6.7,
        h: 6.5,
        fontFace: profile.font?.name ?? 'Arial',
        fontSize: profile.font?.size ?? 16,
      })
    }
  }

  await pptx.writeFile({ fileName: `AdaptActif_${profileLabel}.pptx` })
}
