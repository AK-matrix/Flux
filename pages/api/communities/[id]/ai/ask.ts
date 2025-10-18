import { NextApiResponse } from 'next'
import { withAuth, AuthenticatedRequest } from '../../../../../lib/middleware'
import { prisma } from '../../../../../lib/db'
import { chatAI } from '../../../../../lib/ai'

async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { id } = req.query
    const { question } = req.body
    const userId = req.user!.id

    if (!question?.trim()) {
      return res.status(400).json({ error: 'Question is required' })
    }

    // Check if user is member of community
    const community = await prisma.community.findUnique({
      where: { id: id as string },
      include: {
        members: { select: { id: true } },
        post: {
          select: {
            title: true,
            description: true
          }
        }
      }
    })

    if (!community) {
      return res.status(404).json({ error: 'Community not found' })
    }

    const isMember = community.members.some(member => member.id === userId)
    if (!isMember) {
      return res.status(403).json({ error: 'Not a member of this community' })
    }

    // Get recent messages for context
    const messages = await prisma.message.findMany({
      where: { communityId: id as string },
      include: {
        author: {
          select: {
            displayName: true,
            anonymousCode: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 50 // Last 50 messages for context
    })

    if (messages.length === 0) {
      return res.status(400).json({ error: 'No messages to analyze' })
    }

    // Convert to format expected by AI
    const chatMessages = messages.map(msg => ({
      id: msg.id,
      content: msg.content,
      author: {
        displayName: msg.author.displayName || undefined,
        anonymousCode: msg.author.anonymousCode || undefined
      },
      createdAt: msg.createdAt.toISOString(),
      isAnonymous: msg.isAnonymous
    })).reverse() // Reverse to get chronological order

    const context = community.post ? `Community discussion about: ${community.post.title}` : 'Community chat'
    const answer = await chatAI.answerQuestion(question, chatMessages, context)

    return res.status(200).json({ answer })
  } catch (error) {
    console.error('AI ask error:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}

export default withAuth(handler)