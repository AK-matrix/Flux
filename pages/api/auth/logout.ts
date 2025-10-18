import { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  // With Firebase, logout is handled on the client side
  // This endpoint is kept for compatibility but doesn't need to do anything
  return res.status(200).json({ message: 'Logged out successfully' })
}
