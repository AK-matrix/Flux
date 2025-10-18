import { NextApiResponse } from 'next'
import { withAuth, AuthenticatedRequest } from '../../../lib/middleware'
import { prisma } from '../../../lib/db'

async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      console.log('Fetching DMs for user:', req.user!.id)
      
      const dms = await prisma.directMessage.findMany({
        where: {
          OR: [
            { senderId: req.user!.id },
            { receiverId: req.user!.id }
          ],
          isActive: true
        },
        include: {
          sender: {
            select: {
              id: true,
              displayName: true,
              anonymousCode: true,
              creditScore: true
            }
          },
          receiver: {
            select: {
              id: true,
              displayName: true,
              anonymousCode: true,
              creditScore: true
            }
          },
          post: {
            select: {
              id: true,
              title: true,
              minCreditScore: true,
              requireRealName: true
            }
          },
          messages: {
            include: {
              author: {
                select: {
                  displayName: true,
                  anonymousCode: true
                }
              }
            },
            orderBy: { createdAt: 'desc' },
            take: 1
          }
        },
        orderBy: { updatedAt: 'desc' }
      })
      
      console.log('Found DMs:', dms.length, dms.map(dm => ({ id: dm.id, sender: dm.senderId, receiver: dm.receiverId })))
      return res.status(200).json({ dms })
    } catch (error) {
      console.error('Get DMs error:', error)
      return res.status(500).json({ error: 'Internal server error' })
    }
  }

  return res.status(405).json({ error: 'Method not allowed' })
}

export default withAuth(handler)