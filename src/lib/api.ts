import type { FormState } from '../App'

export const MEMBERS = ['Chris', 'Tony', 'Julian', 'Eric', 'Mike', 'Ethan'] as const
export type MemberName = (typeof MEMBERS)[number]

export interface ForumUpdateRecord {
  member: string
  yearMonth: string
  month: string
  submittedAt: string
  data: FormState
  hasUpdate: boolean
}

export interface MonthResponse {
  yearMonth: string
  members: ForumUpdateRecord[]
}

export function toYearMonth(dateStr: string): string {
  const months = [
    'January','February','March','April','May','June',
    'July','August','September','October','November','December'
  ]
  const parts = dateStr.trim().split(' ')
  if (parts.length !== 2) return new Date().toISOString().slice(0, 7)
  const [month, year] = parts
  const idx = months.indexOf(month)
  if (idx === -1) return new Date().toISOString().slice(0, 7)
  return `${year}-${String(idx + 1).padStart(2, '0')}`
}

export function fromYearMonth(ym: string): string {
  const months = [
    'January','February','March','April','May','June',
    'July','August','September','October','November','December'
  ]
  const [year, month] = ym.split('-')
  return `${months[parseInt(month) - 1]} ${year}`
}

export function currentYearMonth(): string {
  return new Date().toISOString().slice(0, 7)
}

export async function getMonthUpdates(yearMonth: string): Promise<MonthResponse | null> {
  try {
    const resp = await fetch(`/api/updates?month=${yearMonth}`)
    if (!resp.ok) return null
    return resp.json()
  } catch {
    return null
  }
}

export async function getMemberUpdate(member: string, yearMonth: string): Promise<ForumUpdateRecord | null> {
  try {
    const resp = await fetch(`/api/updates?month=${yearMonth}&member=${encodeURIComponent(member)}`)
    if (!resp.ok) return null
    return resp.json()
  } catch {
    return null
  }
}

export async function saveUpdate(payload: {
  member: string
  yearMonth: string
  month: string
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
