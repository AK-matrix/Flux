import { NextApiResponse } from 'next'
import { withAuth, AuthenticatedRequest } from '../../../lib/middleware'
import { prisma } from '../../../lib/db'

async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    try {
      const { receiverId, postId } = req.body

      if (!receiverId) {
        return res.status(400).json({ error: 'Receiver ID is required' })
      }

      // Check if post exists and get requirements
      let post = null
      if (postId) {
        post = await prisma.post.findUnique({
          where: { id: postId },
          select: {
            id: true,
            title: true,
            minCreditScore: true,
            requireRealName: true,
            authorId: true
          }
        })

        if (!post) {
          return res.status(404).json({ error: 'Post not found' })
        }

        // Check credit score requirement
        if (post.minCreditScore && req.user!.creditScore < post.minCreditScore) {
          return res.status(403).json({ 
            error: `This conversation requires a minimum credit score of ${post.minCreditScore}. Your current score: ${req.user!.creditScore}` 
          })
        }
      }

      // Check if DM already exists (without postId constraint for same users)
      const existingDM = await prisma.directMessage.findFirst({
        where: {
          OR: [
            { senderId: req.user!.id, receiverId },
            { senderId: receiverId, receiverId: req.user!.id }
          ]
        }
      })

      if (existingDM) {
        console.log('Existing DM found:', existingDM.id)
        return res.status(200).json({ dm: existingDM })
      }

      // Create new DM (simplified approach)
      console.log('Creating new DM:', { senderId: req.user!.id, receiverId, postId })
      
      const dm = await prisma.directMessage.create({
        data: {
          senderId: req.user!.id,
          receiverId,
          postId: postId || null
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
          }
        }
      })

      return res.status(201).json({ dm })
    } catch (error) {
      console.error('Create DM error:', error)
      return res.status(500).json({ error: 'Internal server error' })
    }
  }

  return res.status(405).json({ error: 'Method not allowed' })
}

export default withAuth(handler)
