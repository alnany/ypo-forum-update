import type { FormState } from '../App'

export const MEMBERS = ['Chris', 'Tony', 'Julian', 'Eric', 'Mike', 'Ethan'] as const
export type MemberName = (typeof MEMBERS)[number]

export interface Meeting {
  id: string          // "2026-04-10"
  date: string        // "2026-04-10"
  displayDate: string // "April 10, 2026"
  location: string
  createdAt: string
}

export interface ForumUpdateRecord {
  member: string
  meetingId: string
  displayDate: string
  location: string
  submittedAt: string
  data: FormState
  hasUpdate: boolean
}

export interface MeetingUpdatesResponse {
  meetingId: string
  members: ForumUpdateRecord[]
}

// ── Meetings ────────────────────────────────────────────────────────────────

export async function getMeetings(): Promise<Meeting[]> {
  try {
    const resp = await fetch('/api/meetings')
    if (!resp.ok) return []
    return resp.json()
  } catch {
    return []
  }
}

export async function createMeeting(date: string, location: string): Promise<Meeting | null> {
  try {
    const resp = await fetch('/api/meetings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ date, location }),
    })
    if (!resp.ok) return null
    return resp.json()
  } catch {
    return null
  }
}

// ── Updates ─────────────────────────────────────────────────────────────────

export async function getMeetingUpdates(meetingId: string): Promise<MeetingUpdatesResponse | null> {
  try {
    const resp = await fetch(`/api/updates?meetingId=${encodeURIComponent(meetingId)}`)
    if (!resp.ok) return null
    return resp.json()
  } catch {
    return null
  }
}

export async function getMemberUpdate(member: string, meetingId: string): Promise<ForumUpdateRecord | null> {
  try {
    const resp = await fetch(
      `/api/updates?meetingId=${encodeURIComponent(meetingId)}&member=${encodeURIComponent(member)}`
    )
    if (!resp.ok) return null
    return resp.json()
  } catch {
    return null
  }
}

export async function saveUpdate(payload: {
  member: string
  meetingId: string
  displayDate: string
  location: string
  data: FormState
}): Promise<boolean> {
  try {
    const resp = await fetch('/api/updates', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    return resp.ok
  } catch {
    return false
  }
}
