import { NextApiResponse } from 'next'
import { withAuth, AuthenticatedRequest } from '../../../lib/middleware'
import { prisma } from '../../../lib/db'

async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const communities = await prisma.community.findMany({
        where: {
          isActive: true,
          // Filter out expired ephemeral communities
          OR: [
            { post: { isEphemeral: false } },
            {
              post: { isEphemeral: true },
              createdAt: {
                gte: new Date(Date.now() - 48 * 60 * 60 * 1000) // 48 hours ago
              }
            }
          ]
        },
        include: {
          post: {
            select: {
              id: true,
              title: true,
              description: true,
              category: true,
              urgency: true,
              isEphemeral: true,
              ttlHours: true,
              createdAt: true,
              author: {
                select: {
                  id: true,
                  displayName: true,
                  anonymousCode: true
                }
              }
            }
          },
          members: {
            select: {
              id: true,
              displayName: true,
              anonymousCode: true
            }
          }
        },
        orderBy: [
          { post: { urgency: 'asc' } },
          { createdAt: 'desc' }
        ]
      })

      return res.status(200).json({ communities })
    } catch (error) {
      console.error('Get communities error:', error)
      return res.status(500).json({ error: 'Internal server error' })
    }
  }

  return res.status(405).json({ error: 'Method not allowed' })
}

export default withAuth(handler)

