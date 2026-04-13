import type { FormState } from '../App'

export const MEMBERS = ['Chris', 'Eric', 'Ethan', 'Julian', 'Mike', 'Tony'] as const
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

export async function deleteMeeting(id: string, password: string): Promise<{ ok: boolean; error?: string }> {
  try {
    const resp = await fetch('/api/meetings', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, password }),
    })
    if (resp.status === 403) return { ok: false, error: 'Incorrect password.' }
    if (!resp.ok) return { ok: false, error: 'Failed to delete meeting.' }
    return { ok: true }
  } catch {
    return { ok: false, error: 'Network error.' }
  }
}

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

// ── Parking Lot ─────────────────────────────────────────────────────────────

export interface ParkingLotItem {
  id: string
  text: string
  member: string
  meetingId: string
  displayDate: string
  source: 'groupLearning' | 'explore'
  checked: boolean
  deleted: boolean
}

export async function getParkingLot(): Promise<ParkingLotItem[]> {
  try {
    const resp = await fetch('/api/parking-lot')
    if (!resp.ok) return []
    return resp.json()
  } catch {
    return []
  }
}

export async function updateParkingLotItem(
  id: string,
  patch: { checked?: boolean; deleted?: boolean }
): Promise<boolean> {
  try {
    const resp = await fetch('/api/parking-lot', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, ...patch }),
    })
    return resp.ok
  } catch {
    return false
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
