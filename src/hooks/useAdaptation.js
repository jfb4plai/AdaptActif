import { useState, useCallback } from 'react'

export function useAdaptation(rawSlides, selectedProfiles) {
  const [adaptedSlides, setAdaptedSlides] = useState({})
  const [progress, setProgress] = useState({ current: 0, total: 0, step: '' })
  const [adapting, setAdapting] = useState(false)
  const [error, setError] = useState(null)

  const runAdaptation = useCallback(async () => {
    setAdapting(true)
    setError(null)
    const total = rawSlides.length * (1 + selectedProfiles.length)
    setProgress({ current: 0, total, step: 'Extraction du texte et nettoyage des images...' })

    try {
      // Étape 1 : remove-bg + OCR en parallèle pour chaque slide (comme NBLM2PPTX)
      const processedSlides = []
      for (let i = 0; i < rawSlides.length; i++) {
        setProgress({
          current: i,
          total,
          step: `Slide ${i + 1}/${rawSlides.length} — extraction texte + nettoyage...`,
        })
        try {
          const res = await fetch('/api/remove-bg', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ imageDataUrl: rawSlides[i].imageDataUrl }),
          })
          const data = res.ok ? await res.json() : {}
          processedSlides.push({
            ...rawSlides[i],
            cleanImageDataUrl: data.imageDataUrl ?? rawSlides[i].imageDataUrl,
            textBlocks: data.textBlocks ?? [],  // blocs avec positions box_2d
          })
        } catch {
          processedSlides.push({
            ...rawSlides[i],
            cleanImageDataUrl: rawSlides[i].imageDataUrl,
            textBlocks: [],
          })
        }
      }

      // Étape 2 : adaptation Claude par profil × slide
      const result = {}
      let done = rawSlides.length

      for (const profileId of selectedProfiles) {
        result[profileId] = []
        for (let i = 0; i < processedSlides.length; i++) {
          setProgress({
            current: done,
            total,
            step: `Profil ${profileId.toUpperCase()} — slide ${i + 1}/${processedSlides.length}...`,
          })

          const slide = processedSlides[i]

          // Profil direct : aucune adaptation IA
          if (profileId === 'direct') {
            result[profileId].push({
              cleanImageDataUrl: slide.cleanImageDataUrl,
              textBlocks: slide.textBlocks,          // blocs originaux
              adaptedText: slide.textBlocks.map((b) => b.text).join('\n'),
            })
            done++
            continue
          }

          // Si pas de blocs OCR : fallback texte PDF.js
          const hasBlocks = slide.textBlocks.length > 0
          const fallbackText = slide.textItems?.map((t) => t.text).join('\n') ?? ''

          let adaptedBlocks = null
          let adaptedText = fallbackText

          try {
            const body = hasBlocks
              ? { textBlocks: slide.textBlocks, profileId }
              : { text: fallbackText || '(slide sans texte)', profileId }

            const res = await fetch('/api/adapt-text', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(body),
            })
            const data = res.ok ? await res.json() : {}

            if (data.adaptedBlocks) {
              adaptedBlocks = data.adaptedBlocks  // [{index, text}]
              adaptedText = data.adaptedBlocks.map((b) => b.text).join('\n')
            } else if (data.adapted) {
              adaptedText = data.adapted
            }
          } catch { /* fallback silencieux */ }

          // Fusionner les positions originales avec le texte adapté
          const mergedBlocks = hasBlocks
            ? slide.textBlocks.map((block, idx) => ({
                ...block,
                text: adaptedBlocks?.[idx]?.text ?? block.text,
              }))
            : []

          result[profileId].push({
            cleanImageDataUrl: slide.cleanImageDataUrl,
            textBlocks: mergedBlocks,
            adaptedText,
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
      updated[profileId][slideIndex] = {
        ...updated[profileId][slideIndex],
        adaptedText: newText,
      }
      return updated
    })
  }, [])

  return { adaptedSlides, progress, adapting, error, runAdaptation, updateSlideText }
}
