import { useState, useCallback, useRef, useEffect } from 'react'
import CLIMode from './CLIMode'
import PacketCapture from './PacketCapture'
import GlobeCanvas from './GlobeCanvas'
import LiveTerminalStream from './LiveTerminalStream'
import TerminalSidebar from './TerminalSidebar'
import MatrixRain from './MatrixRain'
import { useAudio } from '../../hooks/useAudio'

// ── Uptime counter ────────────────────────────────────────────────────────────
function useUptime() {
  const [s, setS] = useState(0)
  useEffect(() => {
    const id = setInterval(() => setS(t => t + 1), 1000)
    return () => clearInterval(id)
  }, [])
  const h = String(Math.floor(s / 3600)).padStart(2, '0')
  const m = String(Math.floor((s % 3600) / 60)).padStart(2, '0')
  const sec = String(s % 60).padStart(2, '0')
  return `${h}:${m}:${sec}`
}

// ── Thin section divider ──────────────────────────────────────────────────────
const HLine = ({ color = '#0e1e1a', label, labelColor = '#1a5540' }) => (
  <div style={{
    flexShrink: 0, display: 'flex', alignItems: 'center',
    fontFamily: "'JetBrains Mono',monospace", fontSize: '0.6rem',
    color, lineHeight: 1, whiteSpace: 'pre', userSelect: 'none',
  }}>
    <span>├</span>
    <span style={{ color }}>{`─`.repeat(4)}</span>
    {label && <span style={{ color: labelColor, padding: '0 0.375rem' }}>{label}</span>}
    <span style={{ flex: 1, color }}>{`─`.repeat(60)}</span>
    <span>┤</span>
  </div>
)

// ── Pane header bar ───────────────────────────────────────────────────────────
const PaneBar = ({ title, right, accent = '#1a5540' }) => (
  <div style={{
    flexShrink: 0, display: 'flex', alignItems: 'center',
    padding: '0.15rem 0.5rem', borderBottom: '1px solid #0a1e18',
    background: '#020808', fontFamily: "'JetBrains Mono',monospace",
    fontSize: '0.6rem', gap: '0.5rem', whiteSpace: 'nowrap',
  }}>
    <span style={{ color: '#0e2a22' }}>┌─</span>
    <span style={{ color: accent }}>{title}</span>
    <span style={{ flex: 1, color: '#081410' }}>{'─'.repeat(20)}</span>
    {right && <span style={{ color: '#0e2a22' }}>{right}</span>}
    <span style={{ color: '#0e2a22' }}>─┐</span>
  </div>
)

// ── View mode toggle button ───────────────────────────────────────────────────
const VMBtn = ({ active, onClick, children }) => (
  <button onClick={onClick} style={{
    fontFamily: "'JetBrains Mono',monospace", fontSize: '0.55rem',
    background: active ? 'rgba(0,255,200,0.08)' : 'transparent',
    border: `1px solid ${active ? 'rgba(0,255,200,0.35)' : '#0e2a22'}`,
    borderRadius: 3, padding: '0.15rem 0.5rem',
    color: active ? '#00ffe0' : '#1a5040',
    cursor: 'pointer', transition: 'all 150ms',
  }}>{children}</button>
)

// ── VIEW MODES ────────────────────────────────────────────────────────────────
// 'globe'  — GlobeCanvas (top 45%) + LiveTerminalStream (bottom 55%)
// 'stream' — Full-height LiveTerminalStream
// 'legacy' — Original SystemHealthPane layout

