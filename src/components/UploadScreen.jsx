import { useCallback } from 'react'
import { useDropzone } from 'react-dropzone'

export default function UploadScreen({
  geminiKey, onGeminiKey, onFileParsed, parsing, slideCount, error, onNext,
}) {
  const onDrop = useCallback((accepted) => {
    if (accepted[0]) onFileParsed(accepted[0])
  }, [onFileParsed])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'] },
    multiple: false,
  })

  return (
    <div className="max-w-xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-800 mb-2">Importer une présentation NotebookLM</h2>
      <p className="text-gray-500 mb-6">Exportez votre présentation en PDF depuis NotebookLM, puis déposez-la ici.</p>

      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Clé API Google Gemini
          <span className="text-gray-400 font-normal ml-1">(stockée localement, jamais envoyée à nos serveurs)</span>
        </label>
        <input
          type="password"
          value={geminiKey}
          onChange={(e) => onGeminiKey(e.target.value)}
          placeholder="AIza..."
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0a9370]"
        />
      </div>

      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-colors ${
          isDragActive ? 'border-[#0a9370] bg-teal-50' : 'border-gray-300 hover:border-[#0a9370]'
        }`}
      >
        <input {...getInputProps()} />
        {parsing ? (
          <p className="text-gray-500">Analyse du PDF en cours...</p>
        ) : slideCount > 0 ? (
          <p className="text-[#0a9370] font-medium">{slideCount} slides détectées</p>
        ) : (
          <p className="text-gray-400">
            {isDragActive ? 'Déposez le PDF ici' : 'Glissez-déposez un PDF ou cliquez pour sélectionner'}
          </p>
        )}
      </div>

      {error && <p className="mt-3 text-red-600 text-sm">{error}</p>}

      <button
        onClick={onNext}
        disabled={slideCount === 0 || !geminiKey}
        className="mt-6 w-full py-3 rounded-lg bg-[#0a9370] text-white font-semibold disabled:opacity-40 hover:bg-teal-800 transition-colors"
      >
        Choisir les profils →
      </button>
    </div>
  )
}
