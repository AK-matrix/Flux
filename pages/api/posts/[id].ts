import { NextApiResponse } from 'next'
import { withAuth, AuthenticatedRequest } from '../../../lib/middleware'
import { prisma } from '../../../lib/db'

async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  const { id } = req.query

  if (req.method === 'GET') {
    try {
      const post = await prisma.post.findUnique({
        where: { id: id as string },
        include: {
          author: {
            select: {
              id: true,
              displayName: true,
              anonymousCode: true,
              creditScore: true
            }
          },
          comments: {
            include: {
              author: {
                select: {
                  id: true,
                  displayName: true,
                  anonymousCode: true,
                }
              },
              replies: {
                include: {
                  author: {
                    select: {
                      id: true,
                      displayName: true,
                      anonymousCode: true,
                    }
                  }
                }
              }
            },
            orderBy: { createdAt: 'asc' }
          },
          community: {
            include: {
              members: {
                select: {
                  id: true,
                  displayName: true,
                  anonymousCode: true,
                }
              }
            }
          }
        }
      })

      if (!post) {
        return res.status(404).json({ error: 'Post not found' })
      }

      return res.status(200).json({ post })
    } catch (error) {
      console.error('Get post error:', error)
      return res.status(500).json({ error: 'Internal server error' })
    }
  }

  if (req.method === 'PUT') {
    try {
      const { isCompleted } = req.body

      const post = await prisma.post.findUnique({
        where: { id: id as string }
      })

      if (!post) {
        return res.status(404).json({ error: 'Post not found' })
      }

      if (post.authorId !== req.user!.id) {
        return res.status(403).json({ error: 'Not authorized' })
      }

      const updatedPost = await prisma.post.update({
        where: { id: id as string },
        data: { isCompleted },
        include: {
          author: {
            select: {
              id: true,
              displayName: true,
              anonymousCode: true,
              creditScore: true
            }
          },
          comments: {
            select: { id: true }
          },
          community: {
            select: {
              id: true,
              maxMembers: true,
              members: {
                select: { id: true }
              }
            }
          }
        }
      })

      // If marking as completed and ephemeral, delete the community
      if (isCompleted && post.isEphemeral) {
        await prisma.community.deleteMany({
          where: { postId: post.id }
        })
      }

      return res.status(200).json({ post: updatedPost })
    } catch (error) {
      console.error('Update post error:', error)
      return res.status(500).json({ error: 'Internal server error' })
    }
  }

  return res.status(405).json({ error: 'Method not allowed' })
}

export default withAuth(handler)
