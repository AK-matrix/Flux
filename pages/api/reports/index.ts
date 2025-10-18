import { NextApiResponse } from 'next'
import { withAuth, AuthenticatedRequest } from '../../../lib/middleware'
import { prisma } from '../../../lib/db'

async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    try {
      const { reportedUserId, postId, reason, evidence } = req.body

      if (!reportedUserId || !reason) {
        return res.status(400).json({ error: 'Missing required fields' })
      }

      // Check if user is reporting themselves
      if (reportedUserId === req.user!.id) {
        return res.status(400).json({ error: 'Cannot report yourself' })
      }

      // Check if user already reported this person for this post
      const existingReport = await prisma.report.findFirst({
        where: {
          reporterId: req.user!.id,
          reportedUserId,
          postId: postId || null
        }
      })

      if (existingReport) {
        return res.status(400).json({ error: 'Already reported this user for this post' })
      }

      // Create report
      const report = await prisma.report.create({
        data: {
          reporterId: req.user!.id,
          reportedUserId,
          postId: postId || null,
          reason,
          evidence: evidence || null
        }
      })

      return res.status(201).json({ report })
    } catch (error) {
      console.error('Create report error:', error)
      return res.status(500).json({ error: 'Internal server error' })
    }
  }

  return res.status(405).json({ error: 'Method not allowed' })
}

export default withAuth(handler)
