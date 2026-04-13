import { useState, useEffect, useCallback } from 'react'
import { getParkingLot, updateParkingLotItem } from '../lib/api'
import type { ParkingLotItem } from '../lib/api'

const MEMBER_COLORS: Record<string, string> = {
  Chris: '#1a3660',
  Tony: '#065f46',
  Julian: '#5b21b6',
  Eric: '#b45309',
  Mike: '#9d174d',
  Ethan: '#1e40af',
}

const SOURCE_LABELS: Record<string, string> = {
  groupLearning: 'Something I could learn from you all',
  explore: 'I want to explore this',
}

export default function ParkingLot() {
  const [items, setItems] = useState<ParkingLotItem[]>([])
  const [loading, setLoading] = useState(true)
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)
  const [pending, setPending] = useState<Set<string>>(new Set())

  const load = useCallback(async () => {
    setLoading(true)
    const data = await getParkingLot()
    setItems(data)
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  const toggleCheck = async (item: ParkingLotItem) => {
    if (pending.has(item.id)) return
    const newChecked = !item.checked
    setItems((prev) => prev.map((i) => i.id === item.id ? { ...i, checked: newChecked } : i))
    setPending((prev) => new Set(prev).add(item.id))
    await updateParkingLotItem(item.id, { checked: newChecked })
    setPending((prev) => { const s = new Set(prev); s.delete(item.id); return s })
  }

  const doDelete = async (id: string) => {
    setConfirmDeleteId(null)
    setItems((prev) => prev.map((i) => i.id === id ? { ...i, deleted: true } : i))
    setPending((prev) => new Set(prev).add(id))
    await updateParkingLotItem(id, { deleted: true })
    setPending((prev) => { const s = new Set(prev); s.delete(id); return s })
  }

  const visible = items.filter((i) => !i.deleted)
  const checkedCount = visible.filter((i) => i.checked).length

  const renderSection = (source: 'groupLearning' | 'explore', sectionItems: ParkingLotItem[]) => {
    if (sectionItems.length === 0) return null
    return (
      <div style={{ marginBottom: 18 }}>
        <p style={{
          fontSize: 11,
          fontWeight: 700,
          color: 'var(--text-muted)',
          textTransform: 'uppercase',
          letterSpacing: '0.06em',
          marginBottom: 8,
        }}>
          {SOURCE_LABELS[source]}
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
          {sectionItems.map((item) => (
            <div
              key={item.id}
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: 10,
                padding: '10px 12px',
                background: item.checked ? '#f8fafc' : 'white',
                border: '1.5px solid var(--border)',
                borderRadius: 10,
                transition: 'background 0.15s',
              }}
            >
              {/* Checkbox */}
              <button
                onClick={() => toggleCheck(item)}
                title={item.checked ? 'Mark as pending' : 'Mark as discussed'}
                style={{
                  flexShrink: 0,
                  width: 20,
                  height: 20,
                  marginTop: 2,
                  borderRadius: 5,
                  border: `2px solid ${item.checked ? '#10b981' : '#cbd5e1'}`,
                  background: item.checked ? '#10b981' : 'white',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 11,
                  color: 'white',
                  fontWeight: 900,
                  transition: 'all 0.15s',
                  opacity: pending.has(item.id) ? 0.6 : 1,
                }}
              >
                {item.checked ? '✓' : ''}
              </button>

              {/* Text + meta */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{
                  fontSize: 14,
                  color: item.checked ? 'var(--text-muted)' : 'var(--navy)',
                  textDecoration: item.checked ? 'line-through' : 'none',
                  marginBottom: 5,
                  lineHeight: 1.55,
                  wordBreak: 'break-word',
                }}>
                  {item.text}
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                  <span style={{
                    fontSize: 11,
                    fontWeight: 700,
                    color: MEMBER_COLORS[item.member] ?? 'var(--navy)',
                    background: '#f1f5f9',
                    borderRadius: 10,
                    padding: '1px 8px',
                  }}>
                    {item.member}
                  </span>
                  <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{item.displayDate}</span>
                </div>
              </div>

              {/* Delete */}
              <button
                onClick={() => setConfirmDeleteId(item.id)}
                title="Remove from parking lot"
                style={{
                  flexShrink: 0,
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'var(--text-muted)',
                  fontSize: 18,
                  lineHeight: 1,
                  padding: '0 2px',
                  opacity: 0.45,
                  marginTop: 1,
                }}
              >
                ×
              </button>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="card" style={{ padding: '20px 22px', marginBottom: 14 }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 24 }}>🅿️</span>
            <div>
              <h2 style={{ fontSize: 17, fontWeight: 800, color: 'var(--navy)', marginBottom: 1 }}>Parking Lot</h2>
              {!loading && (
                <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                  {visible.length === 0 ? 'No items yet' : `${checkedCount} of ${visible.length} discussed`}
                </p>
              )}
            </div>
          </div>
          {!loading && checkedCount > 0 && checkedCount === visible.length && (
            <span style={{
              background: '#dcfce7',
              color: '#15803d',
              borderRadius: 20,
              padding: '4px 12px',
              fontSize: 12,
              fontWeight: 700,
            }}>
              All done ✓
            </span>
          )}
        </div>

        {/* Body */}
        {loading ? (
          <p style={{ color: 'var(--text-muted)', fontSize: 14, textAlign: 'center', padding: '8px 0' }}>
            Loading…
          </p>
        ) : visible.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '20px',
            border: '2px dashed var(--border)',
            borderRadius: 10,
            color: 'var(--text-muted)',
            fontSize: 13,
            lineHeight: 1.6,
          }}>
            Items from members' <strong>"Something I could learn from you all"</strong> and{' '}
            <strong>"I want to explore this"</strong> will appear here automatically.
          </div>
        ) : (
          <>
            {renderSection('groupLearning', visible.filter((i) => i.source === 'groupLearning'))}
            {renderSection('explore', visible.filter((i) => i.source === 'explore'))}
          </>
        )}
      </div>

      {/* Delete confirmation */}
      {confirmDeleteId && (
        <div
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
            zIndex: 1300, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 24px',
          }}
          onClick={(e) => e.target === e.currentTarget && setConfirmDeleteId(null)}
        >
          <div style={{
            background: 'white', borderRadius: 16, padding: '24px',
            width: '100%', maxWidth: 340, boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
          }}>
            <p style={{ fontSize: 15, fontWeight: 700, color: 'var(--navy)', marginBottom: 8 }}>
              Remove from Parking Lot?
            </p>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 20, lineHeight: 1.5 }}>
              This item will be hidden from the list. The original update is not affected.
            </p>
            <div style={{ display: 'flex', gap: 10 }}>
              <button
                onClick={() => setConfirmDeleteId(null)}
                className="btn-secondary"
                style={{ flex: 1, justifyContent: 'center' }}
              >
                Cancel
              </button>
              <button
                onClick={() => doDelete(confirmDeleteId)}
                style={{
                  flex: 1, padding: '10px', background: '#ef4444', border: 'none',
                  borderRadius: 8, color: 'white', fontSize: 14, fontWeight: 700, cursor: 'pointer',
                }}
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
