import { NextApiResponse } from 'next'
import { withAuth, AuthenticatedRequest } from '../../../../lib/middleware'
import { prisma } from '../../../../lib/db'

async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  const { id } = req.query

  if (req.method === 'GET') {
    try {
      const messages = await prisma.message.findMany({
        where: { dmId: id as string },
        include: {
          author: {
            select: {
              id: true,
              displayName: true,
              anonymousCode: true,
              creditScore: true
            }
          },
          reactions: {
            include: {
              user: {
                select: {
                  id: true,
                  displayName: true,
                  anonymousCode: true
                }
              }
            }
          }
        },
        orderBy: { createdAt: 'asc' }
      })

      return res.status(200).json({ messages })
    } catch (error) {
      console.error('Get DM messages error:', error)
      return res.status(500).json({ error: 'Internal server error' })
    }
  }

  if (req.method === 'POST') {
    try {
      const { content, isAnonymous = false } = req.body

      if (!content?.trim()) {
        return res.status(400).json({ error: 'Message content is required' })
      }

      // Check if user is part of this DM
      console.log('Looking for DM:', id, 'for user:', req.user!.id)
      const dm = await prisma.directMessage.findUnique({
        where: { id: id as string },
        include: {
          post: {
            select: {
              minCreditScore: true,
              requireRealName: true
            }
          }
        }
      })

      console.log('Found DM:', dm)
      if (!dm) {
        return res.status(404).json({ error: 'Direct message not found' })
      }

      if (dm.senderId !== req.user!.id && dm.receiverId !== req.user!.id) {
        return res.status(403).json({ error: 'Not authorized to send messages in this conversation' })
      }

      // Check credit score requirement
      if (dm.post?.minCreditScore && req.user!.creditScore < dm.post.minCreditScore) {
        return res.status(403).json({ error: 'Credit score requirement not met' })
      }

      // Check anonymity requirement
      if (isAnonymous && dm.post?.requireRealName) {
        return res.status(400).json({ error: 'Real name required for this conversation' })
      }

      const message = await prisma.message.create({
        data: {
          content,
          isAnonymous,
          authorId: req.user!.id,
          dmId: id as string
        },
        include: {
          author: {
            select: {
              id: true,
              displayName: true,
              anonymousCode: true,
              creditScore: true
            }
          },
          reactions: true
        }
      })

      return res.status(201).json({ message })
    } catch (error) {
      console.error('Create DM message error:', error)
      return res.status(500).json({ error: 'Internal server error' })
    }
  }

  return res.status(405).json({ error: 'Method not allowed' })
}

export default withAuth(handler)
