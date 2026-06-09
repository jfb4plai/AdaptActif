// src/components/PreviewScreen.jsx
import { useState } from 'react'
import { PROFILES } from '../lib/profileConfig.js'
import SlidePreview from './SlidePreview.jsx'

export default function PreviewScreen({
  adaptedSlides, selectedProfiles, progress, adapting, error,
  onSlideTextChange, onNext, onBack,
}) {
  const [activeProfile, setActiveProfile] = useState(selectedProfiles[0])

  return (
    <div className="max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-800 mb-2">Prévisualisation et édition</h2>
      <p className="text-gray-500 mb-4">
        Ajoutez vos 20% — modifiez le texte adapté avant l'export.
      </p>

      {adapting && (
        <div className="mb-6 p-4 bg-teal-50 border border-teal-200 rounded-xl">
          <p className="text-sm text-teal-700 mb-2">{progress.step}</p>
          <div className="w-full bg-teal-100 rounded-full h-2">
            <div
              className="bg-[#0a9370] h-2 rounded-full transition-all"
              style={{ width: progress.total > 0 ? `${(progress.current / progress.total) * 100}%` : '0%' }}
            />
          </div>
        </div>
      )}

      {error && <p className="mb-4 text-red-600 text-sm">{error}</p>}

      {!adapting && Object.keys(adaptedSlides).length > 0 && (
        <>
          <div className="flex gap-2 mb-4">
            {selectedProfiles.map((id) => (
              <button
                key={id}
                onClick={() => setActiveProfile(id)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeProfile === id
                    ? 'bg-[#0a9370] text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {PROFILES[id].label}
              </button>
            ))}
          </div>

          <div className="space-y-4">
            {(adaptedSlides[activeProfile] ?? []).map((slide, i) => (
              <SlidePreview
                key={i}
                slide={slide}
                slideIndex={i}
                profileId={activeProfile}
                onTextChange={onSlideTextChange}
              />
            ))}
          </div>
        </>
      )}

      <div className="flex gap-3 mt-8">
        <button onClick={onBack} className="flex-1 py-3 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50">
          ← Retour
        </button>
        <button
          onClick={onNext}
          disabled={adapting || Object.keys(adaptedSlides).length === 0}
          className="flex-grow py-3 rounded-lg bg-[#0a9370] text-white font-semibold disabled:opacity-40 hover:bg-teal-800"
        >
          Exporter →
        </button>
      </div>
    </div>
  )
}
