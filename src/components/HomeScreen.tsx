import { useState, useEffect } from 'react'
import { MEMBERS, getMonthUpdates, fromYearMonth } from '../lib/api'
import type { MemberName, ForumUpdateRecord } from '../lib/api'

const MEMBER_COLORS: Record<string, string> = {
  Chris: '#1a3660',
  Tony: '#065f46',
  Julian: '#5b21b6',
  Eric: '#b45309',
  Mike: '#9d174d',
  Ethan: '#1e40af',
}

interface Props {
  currentYearMonth: string
  onStartUpdate: (member: MemberName) => void
  onViewForum: () => void
}

export default function HomeScreen({ currentYearMonth, onStartUpdate, onViewForum }: Props) {
  const [memberStatuses, setMemberStatuses] = useState<Record<string, boolean>>({})
  const [loading, setLoading] = useState(true)
  const [pickingMember, setPickingMember] = useState(false)

  useEffect(() => {
    setLoading(true)
    getMonthUpdates(currentYearMonth).then((data) => {
      if (data) {
        const statuses: Record<string, boolean> = {}
        data.members.forEach((m: ForumUpdateRecord) => {
          statuses[m.member] = m.hasUpdate
        })
        setMemberStatuses(statuses)
      }
      setLoading(false)
    })
  }, [currentYearMonth])

  const submittedCount = Object.values(memberStatuses).filter(Boolean).length
  const displayMonth = fromYearMonth(currentYearMonth)

  return (
    <div className="animate-in" style={{ maxWidth: 560, margin: '0 auto', padding: '32px 24px 60px' }}>
      {/* Hero */}
      <div style={{ textAlign: 'center', marginBottom: 36 }}>
        <div style={{ fontSize: 44, marginBottom: 12 }}>📋</div>
        <h1 style={{ fontSize: 26, fontWeight: 800, color: 'var(--navy)', marginBottom: 6 }}>
          Forum 11
        </h1>
        <div
          style={{
            display: 'inline-block',
            background: 'var(--gold-pale)',
            border: '1px solid #f3d87a',
            borderRadius: 20,
            padding: '4px 14px',
            fontSize: 14,
            fontWeight: 600,
            color: '#78500a',
          }}
        >
          {displayMonth} Updates
        </div>
      </div>

      {/* Member status grid */}
      <div className="card" style={{ padding: '20px 22px', marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
          <h3 style={{ fontSize: 14, fontWeight: 700, color: 'var(--navy)' }}>Submission Status</h3>
          {!loading && (
            <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>
              {submittedCount}/{MEMBERS.length} submitted
            </span>
          )}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
          {MEMBERS.map((member) => {
            const submitted = memberStatuses[member]
            const color = MEMBER_COLORS[member]
            return (
              <div
                key={member}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '10px 12px',
                  borderRadius: 8,
                  background: submitted ? `${color}12` : '#f8fafc',
                  border: `1.5px solid ${submitted ? color + '44' : 'var(--border-light)'}`,
                  transition: 'all 0.2s',
                }}
              >
                <div
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    background: submitted ? color : '#d1d5db',
                    flexShrink: 0,
                  }}
                />
                <span
                  style={{
                    fontSize: 14,
                    fontWeight: submitted ? 700 : 400,
                    color: submitted ? color : 'var(--text-muted)',
                  }}
                >
                  {member}
                </span>
                {submitted && (
                  <span style={{ marginLeft: 'auto', fontSize: 13 }}>✓</span>
                )}
              </div>
            )
          })}
        </div>

        {/* Progress bar */}
        {!loading && (
          <div style={{ marginTop: 14 }}>
            <div style={{ height: 4, background: 'var(--border-light)', borderRadius: 2, overflow: 'hidden' }}>
              <div
                style={{
                  height: '100%',
                  width: `${(submittedCount / MEMBERS.length) * 100}%`,
                  background: 'linear-gradient(90deg, var(--navy), var(--navy-muted))',
                  borderRadius: 2,
                  transition: 'width 0.6s ease',
                }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Member picker (inline) */}
      {pickingMember ? (
        <div className="card" style={{ padding: '20px 22px', marginBottom: 16 }}>
          <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--navy)', marginBottom: 14, textAlign: 'center' }}>
            Who are you?
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
            {MEMBERS.map((member) => {
              const color = MEMBER_COLORS[member]
              return (
                <button
                  key={member}
                  onClick={() => onStartUpdate(member)}
                  style={{
                    background: 'white',
                    border: `2px solid ${color}44`,
                    borderRadius: 10,
                    padding: '14px 10px',
                    fontSize: 15,
                    fontWeight: 700,
                    color: color,
                    cursor: 'pointer',
                    transition: 'all 0.15s',
                  }}
                  onMouseEnter={(e) => {
                    ;(e.target as HTMLButtonElement).style.background = `${color}12`
                    ;(e.target as HTMLButtonElement).style.borderColor = color
                  }}
                  onMouseLeave={(e) => {
                    ;(e.target as HTMLButtonElement).style.background = 'white'
                    ;(e.target as HTMLButtonElement).style.borderColor = `${color}44`
                  }}
                >
                  {member}
                </button>
              )
            })}
          </div>
          <button
            onClick={() => setPickingMember(false)}
            style={{
              marginTop: 14,
              width: '100%',
              background: 'none',
              border: 'none',
              color: 'var(--text-muted)',
              fontSize: 13,
              cursor: 'pointer',
              padding: '6px',
            }}
          >
            Cancel
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <button
            className="btn-primary"
            style={{ width: '100%', justifyContent: 'center', padding: '16px' }}
            onClick={() => setPickingMember(true)}
          >
            ✏️ &nbsp;My Update
          </button>
          <button
            onClick={onViewForum}
            style={{
              width: '100%',
              padding: '16px',
              background: 'white',
              border: '2px solid var(--navy)',
              borderRadius: 10,
              fontSize: 15,
              fontWeight: 700,
              color: 'var(--navy)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
            }}
          >
            👥 &nbsp;View Forum Updates
          </button>
        </div>
      )}

      {/* Forum principles */}
      <div
        style={{
          marginTop: 28,
          background: 'var(--gold-pale)',
          border: '1px solid #f3d87a',
          borderRadius: 10,
          padding: '14px 18px',
          fontSize: 13,
          color: '#78500a',
          lineHeight: 1.6,
          textAlign: 'center',
        }}
      >
        🔒 Everything shared here is strictly confidential among Forum 11 members.
      </div>
    </div>
  )
}
