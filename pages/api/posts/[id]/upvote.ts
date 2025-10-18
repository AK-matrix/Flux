import { NextApiResponse } from 'next'
import { withAuth, AuthenticatedRequest } from '../../../../lib/middleware'
import { prisma } from '../../../../lib/db'

async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { id } = req.query
    const userId = req.user!.id

    const post = await prisma.post.findUnique({
      where: { id: id as string }
    })

    if (!post) {
      return res.status(404).json({ error: 'Post not found' })
    }

    // Check if user already upvoted
    const hasUpvoted = post.upvotedBy.includes(userId)

    if (hasUpvoted) {
      // Remove upvote
      const updatedUpvotedBy = post.upvotedBy.filter(id => id !== userId)
      const updatedPost = await prisma.post.update({
        where: { id: id as string },
        data: {
          upvotes: { decrement: 1 },
          upvotedBy: updatedUpvotedBy
        }
      })

      return res.status(200).json({ 
        upvoted: false, 
        upvotes: updatedPost.upvotes 
      })
    } else {
      // Add upvote
      const updatedUpvotedBy = [...post.upvotedBy, userId]
      const updatedPost = await prisma.post.update({
        where: { id: id as string },
        data: {
          upvotes: { increment: 1 },
          upvotedBy: updatedUpvotedBy
        }
      })

      return res.status(200).json({ 
        upvoted: true, 
        upvotes: updatedPost.upvotes 
      })
    }
  } catch (error) {
    console.error('Upvote error:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}

export default withAuth(handler)
