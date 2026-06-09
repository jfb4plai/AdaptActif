// src/components/SlidePreview.jsx
export default function SlidePreview({ slide, slideIndex, profileId, onTextChange }) {
  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden bg-white">
      <div className="p-3 bg-gray-50 border-b text-sm text-gray-500 font-medium">
        Slide {slideIndex + 1}
      </div>
      <div className="flex gap-0">
        <div className="w-1/2 p-3 border-r border-gray-100">
          <img
            src={slide.cleanImageDataUrl}
            alt={`Fond slide ${slideIndex + 1}`}
            className="w-full rounded"
          />
        </div>
        <div className="w-1/2 p-3 flex flex-col">
          <p className="text-xs text-gray-400 mb-1">Texte adapté — modifiable avant export</p>
          <textarea
            value={slide.adaptedText}
            onChange={(e) => onTextChange(profileId, slideIndex, e.target.value)}
            className="flex-1 min-h-32 text-sm border border-gray-200 rounded p-2 resize-none focus:outline-none focus:ring-2 focus:ring-[#0a9370]"
            placeholder="Texte adapté..."
          />
        </div>
      </div>
    </div>
  )
}
