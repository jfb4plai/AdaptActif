import { useState, useCallback } from 'react'

export function useAdaptation(rawSlides, selectedProfiles, advancedOptions = {}) {
  const [adaptedSlides, setAdaptedSlides] = useState({})
  const [progress, setProgress] = useState({ current: 0, total: 0, step: '' })
  const [adapting, setAdapting] = useState(false)
  const [error, setError] = useState(null)

  const runAdaptation = useCallback(async () => {
    setAdapting(true)
    setError(null)
    const total = rawSlides.length * (1 + selectedProfiles.length)
    setProgress({ current: 0, total, step: 'Suppression du texte des images...' })

    try {
      // Step 1: remove-bg for each slide
      const cleanSlides = []
      for (let i = 0; i < rawSlides.length; i++) {
        setProgress({ current: i, total, step: `Slide ${i + 1}/${rawSlides.length} — nettoyage image...` })
        const res = await fetch('/api/remove-bg', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ imageDataUrl: rawSlides[i].imageDataUrl }),
        })
        if (!res.ok) {
          // Fallback silencieux si l'API échoue (ex: image trop grande)
          cleanSlides.push({ ...rawSlides[i], cleanImageDataUrl: rawSlides[i].imageDataUrl })
          continue
        }
        let data
        try { data = await res.json() } catch {
          cleanSlides.push({ ...rawSlides[i], cleanImageDataUrl: rawSlides[i].imageDataUrl })
          continue
        }
        cleanSlides.push({
          ...rawSlides[i],
          cleanImageDataUrl: data.imageDataUrl ?? rawSlides[i].imageDataUrl,
          // Texte extrait par Gemini Vision — prioritaire sur PDF.js (NotebookLM n'a pas de couche texte)
          extractedText: data.extractedText ?? null,
        })
      }

      // Step 2: adapt-text for each profile × slide
      const result = {}
      let done = rawSlides.length

      for (const profileId of selectedProfiles) {
        result[profileId] = []
        for (let i = 0; i < cleanSlides.length; i++) {
          setProgress({
            current: done,
            total,
            step: `Profil ${profileId.toUpperCase()} — slide ${i + 1}/${cleanSlides.length}...`,
          })
          // Priorité : texte extrait par Gemini Vision > texte PDF.js (souvent vide sur NotebookLM)
          const pdfText = cleanSlides[i].textItems.map((t) => t.text).join('\n')
          const originalText = cleanSlides[i].extractedText || pdfText
          // Profil "direct" : aucune reformulation IA, texte original conservé
          if (profileId === 'direct') {
            result[profileId].push({
              cleanImageDataUrl: cleanSlides[i].cleanImageDataUrl,
              adaptedText: originalText,
              originalText,
            })
            done++
            continue
          }
          const res = await fetch('/api/adapt-text', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text: originalText, profileId }),
          })
          let data = {}
          try { data = await res.json() } catch { /* fallback to original */ }
          result[profileId].push({
            cleanImageDataUrl: cleanSlides[i].cleanImageDataUrl,
            adaptedText: data.adapted ?? originalText,
            originalText,
          })
          done++
        }
      }

      setAdaptedSlides(result)
    } catch (err) {
      setError(err.message)
    } finally {
      setAdapting(false)
    }
  }, [rawSlides, selectedProfiles])

  const updateSlideText = useCallback((profileId, slideIndex, newText) => {
    setAdaptedSlides((prev) => {
      const updated = { ...prev }
      updated[profileId] = [...prev[profileId]]
      updated[profileId][slideIndex] = { ...updated[profileId][slideIndex], adaptedText: newText }
      return updated
    })
  }, [])

  return { adaptedSlides, progress, adapting, error, runAdaptation, updateSlideText }
}
