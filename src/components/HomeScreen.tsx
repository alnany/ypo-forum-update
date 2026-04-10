import { useState, useEffect } from 'react'
import {
  MEMBERS,
  getMeetings,
  createMeeting,
  getMeetingUpdates,
  deleteMeeting,
} from '../lib/api'
import type { Meeting, MemberName, ForumUpdateRecord } from '../lib/api'

const MEMBER_COLORS: Record<string, string> = {
  Chris: '#1a3660',
  Tony: '#065f46',
  Julian: '#5b21b6',
  Eric: '#b45309',
  Mike: '#9d174d',
  Ethan: '#1e40af',
}

// ── Meeting Card ─────────────────────────────────────────────────────────────

function MeetingCard({
  meeting,
  onMyUpdate,
  onView,
  onDeleted,
}: {
  meeting: Meeting
  onMyUpdate: (meeting: Meeting, member: MemberName) => void
  onView: (meeting: Meeting) => void
  onDeleted: (id: string) => void
}) {
  const [memberStatuses, setMemberStatuses] = useState<Record<string, boolean>>({})
  const [loadingStatus, setLoadingStatus] = useState(true)
  const [pickingMember, setPickingMember] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deletePassword, setDeletePassword] = useState('')
  const [deleteError, setDeleteError] = useState('')
  const [deleting, setDeleting] = useState(false)

  const handleDelete = async () => {
    setDeleting(true)
    setDeleteError('')
    const result = await deleteMeeting(meeting.id, deletePassword)
    setDeleting(false)
    if (result.ok) {
      setShowDeleteModal(false)
      onDeleted(meeting.id)
    } else {
      setDeleteError(result.error ?? 'Delete failed.')
      setDeletePassword('')
    }
  }

  useEffect(() => {
    getMeetingUpdates(meeting.id).then((data) => {
      if (data) {
        const s: Record<string, boolean> = {}
        data.members.forEach((m: ForumUpdateRecord) => { s[m.member] = m.hasUpdate })
        setMemberStatuses(s)
      }
      setLoadingStatus(false)
    })
  }, [meeting.id])

  const count = Object.values(memberStatuses).filter(Boolean).length

  return (
      {showDeleteModal && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1000, padding: '0 24px',
        }}>
          <div className="card" style={{ padding: '24px', width: '100%', maxWidth: 360 }}>
            <h3 style={{ fontSize: 15, fontWeight: 800, color: 'var(--navy)', marginBottom: 6 }}>
              🗑️ Delete Meeting
            </h3>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 16 }}>
              Enter the admin password to delete <strong>{meeting.displayDate}</strong> and all its updates.
            </p>
            <input
              type="password"
              placeholder="Password"
              value={deletePassword}
              autoFocus
              onChange={(e) => setDeletePassword(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleDelete()}
              style={{ width: '100%', marginBottom: 10 }}
            />
            {deleteError && (
              <div style={{ color: '#b91c1c', fontSize: 13, marginBottom: 10 }}>{deleteError}</div>
            )}
            <div style={{ display: 'flex', gap: 10 }}>
              <button
                className="btn-secondary"
                style={{ flex: 1, justifyContent: 'center' }}
                onClick={() => { setShowDeleteModal(false); setDeletePassword(''); setDeleteError('') }}
                disabled={deleting}
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting || !deletePassword}
                style={{
                  flex: 1, padding: '11px 14px', background: deleting ? '#fca5a5' : '#dc2626',
                  border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 700,
                  color: 'white', cursor: deleting ? 'not-allowed' : 'pointer',
                }}
              >
                {deleting ? 'Deleting…' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Meeting header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 14 }}>
        <div>
          <div style={{ fontSize: 17, fontWeight: 800, color: 'var(--navy)', marginBottom: 3 }}>
            {meeting.displayDate}
          </div>
          <div style={{ fontSize: 13, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 5 }}>
            <span>📍</span>
            <span>{meeting.location}</span>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {!loadingStatus && (
            <div
              style={{
                background: count === MEMBERS.length ? '#d1fae5' : 'var(--gold-pale)',
                border: `1px solid ${count === MEMBERS.length ? '#6ee7b7' : '#f3d87a'}`,
                borderRadius: 20,
                padding: '3px 10px',
                fontSize: 12,
                fontWeight: 700,
                color: count === MEMBERS.length ? '#065f46' : '#78500a',
                whiteSpace: 'nowrap',
              }}
            >
              {count}/{MEMBERS.length} submitted
            </div>
          )}
          <button
            onClick={() => setShowDeleteModal(true)}
            title="Delete meeting"
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: '#94a3b8', fontSize: 16, padding: '2px 4px',
              lineHeight: 1, borderRadius: 4,
              transition: 'color 0.15s',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = '#dc2626')}
            onMouseLeave={(e) => (e.currentTarget.style.color = '#94a3b8')}
          >
            🗑️
          </button>
        </div>
      </div>

      {/* Member status dots */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 14 }}>
        {MEMBERS.map((m) => {
          const submitted = memberStatuses[m]
          const color = MEMBER_COLORS[m]
          return (
            <div
              key={m}
              title={submitted ? `${m} — submitted` : `${m} — pending`}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 5,
                padding: '4px 10px',
                borderRadius: 20,
                background: submitted ? `${color}15` : '#f1f5f9',
                border: `1px solid ${submitted ? color + '44' : '#e2e8f0'}`,
                fontSize: 12,
                fontWeight: submitted ? 700 : 400,
                color: submitted ? color : '#94a3b8',
                transition: 'all 0.2s',
              }}
            >
              <span
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: '50%',
                  background: submitted ? color : '#cbd5e1',
                  display: 'inline-block',
                  flexShrink: 0,
                }}
              />
              {m}
            </div>
          )
        })}
      </div>

      {/* Progress bar */}
      {!loadingStatus && (
        <div style={{ height: 3, background: '#e2e8f0', borderRadius: 2, overflow: 'hidden', marginBottom: 16 }}>
          <div
            style={{
              height: '100%',
              width: `${(count / MEMBERS.length) * 100}%`,
              background: count === MEMBERS.length
                ? 'linear-gradient(90deg, #059669, #34d399)'
                : 'linear-gradient(90deg, var(--navy), var(--navy-muted))',
              borderRadius: 2,
              transition: 'width 0.6s ease',
            }}
          />
        </div>
      )}

      {/* Action buttons */}
      {pickingMember ? (
        <div>
          <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--navy)', marginBottom: 10, textAlign: 'center' }}>
            Who are you?
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginBottom: 8 }}>
            {MEMBERS.map((member) => {
              const color = MEMBER_COLORS[member]
              const alreadySubmitted = memberStatuses[member]
              return (
                <button
                  key={member}
                  onClick={() => onMyUpdate(meeting, member)}
                  style={{
                    background: 'white',
                    border: `2px solid ${color}44`,
                    borderRadius: 8,
                    padding: '10px 6px',
                    fontSize: 13,
                    fontWeight: 700,
                    color: color,
                    cursor: 'pointer',
                    position: 'relative',
                  }}
                >
                  {member}
                  {alreadySubmitted && (
                    <span
                      style={{
                        position: 'absolute',
                        top: 3,
                        right: 5,
                        fontSize: 10,
                        color: color,
                        opacity: 0.7,
                      }}
                    >
                      ✓
                    </span>
                  )}
                </button>
              )
            })}
          </div>
          <button
            onClick={() => setPickingMember(false)}
            style={{ width: '100%', background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: 12, cursor: 'pointer', padding: '4px' }}
          >
            Cancel
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', gap: 10 }}>
          <button
            className="btn-primary"
            style={{ flex: 1, justifyContent: 'center', padding: '11px 14px', fontSize: 14 }}
            onClick={() => setPickingMember(true)}
          >
            ✏️ My Update
          </button>
          <button
            onClick={() => onView(meeting)}
            style={{
              flex: 1,
              padding: '11px 14px',
              background: 'white',
              border: '2px solid var(--navy)',
              borderRadius: 8,
              fontSize: 14,
              fontWeight: 700,
              color: 'var(--navy)',
              cursor: 'pointer',
            }}
          >
            👥 View Updates
          </button>
        </div>
      )}
    </div>
  )
}

