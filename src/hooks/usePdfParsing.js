import { useState, useCallback } from 'react'
import { extractSlides } from '../lib/pdfExtract.js'

export function usePdfParsing() {
  const [slides, setSlides] = useState([])
  const [parsing, setParsing] = useState(false)
  const [error, setError] = useState(null)

  const parsePdf = useCallback(async (file) => {
    setParsing(true)
    setError(null)
    try {
      const extracted = await extractSlides(file)
      setSlides(extracted)
    } catch (err) {
      setError(err.message)
    } finally {
      setParsing(false)
    }
  }, [])

  return { slides, parsing, error, parsePdf }
}
