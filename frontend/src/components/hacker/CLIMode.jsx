import { useState, useRef, useEffect, useCallback } from 'react'
import { PROFILE } from '../../data/profile'
import axios from 'axios'

const API = 'http://localhost:8000'

const HELP_TEXT = `
╔═══════════════════════════════════════════════════════════╗
║         baakaa terminal — COMMAND REFERENCE               ║
╠═══════════════════════════════════════════════════════════╣
║  whoami         — Identity manifest                      ║
║  about          — Bio and background                     ║
║  skills         — Full capability manifest               ║
║  projects       — Project node registry                  ║
║  labs           — Defense case studies & CTF logs        ║
║  education      — Academic history                       ║
║  contact        — Contact vectors                        ║
║  target <ip>    — Recon a specific project node          ║
║  about system   — How this platform was built            ║
║  sudo su        — Attempt privilege escalation           ║
║  mode --view    — Switch to dashboard view               ║
║  download resume— Exfiltrate CVE advisory                ║
║  clear          — Purge terminal buffer                  ║
║  exit           — Terminate session                      ║
╠═══════════════════════════════════════════════════════════╣
║  ALIASES: ls=projects, edu=education                     ║
╚═══════════════════════════════════════════════════════════╝`

const ROOT_HELP_TEXT = `
╔═══════════════════════════════════════════════════════════╗
║         root@security-core — CLASSIFIED SHELL            ║
╠═══════════════════════════════════════════════════════════╣
║  [ALL STANDARD COMMANDS AVAILABLE]                       ║
║  classified     — View classified operation logs         ║
║  ops            — Alias for classified                   ║
╚═══════════════════════════════════════════════════════════╝`

