// Shared GitHub Gist storage helper
// All data lives in one private Gist owned by @alnany

const GITHUB_TOKEN = process.env.GITHUB_TOKEN!
const GIST_ID = process.env.GIST_ID!
const GITHUB_API = 'https://api.github.com'

export interface GistData {
  meetings: Meeting[]
  updates: Record<string, MemberUpdate> // key: "member:meetingId"
}

export interface Meeting {
  id: string        // "2026-04-10"
  date: string      // "2026-04-10"
  displayDate: string // "April 10, 2026"
  location: string
  createdAt: string
}

export interface MemberUpdate {
  member: string
  meetingId: string
  displayDate: string
  location: string
  submittedAt: string
  data: unknown
}

function formatDate(dateStr: string): string {
  const [year, month, day] = dateStr.split('-').map(Number)
  const months = ['January','February','March','April','May','June','July','August','September','October','November','December']
  return `${months[month - 1]} ${day}, ${year}`
}

async function readGist(): Promise<GistData> {
  const resp = await fetch(`${GITHUB_API}/gists/${GIST_ID}`, {
    headers: {
      Authorization: `Bearer ${GITHUB_TOKEN}`,
      Accept: 'application/vnd.github+json',
    },
  })
  if (!resp.ok) throw new Error(`Gist read failed: ${resp.status}`)
  const gist = await resp.json() as {
    files: Record<string, { content?: string; raw_url?: string }>
  }

  const file = gist.files['meetings.json']
  if (!file) return { meetings: [], updates: {} }

  let content = file.content
  if (!content && file.raw_url) {
    const rawResp = await fetch(file.raw_url)
    content = await rawResp.text()
  }
  if (!content) return { meetings: [], updates: {} }

  try {
    return JSON.parse(content) as GistData
  } catch {
    return { meetings: [], updates: {} }
  }
}

async function writeGist(data: GistData): Promise<void> {
  const resp = await fetch(`${GITHUB_API}/gists/${GIST_ID}`, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${GITHUB_TOKEN}`,
      Accept: 'application/vnd.github+json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      files: {
        'meetings.json': {
          content: JSON.stringify(data, null, 2),
        },
      },
    }),
  })
  if (!resp.ok) {
    const err = await resp.text()
    throw new Error(`Gist write failed: ${resp.status} ${err}`)
  }
}

// ── Meetings ─────────────────────────────────────────────────────────────────

export async function getMeetings(): Promise<Meeting[]> {
  const data = await readGist()
  return (data.meetings || []).sort((a, b) => (b.date > a.date ? 1 : -1))
}

export async function createMeeting(date: string, location: string): Promise<Meeting> {
  const data = await readGist()
  const id = date
  if (data.meetings.find((m) => m.id === id)) {
    return data.meetings.find((m) => m.id === id)!
  }
  const meeting: Meeting = {
    id,
    date,
    displayDate: formatDate(date),
    location: location.trim(),
    createdAt: new Date().toISOString(),
  }
  data.meetings = [...(data.meetings || []), meeting]
  if (!data.updates) data.updates = {}
  await writeGist(data)
  return meeting
}

// ── Updates ──────────────────────────────────────────────────────────────────

const MEMBERS = ['Chris', 'Tony', 'Julian', 'Eric', 'Mike', 'Ethan']

export async function getMeetingUpdates(meetingId: string) {
  const data = await readGist()
  const updates = data.updates || {}
  return {
    meetingId,
    members: MEMBERS.map((m) => {
      const key = `${m}:${meetingId}`
      const u = updates[key]
      return u ? { member: m, hasUpdate: true, ...u } : { member: m, hasUpdate: false }
    }),
  }
}

export async function getMemberUpdate(member: string, meetingId: string): Promise<MemberUpdate | null> {
  const data = await readGist()
  return (data.updates || {})[`${member}:${meetingId}`] ?? null
}

export async function saveUpdate(payload: {
  member: string
  meetingId: string
  displayDate: string
  location: string
  data: unknown
}): Promise<void> {
  const gistData = await readGist()
  if (!gistData.updates) gistData.updates = {}
  gistData.updates[`${payload.member}:${payload.meetingId}`] = {
    ...payload,
    submittedAt: new Date().toISOString(),
  }
  await writeGist(gistData)
}
