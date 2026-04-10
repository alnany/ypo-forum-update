import type { VercelRequest, VercelResponse } from '@vercel/node'

export default function handler(req: VercelRequest, res: VercelResponse) {
  res.json({
    ok: true,
    has_token: !!process.env.GITHUB_TOKEN,
    has_gist: !!process.env.GIST_ID,
    gist_id: process.env.GIST_ID ?? 'not set',
    node: process.version,
  })
}
