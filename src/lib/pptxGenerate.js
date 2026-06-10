// src/lib/pptxGenerate.js — v3 NBLM2PPTX
import PptxGenJS from 'pptxgenjs'

const SLIDE_W = 13.33
const SLIDE_H = 7.5

export function parseAdaptedText(text) {
  return (text ?? '').split('\n').map((l) => l.trim().replace(/^[-•*#]+\s*/, '')).filter(Boolean)
}

/**
 * Parse une ligne avec markdown **bold** en tableau de runs pptxgenjs
 * Ex: "L'**Univers** est grand" → [{text:"L'", bold:false}, {text:"Univers", bold:true}, ...]
 */
function parseMarkdownLine(line) {
  const runs = []
  const parts = line.split(/\*\*/)
  parts.forEach((part, i) => {
    if (part) runs.push({ text: part, options: { bold: i % 2 === 1 } })
  })
  return runs.length ? runs : [{ text: line }]
}

function box2dToInches(box_2d) {
  const [ymin, xmin, ymax, xmax] = box_2d
  return {
    x: (xmin / 1000) * SLIDE_W,
    y: (ymin / 1000) * SLIDE_H,
    w: Math.max(((xmax - xmin) / 1000) * SLIDE_W, 0.5),
    h: Math.max(((ymax - ymin) / 1000) * SLIDE_H, 0.3),
  }
}

export async function generatePptx(slides, profile, profileLabel) {
  const pptx = new PptxGenJS()
  pptx.defineLayout({ name: 'WIDESCREEN', width: SLIDE_W, height: SLIDE_H })
  pptx.layout = 'WIDESCREEN'

  for (const slide of slides) {
    const s = pptx.addSlide()

    // Image pleine slide en fond
    s.addImage({ data: slide.cleanImageDataUrl, x: 0, y: 0, w: SLIDE_W, h: SLIDE_H })

    const hasBlocks = slide.textBlocks?.length > 0

    if (hasBlocks) {
      // Mode NBLM2PPTX : texte adapté aux positions exactes des blocs originaux
      for (const block of slide.textBlocks) {
        if (!block.text?.trim() || !block.box_2d) continue
        const pos = box2dToInches(block.box_2d)
        const color = (block.color ?? profile.textColor ?? '000000').replace('#', '')
        const runs = parseMarkdownLine(block.text)

        // Heuristique police : titre (>20pt) → Georgia, corps → Calibri
        const fontSize = block.font_size_pt ?? 16
        const fontFace = fontSize > 20 ? 'Georgia' : 'Calibri'

        s.addText(runs, {
          ...pos,
          fontFace,
          fontSize,
          color,
          bold: block.font_weight === 'bold',
          italic: block.font_style === 'italic',
          align: block.text_align ?? 'left',
          valign: 'top',
          wrap: true,
          margin: 0,
        })
      }
    } else if (slide.adaptedText?.trim()) {
      // Fallback sans blocs : zone texte sur fond semi-transparent en bas
      s.addShape(pptx.ShapeType.rect, {
        x: 0, y: 4.8, w: SLIDE_W, h: 2.7,
        fill: { color: 'FFFFFF', transparency: 20 },
        line: { color: 'FFFFFF' },
      })
      const lines = parseAdaptedText(slide.adaptedText)
      if (profile.maxBullets) lines.splice(profile.maxBullets)
      s.addText(
        lines.flatMap((l) => [...parseMarkdownLine(l), { text: '\n', options: {} }]),
        {
          x: 0.3, y: 4.9, w: 12.7, h: 2.5,
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
