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
    const { email, displayName } = req.body
    const token = req.headers.authorization?.replace('Bearer ', '')

    if (!token) {
      return res.status(401).json({ error: 'Authentication required' })
    }

    // For now, skip Firebase Admin verification
    // TODO: Implement proper Firebase Admin SDK verification
    if (!token || token.length < 10) {
      return res.status(401).json({ error: 'Invalid token' })
    }

    if (!displayName) {
      return res.status(400).json({ error: 'Display name is required' })
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' })
    }

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        displayName,
        emailVerified: true, // Mock for development
        creditScore: 85,
        interests: [],
        anonymousCode: `FLX-${Math.random().toString(36).substr(2, 5).toUpperCase()}`
      }
    })

    return res.status(201).json({
      user: {
        id: user.id,
        email: user.email,
        displayName: user.displayName,
        emailVerified: user.emailVerified,
        isNUS: isNUSEmail(user.email),
        needsSetup: !user.displayName && !user.anonymousCode,
        creditScore: user.creditScore
      }
    })
  } catch (error) {
    console.error('Registration error:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}
