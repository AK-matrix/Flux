import { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '../../../lib/db'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { token } = req.query

    if (!token || typeof token !== 'string') {
      return res.status(400).json({ error: 'Verification token required' })
    }

    // For MVP, we'll just mark the first user as verified
    // In production, you'd store and verify the token
    const user = await prisma.user.findFirst({
      where: { emailVerified: false }
    })

    if (!user) {
      return res.status(400).json({ error: 'No user to verify' })
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { emailVerified: true }
    })

    return res.redirect('/?verified=true')
  } catch (error) {
    console.error('Verification error:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}

