import { NextApiResponse } from 'next'
import { withAuth, AuthenticatedRequest } from '../../../lib/middleware'
import { prisma } from '../../../lib/db'
import { calculateTrendingScore } from '../../../lib/utils'

async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const posts = await prisma.post.findMany({
        where: {
          isCompleted: false,
          // Filter out expired ephemeral posts
          OR: [
            { isEphemeral: false },
            {
              isEphemeral: true,
              createdAt: {
                gte: new Date(Date.now() - 48 * 60 * 60 * 1000) // 48 hours ago
              }
            }
          ]
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
          comments: {
            select: { id: true }
          },
          community: {
            include: {
              members: {
                select: {
                  id: true,
                  displayName: true,
                  anonymousCode: true
                }
              }
            }
          }
        },
        orderBy: [
          { urgency: 'asc' },
          { createdAt: 'desc' }
        ]
      })

      // Calculate trending scores
      const postsWithTrending = posts.map(post => ({
        ...post,
        trendingScore: calculateTrendingScore(post)
      }))

      return res.status(200).json({ posts: postsWithTrending })
    } catch (error) {
      console.error('Get posts error:', error)
      return res.status(500).json({ error: 'Internal server error' })
    }
  }

  if (req.method === 'POST') {
    try {
      const {
        title,
        description,
        category,
        tags = [],
        location,
        timeStart,
        durationMins,
        maxPeople,
        urgency,
        isAnonymous = false,
        isEphemeral = false,
        ttlHours = 48
      } = req.body

      if (!title || !description || !category || !urgency) {
        return res.status(400).json({ error: 'Missing required fields' })
      }

      // Create post
      const post = await prisma.post.create({
        data: {
          title,
          description,
          category,
          tags,
          location,
          timeStart: timeStart ? new Date(timeStart) : null,
          durationMins,
          maxPeople,
          urgency,
          isAnonymous,
          isEphemeral,
          ttlHours: isEphemeral ? ttlHours : null,
          authorId: req.user!.id
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
          comments: {
            select: { id: true }
          }
        }
      })

      // Create ephemeral community if requested
      let community = null
      if (isEphemeral) {
        const createdCommunity = await prisma.community.create({
          data: {
            postId: post.id,
            maxMembers: maxPeople || 12,
            ttlHours
          },
          include: {
            members: {
              select: {
                id: true,
                displayName: true,
                anonymousCode: true
              }
            }
          }
        })
        community = createdCommunity
      }

      return res.status(201).json({ 
        post: {
          ...post,
          community
        }
      })
    } catch (error) {
      console.error('Create post error:', error)
      return res.status(500).json({ error: 'Internal server error' })
    }
  }

  return res.status(405).json({ error: 'Method not allowed' })
}

export default withAuth(handler)
