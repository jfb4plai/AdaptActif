// src/components/AdvancedOptions.jsx
import { PROFILES } from '../lib/profileConfig.js'

// "direct" n'a pas d'options à la carte (pas d'IA)
const OPTIONS = {
  dys: [
    { key: 'reformulate', label: 'Reformulation IA du texte' },
    { key: 'applyFont', label: "Appliquer la police Arial" },
    { key: 'applySpacing', label: "Appliquer l'interligne 1.5" },
    { key: 'applyBg', label: 'Appliquer le fond pastel' },
  ],
  tdah: [
    { key: 'reformulate', label: 'Reformulation IA du texte' },
    { key: 'limitBullets', label: 'Limiter à 3 bullet points' },
    { key: 'boldKeywords', label: 'Mettre les mots-clés en gras' },
    { key: 'applyContrast', label: 'Appliquer le contraste élevé' },
  ],
  falc: [
    { key: 'reformulate', label: 'Reformulation FALC (Sonnet)' },
    { key: 'applyFont', label: 'Appliquer Arial 14pt' },
    { key: 'applySpacing', label: "Appliquer l'interligne variable" },
    { key: 'applyColors', label: 'Appliquer les couleurs FALC' },
  ],
}

const DEFAULT_OPTIONS = {
  reformulate: true, applyFont: true, applySpacing: true, applyBg: true,
  limitBullets: true, boldKeywords: true, applyContrast: true, applyColors: true,
}

export default function AdvancedOptions({ selectedProfiles, options, onChange }) {
  function toggle(profileId, key) {
    const current = options[profileId] ?? DEFAULT_OPTIONS
    onChange({
      ...options,
      [profileId]: { ...current, [key]: !current[key] },
    })
  }

  // Profils qui ont des options configurables (hors "direct")
  const configurableProfiles = selectedProfiles.filter((id) => OPTIONS[id])

  return (
    <div className="mt-4 border border-gray-200 rounded-lg p-4 bg-gray-50">
      <h3 className="font-medium text-gray-700 mb-3">Options à la carte</h3>
      {configurableProfiles.length === 0 && (
        <p className="text-sm text-gray-400 italic">
          Sélectionne au moins un profil DYS, TDAH ou FALC pour accéder aux options.
        </p>
      )}
      {configurableProfiles.map((profileId) => (
        <div key={profileId} className="mb-4">
          <p className="text-sm font-semibold text-[#0a9370] mb-2">{PROFILES[profileId].label}</p>
          <div className="space-y-1">
            {(OPTIONS[profileId] ?? []).map(({ key, label }) => {
              const profileOpts = options[profileId] ?? DEFAULT_OPTIONS
              return (
                <label key={key} className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={profileOpts[key] ?? true}
                    onChange={() => toggle(profileId, key)}
                    className="accent-[#0a9370]"
                  />
                  {label}
                </label>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}
