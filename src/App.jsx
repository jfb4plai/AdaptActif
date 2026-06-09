import { useState } from 'react'
import UploadScreen from './components/UploadScreen.jsx'
import ProfileScreen from './components/ProfileScreen.jsx'
import PreviewScreen from './components/PreviewScreen.jsx'
import ExportScreen from './components/ExportScreen.jsx'
import { usePdfParsing } from './hooks/usePdfParsing.js'
import { useAdaptation } from './hooks/useAdaptation.js'

export default function App() {
  const [screen, setScreen] = useState('upload')
  const [geminiKey, setGeminiKey] = useState(() => localStorage.getItem('gemini_key') ?? '')
  const [selectedProfiles, setSelectedProfiles] = useState(['dys'])
  const [advancedOptions, setAdvancedOptions] = useState({})

  const { slides: rawSlides, parsing, error: parseError, parsePdf } = usePdfParsing()
  const {
    adaptedSlides, progress, adapting, error: adaptError,
    runAdaptation, updateSlideText,
  } = useAdaptation(rawSlides, selectedProfiles, advancedOptions)

  function handleGeminiKey(key) {
    setGeminiKey(key)
    localStorage.setItem('gemini_key', key)
  }

  async function handleStartAdaptation() {
    setScreen('preview')
    await runAdaptation(geminiKey)
  }

  return (
    <div className="min-h-screen bg-gray-50 font-inter">
      <header className="bg-white shadow-sm px-6 py-3 flex items-center gap-3">
        <img src="/plai-logo.jpg" alt="PLAI" className="h-8" />
        <h1 className="text-xl font-semibold text-[#0a9370]">AdaptActif</h1>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8">
        {screen === 'upload' && (
          <UploadScreen
            geminiKey={geminiKey}
            onGeminiKey={handleGeminiKey}
            onFileParsed={parsePdf}
            parsing={parsing}
            slideCount={rawSlides.length}
            error={parseError}
            onNext={() => setScreen('profile')}
          />
        )}
        {screen === 'profile' && (
          <ProfileScreen
            selectedProfiles={selectedProfiles}
            onProfileChange={setSelectedProfiles}
            advancedOptions={advancedOptions}
            onAdvancedChange={setAdvancedOptions}
            onBack={() => setScreen('upload')}
            onNext={handleStartAdaptation}
          />
        )}
        {screen === 'preview' && (
          <PreviewScreen
            adaptedSlides={adaptedSlides}
            selectedProfiles={selectedProfiles}
            progress={progress}
            adapting={adapting}
            error={adaptError}
            onSlideTextChange={updateSlideText}
            onNext={() => setScreen('export')}
            onBack={() => setScreen('profile')}
          />
        )}
        {screen === 'export' && (
          <ExportScreen
            adaptedSlides={adaptedSlides}
            selectedProfiles={selectedProfiles}
            onBack={() => setScreen('preview')}
          />
        )}
      </main>
    </div>
  )
}
