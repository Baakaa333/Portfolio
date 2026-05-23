import { useState, useCallback, useRef, useEffect } from 'react'

const STORAGE_KEY = 'baakaa_audio_enabled'

export function useAudio() {
  const [audioEnabled, setAudioEnabled] = useState(() => {
    try { return localStorage.getItem(STORAGE_KEY) !== 'false' }
    catch { return true }
  })

  const ctxRef = useRef(null)

  // Lazily init AudioContext on first user interaction
  const getCtx = useCallback(() => {
    if (!ctxRef.current) {
      ctxRef.current = new (window.AudioContext || window.webkitAudioContext)()
    }
    // Resume if suspended (browser autoplay policy)
    if (ctxRef.current.state === 'suspended') {
      ctxRef.current.resume()
    }
    return ctxRef.current
  }, [])

  const playClick = useCallback(() => {
    if (!audioEnabled) return
    try {
      const ctx = getCtx()
      const now = ctx.currentTime

      // White noise buffer — 30ms
      const bufLen  = Math.ceil(ctx.sampleRate * 0.03)
      const buffer  = ctx.createBuffer(1, bufLen, ctx.sampleRate)
      const data    = buffer.getChannelData(0)
      for (let i = 0; i < bufLen; i++) {
        data[i] = (Math.random() * 2 - 1) * 0.4
      }

      const src  = ctx.createBufferSource()
      src.buffer = buffer

      // High-pass filter so it sounds like a crisp click, not thud
      const hpf       = ctx.createBiquadFilter()
      hpf.type        = 'highpass'
      hpf.frequency.value = 1800

      // Gain envelope — instant attack, fast decay
      const gain = ctx.createGain()
      gain.gain.setValueAtTime(0.18, now)
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.03)

      src.connect(hpf)
      hpf.connect(gain)
      gain.connect(ctx.destination)
      src.start(now)
    } catch {
      // Silently ignore if audio context unavailable
    }
  }, [audioEnabled, getCtx])

  const toggleAudio = useCallback(() => {
    setAudioEnabled(prev => {
      const next = !prev
      try { localStorage.setItem(STORAGE_KEY, String(next)) } catch {}
      return next
    })
  }, [])

  // Cleanup
  useEffect(() => {
    return () => {
      ctxRef.current?.close().catch(() => {})
    }
  }, [])

  return { audioEnabled, toggleAudio, playClick }
}
