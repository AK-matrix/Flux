import { NextApiResponse } from 'next'
import { withAuth, AuthenticatedRequest } from '../../../../lib/middleware'
import { prisma } from '../../../../lib/db'

async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    try {
      const { id } = req.query
      const { content, parentId } = req.body

      if (!content) {
        return res.status(400).json({ error: 'Content is required' })
      }

      // Check if post exists
      const post = await prisma.post.findUnique({
        where: { id: id as string }
      })

      if (!post) {
        return res.status(404).json({ error: 'Post not found' })
      }

      // Create comment
      const comment = await prisma.comment.create({
        data: {
          content,
          postId: id as string,
          authorId: req.user!.id,
          parentId: parentId || null
        },
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
        }
      })

      return res.status(201).json({ comment })
    } catch (error) {
      console.error('Create comment error:', error)
      return res.status(500).json({ error: 'Internal server error' })
    }
  }

  return res.status(405).json({ error: 'Method not allowed' })
}

export default withAuth(handler)