// ── New Meeting Form ──────────────────────────────────────────────────────────

function NewMeetingForm({
  onCreated,
  onCancel,
}: {
  onCreated: (meeting: Meeting) => void
  onCancel: () => void
}) {
  const [date, setDate] = useState('')
  const [location, setLocation] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const handleCreate = async () => {
    if (!date || !location.trim()) {
      setError('Both date and location are required.')
      return
    }
    setSaving(true)
    const meeting = await createMeeting(date, location.trim())
    setSaving(false)
    if (meeting) {
      onCreated(meeting)
    } else {
      setError('Failed to create meeting. Please try again.')
    }
  }

  return (
    <div
      className="card"
      style={{
        padding: '22px 24px',
        marginBottom: 20,
        border: '2px solid var(--navy)',
        background: '#f8fafc',
      }}
    >
      <h3 style={{ fontSize: 15, fontWeight: 800, color: 'var(--navy)', marginBottom: 16 }}>
        📅 New Forum Meeting
      </h3>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 16 }}>
        <div>
          <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Meeting Date
          </label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            style={{ width: '100%' }}
          />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Location
          </label>
          <input
            type="text"
            placeholder="e.g. Bangkok, Thailand"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
          />
        </div>
      </div>

      {error && (
        <div style={{ color: '#b91c1c', fontSize: 13, marginBottom: 12 }}>{error}</div>
      )}

      <div style={{ display: 'flex', gap: 10 }}>
        <button className="btn-secondary" onClick={onCancel} style={{ flex: 1, justifyContent: 'center' }}>
          Cancel
        </button>
        <button
          className="btn-primary"
          style={{ flex: 2, justifyContent: 'center' }}
          onClick={handleCreate}
          disabled={saving}
        >
          {saving ? 'Creating…' : 'Create Meeting'}
        </button>
      </div>
    </div>
  )
}

