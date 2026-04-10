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
const MEMBERS = ['Chris', 'Tony', 'Julian', 'Eric', 'Mike', 'Ethan']

interface AppData {
  meetings: unknown[]
  updates: Record<string, unknown>
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
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  if (req.method === 'OPTIONS') return res.status(200).end()

  try {
    const { meetingId, member } = req.query

    if (req.method === 'GET') {
      if (!meetingId) return res.status(400).json({ error: 'meetingId required' })
      const { data } = await readData()
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
            return u ? { member: m, hasUpdate: true, ...(u as object) } : { member: m, hasUpdate: false }
          }),
        })
      }
    }

    if (req.method === 'POST') {
      const body = req.body as { member: string; meetingId: string; displayDate: string; location: string; data: unknown }
      if (!body.member || !body.meetingId || !MEMBERS.includes(body.member)) {
        return res.status(400).json({ error: 'invalid member or missing meetingId' })
      }
      const { data, sha } = await readData()
      if (!data.updates) data.updates = {}
      data.updates[`${body.member}:${body.meetingId}`] = { ...body, submittedAt: new Date().toISOString() }
      await writeData(data, sha)
      return res.status(201).json({ success: true })
    }

    return res.status(405).json({ error: 'method not allowed' })
  } catch (err) {
    console.error('updates error:', err)
    return res.status(500).json({ error: String(err) })\
  }
}
