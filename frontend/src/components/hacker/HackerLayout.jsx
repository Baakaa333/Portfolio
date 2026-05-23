import { useState, useCallback, useRef, useEffect } from 'react'
import CLIMode from './CLIMode'
import PacketCapture from './PacketCapture'
import SystemHealthPane from './SystemHealthPane'

// ── Box-drawing pane label ──────────────────────────────────────────────────
const PaneBar = ({ left, title, right, borderColor = '#330000' }) => (
  <div style={{
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: '0.6875rem',
    color: borderColor,
    display: 'flex',
    alignItems: 'center',
    whiteSpace: 'pre',
    flexShrink: 0,
    lineHeight: 1,
  }}>
    <span>{left}</span>
    {title && (
      <>
        <span style={{ color: '#661111', padding: '0 0.375rem' }}>{title}</span>
      </>
    )}
    <span style={{ flex: 1 }}>{right}</span>
  </div>
)

// ── Vertical border column ──────────────────────────────────────────────────
const VBorder = () => (
  <div style={{
    width: '1ch',
    background: '#000',
    color: '#330000',
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: '0.6875rem',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    overflow: 'hidden',
    flexShrink: 0,
    userSelect: 'none',
    lineHeight: 1.3,
  }}>
    {Array.from({ length: 200 }).map((_, i) => <span key={i}>│</span>)}
  </div>
)

