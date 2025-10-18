import { NextApiResponse } from 'next'
import { withAuth, AuthenticatedRequest } from '../../lib/middleware'
import { prisma } from '../../lib/db'
import { isNUSEmail } from '../../lib/utils'

async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const user = await prisma.user.findUnique({
        where: { id: req.user!.id },
        select: {
          id: true,
          email: true,
          displayName: true,
          anonymousCode: true,
          emailVerified: true,
          interests: true,
          year: true,
          major: true,
          creditScore: true,
          createdAt: true
        }
      })

      if (!user) {
        return res.status(404).json({ error: 'User not found' })
      }

      return res.status(200).json({
        ...user,
        isNUS: isNUSEmail(user.email),
        needsSetup: !user.displayName && !user.anonymousCode
      })
    } catch (error) {
      console.error('Get user error:', error)
      return res.status(500).json({ error: 'Internal server error' })
    }
  }

  if (req.method === 'PUT') {
    try {
      const { displayName, anonymousCode, interests, year, major } = req.body

      const updateData: any = {}
      
      if (displayName !== undefined) updateData.displayName = displayName
      if (anonymousCode !== undefined) updateData.anonymousCode = anonymousCode
      if (interests !== undefined) updateData.interests = interests
      if (year !== undefined) updateData.year = year
      if (major !== undefined) updateData.major = major

      const user = await prisma.user.update({
        where: { id: req.user!.id },
        data: updateData,
        select: {
          id: true,
          email: true,
          displayName: true,
          anonymousCode: true,
          emailVerified: true,
          interests: true,
          year: true,
          major: true,
          creditScore: true,
          createdAt: true
        }
      })

      return res.status(200).json({
        ...user,
        isNUS: isNUSEmail(user.email),
        needsSetup: !user.displayName && !user.anonymousCode
      })
    } catch (error) {
      console.error('Update user error:', error)
      return res.status(500).json({ error: 'Internal server error' })
    }
  }

  return res.status(405).json({ error: 'Method not allowed' })
}

export default withAuth(handler)
