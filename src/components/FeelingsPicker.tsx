import { useState, useMemo } from 'react'
import { feelingsData } from '../data/feelings'

interface Props {
  selectedFeelings: string[]
  onAdd: (feeling: string) => void
  onRemove: (feeling: string) => void
  onClose: () => void
}

// Build flat list of all feelings with their core parent
const allFeelings: { name: string; level: 'secondary' | 'tertiary'; coreIndex: number }[] = []
feelingsData.forEach((core, ci) => {
  core.secondary.forEach((sec) => {
    allFeelings.push({ name: sec.name, level: 'secondary', coreIndex: ci })
    sec.tertiary.forEach((t) => {
      allFeelings.push({ name: t, level: 'tertiary', coreIndex: ci })
    })
  })
})

export default function FeelingsPicker({ selectedFeelings, onAdd, onRemove, onClose }: Props) {
  const [search, setSearch] = useState('')

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim()
    if (!q) return allFeelings
    return allFeelings.filter((f) => f.name.toLowerCase().includes(q))
  }, [search])

  // Group filtered feelings by core
  const grouped = useMemo(() => {
    return feelingsData.map((core, ci) => ({
      core,
      feelings: filtered.filter((f) => f.coreIndex === ci),
    })).filter((g) => g.feelings.length > 0)
  }, [filtered])

  const toggle = (name: string) => {
    if (selectedFeelings.includes(name)) {
      onRemove(name)
    } else {
      onAdd(name)
    }
  }

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.5)',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'center',
      }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="modal-in"
        style={{
          background: 'var(--bg)',
          borderRadius: '20px 20px 0 0',
          width: '100%',
          maxWidth: 640,
          maxHeight: '88vh',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Header */}
        <div
          style={{
            background: 'white',
            borderBottom: '1px solid var(--border-light)',
            padding: '16px 20px 12px',
            borderRadius: '20px 20px 0 0',
            flexShrink: 0,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--navy)' }}>
              How are you feeling?
            </h3>
            <button
              onClick={onClose}
              style={{
                background: '#f1f5f9',
                border: 'none',
                borderRadius: '50%',
                width: 32,
                height: 32,
                fontSize: 18,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--text-muted)',
              }}
            >
              ×
            </button>
          </div>

          {/* Search */}
          <input
            type="text"
            placeholder="Search feelings…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            autoFocus
            style={{
              width: '100%',
              fontSize: 14,
              padding: '9px 14px',
              borderRadius: 8,
              border: '1.5px solid var(--border)',
              outline: 'none',
              background: 'var(--bg)',
              boxSizing: 'border-box',
            }}
          />

          {/* Selected pills */}
          {selectedFeelings.length > 0 && (
            <div style={{ marginTop: 10, display: 'flex', flexWrap: 'wrap', gap: 5 }}>
              {selectedFeelings.map((f) => {
                const match = allFeelings.find((x) => x.name === f)
                const core = match ? feelingsData[match.coreIndex] : null
                return (
                  <span
                    key={f}
                    onClick={() => onRemove(f)}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 4,
                      background: core?.bgColor || '#f1f5f9',
                      border: `1px solid ${core?.color || '#cbd5e1'}55`,
                      color: core?.color || '#334155',
                      borderRadius: 20,
                      padding: '3px 10px',
                      fontSize: 12,
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    {f} <span style={{ opacity: 0.6, fontSize: 14, lineHeight: 1 }}>×</span>
                  </span>
                )
              })}
            </div>
          )}
        </div>

        {/* Scrollable feelings list */}
        <div style={{ overflowY: 'auto', flex: 1, padding: '16px 20px' }}>
          {grouped.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)', fontSize: 14 }}>
              No feelings match "{search}"
            </div>
          ) : (
            grouped.map(({ core, feelings }) => (
              <div key={core.name} style={{ marginBottom: 20 }}>
                {/* Core label */}
                <div
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                    background: core.bgColor,
                    border: `1px solid ${core.color}33`,
                    borderRadius: 20,
                    padding: '4px 12px',
                    marginBottom: 10,
                  }}
                >
                  <span style={{ fontSize: 15 }}>{core.emoji}</span>
                  <span style={{ fontSize: 12, fontWeight: 800, color: core.color, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    {core.name}
                  </span>
                </div>

                {/* All feelings for this core */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
                  {feelings.map((f) => {
                    const selected = selectedFeelings.includes(f.name)
                    return (
                      <button
                        key={f.name + f.level}
                        onClick={() => toggle(f.name)}
                        style={{
                          background: selected ? core.color : 'white',
                          border: `1.5px solid ${selected ? core.color : core.color + '44'}`,
                          borderRadius: 20,
                          padding: f.level === 'secondary' ? '7px 16px' : '5px 13px',
                          fontSize: f.level === 'secondary' ? 14 : 13,
                          fontWeight: f.level === 'secondary' ? 700 : 400,
                          color: selected ? 'white' : core.color,
                          cursor: 'pointer',
                          transition: 'all 0.12s',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 4,
                        }}
                      >
                        {selected && <span style={{ fontSize: 11 }}>✓</span>}
                        {f.name}
                      </button>
                    )
                  })}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div
          style={{
            background: 'white',
            borderTop: '1px solid var(--border-light)',
            padding: '12px 20px',
            flexShrink: 0,
          }}
        >
          <button
            className="btn-primary"
            style={{ width: '100%', justifyContent: 'center' }}
            onClick={onClose}
          >
            Done{selectedFeelings.length > 0 ? ` (${selectedFeelings.length} selected)` : ''}
          </button>
        </div>
      </div>
    </div>
  )
}
