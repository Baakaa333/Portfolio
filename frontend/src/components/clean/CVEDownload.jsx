import { useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import axios from 'axios'

const API = 'http://localhost:8000'

export default function CVEDownload() {
  const [status, setStatus] = useState('idle') // idle | downloading | done | error

  const handleDownload = useCallback(async () => {
    setStatus('downloading')
    try {
      const res = await axios.get(`${API}/api/resume`, { responseType: 'blob' })
      const url = URL.createObjectURL(new Blob([res.data], { type: 'text/markdown' }))
      const a = document.createElement('a')
      a.href = url
      a.download = 'CVE-2026-CORE-security-advisory.md'
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      setStatus('done')
      setTimeout(() => setStatus('idle'), 3000)
    } catch {
      setStatus('error')
      setTimeout(() => setStatus('idle'), 3000)
    }
  }, [])

  const labels = {
    idle: '⬇ Download Security Advisory',
    downloading: '⟳ Generating CVE report...',
    done: '✓ CVE-2026-CORE.md downloaded',
    error: '⚠ Backend offline — start uvicorn',
  }

  const colors = {
    idle: undefined,
    downloading: undefined,
    done: '#059669',
    error: '#dc2626',
  }

  return (
    <motion.div
      style={{
        background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)',
        borderRadius: 'var(--radius-xl)',
        padding: '2.5rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '1.25rem',
      }}
      whileHover={{ scale: 1.01 }}
      transition={{ duration: 0.25 }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
        <div style={{
          background: 'rgba(220,38,38,0.15)',
          border: '1px solid rgba(220,38,38,0.3)',
          borderRadius: 'var(--radius-md)',
          padding: '0.75rem',
          fontSize: '1.5rem',
          flexShrink: 0,
        }}>
          🛡️
        </div>
        <div>
          <div style={{ color: '#dc2626', fontWeight: 700, fontSize: '0.7rem', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '0.25rem' }}>
            CVE-2026-CORE · CRITICAL
          </div>
          <h3 style={{ color: '#fff', fontFamily: 'var(--font-display)', fontSize: '1.25rem', fontWeight: 700, lineHeight: 1.3, marginBottom: '0.5rem' }}>
            Security Advisory — Unremediated Engineering Deficit
          </h3>
          <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: '0.875rem', lineHeight: 1.7 }}>
            CVSS Score: 10.0 · Immediate remediation required. Download the full disclosure report structured as a MITRE CVE advisory.
          </p>
        </div>
      </div>

      <div style={{
        background: 'rgba(220,38,38,0.08)',
        border: '1px solid rgba(220,38,38,0.2)',
        borderRadius: 'var(--radius-md)',
        padding: '0.875rem 1rem',
        fontFamily: 'var(--font-mono)',
        fontSize: '0.75rem',
        color: '#ff6666',
        lineHeight: 1.7,
      }}>
        <div>Severity   : CRITICAL ██████████ 10.0</div>
        <div>Vector     : AV:N/AC:L/PR:N/UI:R/S:C</div>
        <div>Remediation: Retain candidate immediately</div>
      </div>

      <button
        id="cve-download-btn"
        className="btn btn-danger"
        onClick={handleDownload}
        disabled={status === 'downloading'}
        style={{
          alignSelf: 'flex-start',
          color: colors[status] ? '#fff' : undefined,
          background: colors[status]
            ? `linear-gradient(135deg, ${colors[status]}, ${colors[status]})`
            : undefined,
        }}
      >
        {labels[status]}
      </button>
    </motion.div>
  )
}
