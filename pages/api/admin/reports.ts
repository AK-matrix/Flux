import { NextApiResponse } from 'next'
import { withAdmin, AuthenticatedRequest } from '../../../lib/middleware'
import { prisma } from '../../../lib/db'

async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const { status = 'pending' } = req.query

      const reports = await prisma.report.findMany({
        where: { status: status as string },
        include: {
          reporter: {
            select: {
              id: true,
              email: true,
              displayName: true,
              anonymousCode: true
            }
          },
          reportedUser: {
            select: {
              id: true,
              email: true,
              displayName: true,
              anonymousCode: true,
              creditScore: true
            }
          },
          post: {
            select: {
              id: true,
              title: true,
              category: true
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      })

      return res.status(200).json({ reports })
    } catch (error) {
      console.error('Get reports error:', error)
      return res.status(500).json({ error: 'Internal server error' })
    }
  }

  return res.status(405).json({ error: 'Method not allowed' })
}

export default withAdmin(handler)

