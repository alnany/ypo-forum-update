import { useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
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
  const { t } = useTranslation()
  const [search, setSearch] = useState('')
  const [pendingRemove, setPendingRemove] = useState<string | null>(null)

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim()
    if (!q) return allFeelings
    return allFeelings.filter((f) =>
      f.name.toLowerCase().includes(q) ||
      t(`feelings.${f.name}`, f.name).toLowerCase().includes(q)
    )
  }, [search, t])

  const grouped = useMemo(() => {
    return feelingsData.map((core, ci) => ({
      core,
      feelings: filtered.filter((f) => f.coreIndex === ci),
    })).filter((g) => g.feelings.length > 0)
  }, [filtered])

  const toggle = (name: string) => {
    if (selectedFeelings.includes(name)) {
      setPendingRemove(name)
    } else {
      onAdd(name)
    }
  }

  const confirmRemove = () => {
    if (pendingRemove) {
      onRemove(pendingRemove)
      setPendingRemove(null)
    }
  }

  return (
    <>
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
                {t('section.yourFeelings')}
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
              placeholder={t('picker.searchPlaceholder')}
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
                      onClick={() => setPendingRemove(f)}
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
                      {t(`feelings.${f}`, f)} <span style={{ opacity: 0.6, fontSize: 14, lineHeight: 1 }}>×</span>
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
                {t('picker.searchPlaceholder', '').replace('…', '')} "{search}"
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
                      {t(`feelings.${core.name}`, core.name)}
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
                          {t(`feelings.${f.name}`, f.name)}
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
              {t('picker.done')}{selectedFeelings.length > 0 ? ` (${selectedFeelings.length})` : ''}
            </button>
          </div>
        </div>
      </div>

      {/* Confirm remove dialog */}
      {pendingRemove && (() => {
        const match = allFeelings.find((x) => x.name === pendingRemove)
        const core = match ? feelingsData[match.coreIndex] : null
        return (
          <div
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0,0,0,0.55)',
              zIndex: 1100,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '0 24px',
            }}
          >
            <div
              style={{
                background: 'white',
                borderRadius: 16,
                padding: '24px 20px 20px',
                width: '100%',
                maxWidth: 340,
                boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
              }}
            >
              <p style={{ fontSize: 15, fontWeight: 600, color: 'var(--navy)', marginBottom: 6, textAlign: 'center' }}>
                {t('picker.removeConfirmTitle', 'Remove feeling?')}
              </p>
              <p style={{ fontSize: 13, color: 'var(--text-muted)', textAlign: 'center', marginBottom: 20 }}>
                <span
                  style={{
                    display: 'inline-block',
                    background: core?.bgColor || '#f1f5f9',
                    color: core?.color || '#334155',
                    borderRadius: 20,
                    padding: '2px 10px',
                    fontWeight: 700,
                    fontSize: 13,
                  }}
                >
                  {t(`feelings.${pendingRemove}`, pendingRemove)}
                </span>
                <br />
                <span style={{ display: 'block', marginTop: 8 }}>
                  {t('picker.removeConfirmBody', 'This will also remove its associated notes.')}
                </span>
              </p>
              <div style={{ display: 'flex', gap: 10 }}>
                <button
                  onClick={() => setPendingRemove(null)}
                  style={{
                    flex: 1,
                    padding: '10px 0',
                    borderRadius: 10,
                    border: '1.5px solid var(--border)',
                    background: 'white',
                    fontSize: 14,
                    fontWeight: 600,
                    color: 'var(--text-muted)',
                    cursor: 'pointer',
                  }}
                >
                  {t('common.cancel', 'Cancel')}
                </button>
                <button
                  onClick={confirmRemove}
                  style={{
                    flex: 1,
                    padding: '10px 0',
                    borderRadius: 10,
                    border: 'none',
                    background: '#ef4444',
                    fontSize: 14,
                    fontWeight: 700,
                    color: 'white',
                    cursor: 'pointer',
                  }}
                >
                  {t('common.remove', 'Remove')}
                </button>
              </div>
            </div>
          </div>
        )
      })()}
    </>
  )
}
