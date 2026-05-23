import { useState, useCallback, useEffect, useRef } from 'react'
import { Routes, Route } from 'react-router-dom'
import './styles/clean.css'
import './styles/hacker.css'
import CleanLayout from './components/clean/CleanLayout'
import HackerLayout from './components/hacker/HackerLayout'
import GlitchOverlay from './components/shared/GlitchOverlay'
import TorBootSequence from './components/hacker/TorBootSequence'
import BootSequence from './components/hacker/BootSequence'
import Honeypot404 from './components/shared/Honeypot404'

const TARGET = 'sudo su'

// mode: 'clean' | 'glitching' | 'tor' | 'booting' | 'hacker'
export default function App() {
  const [mode, setMode] = useState('clean')
  const [typedSoFar, setTypedSoFar] = useState('')
  const bufferRef = useRef('')

  // Apply body class for global CSS scoping
  useEffect(() => {
    document.body.className = ['hacker', 'booting', 'glitching', 'tor'].includes(mode)
      ? 'hacker-mode'
      : 'clean-mode'
  }, [mode])

  const triggerHacker = useCallback(() => {
    setMode('glitching')
    setTypedSoFar('')
    bufferRef.current = ''
    setTimeout(() => setMode('tor'), 1200)
  }, [])

  const triggerClean = useCallback(() => {
    setMode('clean')
    setTypedSoFar('')
    bufferRef.current = ''
  }, [])

  // Global keystroke listener — tracks 'sudo su' anywhere
  useEffect(() => {
    if (mode !== 'clean') return
    const onKey = (e) => {
      const tag = document.activeElement?.tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA') return
      const ch = e.key
      if (ch.length !== 1) return

      bufferRef.current += ch
      if (TARGET.startsWith(bufferRef.current)) {
        setTypedSoFar(bufferRef.current)
      } else {
        bufferRef.current = ch
        setTypedSoFar(TARGET.startsWith(ch) ? ch : '')
      }
      if (bufferRef.current.length > TARGET.length) {
        bufferRef.current = bufferRef.current.slice(-TARGET.length)
        setTypedSoFar(TARGET.startsWith(bufferRef.current) ? bufferRef.current : '')
      }
      if (bufferRef.current === TARGET) {
        setTimeout(triggerHacker, 300)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [mode, triggerHacker])

  return (
    <Routes>
      <Route path="/admin" element={<Honeypot404 />} />
      <Route path="/.env" element={<Honeypot404 />} />
      <Route path="/wp-admin" element={<Honeypot404 />} />
      <Route path="/config" element={<Honeypot404 />} />

      <Route
        path="*"
        element={
          <div style={{ position: 'relative', width: '100vw', minHeight: '100vh' }}>
            {/* Glitch transition */}
            {mode === 'glitching' && <GlitchOverlay />}

            {/* Tor .onion boot sequence */}
            {mode === 'tor' && (
              <TorBootSequence onComplete={() => setMode('booting')} />
            )}

            {/* baakaa OS BIOS boot */}
            {mode === 'booting' && (
              <BootSequence onComplete={() => setMode('hacker')} />
            )}

            {/* Hacker terminal */}
            {mode === 'hacker' && <HackerLayout onExit={triggerClean} />}

            {/* Clean portfolio — hidden but mounted so no flicker on exit */}
            <div style={{ display: mode === 'clean' ? 'block' : 'none' }}>
              <CleanLayout typedSoFar={typedSoFar} />
            </div>
          </div>
        }
      />
    </Routes>
  )
}
