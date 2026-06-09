// src/components/ExportScreen.jsx
import { PROFILES, getProfile } from '../lib/profileConfig.js'
import { generatePptx } from '../lib/pptxGenerate.js'
import { buildHtmlExport, downloadHtml } from '../lib/htmlExport.js'
import { useState } from 'react'

export default function ExportScreen({ adaptedSlides, selectedProfiles, onBack }) {
  const [exporting, setExporting] = useState(null)

  async function handlePptx(profileId) {
    setExporting(profileId)
    try {
      const profile = getProfile(profileId)
      await generatePptx(adaptedSlides[profileId], profile, PROFILES[profileId].label)
    } finally {
      setExporting(null)
    }
  }

  function handleHtml() {
    const profiles = {}
    selectedProfiles.forEach((id) => { profiles[id] = getProfile(id) })
    const html = buildHtmlExport(adaptedSlides, profiles)
    downloadHtml(html)
  }

  return (
    <div className="max-w-xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-800 mb-2">Télécharger les présentations adaptées</h2>
      <p className="text-gray-500 mb-6">
        Chaque profil génère un fichier PPTX éditable dans PowerPoint.
      </p>

      <div className="space-y-3">
        {selectedProfiles.map((profileId) => (
          <div key={profileId} className="flex items-center justify-between p-4 border border-gray-200 rounded-xl bg-white">
            <div>
              <p className="font-semibold text-gray-800">{PROFILES[profileId].label}</p>
              <p className="text-sm text-gray-400">
                {adaptedSlides[profileId]?.length ?? 0} slides
              </p>
            </div>
            <button
              onClick={() => handlePptx(profileId)}
              disabled={exporting === profileId}
              className="px-4 py-2 rounded-lg bg-[#0a9370] text-white text-sm font-medium disabled:opacity-50 hover:bg-teal-800"
            >
              {exporting === profileId ? 'Génération...' : 'PPTX ↓'}
            </button>
          </div>
        ))}

        <div className="flex items-center justify-between p-4 border border-dashed border-gray-300 rounded-xl">
          <div>
            <p className="font-medium text-gray-600">Export HTML</p>
            <p className="text-sm text-gray-400">Tous les profils en onglets, affichable sur TBI</p>
          </div>
          <button
            onClick={handleHtml}
            className="px-4 py-2 rounded-lg border border-gray-300 text-gray-600 text-sm hover:bg-gray-50"
          >
            HTML ↓
          </button>
        </div>
      </div>

      <button onClick={onBack} className="mt-6 w-full py-3 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50">
        ← Modifier le texte
      </button>
    </div>
  )
}
