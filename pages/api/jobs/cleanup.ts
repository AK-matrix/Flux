import { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '../../../lib/db'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'DELETE') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const now = new Date()
    
    // Find expired ephemeral communities
    const expiredCommunities = await prisma.community.findMany({
      where: {
        isActive: true,
        createdAt: {
          lt: new Date(now.getTime() - 24 * 60 * 60 * 1000) // 24 hours ago
        }
      },
      include: {
        post: true
      }
    })

    // Delete expired communities and their posts
    for (const community of expiredCommunities) {
      await prisma.community.delete({
        where: { id: community.id }
      })

      if (community.post?.isEphemeral) {
        await prisma.post.delete({
          where: { id: community.post?.id }
        })
      }
    }

    // Mark communities as inactive if they're close to expiry
    const nearExpiryCommunities = await prisma.community.findMany({
      where: {
        isActive: true,
        createdAt: {
          lt: new Date(now.getTime() - 22 * 60 * 60 * 1000) // 22 hours ago
        }
      }
    })

    for (const community of nearExpiryCommunities) {
      await prisma.community.update({
        where: { id: community.id },
        data: { isActive: false }
      })
    }

    return res.status(200).json({ 
      message: 'Cleanup completed',
      deletedCommunities: expiredCommunities.length,
      markedInactive: nearExpiryCommunities.length
    })
  } catch (error) {
    console.error('Cleanup error:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}

