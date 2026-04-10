import type { VercelRequest, VercelResponse } from '@vercel/node'
import { kv } from '@vercel/kv'

const MEMBERS = ['Chris', 'Tony', 'Julian', 'Eric', 'Mike', 'Ethan']

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS (same-origin in production, needed for local dev)
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  if (req.method === 'OPTIONS') return res.status(200).end()

  try {
    if (req.method === 'GET') {
      const { month, member } = req.query
      if (!month) return res.status(400).json({ error: 'month parameter required (e.g. 2026-04)' })
      const yearMonth = month as string

      if (member) {
        // Fetch a single member's update
        const data = await kv.get(`update:${member}:${yearMonth}`)
        if (!data) return res.status(404).json({ error: 'not found' })
        return res.json(data)
      } else {
        // Fetch all updates for the month
        const results = await Promise.all(
          MEMBERS.map(async (m) => {
            const data = await kv.get<object>(`update:${m}:${yearMonth}`)
            return data ? { member: m, hasUpdate: true, ...data } : { member: m, hasUpdate: false }
          })
        )
        return res.json({ yearMonth, members: results })
      }
    }

    if (req.method === 'POST') {
      const body = req.body as {
        member: string
        yearMonth: string
        month: string
        data: unknown
      }
      if (!body.member || !body.yearMonth || !MEMBERS.includes(body.member)) {
        return res.status(400).json({ error: 'invalid member or missing yearMonth' })
      }
      const record = { ...body, submittedAt: new Date().toISOString() }
      await kv.set(`update:${body.member}:${body.yearMonth}`, record)
      // Track months for archive
      await kv.sadd('months', body.yearMonth)
      return res.status(201).json({ success: true })
    }

    return res.status(405).json({ error: 'method not allowed' })
  } catch (err) {
    console.error('KV error:', err)
    return res.status(500).json({ error: 'storage error', detail: String(err) })
  }
}
