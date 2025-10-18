import { NextApiResponse } from 'next'
import { withAuth, AuthenticatedRequest } from '../../../../lib/middleware'
import { prisma } from '../../../../lib/db'

async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  const { id } = req.query

  if (req.method === 'GET') {
    try {
      const messages = await prisma.message.findMany({
        where: { communityId: id as string },
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
          },
          replies: {
            include: {
              author: {
                select: {
                  id: true,
                  displayName: true,
                  anonymousCode: true,
                  creditScore: true
                }
              }
            }
          }
        },
        orderBy: { createdAt: 'asc' }
      })

      return res.status(200).json({ messages })
    } catch (error) {
      console.error('Get messages error:', error)
      return res.status(500).json({ error: 'Internal server error' })
    }
  }

  if (req.method === 'POST') {
    try {
      const { content, isAnonymous = false } = req.body

      if (!content?.trim()) {
        return res.status(400).json({ error: 'Message content is required' })
      }

      // Check if user is member of community
      const community = await prisma.community.findUnique({
        where: { id: id as string },
        include: {
          members: { select: { id: true } }
        }
      })

      if (!community) {
        return res.status(404).json({ error: 'Community not found' })
      }

      const isMember = community.members.some(member => member.id === req.user!.id)
      if (!isMember) {
        return res.status(403).json({ error: 'Not a member of this community' })
      }

      // For now, allow anonymous messages by default
      // TODO: Add community settings for anonymity control

      const message = await prisma.message.create({
        data: {
          content,
          isAnonymous,
          authorId: req.user!.id,
          communityId: id as string
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
      console.error('Create message error:', error)
      return res.status(500).json({ error: 'Internal server error' })
    }
  }

  return res.status(405).json({ error: 'Method not allowed' })
}

export default withAuth(handler)
