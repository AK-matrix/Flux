import { NextApiRequest, NextApiResponse } from 'next'
import { adminAuth } from './firebase-admin'
import { prisma } from './db'
import type { Auth } from 'firebase-admin/auth'

// Type the adminAuth variable
const firebaseAdminAuth: Auth | null = adminAuth

export interface AuthenticatedRequest extends NextApiRequest {
  user?: {
    id: string
    email: string
    displayName?: string
    anonymousCode?: string
    creditScore: number
  }
}

export function withAuth(handler: (req: AuthenticatedRequest, res: NextApiResponse) => Promise<void>) {
  return async (req: AuthenticatedRequest, res: NextApiResponse) => {
    try {
      const token = req.headers.authorization?.replace('Bearer ', '')
      
      if (!token) {
        return res.status(401).json({ error: 'Authentication required' })
      }

      // For development, create a user in the database if they don't exist
      // This simulates the registration flow
      let user = await prisma.user.findFirst({
        where: { email: 'test@example.com' }
      })

      if (!user) {
        // Create a test user for development
        user = await prisma.user.create({
          data: {
            id: 'test-user-id',
            email: 'test@example.com',
            displayName: 'Test User',
            anonymousCode: 'FLX-TEST',
            emailVerified: true,
            interests: ['Technology', 'Social'],
            year: '2024',
            major: 'Computer Science',
            creditScore: 85,
            isAnonymous: false
          }
        })
      }

      req.user = {
        id: user.id,
        email: user.email,
        displayName: user.displayName,
        anonymousCode: user.anonymousCode,
        creditScore: user.creditScore
      }
      
      return handler(req, res)
    } catch (error) {
      console.error('Auth error:', error)
      return res.status(401).json({ error: 'Authentication failed' })
    }
  }
}

export function withAdmin(handler: (req: AuthenticatedRequest, res: NextApiResponse) => Promise<void>) {
  return withAuth(async (req: AuthenticatedRequest, res: NextApiResponse) => {
    // For MVP, we'll check if user email is in admin list
    // In production, you'd have a proper admin role system
    const adminEmails = process.env.ADMIN_EMAILS?.split(',') || ['admin@flux.app']
    
    if (!req.user || !adminEmails.includes(req.user.email)) {
      return res.status(403).json({ error: 'Admin access required' })
    }

    return handler(req, res)
  })
}
