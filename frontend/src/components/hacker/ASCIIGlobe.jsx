import { useEffect, useRef, useState, useCallback } from 'react'
import { PROFILE } from '../../data/profile'

// ASCII world map (72×24 chars) — simplified Mercator projection
const BASE_MAP = [
  '                .......          ...........          .......',
  '          .::::::::::::::.   .::::::::::::::::.    .::::::::.',
  '        .:::::::::::::::::: :::::::::::::::::::::.::::::::::.',
  '       .:::::::::::::::::::::::::::::::::::::::::::::::::::: ',
  '      .::::::::::::::::::::::::::::::::::::::::::::::::::::: ',
  '      :::::::::::::::::::::::::::::::::::::::::::::::::::::: ',
  '       .::::::::::::::::::::::::::::::::::::::::::::::::::.. ',
  '        .:::::::::::   .::::::::::::::::::::::::::::::::..   ',
  '          .:::::::.     .::::::::::::::::::::::::::::::..    ',
  '            .::.          .::::::::::::::::::::::::::::..    ',
  '                           .::::::::::::::::::::::::::..     ',
  '                            .::::::::::::::::::::::::..      ',
  '                             .:::::::::::::::::::::..        ',
  '                              .::::::::::::::::::::..        ',
  '                               .::::::::::::::::..           ',
  '                                 .::::::::::....             ',
  '                                  ...:::::..                 ',
  '                                    .....                    ',
  '                                                             ',
  '                                                             ',
  '                                                             ',
  '                                                             ',
  '                                                             ',
  '                                                             ',
]

// Project node positions mapped to ascii grid coordinates
function latLngToGrid(lat, lng, rows, cols) {
  const x = Math.round(((lng + 180) / 360) * (cols - 1))
  const y = Math.round(((90 - lat) / 180) * (rows - 1))
  return { x: Math.max(0, Math.min(cols - 1, x)), y: Math.max(0, Math.min(rows - 1, y)) }
}

export default function ASCIIGlobe({ targetedNode, onNodeClick }) {
  const [tick, setTick] = useState(0)
  const [offset, setOffset] = useState(0)
  const rows = BASE_MAP.length
  const cols = BASE_MAP[0].length

  // Slowly rotate the map by shifting chars
  useEffect(() => {
    const id = setInterval(() => {
      setTick(t => t + 1)
      setOffset(o => (o + 1) % cols)
    }, 120)
    return () => clearInterval(id)
  }, [cols])

  // Build rotated map lines
  const rotatedMap = BASE_MAP.map(line => {
    const shift = offset % line.length
    return line.slice(shift) + line.slice(0, shift)
  })

  // Plot project nodes on map
  const nodes = PROFILE.projects.map(p => {
    const { x, y } = latLngToGrid(p.position.lat, p.position.lng, rows, cols)
    return { ...p, gridX: x, gridY: y }
  })

  // Build character grid with node overlays
  const grid = rotatedMap.map((line, rowIdx) => {
    let chars = line.split('')
    nodes.forEach(n => {
      if (n.gridY === rowIdx) {
        const marker = '◉'
        if (n.gridX < chars.length) {
          chars[n.gridX] = marker
        }
      }
    })
    return { row: rowIdx, chars }
  })

  return (
    <div
      className="ascii-globe-wrap"
      style={{ padding: '0.5rem 0', cursor: 'default', lineHeight: 1.15 }}
    >
      {grid.map(({ row, chars }) => (
        <div key={row} style={{ whiteSpace: 'pre', display: 'block' }}>
          {chars.map((ch, col) => {
            const nodeHere = nodes.find(n => n.gridY === row && n.gridX === col)
            if (nodeHere) {
              const isTargeted = targetedNode === nodeHere.id
              return (
                <span
                  key={col}
                  className={`ascii-globe-node ${isTargeted ? 'targeted' : ''} blink-fast`}
                  onClick={() => onNodeClick && onNodeClick(nodeHere)}
                  title={`[${nodeHere.ip}] ${nodeHere.title}`}
                  style={{ cursor: 'pointer' }}
                >
                  ◉
                </span>
              )
            }
            return (
              <span key={col} style={{ color: ch === ':' ? '#440000' : '#221111' }}>
                {ch}
              </span>
            )
          })}
        </div>
      ))}

      {/* Node IP legend */}
      <div style={{ marginTop: '0.75rem', color: '#661111', fontSize: '0.65rem' }}>
        {'─'.repeat(62)}
      </div>
      <div style={{
        display: 'flex', flexWrap: 'wrap', gap: '0.75rem 2rem',
        marginTop: '0.375rem', fontSize: '0.65rem',
      }}>
        {nodes.map(n => (
          <span
            key={n.id}
            onClick={() => onNodeClick && onNodeClick(n)}
            style={{
              cursor: 'pointer',
              color: targetedNode === n.id ? '#00ff41' : '#ff3333',
              textShadow: targetedNode === n.id ? '0 0 8px rgba(0,255,65,0.5)' : '0 0 6px rgba(255,0,0,0.3)',
            }}
          >
            ◉ [{n.ip}] {n.title}
          </span>
        ))}
      </div>
    </div>
  )
}
