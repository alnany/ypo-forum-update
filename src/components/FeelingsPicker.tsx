import { useState } from 'react'
import { feelingsData, type CoreEmotion, type SecondaryEmotion } from '../data/feelings'

interface Props {
  selectedFeelings: string[]
  onAdd: (feeling: string) => void
  onClose: () => void
}

export default function FeelingsPicker({ selectedFeelings, onAdd, onClose }: Props) {
  const [selectedCore, setSelectedCore] = useState<CoreEmotion | null>(null)
  const [selectedSecondary, setSelectedSecondary] = useState<SecondaryEmotion | null>(null)

  const handleAddAndClose = (feeling: string) => {
    onAdd(feeling)
  }

  const handleCoreClick = (core: CoreEmotion) => {
    if (selectedCore?.name === core.name) {
      setSelectedCore(null)
      setSelectedSecondary(null)
    } else {
      setSelectedCore(core)
      setSelectedSecondary(null)
    }
  }

  const handleSecondaryClick = (sec: SecondaryEmotion) => {
    if (selectedSecondary?.name === sec.name) {
      setSelectedSecondary(null)
    } else {
      setSelectedSecondary(sec)
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
        padding: '0',
      }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="modal-in"
        style={{
          background: 'white',
          borderRadius: '20px 20px 0 0',
          width: '100%',
          maxWidth: 640,
          maxHeight: '85vh',
          overflow: 'auto',
          padding: '0 0 24px',
        }}
      >
        {/* Modal Header */}
        <div
          style={{
            position: 'sticky',
            top: 0,
            background: 'white',
            borderBottom: '1px solid var(--border-light)',
            padding: '16px 20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            zIndex: 1,
          }}
        >
          <div>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--navy)' }}>Select a Feeling</h3>
            <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
              {!selectedCore
                ? 'Choose a core emotion to explore'
                : !selectedSecondary
                ? `${selectedCore.name} → select more specific`
                : `${selectedCore.name} → ${selectedSecondary.name} → select or pick specific`}
            </p>
          </div>
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

        <div style={{ padding: '20px 20px 0' }}>
          {/* Breadcrumb */}
          {(selectedCore || selectedSecondary) && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
              <button
                onClick={() => { setSelectedCore(null); setSelectedSecondary(null) }}
                style={{ background: 'none', color: 'var(--text-muted)', fontSize: 13, padding: '4px 8px', borderRadius: 6, border: '1px solid var(--border)' }}
              >
                All Emotions
              </button>
              {selectedCore && (
                <>
                  <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>›</span>
                  <button
                    onClick={() => setSelectedSecondary(null)}
                    style={{
                      background: selectedCore.bgColor,
                      color: selectedCore.color,
                      fontSize: 13,
                      padding: '4px 10px',
                      borderRadius: 6,
                      border: `1px solid ${selectedCore.color}44`,
                      fontWeight: 600,
                    }}
                  >
                    {selectedCore.emoji} {selectedCore.name}
                  </button>
                </>
              )}
              {selectedSecondary && (
                <>
                  <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>›</span>
                  <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>
                    {selectedSecondary.name}
                  </span>
                </>
              )}
            </div>
          )}

          {/* Level 1: Core emotions */}
          {!selectedCore && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: 10 }}>
              {feelingsData.map((core) => (
                <button
                  key={core.name}
                  onClick={() => handleCoreClick(core)}
                  style={{
                    background: core.bgColor,
                    border: `2px solid ${core.color}33`,
                    borderRadius: 12,
                    padding: '14px 12px',
                    textAlign: 'center',
                    cursor: 'pointer',
                    transition: 'all 0.15s',
                  }}
                >
                  <div style={{ fontSize: 26, marginBottom: 6 }}>{core.emoji}</div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: core.color }}>{core.name}</div>
                </button>
              ))}
            </div>
          )}

          {/* Level 2: Secondary emotions */}
          {selectedCore && !selectedSecondary && (
            <div>
              <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 12 }}>
                Tap a feeling to select it directly, or drill in for more specific options
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {selectedCore.secondary.map((sec) => {
                  const isSelected = selectedFeelings.includes(sec.name)
                  return (
                    <div key={sec.name} style={{ display: 'flex', gap: 4 }}>
                      <button
                        onClick={() => {
                          if (!isSelected) handleAddAndClose(sec.name)
                        }}
                        style={{
                          background: isSelected ? selectedCore.bgColor : 'white',
                          border: `1.5px solid ${isSelected ? selectedCore.color : 'var(--border)'}`,
                          borderRadius: '8px 0 0 8px',
                          padding: '8px 14px',
                          fontSize: 14,
                          fontWeight: 600,
                          color: isSelected ? selectedCore.color : 'var(--text)',
                          cursor: isSelected ? 'default' : 'pointer',
                          opacity: isSelected ? 0.6 : 1,
                        }}
                      >
                        {isSelected ? '✓ ' : ''}{sec.name}
                      </button>
                      <button
                        onClick={() => handleSecondaryClick(sec)}
                        style={{
                          background: 'var(--bg)',
                          border: `1.5px solid var(--border)`,
                          borderLeft: 'none',
                          borderRadius: '0 8px 8px 0',
                          padding: '8px 10px',
                          fontSize: 12,
                          color: 'var(--text-muted)',
                          cursor: 'pointer',
                        }}
                        title="See more specific feelings"
                      >
                        ›
                      </button>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Level 3: Tertiary emotions */}
          {selectedCore && selectedSecondary && (
            <div>
              <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 12 }}>
                Or tap <strong>{selectedSecondary.name}</strong> itself to use it
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
                {/* Add secondary itself */}
                {!selectedFeelings.includes(selectedSecondary.name) && (
                  <button
                    onClick={() => handleAddAndClose(selectedSecondary.name)}
                    style={{
                      background: selectedCore.bgColor,
                      border: `1.5px solid ${selectedCore.color}`,
                      borderRadius: 8,
                      padding: '8px 16px',
                      fontSize: 14,
                      fontWeight: 700,
                      color: selectedCore.color,
                      cursor: 'pointer',
                    }}
                  >
                    + {selectedSecondary.name}
                  </button>
                )}
                {/* Tertiary */}
                {selectedSecondary.tertiary.map((t) => {
                  const isSelected = selectedFeelings.includes(t)
                  return (
                    <button
                      key={t}
                      onClick={() => { if (!isSelected) handleAddAndClose(t) }}
                      style={{
                        background: isSelected ? selectedCore.bgColor : 'white',
                        border: `1.5px solid ${isSelected ? selectedCore.color : 'var(--border)'}`,
                        borderRadius: 8,
                        padding: '8px 16px',
                        fontSize: 14,
                        fontWeight: 500,
                        color: isSelected ? selectedCore.color : 'var(--text)',
                        cursor: isSelected ? 'default' : 'pointer',
                        opacity: isSelected ? 0.6 : 1,
                      }}
                    >
                      {isSelected ? '✓ ' : ''}{t}
                    </button>
                  )
                })}
              </div>
            </div>
          )}
        </div>

        {/* Selected feelings summary */}
        {selectedFeelings.length > 0 && (
          <div style={{ padding: '16px 20px 0', borderTop: '1px solid var(--border-light)', marginTop: 16 }}>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 8, fontWeight: 600 }}>
              ADDED ({selectedFeelings.length})
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {selectedFeelings.map((f) => (
                <span
                  key={f}
                  style={{
                    background: '#f1f5f9',
                    border: '1px solid var(--border)',
                    borderRadius: 20,
                    padding: '4px 10px',
                    fontSize: 12,
                    color: 'var(--text)',
                  }}
                >
                  {f}
                </span>
              ))}
            </div>
          </div>
        )}

        <div style={{ padding: '16px 20px 0' }}>
          <button
            className="btn-primary"
            style={{ width: '100%', justifyContent: 'center' }}
            onClick={onClose}
          >
            Done
          </button>
        </div>
      </div>
    </div>
  )
}
