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
    const userId = req.user!.id

    // Check if user is part of this DM
    const dm = await prisma.directMessage.findUnique({
      where: { id: id as string },
      include: {
        post: {
          select: {
            title: true,
            description: true
          }
        }
      }
    })

    if (!dm) {
      return res.status(404).json({ error: 'Direct message not found' })
    }

    if (dm.senderId !== userId && dm.receiverId !== userId) {
      return res.status(403).json({ error: 'Not authorized to access this conversation' })
    }

    // Get all messages for this DM
    const messages = await prisma.message.findMany({
      where: { dmId: id as string },
      include: {
        author: {
          select: {
            displayName: true,
            anonymousCode: true
          }
        }
      },
      orderBy: { createdAt: 'asc' }
    })

    if (messages.length === 0) {
      return res.status(400).json({ error: 'No messages to summarize' })
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
    }))

    const context = dm.post ? `Discussion about: ${dm.post.title}` : 'Direct message conversation'
    const summary = await chatAI.summarizeChat(chatMessages, context)

    return res.status(200).json({ summary })
  } catch (error) {
    console.error('AI summarize error:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}

export default withAuth(handler)

