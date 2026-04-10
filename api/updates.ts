import type { VercelRequest, VercelResponse } from '@vercel/node'

const GITHUB_TOKEN = process.env.GITHUB_TOKEN ?? ''
const GIST_ID = process.env.GIST_ID ?? ''
const GITHUB_HEADERS = {
  Authorization: `Bearer ${GITHUB_TOKEN}`,
  Accept: 'application/vnd.github+json',
  'Content-Type': 'application/json',
  'User-Agent': 'ypo-forum-app',
}
const MEMBERS = ['Chris', 'Tony', 'Julian', 'Eric', 'Mike', 'Ethan']

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
    const { meetingId, member } = req.query

    if (req.method === 'GET') {
      if (!meetingId) return res.status(400).json({ error: 'meetingId required' })
      const data = await readGist()
      const updates = data.updates ?? {}

      if (member) {
        const u = updates[`${member}:${meetingId}`]
        if (!u) return res.status(404).json({ error: 'not found' })
        return res.json(u)
      } else {
        return res.json({
          meetingId,
          members: MEMBERS.map(m => {
            const u = updates[`${m}:${meetingId}`]
            return u ? { member: m, hasUpdate: true, ...u } : { member: m, hasUpdate: false }
          }),
        })
      }
    }

    if (req.method === 'POST') {
      const body = req.body as { member: string; meetingId: string; displayDate: string; location: string; data: unknown }
      if (!body.member || !body.meetingId || !MEMBERS.includes(body.member)) {
        return res.status(400).json({ error: 'invalid member or missing meetingId' })
      }
      const gistData = await readGist()
      if (!gistData.updates) gistData.updates = {}
      gistData.updates[`${body.member}:${body.meetingId}`] = { ...body, submittedAt: new Date().toISOString() }
      await writeGist(gistData)
      return res.status(201).json({ success: true })
    }

    return res.status(405).json({ error: 'method not allowed' })
  } catch (err) {
    console.error('updates error:', err)
    return res.status(500).json({ error: String(err) })
  }
}
