import type { VercelRequest, VercelResponse } from '@vercel/node'

const GITHUB_TOKEN = process.env.GITHUB_TOKEN ?? ''
const OWNER = 'alnany'
const REPO = 'ypo-forum-update'
const FILE = 'data/meetings.json'
const GH = {
  Authorization: `Bearer ${GITHUB_TOKEN}`,
  Accept: 'application/vnd.github+json',
  'Content-Type': 'application/json',
  'User-Agent': 'ypo-forum-app',
}

interface FormData {
  groupLearning?: string
  explore?: string
}

interface MemberUpdate {
  member: string
  meetingId: string
  displayDate?: string
  data?: FormData
}

interface AppData {
  meetings: unknown[]
  updates: Record<string, MemberUpdate>
  parkingLotState?: Record<string, { checked: boolean; deleted: boolean }>
}

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

/** Deterministic, collision-resistant ID stable across sessions */
function makeItemId(member: string, meetingId: string, source: string, text: string): string {
  const s = `${member}|${meetingId}|${source}|${text.trim()}`
  let h = 0
  for (let i = 0; i < s.length; i++) {
    h = Math.imul(31, h) + s.charCodeAt(i) | 0
  }
  return `pl_${(h >>> 0).toString(16)}`
}

async function readData(): Promise<{ data: AppData; sha: string }> {
  const resp = await fetch(`https://api.github.com/repos/${OWNER}/${REPO}/contents/${FILE}`, { headers: GH })
  if (resp.status === 404) return { data: { meetings: [], updates: {} }, sha: '' }
  if (!resp.ok) throw new Error(`Read failed: ${resp.status} ${await resp.text()}`)
  const file = await resp.json() as { content: string; sha: string }
  const text = Buffer.from(file.content, 'base64').toString('utf-8')
  try { return { data: JSON.parse(text) as AppData, sha: file.sha } }
  catch { return { data: { meetings: [], updates: {} }, sha: file.sha } }
}

async function writeData(data: AppData, sha: string): Promise<void> {
  const content = Buffer.from(JSON.stringify(data, null, 2)).toString('base64')
  const body: Record<string, string> = { message: 'chore: update parking lot state', content, branch: 'main' }
  if (sha) body.sha = sha
  const resp = await fetch(`https://api.github.com/repos/${OWNER}/${REPO}/contents/${FILE}`, {
    method: 'PUT', headers: GH, body: JSON.stringify(body),
  })
  if (!resp.ok) throw new Error(`Write failed: ${resp.status} ${await resp.text()}`)
}

function extractItems(data: AppData): ParkingLotItem[] {
  const state = data.parkingLotState ?? {}
  const items: ParkingLotItem[] = []

  for (const [key, update] of Object.entries(data.updates ?? {})) {
    const colonIdx = key.lastIndexOf(':')
    const member = key.slice(0, colonIdx)
    const meetingId = key.slice(colonIdx + 1)
    const formData = update.data ?? {}
    const displayDate = update.displayDate ?? meetingId

    const sources: Array<'groupLearning' | 'explore'> = ['groupLearning', 'explore']
    for (const source of sources) {
      const raw = formData[source] ?? ''
      const lines = raw.split('\n').map((l) => l.trim()).filter((l) => l.length > 0)
      for (const line of lines) {
        const id = makeItemId(member, meetingId, source, line)
        const s = state[id] ?? {}
        items.push({
          id,
          text: line,
          member,
          meetingId,
          displayDate,
          source,
          checked: s.checked ?? false,
          deleted: s.deleted ?? false,
        })
      }
    }
  }

  // Unchecked first, then checked; within each group alphabetical by member
  return items.sort((a, b) => {
    if (a.checked !== b.checked) return a.checked ? 1 : -1
    return a.member.localeCompare(b.member)
  })
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, PATCH, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  if (req.method === 'OPTIONS') return res.status(200).end()

  try {
    if (req.method === 'GET') {
      const { data } = await readData()
      return res.json(extractItems(data))
    }

    if (req.method === 'PATCH') {
      const { id, checked, deleted } = req.body as { id: string; checked?: boolean; deleted?: boolean }
      if (!id) return res.status(400).json({ error: 'id required' })
      const { data, sha } = await readData()
      if (!data.parkingLotState) data.parkingLotState = {}
      const current = data.parkingLotState[id] ?? { checked: false, deleted: false }
      data.parkingLotState[id] = {
        checked: checked !== undefined ? checked : current.checked,
        deleted: deleted !== undefined ? deleted : current.deleted,
      }
      await writeData(data, sha)
      return res.json({ success: true })
    }

    return res.status(405).json({ error: 'method not allowed' })
  } catch (err) {
    console.error('parking-lot error:', err)
    return res.status(500).json({ error: String(err) })
  }
}
