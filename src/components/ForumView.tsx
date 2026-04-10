import { useState, useEffect } from 'react'
import { MEMBERS, getMonthUpdates, fromYearMonth } from '../lib/api'
import type { ForumUpdateRecord } from '../lib/api'
import Summary from './Summary'
import type { FormState } from '../App'

const MEMBER_COLORS: Record<string, string> = {
  Chris: '#1a3660',
  Tony: '#065f46',
  Julian: '#5b21b6',
  Eric: '#b45309',
  Mike: '#9d174d',
  Ethan: '#1e40af',
}

function prevMonth(ym: string): string {
  const [y, m] = ym.split('-').map(Number)
  const d = new Date(y, m - 2, 1)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

function nextMonth(ym: string): string {
  const [y, m] = ym.split('-').map(Number)
  const d = new Date(y, m, 1)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

interface Props {
  initialYearMonth: string
  onBack: () => void
}

export default function ForumView({ initialYearMonth, onBack }: Props) {
  const [yearMonth, setYearMonth] = useState(initialYearMonth)
  const [memberData, setMemberData] = useState<ForumUpdateRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState<string | null>(null)

  useEffect(() => {
    setLoading(true)
    setExpanded(null)
    getMonthUpdates(yearMonth).then((data) => {
      if (data) setMemberData(data.members)
      setLoading(false)
    })
  }, [yearMonth])

  const expandedRecord = expanded ? memberData.find((m) => m.member === expanded) : null

  if (expandedRecord?.hasUpdate && expandedRecord.data) {
    return (
      <div>
        <div
          style={{
            background: 'var(--navy)',
            padding: '12px 20px',
            display: 'flex',
            alignItems: 'center',
            gap: 12,
          }}
        >
          <button
            onClick={() => setExpanded(null)}
            style={{
              background: 'rgba(255,255,255,0.15)',
              border: 'none',
              color: 'white',
              borderRadius: 8,
              padding: '6px 14px',
              fontSize: 14,
              cursor: 'pointer',
              fontWeight: 600,
            }}
          >
            ← Back
          </button>
          <span style={{ color: 'white', fontSize: 15, fontWeight: 700 }}>
            {expanded}'s Update — {fromYearMonth(yearMonth)}
          </span>
        </div>
        <Summary
          form={expandedRecord.data as FormState}
          onBack={() => setExpanded(null)}
          onRestart={() => setExpanded(null)}
          readOnly
        />
      </div>
    )
  }

  return (
    <div className="animate-in" style={{ maxWidth: 600, margin: '0 auto', padding: '24px 24px 60px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
        <button
          onClick={onBack}
          style={{
            background: '#f1f5f9',
            border: 'none',
            borderRadius: 8,
            padding: '8px 14px',
            fontSize: 14,
            cursor: 'pointer',
            color: 'var(--navy)',
            fontWeight: 600,
          }}
        >
          ← Home
        </button>
        <h2 style={{ fontSize: 18, fontWeight: 800, color: 'var(--navy)', flex: 1 }}>
          Forum Updates
        </h2>
      </div>

      {/* Month navigation */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'white',
          borderRadius: 10,
          border: '1px solid var(--border-light)',
          padding: '10px 16px',
          marginBottom: 22,
        }}
      >
        <button
          onClick={() => setYearMonth(prevMonth(yearMonth))}
          style={{ background: 'none', border: 'none', fontSize: 18, cursor: 'pointer', color: 'var(--navy)', padding: '4px 8px' }}
        >
          ‹
        </button>
        <span style={{ fontSize: 16, fontWeight: 700, color: 'var(--navy)' }}>
          {fromYearMonth(yearMonth)}
        </span>
        <button
          onClick={() => setYearMonth(nextMonth(yearMonth))}
          style={{ background: 'none', border: 'none', fontSize: 18, cursor: 'pointer', color: 'var(--navy)', padding: '4px 8px' }}
        >
          ›
        </button>
      </div>

      {/* Member grid */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)', fontSize: 14 }}>
          Loading...
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
          {MEMBERS.map((member) => {
            const record = memberData.find((m) => m.member === member)
            const submitted = record?.hasUpdate ?? false
            const color = MEMBER_COLORS[member]
            const submittedDate = submitted && record?.submittedAt
              ? new Date(record.submittedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
              : null

            return (
              <div
                key={member}
                onClick={() => submitted && setExpanded(member)}
                style={{
                  borderRadius: 12,
                  border: `2px solid ${submitted ? color + '55' : 'var(--border-light)'}`,
                  background: submitted ? `${color}08` : '#f9fafb',
                  padding: '18px 20px',
                  cursor: submitted ? 'pointer' : 'default',
                  transition: 'all 0.15s',
                  opacity: submitted ? 1 : 0.6,
                }}
              >
                {/* Avatar */}
                <div
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: '50%',
                    background: submitted ? color : '#d1d5db',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontWeight: 800,
                    fontSize: 18,
                    marginBottom: 10,
                  }}
                >
                  {member[0]}
                </div>
                <div style={{ fontSize: 16, fontWeight: 700, color: submitted ? color : 'var(--text-muted)', marginBottom: 4 }}>
                  {member}
                </div>
                {submitted ? (
                  <div style={{ fontSize: 12, color: color, fontWeight: 600 }}>
                    ✓ Submitted {submittedDate ? `· ${submittedDate}` : ''}
                  </div>
                ) : (
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                    Not yet submitted
                  </div>
                )}
                {submitted && (
                  <div
                    style={{
                      marginTop: 10,
                      fontSize: 12,
                      color: color,
                      fontWeight: 600,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4,
                    }}
                  >
                    Read update →
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
