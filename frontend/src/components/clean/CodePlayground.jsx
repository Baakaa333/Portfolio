import { useState, useCallback } from 'react'
import { PROFILE } from '../../data/profile'
import SyntaxHighlighter from 'react-syntax-highlighter'
import { atomOneDark } from 'react-syntax-highlighter/dist/esm/styles/hljs'

const LANG_MAP = { javascript: 'javascript', python: 'python', c: 'c' }

export default function CodePlayground() {
  const snippets = PROFILE.codeSnippets
  const [activeSnippet, setActiveSnippet] = useState(snippets[0])
  const [evalOutput, setEvalOutput] = useState('')

  const runCode = useCallback(() => {
    if (activeSnippet.language === 'javascript') {
      try {
        const logs = []
        const fakeCons = { log: (...args) => logs.push(args.join(' ')) }
        // eslint-disable-next-line no-new-func
        const fn = new Function('console', activeSnippet.code.replace(/^import.*$/gm, '// import omitted'))
        fn(fakeCons)
        setEvalOutput(logs.join('\n') || '✓ Executed (no console output)')
      } catch (e) {
        setEvalOutput('Error: ' + e.message)
      }
    } else {
      setEvalOutput(`// ${activeSnippet.language.toUpperCase()} snippets run server-side.\n// This is a static preview. Start the backend to execute.`)
    }
  }, [activeSnippet])

  return (
    <section id="playground" className="section" style={{ background: 'var(--bg-secondary)' }}>
      <div className="container">
        <div style={{ marginBottom: '2.5rem' }}>
          <div className="section-label">Code Playground</div>
          <h2 className="display-lg" style={{ marginBottom: '0.75rem' }}>Live Code Snippets</h2>
          <p style={{ color: 'var(--text-secondary)', maxWidth: 480 }}>
            Real code from my projects. Select a snippet and explore.
          </p>
        </div>

        {/* Snippet selector */}
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
          {snippets.map(s => (
            <button
              key={s.id}
              onClick={() => { setActiveSnippet(s); setEvalOutput('') }}
              style={{
                padding: '0.5rem 1rem', borderRadius: 'var(--radius-md)',
                border: '1.5px solid',
                borderColor: activeSnippet.id === s.id ? 'var(--accent)' : 'var(--border)',
                background: activeSnippet.id === s.id ? 'rgba(99,102,241,0.08)' : 'var(--bg)',
                color: activeSnippet.id === s.id ? 'var(--accent)' : 'var(--text-secondary)',
                cursor: 'pointer', fontSize: '0.8125rem', fontWeight: 600,
                fontFamily: 'var(--font-sans)',
                transition: 'all 150ms ease',
              }}
            >
              {s.title}
            </button>
          ))}
        </div>

        <div className="card" style={{ overflow: 'hidden' }}>
          {/* Header */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '0.875rem 1.25rem',
            background: 'var(--bg-secondary)',
            borderBottom: '1px solid var(--border)',
          }}>
            <div>
              <span style={{ fontWeight: 700, fontSize: '0.9375rem', marginRight: '0.75rem' }}>
                {activeSnippet.title}
              </span>
              <span className="chip chip-accent">{activeSnippet.language}</span>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                id="run-code-btn"
                className="btn btn-primary btn-sm"
                onClick={runCode}
              >
                ▶ Run
              </button>
            </div>
          </div>

          {/* Description */}
          <div style={{ padding: '0.75rem 1.25rem', borderBottom: '1px solid var(--border)', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
            {activeSnippet.description}
          </div>

          {/* Code editor area */}
          <div style={{ maxHeight: 380, overflow: 'auto' }}>
            <SyntaxHighlighter
              language={LANG_MAP[activeSnippet.language] || 'text'}
              style={atomOneDark}
              customStyle={{
                margin: 0, padding: '1.5rem', fontSize: '0.8125rem',
                lineHeight: 1.7, background: '#1e293b',
              }}
              showLineNumbers
              wrapLongLines
            >
              {activeSnippet.code}
            </SyntaxHighlighter>
          </div>

          {/* Output panel */}
          {evalOutput && (
            <div style={{
              borderTop: '1px solid var(--border)',
              padding: '1rem 1.25rem',
              background: '#0f172a',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.8125rem',
              color: evalOutput.startsWith('Error') ? '#ef4444' : '#10b981',
              lineHeight: 1.7,
              whiteSpace: 'pre',
            }}>
              <div style={{ color: '#475569', marginBottom: '0.25rem', fontSize: '0.7rem', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                Output
              </div>
              {evalOutput}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
