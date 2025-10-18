import { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '../../lib/db'
import { calculateTrendingScore } from '../../lib/utils'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { limit = '20' } = req.query

    const posts = await prisma.post.findMany({
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
      },
      orderBy: { createdAt: 'desc' },
      take: parseInt(limit as string)
    })

    // Calculate trending scores
    const now = new Date()
    const postsWithScores = posts.map((post: any) => {
      const ageHours = (now.getTime() - post.createdAt.getTime()) / (1000 * 60 * 60)
      const score = calculateTrendingScore(
        post.upvotes,
        post.comments.length,
        ageHours,
        post.urgency
      )
      return { ...post, trendingScore: score }
    }).sort((a: any, b: any) => b.trendingScore - a.trendingScore)

    return res.status(200).json({ posts: postsWithScores })
  } catch (error) {
    console.error('Get trending error:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}