// ── HomeScreen ────────────────────────────────────────────────────────────────

interface Props {
  onStartUpdate: (meeting: Meeting, member: MemberName) => void
  onViewForum: (meeting: Meeting) => void
}

export default function HomeScreen({ onStartUpdate, onViewForum }: Props) {
  const [meetings, setMeetings] = useState<Meeting[]>([])
  const [loading, setLoading] = useState(true)
  const [showNewForm, setShowNewForm] = useState(false)

  useEffect(() => {
    getMeetings().then((data) => {
      setMeetings(data)
      setLoading(false)
    })
  }, [])

  const handleMeetingCreated = (meeting: Meeting) => {
    setMeetings((prev) => [meeting, ...prev])
    setShowNewForm(false)
  }

  const handleMeetingDeleted = (id: string) => {
    setMeetings((prev) => prev.filter((m) => m.id !== id))
  }

  return (
    <div className="animate-in" style={{ maxWidth: 560, margin: '0 auto', padding: '28px 24px 60px' }}>
      {/* Title */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 22 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: 'var(--navy)', marginBottom: 2 }}>Forum 11</h1>
          <p style={{ fontSize: 14, color: 'var(--text-muted)' }}>Monthly Revelation</p>
        </div>
        {!showNewForm && (
          <button
            className="btn-primary"
            style={{ fontSize: 13, padding: '10px 16px' }}
            onClick={() => setShowNewForm(true)}
          >
            + New Meeting
          </button>
        )}
      </div>

      {/* New meeting form */}
      {showNewForm && (
        <NewMeetingForm onCreated={handleMeetingCreated} onCancel={() => setShowNewForm(false)} />
      )}

      {/* Meetings list */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '48px 0', color: 'var(--text-muted)', fontSize: 14 }}>
          Loading meetings…
        </div>
      ) : meetings.length === 0 ? (
        <div
          style={{
            textAlign: 'center',
            padding: '48px 24px',
            border: '2px dashed var(--border)',
            borderRadius: 12,
            color: 'var(--text-muted)',
          }}
        >
          <div style={{ fontSize: 36, marginBottom: 12 }}>📅</div>
          <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 8 }}>No meetings yet</div>
          <div style={{ fontSize: 13 }}>Create your first Forum meeting to get started.</div>
        </div>
      ) : (
        meetings.map((meeting) => (
          <MeetingCard
            key={meeting.id}
            meeting={meeting}
            onMyUpdate={onStartUpdate}
            onView={onViewForum}
            onDeleted={handleMeetingDeleted}
          />
        ))
      )}

      {/* Confidentiality note */}
      <div
        style={{
          marginTop: 24,
          background: 'var(--gold-pale)',
          border: '1px solid #f3d87a',
          borderRadius: 10,
          padding: '12px 16px',
          fontSize: 12,
          color: '#78500a',
          textAlign: 'center',
        }}
      >
        🔒 Everything shared here is strictly confidential among Forum 11 members.
      </div>
    </div>
  )
}