export default function HackerLayout({ onExit }) {
  const [isRoot,   setIsRoot]   = useState(false)
  const [viewMode, setViewMode] = useState('globe')
  const [targeted, setTargeted] = useState(null)
  const uptime = useUptime()
  const { audioEnabled, toggleAudio, playClick } = useAudio()

  // sudo su key-listener (outside CLI input)
  const [typedBuf, setTypedBuf] = useState('')
  const bufRef = useRef('')
  const TARGET = 'sudo su'

  useEffect(() => {
    const onKey = (e) => {
      if (isRoot) return
      const tag = document.activeElement?.tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA') return
      const ch = e.key
      if (ch.length !== 1) return
      bufRef.current += ch
      if (TARGET.startsWith(bufRef.current)) {
        setTypedBuf(bufRef.current)
      } else {
        bufRef.current = ch
        setTypedBuf(TARGET.startsWith(ch) ? ch : '')
      }
      if (bufRef.current.length > TARGET.length) {
        bufRef.current = bufRef.current.slice(-TARGET.length)
        setTypedBuf(TARGET.startsWith(bufRef.current) ? bufRef.current : '')
      }
      if (bufRef.current === TARGET) setTimeout(() => setIsRoot(true), 300)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [isRoot])

  const handleNodeClick = useCallback((node) => {
    setTargeted(n => n === node.id ? null : node.id)
  }, [])

  // ── Left pane content based on viewMode ──────────────────────────────────
  const LeftContent = () => {
    if (viewMode === 'stream') {
      return (
        <div style={{ flex: 1, overflow: 'hidden', position: 'relative' }}>
          <MatrixRain />
          <div style={{ position: 'relative', zIndex: 1, height: '100%' }}>
            <LiveTerminalStream />
          </div>
        </div>
      )
    }
    // 'globe' mode — globe top, stream bottom
    return (
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Globe */}
        <div style={{ height: '42%', flexShrink: 0, position: 'relative', borderBottom: '1px solid #0a1e18' }}>
          <GlobeCanvas targetedNode={targeted} onNodeClick={handleNodeClick} />
        </div>
        {/* Live stream below globe */}
        <div style={{ flex: 1, overflow: 'hidden', position: 'relative' }}>
          <MatrixRain />
          <div style={{ position: 'relative', zIndex: 1, height: '100%' }}>
            <LiveTerminalStream />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div style={{
      position: 'fixed', inset: 0,
      background: '#000',
      fontFamily: "'JetBrains Mono', monospace",
      display: 'flex', flexDirection: 'column',
      overflow: 'hidden',
      color: '#00ffe0',
    }}>
      {/* CRT flicker sweep — horizontal glow bar drifts top→bottom every 7s */}
      <div className="flicker-sweep" />

      {/* ══ OUTER TOP BORDER ══════════════════════════════════════════════════ */}
      <div style={{
        flexShrink: 0, color: '#0a1e18', fontSize: '0.6rem',
        lineHeight: 1, whiteSpace: 'pre', display: 'flex', alignItems: 'center',
        fontFamily: "'JetBrains Mono',monospace",
      }}>
        <span>┌</span>
        <span style={{ color: '#0e2a22' }}>{'─'.repeat(6)}</span>
        <span style={{ color: '#00ffe0', padding: '0 0.35rem', textShadow: '0 0 10px #00ffe088' }}>
          [ baakaa OS v2.026 — 🧅 baakaa777xr3p4qzm9y2kwd81c3.onion ]
        </span>
        <span style={{ flex: 1, color: '#0a1e18' }}>{'─'.repeat(30)}</span>
        <button onClick={onExit} style={{
          background: 'none', border: '1px solid #0e2a22', color: '#1a5040',
          fontFamily: 'inherit', fontSize: '0.55rem', cursor: 'pointer',
          padding: '0 0.375rem', lineHeight: 1.6, marginRight: '0.25rem',
          transition: 'all 150ms',
        }}
          onMouseEnter={e => { e.target.style.borderColor='#ff4444'; e.target.style.color='#ff4444' }}
          onMouseLeave={e => { e.target.style.borderColor='#0e2a22'; e.target.style.color='#1a5040' }}
        >[exit]</button>
        <span>┐</span>
      </div>

      {/* ══ STICKY SESSION HEADER ═════════════════════════════════════════════ */}
      <div style={{
        flexShrink: 0,
        display: 'flex', alignItems: 'center', gap: '0.75rem',
        padding: '0.25rem 0.75rem',
        background: '#020c0a',
        borderBottom: '1px solid #0a1e18',
        fontFamily: "'JetBrains Mono',monospace",
        fontSize: '0.6rem',
        flexWrap: 'wrap',
      }}>
        {/* Session info */}
        <span style={{ color: '#1a5040' }}>SESSION:</span>
        <span style={{ color: isRoot ? '#ff4444' : '#00ffe0', textShadow: '0 0 6px currentColor' }}>
          {isRoot ? 'root@node-7' : 'ghost@node-7'}
        </span>
        <span style={{ color: '#0a1e18' }}>│</span>
        <span style={{ color: '#1a5040' }}>UPTIME:</span>
        <span style={{ color: '#22d3ee' }}>{uptime}</span>
        <span style={{ color: '#0a1e18' }}>│</span>
        <span style={{ color: '#1a5040' }}>CONN:</span>
        <span style={{ color: '#00ff41', textShadow: '0 0 6px #00ff4155' }}>ENCRYPTED</span>
        <span style={{ color: '#0a1e18' }}>│</span>
        {isRoot && (
          <>
            <span style={{ color: '#ff2222', textShadow: '0 0 8px #ff0000', animation: 'blink 0.8s step-end infinite' }}>
              ⚡ ROOT
            </span>
            <span style={{ color: '#0a1e18' }}>│</span>
          </>
        )}

        {/* View mode toggles */}
        <div style={{ display: 'flex', gap: '0.25rem', marginLeft: 'auto' }}>
          <VMBtn active={viewMode==='globe'}  onClick={()=>setViewMode('globe')}>GLOBE</VMBtn>
          <VMBtn active={viewMode==='stream'} onClick={()=>setViewMode('stream')}>STREAM</VMBtn>
        </div>

        {/* Audio toggle */}
        <button onClick={toggleAudio} style={{
          fontFamily: 'inherit', fontSize: '0.55rem',
          background: audioEnabled ? 'rgba(0,255,65,0.06)' : 'transparent',
          border: `1px solid ${audioEnabled ? 'rgba(0,255,65,0.25)' : '#0e2a22'}`,
          borderRadius: 3, padding: '0.15rem 0.5rem',
          color: audioEnabled ? '#00ff41' : '#1a5040',
          cursor: 'pointer', transition: 'all 150ms',
        }}>
          {audioEnabled ? '🔊 SFX' : '🔇 SFX'}
        </button>
      </div>

      {/* ══ TOP ROW: LEFT (Globe+Stream) + RIGHT (CLI + Sidebar) ══════════════ */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden', minHeight: 0 }}>

        {/* ── LEFT BORDER ─────────────────────────────────────────────────── */}
        <div style={{ flexShrink: 0, color: '#0a1e18', fontSize: '0.6rem', display: 'flex', flexDirection: 'column', userSelect: 'none' }}>
          {Array.from({ length: 200 }).map((_, i) => <div key={i} style={{ lineHeight: 1.3 }}>│</div>)}
        </div>

        {/* ── LEFT PANE (60%) ──────────────────────────────────────────────── */}
        <div style={{ width: '60%', display: 'flex', flexDirection: 'column', overflow: 'hidden', flexShrink: 0 }}>
          <PaneBar
            title={viewMode === 'stream' ? '[ LIVE INTEL STREAM — ghost@node-7 ]' : '[ GLOBE + LIVE STREAM ]'}
            right={`[ pane:L ]`}
            accent="#00ffe0"
          />
          <LeftContent />
        </div>

        {/* ── VERTICAL DIVIDER ─────────────────────────────────────────────── */}
        <div style={{ flexShrink: 0, color: '#0a1e18', fontSize: '0.6rem', display: 'flex', flexDirection: 'column', userSelect: 'none' }}>
          <div style={{ color: '#0e2a22', lineHeight: 1 }}>┼</div>
          {Array.from({ length: 200 }).map((_, i) => <div key={i} style={{ lineHeight: 1.3 }}>│</div>)}
        </div>

        {/* ── RIGHT PANE (40%) ─────────────────────────────────────────────── */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

          {/* Right pane top: CLI shell */}
          <div style={{ height: '62%', flexShrink: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden', borderBottom: '1px solid #0a1e18' }}>
            <PaneBar
              title={isRoot ? '[ root@security-core — PRIVILEGED SHELL ]' : '[ baakaa@security-core — INTERACTIVE SHELL ]'}
              right="[ pane:R ]"
              accent={isRoot ? '#ff4444' : '#22d3ee'}
            />

            {/* sudo su unlock hint */}
            <div style={{
              flexShrink: 0, borderBottom: '1px solid #0a1e18',
              padding: '0.375rem 0.75rem 0.3rem',
              background: '#000', fontSize: '0.6rem',
            }}>
              <div style={{ color: '#0e2a22' }}>$ system --scan</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginTop: '0.15rem' }}>
                <span style={{ color: '#ff2222', animation: 'blink 0.85s step-end infinite' }}>●</span>
                <span style={{ color: '#cc0000', fontWeight: 700, letterSpacing: '0.04em' }}>
                  ROOT ACCESS AVAILABLE
                </span>
              </div>
              <div style={{ marginTop: '0.2rem', display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.9rem', fontWeight: 700, letterSpacing: '0.1em' }}>
                <span style={{ color: '#330000' }}>$</span>
                <span style={{ color: isRoot ? '#00ff41' : '#ff0000', textShadow: isRoot ? '0 0 12px rgba(0,255,65,0.5)' : '0 0 14px rgba(255,0,0,0.6)' }}>
                  {isRoot ? 'sudo su' : (
                    <>
                      <span style={{ color: '#00ff41' }}>{typedBuf}</span>
                      <span style={{ color: '#440000' }}>{TARGET.slice(typedBuf.length)}</span>
                    </>
                  )}
                </span>
                {!isRoot && <span style={{ color: '#ff0000', animation: 'blink 0.9s step-end infinite' }}>█</span>}
                {isRoot && <span style={{ color: '#00ff41', fontSize: '0.7rem' }}> ✓ ESCALATED</span>}
              </div>
              <div style={{ color: '#1a0000', fontSize: '0.55rem', marginTop: '0.15rem' }}>
                Type anywhere · no click · just type.
              </div>
            </div>

            {/* CLI */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
              <CLIMode
                onSwitchView={() => setViewMode('stream')}
                onExit={onExit}
                isRoot={isRoot}
                onRootEscalation={() => setIsRoot(true)}
                playClick={playClick}
              />
            </div>
          </div>

          {/* Right pane bottom: sidebar metrics */}
          <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            <PaneBar title="[ SYS METRICS — LIVE ]" right="[ pane:S ]" accent="#8b5cf6" />
            <div style={{ flex: 1, overflow: 'hidden' }}>
              <TerminalSidebar />
            </div>
          </div>
        </div>

        {/* ── RIGHT BORDER ─────────────────────────────────────────────────── */}
        <div style={{ flexShrink: 0, color: '#0a1e18', fontSize: '0.6rem', display: 'flex', flexDirection: 'column', userSelect: 'none' }}>
          {Array.from({ length: 200 }).map((_, i) => <div key={i} style={{ lineHeight: 1.3 }}>│</div>)}
        </div>
      </div>

      {/* ══ PACKET CAPTURE SEPARATOR ══════════════════════════════════════════ */}
      <HLine
        label="[ PACKET CAPTURE — eth0 LIVE ]"
        labelColor="#7c3aed"
        color="#0a1e18"
      />

      {/* ══ PACKET CAPTURE PANE ═══════════════════════════════════════════════ */}
      <div style={{ height: '30%', display: 'flex', overflow: 'hidden', flexShrink: 0 }}>
        <div style={{ flexShrink: 0, color: '#0a1e18', fontSize: '0.6rem', display: 'flex', flexDirection: 'column', userSelect: 'none' }}>
          {Array.from({ length: 200 }).map((_, i) => <div key={i} style={{ lineHeight: 1.3 }}>│</div>)}
        </div>
        <div style={{ flex: 1, overflow: 'hidden', position: 'relative' }}>
          <PacketCapture />
        </div>
        <div style={{ flexShrink: 0, color: '#0a1e18', fontSize: '0.6rem', display: 'flex', flexDirection: 'column', userSelect: 'none' }}>
          {Array.from({ length: 200 }).map((_, i) => <div key={i} style={{ lineHeight: 1.3 }}>│</div>)}
        </div>
      </div>

      {/* ══ OUTER BOTTOM BORDER ═══════════════════════════════════════════════ */}
      <div style={{
        flexShrink: 0, color: '#0a1e18', fontSize: '0.6rem',
        lineHeight: 1, whiteSpace: 'pre', display: 'flex', alignItems: 'center',
        fontFamily: "'JetBrains Mono',monospace",
      }}>
        <span>└</span>
        <span>{'─'.repeat(8)}</span>
        <span style={{ color: '#1a5040', padding: '0 0.25rem' }}>
          [ baakaa | prajwalch75@gmail.com | github.com/Baakaa333 ]
        </span>
        <span style={{ flex: 1 }}>{'─'.repeat(20)}</span>
        <span style={{ color: '#1a5040', padding: '0 0.25rem' }}>[ PID:2026 | TTY:pts/0 ]</span>
        <span>┘</span>
      </div>
    </div>
  )
}