export default function HackerLayout({ onExit }) {
  const [isRoot, setIsRoot] = useState(false)
  const [pane3Height, setPane3Height] = useState(38) // % of total height

  // ── Global sudo su listener (passed down via prop) ──────────────────────
  const [typedBuf, setTypedBuf] = useState('')
  const bufRef = useRef('')
  const TARGET = 'sudo su'

  useEffect(() => {
    const onKey = (e) => {
      if (isRoot) return
      const tag = document.activeElement?.tagName
      // allow typing in the cli input
      if (tag === 'INPUT' || tag === 'TEXTAREA') {
        // still track — CLIMode handles its own sudo su
        return
      }
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
      if (bufRef.current === TARGET) {
        setTimeout(() => setIsRoot(true), 300)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [isRoot])

  // ── Top row dimensions ───────────────────────────────────────────────────
  const topH = `${100 - pane3Height}%`
  const botH = `${pane3Height}%`

  const topBarTitle = isRoot
    ? '[ root@security-core — PRIVILEGED SHELL ]'
    : '[ baakaa@security-core — INTERACTIVE SHELL ]'

  return (
    <div style={{
      position: 'fixed', inset: 0,
      background: '#000',
      fontFamily: "'JetBrains Mono', monospace",
      display: 'flex', flexDirection: 'column',
      overflow: 'hidden',
      color: '#ff0000',
    }}>

      {/* ══ OUTER TOP BORDER ════════════════════════════════════════════════ */}
      <div style={{ flexShrink: 0, color: '#330000', fontSize: '0.6875rem', lineHeight: 1, whiteSpace: 'pre', display: 'flex', alignItems: 'center' }}>
        {'┌'}
        <span style={{ color: '#550000' }}>{'─'.repeat(8)}</span>
        <span style={{ color: '#880000', padding: '0 0.25rem' }}>[ baakaa OS v2.026 — 🧅 baakaa777xr3p4qzm9y2kwd81c3.onion ]</span>
        <span style={{ color: '#550000', flex: 1 }}>{'─'.repeat(40)}</span>
        <span style={{ color: '#440000', paddingRight: '0.5rem' }}>
          {isRoot ? '[ ⚡ ROOT ]' : '[ user ]'}
        </span>
        <button
          onClick={onExit}
          style={{ background: 'none', border: '1px solid #330000', color: '#550000', fontFamily: 'inherit', fontSize: '0.6rem', cursor: 'pointer', padding: '0 0.375rem', lineHeight: 1.6 }}
        >[exit]</button>
        {'┐'}
      </div>

      {/* ══ TOP ROW (Pane 1 + Pane 2) ═══════════════════════════════════════ */}
      <div style={{ display: 'flex', height: topH, overflow: 'hidden', flexShrink: 0 }}>

        {/* ── Left border ─────────────────────────────────────────────────── */}
        <div style={{ flexShrink: 0, color: '#330000', fontSize: '0.6875rem', display: 'flex', flexDirection: 'column', alignItems: 'center', overflow: 'hidden' }}>
          {Array.from({ length: 200 }).map((_, i) => <div key={i} style={{ lineHeight: 1.3 }}>│</div>)}
        </div>

        {/* ── PANE 1: TOR GATEWAY / SYSTEM HEALTH (30%) ───────────────────── */}
        <div style={{ width: '30%', display: 'flex', flexDirection: 'column', overflow: 'hidden', flexShrink: 0 }}>
          {/* Pane 1 top bar */}
          <div style={{ flexShrink: 0, fontSize: '0.6rem', color: '#441111', display: 'flex', alignItems: 'center', borderBottom: '1px solid #1a0000', padding: '0.125rem 0.5rem', whiteSpace: 'nowrap', background: '#020000' }}>
            <span style={{ color: '#550000' }}>┌─</span>
            <span style={{ color: '#7c3aed', padding: '0 0.25rem' }}>[ TOR GATEWAY ]</span>
            <span style={{ flex: 1, color: '#1a0000' }}>{'─'.repeat(20)}</span>
            <span style={{ color: '#330000' }}>[ pane:1 ]─┐</span>
          </div>
          {/* Pane 1 content */}
          <div style={{ flex: 1, overflow: 'hidden', padding: '0.25rem 0.375rem' }}>
            <SystemHealthPane />
          </div>
        </div>

        {/* ── Vertical divider ─────────────────────────────────────────────── */}
        <div style={{ flexShrink: 0, color: '#330000', fontSize: '0.6875rem', display: 'flex', flexDirection: 'column', overflow: 'hidden', userSelect: 'none' }}>
          <div style={{ color: '#441111', lineHeight: 1 }}>┼</div>
          {Array.from({ length: 200 }).map((_, i) => <div key={i} style={{ lineHeight: 1.3 }}>│</div>)}
        </div>

        {/* ── PANE 2: INTERACTIVE CLI (70%) ────────────────────────────────── */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          {/* Pane 2 top bar */}
          <div style={{ flexShrink: 0, fontSize: '0.6rem', color: '#441111', display: 'flex', alignItems: 'center', borderBottom: '1px solid #1a0000', padding: '0.125rem 0.5rem', background: '#020000', whiteSpace: 'nowrap' }}>
            <span style={{ color: '#550000' }}>┌─</span>
            <span style={{ color: isRoot ? '#ff0033' : '#cc2222', padding: '0 0.25rem' }}>{topBarTitle}</span>
            <span style={{ flex: 1, color: '#1a0000' }}>{'─'.repeat(10)}</span>
            <span style={{ color: '#330000' }}>[ pane:2 ]─┐</span>
          </div>

          {/* Sudo su guide block — always visible in pane header */}
          <div style={{ flexShrink: 0, borderBottom: '1px solid #1a0000', padding: '0.5rem 1rem 0.375rem', background: '#000', fontFamily: "'JetBrains Mono',monospace", fontSize: '0.7rem' }}>
            <div style={{ color: '#441111' }}>$ system --scan</div>
            <div style={{ color: '#882222' }}>Hidden mode detected.</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <span style={{ color: '#ff2222', animation: 'blink 0.85s step-end infinite' }}>●</span>
              <span style={{ color: '#cc0000', fontWeight: 700, letterSpacing: '0.04em' }}>ROOT ACCESS AVAILABLE</span>
            </div>
            <div style={{ color: '#550000', marginTop: '0.25rem', letterSpacing: '0.1em', fontSize: '0.625rem' }}>UNLOCK SEQUENCE:</div>

            {/* Live sudo su fill-in */}
            <div style={{ marginTop: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '1rem', fontWeight: 700, letterSpacing: '0.12em' }}>
              <span style={{ color: '#440000' }}>$</span>
              <span style={{ color: isRoot ? '#00ff41' : '#ff0000', textShadow: isRoot ? '0 0 12px rgba(0,255,65,0.5)' : '0 0 16px rgba(255,0,0,0.7)' }}>
                {isRoot ? 'sudo su' : (
                  <>
                    <span style={{ color: '#00ff41' }}>{typedBuf}</span>
                    <span style={{ color: '#550000' }}>{TARGET.slice(typedBuf.length)}</span>
                  </>
                )}
              </span>
              {!isRoot && (
                <span style={{ color: '#ff0000', animation: 'blink 0.9s step-end infinite' }}>█</span>
              )}
              {isRoot && <span style={{ color: '#00ff41', fontSize: '0.75rem' }}> ✓ ESCALATED</span>}
            </div>
            <div style={{ color: '#330000', fontSize: '0.6rem', marginTop: '0.25rem' }}>
              Type anywhere on the page. No button. No click. Just type.
            </div>
          </div>

          {/* CLI shell */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <CLIMode
              onSwitchView={() => {}}
              onExit={onExit}
              isRoot={isRoot}
              onRootEscalation={() => setIsRoot(true)}
            />
          </div>
        </div>

        {/* ── Right border ─────────────────────────────────────────────────── */}
        <div style={{ flexShrink: 0, color: '#330000', fontSize: '0.6875rem', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          {Array.from({ length: 200 }).map((_, i) => <div key={i} style={{ lineHeight: 1.3 }}>│</div>)}
        </div>
      </div>

      {/* ══ MIDDLE DIVIDER (Pane 2/3 separator) ═════════════════════════════ */}
      <div style={{ flexShrink: 0, color: '#330000', fontSize: '0.6875rem', lineHeight: 1, whiteSpace: 'pre', display: 'flex', alignItems: 'center' }}>
        {'├'}
        <span style={{ color: '#1a0000' }}>{'─'.repeat(8)}</span>
        <span style={{ color: '#4b1082', padding: '0 0.25rem' }}>[ PACKET CAPTURE — eth0 LIVE ]</span>
        <span style={{ color: '#1a0000', flex: 1 }}>{'─'.repeat(10)}</span>
        <span style={{ color: '#06b6d4', padding: '0 0.25rem' }}>FLUTTER</span>
        <span style={{ color: '#1a0000' }}>─</span>
        <span style={{ color: '#ff0033', padding: '0 0.25rem' }}>SEC</span>
        <span style={{ color: '#1a0000' }}>─</span>
        <span style={{ color: '#10b981', padding: '0 0.25rem' }}>AI_ML</span>
        <span style={{ color: '#1a0000' }}>─</span>
        <span style={{ color: '#f59e0b', padding: '0 0.25rem' }}>CMS</span>
        <span style={{ color: '#1a0000' }}>{'─'.repeat(8)}</span>
        {'┤'}
      </div>

      {/* ══ PANE 3: PACKET CAPTURE (bottom) ═════════════════════════════════ */}
      <div style={{ height: botH, display: 'flex', overflow: 'hidden', flexShrink: 0 }}>
        <div style={{ flexShrink: 0, color: '#330000', fontSize: '0.6875rem', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          {Array.from({ length: 200 }).map((_, i) => <div key={i} style={{ lineHeight: 1.3 }}>│</div>)}
        </div>
        <div style={{ flex: 1, overflow: 'hidden', position: 'relative' }}>
          <PacketCapture />
        </div>
        <div style={{ flexShrink: 0, color: '#330000', fontSize: '0.6875rem', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          {Array.from({ length: 200 }).map((_, i) => <div key={i} style={{ lineHeight: 1.3 }}>│</div>)}
        </div>
      </div>

      {/* ══ OUTER BOTTOM BORDER ═════════════════════════════════════════════ */}
      <div style={{ flexShrink: 0, color: '#330000', fontSize: '0.6875rem', lineHeight: 1, whiteSpace: 'pre', display: 'flex', alignItems: 'center' }}>
        {'└'}
        <span style={{ color: '#1a0000' }}>{'─'.repeat(10)}</span>
        <span style={{ color: '#441111', padding: '0 0.25rem' }}>[ baakaa portfolio | prajwalch75@gmail.com | github.com/Baakaa333 ]</span>
        <span style={{ color: '#1a0000', flex: 1 }}>{'─'.repeat(20)}</span>
        <span style={{ color: '#330000', padding: '0 0.25rem' }}>[ PID:2026 | TTY:pts/0 ]</span>
        {'┘'}
      </div>
    </div>
  )
}
