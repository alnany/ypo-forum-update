import type { VercelRequest, VercelResponse } from '@vercel/node'
import { getMeetings, createMeeting } from './_storage'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  if (req.method === 'OPTIONS') return res.status(200).end()

  try {
    if (req.method === 'GET') {
      const meetings = await getMeetings()
      return res.json(meetings)
    }

    if (req.method === 'POST') {
      const { date, location } = req.body as { date: string; location: string }
      if (!date || !location) {
        return res.status(400).json({ error: 'date and location are required' })
      }
      const meeting = await createMeeting(date, location)
      return res.status(201).json(meeting)
    }

    return res.status(405).json({ error: 'method not allowed' })
  } catch (err) {
    console.error('meetings error:', err)
    return res.status(500).json({ error: 'storage error', detail: String(err) })
  }
}
