// src/lib/htmlExport.js
import { parseAdaptedText } from './pptxGenerate.js'

/**
 * Génère le HTML complet multi-profils
 * @param {Record<string, Array<{cleanImageDataUrl, adaptedText}>>} profileSlides
 * @param {Record<string, object>} profiles - map profileId → profil
 * @returns {string} HTML complet
 */
export function buildHtmlExport(profileSlides, profiles) {
  const profileIds = Object.keys(profileSlides)

  const tabButtons = profileIds
    .map(
      (id, i) =>
        `<button class="tab-btn${i === 0 ? ' active' : ''}" onclick="showTab('${id}')" id="btn-${id}">
          ${profiles[id].label}
        </button>`
    )
    .join('')

  const tabContents = profileIds
    .map(
      (id, i) => `
    <div class="tab-content${i === 0 ? ' active' : ''}" id="tab-${id}">
      ${profileSlides[id]
        .map(
          (slide, si) => `
        <div class="slide">
          <h3>Slide ${si + 1}</h3>
          <img src="${slide.cleanImageDataUrl}" alt="Fond slide ${si + 1}" />
          <ul>
            ${parseAdaptedText(slide.adaptedText)
              .map((b) => `<li>${b}</li>`)
              .join('')}
          </ul>
        </div>`
        )
        .join('')}
    </div>`
    )
    .join('')

  return `<!doctype html>
<html lang="fr">
<head>
  <meta charset="UTF-8" />
  <title>AdaptActif — Export</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background: #f5f5f5; }
    .tabs { display: flex; gap: 8px; margin-bottom: 20px; }
    .tab-btn { padding: 8px 20px; border: none; border-radius: 6px; background: #ddd; cursor: pointer; font-size: 16px; }
    .tab-btn.active { background: #0a9370; color: white; }
    .tab-content { display: none; }
    .tab-content.active { display: block; }
    .slide { background: white; border-radius: 8px; padding: 16px; margin-bottom: 20px; }
    .slide img { max-width: 100%; border-radius: 4px; }
    .slide ul { margin-top: 12px; font-size: 16px; line-height: 1.6; }
  </style>
</head>
<body>
  <h1 style="color:#0a9370">AdaptActif — Présentation adaptée</h1>
  <div class="tabs">${tabButtons}</div>
  ${tabContents}
  <script>
    function showTab(id) {
      document.querySelectorAll('.tab-content').forEach(el => el.classList.remove('active'));
      document.querySelectorAll('.tab-btn').forEach(el => el.classList.remove('active'));
      document.getElementById('tab-' + id).classList.add('active');
      document.getElementById('btn-' + id).classList.add('active');
    }
  </script>
</body>
</html>`
}

/**
 * Déclenche le téléchargement du fichier HTML
 * @param {string} html
 */
export function downloadHtml(html) {
  const blob = new Blob([html], { type: 'text/html;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'AdaptActif_export.html'
  a.click()
  URL.revokeObjectURL(url)
}
