// src/components/ProfileScreen.jsx — phase 1 : PPTX direct uniquement (moteur NBLM2PPTX)
export default function ProfileScreen({ onBack, onNext }) {
  return (
    <div className="max-w-xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-800 mb-2">Convertir en PPTX</h2>
      <p className="text-gray-500 mb-6">
        Le moteur va extraire chaque slide, effacer le texte de l'image, puis reconstruire un fichier
        PowerPoint avec le texte dans des zones éditables aux positions exactes.
      </p>

      <div className="p-4 border-2 border-[#0a9370] bg-teal-50 rounded-xl">
        <p className="font-semibold text-gray-800">PPTX direct</p>
        <p className="text-sm text-gray-500 mt-1">
          Fond nettoyé (texte effacé par Gemini) · Texte original repositionné dans des zones
          PowerPoint éditables · Aucune adaptation IA
        </p>
      </div>

      <p className="mt-4 text-xs text-gray-400">
        Les profils DYS, TDAH et FALC seront disponibles une fois ce moteur validé.
      </p>

      <div className="flex gap-3 mt-8">
        <button
          onClick={onBack}
          className="flex-1 py-3 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50"
        >
          ← Retour
        </button>
        <button
          onClick={() => onNext(['direct'])}
          className="flex-grow py-3 rounded-lg bg-[#0a9370] text-white font-semibold hover:bg-teal-800"
        >
          Convertir →
        </button>
      </div>
    </div>
  )
}
