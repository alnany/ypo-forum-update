import type { VercelRequest, VercelResponse } from '@vercel/node'
import { kv } from '@vercel/kv'

export interface Meeting {
  id: string           // "2026-04-10"
  date: string         // "2026-04-10" ISO date
  displayDate: string  // "April 10, 2026"
  location: string
  createdAt: string
}

function formatDate(dateStr: string): string {
  const [year, month, day] = dateStr.split('-').map(Number)
  const months = ['January','February','March','April','May','June','July','August','September','October','November','December']
  return `${months[month - 1]} ${day}, ${year}`
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  if (req.method === 'OPTIONS') return res.status(200).end()

  try {
    if (req.method === 'GET') {
      const ids = (await kv.smembers('meetings') as string[]) || []
      const meetings = await Promise.all(ids.map(id => kv.get<Meeting>(`meeting:${id}`)))
      const sorted = meetings
        .filter(Boolean)
        .sort((a, b) => (b!.date > a!.date ? 1 : -1))
      return res.json(sorted)
    }

    if (req.method === 'POST') {
      const { date, location } = req.body as { date: string; location: string }
      if (!date || !location) {
        return res.status(400).json({ error: 'date and location are required' })
      }
      const id = date // "YYYY-MM-DD"
      const meeting: Meeting = {
        id,
        date,
        displayDate: formatDate(date),
        location: location.trim(),
        createdAt: new Date().toISOString(),
      }
      await kv.set(`meeting:${id}`, meeting)
      await kv.sadd('meetings', id)
      return res.status(201).json(meeting)
    }

    return res.status(405).json({ error: 'method not allowed' })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: 'storage error', detail: String(err) })
  }
}
