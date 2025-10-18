import { NextApiRequest, NextApiResponse } from 'next'
import { adminAuth } from '../../../lib/firebase-admin'
import { prisma } from '../../../lib/db'
import { isNUSEmail } from '../../../lib/utils'
import type { Auth } from 'firebase-admin/auth'

// Type the adminAuth variable
const firebaseAdminAuth: Auth | null = adminAuth

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { email } = req.body
    const token = req.headers.authorization?.replace('Bearer ', '')

    if (!token) {
      return res.status(401).json({ error: 'Authentication required' })
    }

    // For now, skip Firebase Admin verification
    // TODO: Implement proper Firebase Admin SDK verification
    if (!token || token.length < 10) {
      return res.status(401).json({ error: 'Invalid token' })
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { email }
    })

    if (!user) {
      return res.status(401).json({ error: 'User not found' })
    }

    return res.status(200).json({
      user: {
        id: user.id,
        email: user.email,
        displayName: user.displayName,
        anonymousCode: user.anonymousCode,
        emailVerified: user.emailVerified,
        isNUS: isNUSEmail(user.email),
        needsSetup: !user.displayName && !user.anonymousCode,
        creditScore: user.creditScore
      }
    })
  } catch (error) {
    console.error('Login error:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}
