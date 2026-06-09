// src/components/ProfileScreen.jsx
import { useState } from 'react'
import { PROFILES } from '../lib/profileConfig.js'
import AdvancedOptions from './AdvancedOptions.jsx'

const PROFILE_DESCRIPTIONS = {
  direct: 'Conversion PPTX sans modification — texte original conservé, aucune IA',
  dys: 'Police Arial, interligne 1.5, fond pastel, phrases simplifiées',
  tdah: 'Max 3 points essentiels, mots-clés en gras, mise en page épurée',
  falc: 'FALC strict : phrases ≤ 12 mots, vocabulaire contrôlé, Arial 14pt',
}

export default function ProfileScreen({
  selectedProfiles, onProfileChange, advancedOptions, onAdvancedChange, onBack, onNext,
}) {
  const [showAdvanced, setShowAdvanced] = useState(false)

  function toggleProfile(id) {
    if (selectedProfiles.includes(id)) {
      onProfileChange(selectedProfiles.filter((p) => p !== id))
    } else {
      onProfileChange([...selectedProfiles, id])
    }
  }

  return (
    <div className="max-w-xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-800 mb-2">Choisir les profils</h2>
      <p className="text-gray-500 mb-6">Sélectionne un ou plusieurs profils d'apprenants à générer.</p>

      <div className="space-y-3">
        {Object.entries(PROFILES).map(([id, profile]) => (
          <label
            key={id}
            className={`flex items-start gap-3 p-4 border-2 rounded-xl cursor-pointer transition-colors ${
              selectedProfiles.includes(id)
                ? 'border-[#0a9370] bg-teal-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <input
              type="checkbox"
              checked={selectedProfiles.includes(id)}
              onChange={() => toggleProfile(id)}
              className="mt-1 accent-[#0a9370]"
            />
            <div>
              <p className="font-semibold text-gray-800">{profile.label}</p>
              <p className="text-sm text-gray-500">{PROFILE_DESCRIPTIONS[id]}</p>
            </div>
          </label>
        ))}
      </div>

      <button
        onClick={() => setShowAdvanced((v) => !v)}
        className="mt-4 text-sm text-[#0a9370] underline"
      >
        {showAdvanced ? 'Masquer' : 'Afficher'} les options à la carte
      </button>

      {showAdvanced && (
        <AdvancedOptions
          selectedProfiles={selectedProfiles}
          options={advancedOptions}
          onChange={onAdvancedChange}
        />
      )}

      <div className="flex gap-3 mt-8">
        <button onClick={onBack} className="flex-1 py-3 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50">
          ← Retour
        </button>
        <button
          onClick={onNext}
          disabled={selectedProfiles.length === 0}
          className="flex-2 flex-grow py-3 rounded-lg bg-[#0a9370] text-white font-semibold disabled:opacity-40 hover:bg-teal-800"
        >
          Adapter →
        </button>
      </div>
    </div>
  )
}
