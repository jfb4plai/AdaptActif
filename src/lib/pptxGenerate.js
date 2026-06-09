// src/lib/pptxGenerate.js
// Layout NBLM2PPTX : fond nettoyé en arrière-plan + blocs texte aux positions exactes
import PptxGenJS from 'pptxgenjs'

const SLIDE_W = 13.33  // inches, 16:9
const SLIDE_H = 7.5

/**
 * Convertit une coordonnée box_2d (0-1000) en inches
 */
function box2dToInches(box_2d) {
  const [ymin, xmin, ymax, xmax] = box_2d
  return {
    x: (xmin / 1000) * SLIDE_W,
    y: (ymin / 1000) * SLIDE_H,
    w: Math.max(((xmax - xmin) / 1000) * SLIDE_W, 0.5),
    h: Math.max(((ymax - ymin) / 1000) * SLIDE_H, 0.3),
  }
}

/**
 * Génère un PPTX avec fond nettoyé + texte adapté aux positions originales
 * @param {Array<{ cleanImageDataUrl, textBlocks, adaptedText }>} slides
 * @param {object} profile
 * @param {string} profileLabel
 */
export async function generatePptx(slides, profile, profileLabel) {
  const pptx = new PptxGenJS()
  pptx.defineLayout({ name: 'WIDESCREEN', width: SLIDE_W, height: SLIDE_H })
  pptx.layout = 'WIDESCREEN'

  for (const slide of slides) {
    const s = pptx.addSlide()

    // Fond nettoyé (sans texte) en pleine slide
    s.addImage({
      data: slide.cleanImageDataUrl,
      x: 0, y: 0,
      w: '100%', h: '100%',
    })

    const hasBlocks = slide.textBlocks && slide.textBlocks.length > 0

    if (hasBlocks) {
      // Mode NBLM2PPTX : chaque bloc à sa position exacte
      for (const block of slide.textBlocks) {
        if (!block.text?.trim() || !block.box_2d) continue
        const pos = box2dToInches(block.box_2d)
        const cleanColor = (block.color ?? profile.textColor ?? '000000').replace('#', '')

        s.addText(block.text, {
          ...pos,
          fontFace: profile.font?.name ?? 'Arial',
          fontSize: block.font_size_pt ?? profile.font?.size ?? 16,
          color: cleanColor,
          bold: block.font_weight === 'bold' || profile.font?.bold,
          italic: block.font_style === 'italic',
          align: block.text_align ?? profile.align ?? 'left',
          valign: 'top',
          wrap: true,
        })
      }
    } else if (slide.adaptedText?.trim()) {
      // Fallback : pas de blocs → zone texte unique sur la moitié inférieure
      const lines = slide.adaptedText.split('\n').filter((l) => l.trim())
      if (profile.maxBullets) lines.splice(profile.maxBullets)
      s.addText(
        lines.map((l) => ({ text: l.replace(/^[-•*#]+\s*/, ''), options: { bullet: true } })),
        {
          x: 0.4, y: 4.0, w: 12.5, h: 3.2,
          fontFace: profile.font?.name ?? 'Arial',
          fontSize: profile.font?.size ?? 16,
          color: profile.textColor ?? '000000',
          align: profile.align ?? 'left',
          wrap: true,
          valign: 'top',
        }
      )
    }
  }

  await pptx.writeFile({ fileName: `AdaptActif_${profileLabel}.pptx` })
}
