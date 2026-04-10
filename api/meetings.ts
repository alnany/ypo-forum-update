import type { VercelRequest, VercelResponse } from '@vercel/node'

const GITHUB_TOKEN = process.env.GITHUB_TOKEN ?? ''
const GIST_ID = process.env.GIST_ID ?? ''
const GITHUB_HEADERS = {
  Authorization: `Bearer ${GITHUB_TOKEN}`,
  Accept: 'application/vnd.github+json',
  'Content-Type': 'application/json',
  'User-Agent': 'ypo-forum-app',
}

function formatDate(dateStr: string): string {
  const [year, month, day] = dateStr.split('-').map(Number)
  const months = ['January','February','March','April','May','June','July','August','September','October','November','December']
  return `${months[month - 1]} ${day}, ${year}`
}

async function readGist() {
  const resp = await fetch(`https://api.github.com/gists/${GIST_ID}`, { headers: GITHUB_HEADERS })
  if (!resp.ok) throw new Error(`Gist read failed: ${resp.status} ${await resp.text()}`)
  const gist = await resp.json() as { files: Record<string, { content?: string; raw_url?: string }> }
  const file = gist.files['meetings.json']
  if (!file) return { meetings: [], updates: {} }
  let content = file.content
  if (!content && file.raw_url) {
    content = await fetch(file.raw_url).then(r => r.text())
  }
  try { return JSON.parse(content ?? '{}') } catch { return { meetings: [], updates: {} } }
}

async function writeGist(data: object) {
  const resp = await fetch(`https://api.github.com/gists/${GIST_ID}`, {
    method: 'PATCH',
    headers: GITHUB_HEADERS,
    body: JSON.stringify({ files: { 'meetings.json': { content: JSON.stringify(data, null, 2) } } }),
  })
  if (!resp.ok) throw new Error(`Gist write failed: ${resp.status} ${await resp.text()}`)
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  if (req.method === 'OPTIONS') return res.status(200).end()

  try {
    if (req.method === 'GET') {
      const data = await readGist()
      const meetings = (data.meetings || []).sort((a: { date: string }, b: { date: string }) => b.date > a.date ? 1 : -1)
      return res.json(meetings)
    }

    if (req.method === 'POST') {
      const { date, location } = req.body as { date: string; location: string }
      if (!date || !location) return res.status(400).json({ error: 'date and location required' })
      const data = await readGist()
      const existing = (data.meetings || []).find((m: { id: string }) => m.id === date)
      if (existing) return res.status(201).json(existing)
      const meeting = { id: date, date, displayDate: formatDate(date), location: location.trim(), createdAt: new Date().toISOString() }
      data.meetings = [...(data.meetings || []), meeting]
      if (!data.updates) data.updates = {}
      await writeGist(data)
      return res.status(201).json(meeting)
    }

    return res.status(405).json({ error: 'method not allowed' })
  } catch (err) {
    console.error('meetings error:', err)
    return res.status(500).json({ error: String(err) })
  }
}
