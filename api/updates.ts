import type { VercelRequest, VercelResponse } from '@vercel/node'
import { kv } from '@vercel/kv'

const MEMBERS = ['Chris', 'Tony', 'Julian', 'Eric', 'Mike', 'Ethan']

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  if (req.method === 'OPTIONS') return res.status(200).end()

  try {
    if (req.method === 'GET') {
      const { meetingId, member } = req.query
      if (!meetingId) return res.status(400).json({ error: 'meetingId required' })

      if (member) {
        const data = await kv.get(`update:${member}:${meetingId}`)
        if (!data) return res.status(404).json({ error: 'not found' })
        return res.json(data)
      } else {
        const results = await Promise.all(
          MEMBERS.map(async (m) => {
            const data = await kv.get<object>(`update:${m}:${meetingId}`)
            return data
              ? { member: m, hasUpdate: true, ...data }
              : { member: m, hasUpdate: false }
          })
        )
        return res.json({ meetingId, members: results })
      }
    }

    if (req.method === 'POST') {
      const body = req.body as {
        member: string
        meetingId: string
        displayDate: string
        location: string
        data: unknown
      }
      if (!body.member || !body.meetingId || !MEMBERS.includes(body.member)) {
        return res.status(400).json({ error: 'invalid member or missing meetingId' })
      }
      const record = { ...body, submittedAt: new Date().toISOString() }
      await kv.set(`update:${body.member}:${body.meetingId}`, record)
      return res.status(201).json({ success: true })
    }

    return res.status(405).json({ error: 'method not allowed' })
  } catch (err) {
    console.error('KV error:', err)
    return res.status(500).json({ error: 'storage error', detail: String(err) })
  }
}
