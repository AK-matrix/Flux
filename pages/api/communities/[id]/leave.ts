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
        }
      }
    })

    if (!community) {
      return res.status(404).json({ error: 'Community not found' })
    }

    // Check if user is a member
    const isMember = community.members.some(member => member.id === userId)
    if (!isMember) {
      return res.status(400).json({ error: 'Not a member' })
    }

    // Remove user from community
    await prisma.community.update({
      where: { id: id as string },
      data: {
        members: {
          disconnect: { id: userId }
        }
      }
    })

    return res.status(200).json({ message: 'Left community successfully' })
  } catch (error) {
    console.error('Leave community error:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}

export default withAuth(handler)
