import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { MEMBERS, getMeetingUpdates } from '../lib/api'
import type { Meeting, ForumUpdateRecord } from '../lib/api'
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

interface Props {
  meeting: Meeting
  onBack: () => void
  onEdit?: (member: string, data: FormState) => void
}

export default function ForumView({ meeting, onBack, onEdit }: Props) {
  const { t } = useTranslation()
  const [memberData, setMemberData] = useState<ForumUpdateRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState<string | null>(null)

  useEffect(() => {
    setLoading(true)
    getMeetingUpdates(meeting.id).then((data) => {
      if (data) setMemberData(data.members)
      setLoading(false)
    })
  }, [meeting.id])

  const expandedRecord = expanded ? memberData.find((m) => m.member === expanded) : null

  // Read / edit full update
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
            {t('forumView.back')}
          </button>
          <div style={{ flex: 1 }}>
            <div style={{ color: 'white', fontSize: 15, fontWeight: 700 }}>
              {t('forumView.memberUpdate', { member: expanded })}
            </div>
            <div style={{ color: 'rgba(255,255,255,0.55)', fontSize: 12 }}>
              {meeting.displayDate} · {meeting.location}
            </div>
          </div>
          {onEdit && (
            <button
              onClick={() => onEdit(expanded!, expandedRecord.data as FormState)}
              style={{
                background: 'rgba(201,168,76,0.25)',
                border: '1px solid rgba(201,168,76,0.6)',
                color: 'var(--gold-light)',
                borderRadius: 8,
                padding: '6px 14px',
                fontSize: 13,
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              ✏️ {t('forumView.edit', 'Edit')}
            </button>
          )}
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
      <div style={{ marginBottom: 22 }}>
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
            marginBottom: 14,
          }}
        >
          {t('forumView.backToMeetings')}
        </button>
        <h2 style={{ fontSize: 20, fontWeight: 800, color: 'var(--navy)', marginBottom: 4 }}>
          {meeting.displayDate}
        </h2>
        <div style={{ fontSize: 14, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 5 }}>
          <span>📍</span>
          <span>{meeting.location}</span>
        </div>
      </div>

      {/* Member grid */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)', fontSize: 14 }}>
          {t('forumView.loading')}
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
          {MEMBERS.map((member) => {
            const record = memberData.find((m) => m.member === member)
            const submitted = record?.hasUpdate ?? false
            const color = MEMBER_COLORS[member]
            const submittedDate =
              submitted && record?.submittedAt
                ? new Date(record.submittedAt).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                  })
                : null

            return (
              <div
                key={member}
                style={{
                  borderRadius: 12,
                  border: `2px solid ${submitted ? color + '55' : 'var(--border-light)'}`,
                  background: submitted ? `${color}08` : '#f9fafb',
                  padding: '18px 20px',
                  transition: 'all 0.15s',
                  opacity: submitted ? 1 : 0.55,
                }}
              >
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
                <div
                  style={{
                    fontSize: 16,
                    fontWeight: 700,
                    color: submitted ? color : 'var(--text-muted)',
                    marginBottom: 4,
                  }}
                >
                  {member}
                </div>
                {submitted ? (
                  <>
                    <div style={{ fontSize: 12, color: color, fontWeight: 600, marginBottom: 10 }}>
                      {t('forumView.submitted')}{submittedDate ? ` · ${submittedDate}` : ''}
                    </div>
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                      <button
                        onClick={() => setExpanded(member)}
                        style={{
                          background: `${color}12`,
                          border: `1px solid ${color}44`,
                          color: color,
                          borderRadius: 6,
                          padding: '5px 10px',
                          fontSize: 12,
                          fontWeight: 600,
                          cursor: 'pointer',
                        }}
                      >
                        {t('forumView.readUpdate')}
                      </button>
                      {onEdit && record?.data && (
                        <button
                          onClick={() => onEdit(member, record.data as FormState)}
                          style={{
                            background: 'transparent',
                            border: `1px solid ${color}44`,
                            color: color,
                            borderRadius: 6,
                            padding: '5px 10px',
                            fontSize: 12,
                            fontWeight: 600,
                            cursor: 'pointer',
                          }}
                        >
                          ✏️ {t('forumView.edit', 'Edit')}
                        </button>
                      )}
                    </div>
                  </>
                ) : (
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{t('forumView.notSubmitted')}</div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
