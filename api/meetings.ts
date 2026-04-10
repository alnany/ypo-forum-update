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

interface AppData {
  meetings: Meeting[]
  updates: Record<string, unknown>
}
interface Meeting {
  id: string; date: string; displayDate: string; location: string; createdAt: string
}

function formatDate(d: string): string {
  const [y, m, day] = d.split('-').map(Number)
  const months = ['January','February','March','April','May','June','July','August','September','October','November','December']
  return `${months[m - 1]} ${day}, ${y}`
}

async function readData(): Promise<{ data: AppData; sha: string }> {
  const resp = await fetch(`https://api.github.com/repos/${OWNER}/${REPO}/contents/${FILE}`, { headers: GH })
  if (resp.status === 404) return { data: { meetings: [], updates: {} }, sha: '' }
  if (!resp.ok) throw new Error(`Read failed: ${resp.status} ${await resp.text()}`)
  const file = await resp.json() as { content: string; sha: string }
  const text = Buffer.from(file.content, 'base64').toString('utf-8')
  try { return { data: JSON.parse(text), sha: file.sha } }
  catch { return { data: { meetings: [], updates: {} }, sha: file.sha } }
}

async function writeData(data: AppData, sha: string): Promise<void> {
  const content = Buffer.from(JSON.stringify(data, null, 2)).toString('base64')
  const body: Record<string, string> = { message: 'chore: update meetings data', content, branch: 'main' }
  if (sha) body.sha = sha
  const resp = await fetch(`https://api.github.com/repos/${OWNER}/${REPO}/contents/${FILE}`, {
    method: 'PUT', headers: GH, body: JSON.stringify(body),
  })
  if (!resp.ok) throw new Error(`Write failed: ${resp.status} ${await resp.text()}`)
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  if (req.method === 'OPTIONS') return res.status(200).end()

  try {
    if (req.method === 'GET') {
      const { data } = await readData()
      const sorted = (data.meetings || []).sort((a, b) => b.date > a.date ? 1 : -1)
      return res.json(sorted)
    }

    if (req.method === 'POST') {
      const { date, location } = req.body as { date: string; location: string }
      if (!date || !location) return res.status(400).json({ error: 'date and location required' })
      const { data, sha } = await readData()
      const existing = (data.meetings || []).find((m) => m.id === date)
      if (existing) return res.status(201).json(existing)
      const meeting: Meeting = { id: date, date, displayDate: formatDate(date), location: location.trim(), createdAt: new Date().toISOString() }
      data.meetings = [...(data.meetings || []), meeting]
      if (!data.updates) data.updates = {}
      await writeData(data, sha)
      return res.status(201).json(meeting)
    }

    if (req.method === 'DELETE') {
      const { id, password } = req.body as { id: string; password: string }
      if (!id) return res.status(400).json({ error: 'id required' })
      if (password !== 'eiffeltower') return res.status(403).json({ error: 'incorrect password' })
      const { data, sha } = await readData()
      const exists = (data.meetings || []).some((m) => m.id === id)
      if (!exists) return res.status(404).json({ error: 'meeting not found' })
      // Remove meeting and all associated updates
      data.meetings = (data.meetings || []).filter((m) => m.id !== id)
      if (data.updates) {
        for (const key of Object.keys(data.updates)) {
          if (key.endsWith(`:${id}`)) delete data.updates[key]
        }
      }
      await writeData(data, sha)
      return res.json({ success: true })
    }

    return res.status(405).json({ error: 'method not allowed' })
  } catch (err) {
    console.error('meetings error:', err)
    return res.status(500).json({ error: String(err) })
  }
}