export default function CLIMode({ onSwitchView, onExit, isRoot, onRootEscalation }) {
  const prompt = isRoot ? 'root@security-core:~#' : 'baakaa@security-core:~$'

  const [history, setHistory] = useState([
    { id: 0, text: `baakaa OS v2.026 — Interactive Shell`, color: '#661111' },
    { id: 1, text: isRoot ? `root access granted. Welcome.` : `Type 'help' for available commands.`, color: '#441111' },
    { id: 2, text: '', color: '#000' },
  ])
  const [input, setInput] = useState('')
  const [cmdHistory, setCmdHistory] = useState([])
  const [cmdHistoryIdx, setCmdHistoryIdx] = useState(-1)
  const bodyRef = useRef(null)
  const inputRef = useRef(null)

  const scrollBottom = useCallback(() => {
    setTimeout(() => { if (bodyRef.current) bodyRef.current.scrollTop = bodyRef.current.scrollHeight }, 30)
  }, [])

  const appendLines = useCallback((lines) => {
    setHistory(h => [...h, ...lines.map((l) => ({ id: Date.now() + Math.random(), ...l }))])
    scrollBottom()
  }, [scrollBottom])

  const ml = (texts, color = '#ff6666') => texts.map(text => ({ text, color }))

  // Re-init welcome when root escalates
  useEffect(() => {
    if (isRoot) {
      appendLines([
        { text: '', color: '#000' },
        { text: '█'.repeat(58), color: '#ff0033' },
        { text: '  PRIVILEGE ESCALATION SUCCESSFUL', color: '#ff0033' },
        { text: '  Welcome, root. Classified logs now accessible.', color: '#ff3333' },
        { text: '  Type "classified" to view operation archives.', color: '#881111' },
        { text: '█'.repeat(58), color: '#ff0033' },
        { text: '', color: '#000' },
      ])
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isRoot])

  const runCommand = useCallback(async (raw) => {
    const cmd = raw.trim().toLowerCase()
    appendLines([{ text: `${prompt} ${raw}`, color: isRoot ? '#ff0033' : '#ff3333' }])
    if (!cmd) return

    // ── SUDO SU ───────────────────────────────────────────────
    if (cmd === 'sudo su') {
      if (isRoot) {
        appendLines([{ text: '  Already root. You have full clearance.', color: '#ff0033' }])
      } else {
        appendLines([
          { text: '  [sudo] password for baakaa: ••••••••••', color: '#ffcc00' },
          { text: '  Verifying credentials...', color: '#ffcc00' },
          { text: '  Authentication successful.', color: '#00ff41' },
          { text: '  Escalating to root...', color: '#ff3333' },
        ])
        setTimeout(() => onRootEscalation?.(), 800)
      }

    // ── HELP ─────────────────────────────────────────────────
    } else if (cmd === 'help') {
      appendLines([
        ...(isRoot ? ROOT_HELP_TEXT : HELP_TEXT).split('\n').map(t => ({ text: t, color: '#ff2222' })),
      ])

    // ── WHOAMI ────────────────────────────────────────────────
    } else if (cmd === 'whoami') {
      const m = PROFILE.meta
      appendLines(ml([
        '',
        `  Name    : ${m.name}`,
        `  Alias   : ${m.alias}`,
        `  Role    : ${m.title}`,
        `  Loc     : ${m.location}`,
        `  UID     : ${isRoot ? '0 (root)' : '1000 (baakaa)'}`,
        `  Shell   : /bin/baakaa`,
        '',
      ]))

    // ── ABOUT ─────────────────────────────────────────────────
    } else if (cmd === 'about') {
      const m = PROFILE.meta
      appendLines(ml([
        '',
        `  ┌─ IDENTITY ─────────────────────────────────────┐`,
        `  │  Name     : ${m.name}`,
        `  │  Alias    : ${m.alias}`,
        `  │  Email    : ${m.email}`,
        `  │  GitHub   : ${m.github}`,
        `  │  IG       : ${m.instagram}`,
        `  └────────────────────────────────────────────────┘`,
        '',
        `  ${PROFILE.about}`,
        '',
      ]))

    // ── SKILLS ───────────────────────────────────────────────
    } else if (cmd === 'skills') {
      const lines = ['', '  CAPABILITY MANIFEST:']
      PROFILE.skillCategories.forEach(cat => {
        lines.push('')
        lines.push(`  ── ${cat.label.toUpperCase()} ${'─'.repeat(Math.max(0, 42 - cat.label.length))}`)
        cat.skills.forEach(s => {
          const filled = Math.round(s.level / 10)
          const empty = 10 - filled
          lines.push(`  ${s.name.padEnd(34)} [${('█').repeat(filled)}${('░').repeat(empty)}] ${s.level}%`)
        })
      })
      lines.push('')
      appendLines(lines.map(t => ({ text: t, color: '#ff4444' })))

    // ── PROJECTS / LS ─────────────────────────────────────────
    } else if (cmd === 'projects' || cmd === 'ls' || cmd === 'ls projects') {
      appendLines(ml([
        '',
        '  PROJECT REGISTRY:',
        '  ' + '─'.repeat(54),
        ...PROFILE.projects.map(p =>
          `  [${p.ip.padEnd(15)}]  ${p.title.padEnd(26)}  ${p.status}`
        ),
        '',
        "  Type 'target <ip>' to recon a specific node.",
        '',
      ], '#00ccff'))

    // ── LABS ─────────────────────────────────────────────────
    } else if (cmd === 'labs') {
      const lines = ['', '  LABS & DEFENSE CASE STUDIES:']
      PROFILE.labs.forEach((lab, i) => {
        lines.push('')
        lines.push(`  [${lab.classification}] ${lab.title}`)
        lines.push(`  Category : ${lab.category}`)
        lines.push(`  Summary  : ${lab.summary.slice(0, 80)}...`)
        lines.push(`  Tools    : ${lab.tools.join(', ')}`)
        lines.push(`  Outcome  : ${lab.outcome}`)
      })
      lines.push('')
      appendLines(lines.map(t => ({ text: t, color: '#ff6666' })))

    // ── CLASSIFIED (root only) ────────────────────────────────
    } else if (cmd === 'classified' || cmd === 'ops') {
      if (!isRoot) {
        appendLines([{ text: '  PERMISSION DENIED. Elevate with: sudo su', color: '#ff0000' }])
      } else {
        appendLines([
          { text: '', color: '#000' },
          ...PROFILE.classifiedLogs.map(l => ({ text: `  ${l}`, color: '#00ccff' })),
          { text: '', color: '#000' },
        ])
      }

    // ── EDUCATION ─────────────────────────────────────────────
    } else if (cmd === 'education' || cmd === 'edu') {
      const lines = ['', '  ACADEMIC RECORD:']
      PROFILE.education.forEach(e => {
        lines.push('')
        lines.push(`  ▸ ${e.degree}`)
        lines.push(`    ${e.institution}, ${e.location}`)
        lines.push(`    ${e.year}  |  ${e.status}`)
      })
      lines.push('')
      appendLines(lines.map(t => ({ text: t, color: '#ff6666' })))

    // ── CONTACT ───────────────────────────────────────────────
    } else if (cmd === 'contact') {
      const m = PROFILE.meta
      appendLines(ml([
        '',
        `  Email     : ${m.email}`,
        `  GitHub    : ${m.github}`,
        `  Instagram : ${m.instagram}`,
        `  LinkedIn  : ${m.linkedin || '(not configured)'}`,
        '',
      ]))

    // ── ABOUT SYSTEM ──────────────────────────────────────────
    } else if (cmd === 'about system' || cmd === 'system') {
      appendLines([
        { text: '', color: '#000' },
        { text: '  ┌─ ABOUT THE SYSTEM ─────────────────────────────┐', color: '#ff0000' },
        { text: `  │  ${PROFILE.aboutSystem.slice(0, 52)}`, color: '#ff3333' },
        { text: `  │  ${PROFILE.aboutSystem.slice(52, 104)}`, color: '#ff3333' },
        { text: `  │  ${PROFILE.aboutSystem.slice(104, 156)}`, color: '#ff3333' },
        { text: '  └─────────────────────────────────────────────────┘', color: '#ff0000' },
        { text: '', color: '#000' },
      ])

    // ── TARGET ────────────────────────────────────────────────
    } else if (cmd.startsWith('target ')) {
      const ipArg = cmd.replace('target ', '').trim()
      const proj = PROFILE.projects.find(p =>
        p.ip === ipArg || p.title.toLowerCase() === ipArg
      )
      if (!proj) {
        appendLines([{ text: `  bash: target: node [${ipArg}] not in registry.`, color: '#ff0000' }])
      } else {
        const ts = new Date().toISOString().slice(0, 19)
        appendLines([
          `[${ts}] SYS >> Connecting to ${proj.ip}...`,
          `[${ts}] SYS >> ${proj.title.toUpperCase()} — ${proj.subtitle}`,
          `[${ts}] SYS >> Stack: ${proj.tech.join(', ')}`,
          `[${ts}] SYS >> Impact: ${proj.impact}`,
          `[${ts}] NET >> Recon complete.`,
        ].map(t => ({ text: `  ${t}`, color: '#00ccff' })))
      }

    // ── MODE --VIEW ───────────────────────────────────────────
    } else if (cmd === 'mode --view') {
      appendLines([{ text: '  Switching to VIEW mode...', color: '#00ff41' }])
      setTimeout(() => onSwitchView(), 400)

    // ── DOWNLOAD RESUME ───────────────────────────────────────
    } else if (cmd === 'download resume' || cmd === 'resume') {
      appendLines([{ text: '  Generating CVE-2026-CORE advisory...', color: '#ffcc00' }])
      try {
        const res = await axios.get(`${API}/api/resume`, { responseType: 'blob' })
        const url = URL.createObjectURL(new Blob([res.data]))
        const a = document.createElement('a')
        a.href = url; a.download = 'CVE-2026-CORE-baakaa.md'; a.click()
        URL.revokeObjectURL(url)
        appendLines([{ text: '  CVE-2026-CORE-baakaa.md exfiltrated.', color: '#00ff41' }])
      } catch {
        appendLines([{ text: '  ERROR: Backend offline. Run uvicorn.', color: '#ff0000' }])
      }

    // ── CLEAR ─────────────────────────────────────────────────
    } else if (cmd === 'clear') {
      setHistory([])
      return

    // ── EXIT ──────────────────────────────────────────────────
    } else if (cmd === 'exit') {
      appendLines([{ text: '  Terminating baakaa session. Goodbye.', color: '#661111' }])
      setTimeout(() => onExit(), 600)

    // ── UNKNOWN ───────────────────────────────────────────────
    } else {
      appendLines([{
        text: `  bash: command not found: ${raw}. Type 'help' for available overrides.`,
        color: '#ff0000',
      }])
    }

    appendLines([{ text: '', color: '#000' }])
  }, [appendLines, onSwitchView, onExit, isRoot, onRootEscalation, prompt])

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Enter') {
      const val = input
      setCmdHistory(h => [val, ...h].slice(0, 50))
      setCmdHistoryIdx(-1)
      setInput('')
      runCommand(val)
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setCmdHistoryIdx(i => {
        const next = Math.min(i + 1, cmdHistory.length - 1)
        setInput(cmdHistory[next] || '')
        return next
      })
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      setCmdHistoryIdx(i => {
        const next = Math.max(i - 1, -1)
        setInput(next === -1 ? '' : cmdHistory[next] || '')
        return next
      })
    }
  }, [input, cmdHistory, runCommand])

  useEffect(() => { inputRef.current?.focus() }, [])

  return (
    <>
      <div ref={bodyRef} className="terminal-body" onClick={() => inputRef.current?.focus()}>
        {history.map(line => (
          <div key={line.id} className="t-line" style={{ color: line.color, whiteSpace: 'pre' }}>
            {line.text}
          </div>
        ))}
      </div>
      <div className="cli-input-row">
        <span className="cli-prompt-label" style={{ color: isRoot ? '#ff0033' : undefined }}>
          <span className="h-user" style={{ color: isRoot ? '#ff0033' : undefined }}>
            {isRoot ? 'root' : 'baakaa'}
          </span>
          <span className="h-at">@</span>
          <span className="h-host">security-core</span>
          <span style={{ color: '#661111' }}>:~</span>
          <span className="h-hash" style={{ color: isRoot ? '#ff0033' : undefined }}>
            {isRoot ? '#' : '$'}
          </span>
        </span>
        <input
          ref={inputRef} className="cli-input"
          style={{ caretColor: isRoot ? '#ff0033' : '#ff3333' }}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          autoFocus autoComplete="off" spellCheck={false}
        />
      </div>
    </>
  )
}
