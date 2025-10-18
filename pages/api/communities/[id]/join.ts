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

    const community = await prisma.community.findUnique({
      where: { id: id as string },
      include: {
        members: {
          select: { id: true }
        },
        post: {
          select: { isCompleted: true }
        }
      }
    })

    if (!community) {
      return res.status(404).json({ error: 'Community not found' })
    }

    if (community.post.isCompleted) {
      return res.status(400).json({ error: 'Community is completed' })
    }

    if (!community.isActive) {
      return res.status(400).json({ error: 'Community is no longer active' })
    }

    // Check if user is already a member
    const isMember = community.members.some(member => member.id === userId)
    if (isMember) {
      return res.status(400).json({ error: 'Already a member' })
    }

    // Check if community is full
    if (community.maxMembers && community.members.length >= community.maxMembers) {
      return res.status(400).json({ error: 'Community is full' })
    }

    // Add user to community
    await prisma.community.update({
      where: { id: id as string },
      data: {
        members: {
          connect: { id: userId }
        }
      }
    })

    return res.status(200).json({ message: 'Joined community successfully' })
  } catch (error) {
    console.error('Join community error:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}

export default withAuth(handler)
