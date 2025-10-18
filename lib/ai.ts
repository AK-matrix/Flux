import Groq from 'groq-sdk'

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
})

interface ChatMessage {
  id: string
  content: string
  author: {
    displayName?: string
    anonymousCode?: string
  }
  createdAt: string
  isAnonymous: boolean
}

interface ChatSummary {
  summary: string
  keyPoints: string[]
  actionItems: string[]
  questions: string[]
}

export class ChatAI {
  private static instance: ChatAI
  private groq: typeof groq

  constructor() {
    this.groq = groq
  }

  static getInstance(): ChatAI {
    if (!ChatAI.instance) {
      ChatAI.instance = new ChatAI()
    }
    return ChatAI.instance
  }

  async summarizeChat(messages: ChatMessage[], context?: string): Promise<ChatSummary> {
    try {
      // Get recent messages (last 50) to avoid token limits
      const recentMessages = messages.slice(-50)
      
      const messagesText = recentMessages.map(msg => {
        const author = msg.isAnonymous ? msg.author.anonymousCode : msg.author.displayName
        return `${author}: ${msg.content}`
      }).join('\n')

      const prompt = `Analyze this chat conversation and provide:
1. A concise summary of what was discussed
2. Key points and decisions made
3. Action items or next steps
4. Important questions that need answers

Context: ${context || 'General group discussion'}

Chat messages:
${messagesText}

Please respond in JSON format:
{
  "summary": "Brief summary of the conversation",
  "keyPoints": ["Point 1", "Point 2", "Point 3"],
  "actionItems": ["Action 1", "Action 2"],
  "questions": ["Question 1", "Question 2"]
}`

      const completion = await this.groq.chat.completions.create({
        messages: [
          {
            role: 'system',
            content: 'You are an AI assistant that analyzes group chat conversations and provides structured summaries. Always respond in valid JSON format.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        model: 'openai/gpt-oss-20b',
        temperature: 1,
        max_completion_tokens: 8192,
        top_p: 1,
        reasoning_effort: 'medium',
        stream: false
      })

      const response = completion.choices[0]?.message?.content
      if (!response) throw new Error('No response from AI')

      return JSON.parse(response)
    } catch (error) {
      console.error('AI summarization error:', error)
      return {
        summary: 'Unable to generate summary at this time.',
        keyPoints: [],
        actionItems: [],
        questions: []
      }
    }
  }

  async answerQuestion(question: string, messages: ChatMessage[], context?: string): Promise<string> {
    try {
      // Get relevant messages (last 30) for context
      const recentMessages = messages.slice(-30)
      
      const messagesText = recentMessages.map(msg => {
        const author = msg.isAnonymous ? msg.author.anonymousCode : msg.author.displayName
        return `${author}: ${msg.content}`
      }).join('\n')

      const prompt = `Based on this group chat conversation, answer the following question: "${question}"

Context: ${context || 'General group discussion'}

Recent chat messages:
${messagesText}

Please provide a helpful, accurate answer based on the conversation. If the information isn't available in the chat, say so clearly.`

      const completion = await this.groq.chat.completions.create({
        messages: [
          {
            role: 'system',
            content: 'You are a helpful AI assistant that answers questions based on group chat conversations. Be accurate and cite relevant parts of the conversation when possible.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        model: 'openai/gpt-oss-20b',
        temperature: 0.3,
        max_tokens: 500
      })

      return completion.choices[0]?.message?.content || 'Unable to generate answer at this time.'
    } catch (error) {
      console.error('AI question answering error:', error)
      return 'Sorry, I encountered an error while processing your question. Please try again.'
    }
  }

  async generateMeetingNotes(messages: ChatMessage[], meetingTitle: string): Promise<string> {
    try {
      const messagesText = messages.map(msg => {
        const author = msg.isAnonymous ? msg.author.anonymousCode : msg.author.displayName
        return `${author}: ${msg.content}`
      }).join('\n')

      const prompt = `Generate professional meeting notes for: "${meetingTitle}"

Chat messages from the meeting:
${messagesText}

Please create structured meeting notes with:
1. Meeting overview
2. Key discussion points
3. Decisions made
4. Action items with owners
5. Next steps

Format it professionally and clearly.`

      const completion = await this.groq.chat.completions.create({
        messages: [
          {
            role: 'system',
            content: 'You are an AI assistant that creates professional meeting notes from chat conversations. Structure the output clearly and professionally.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        model: 'openai/gpt-oss-20b',
        temperature: 1,
        max_completion_tokens: 8192,
        top_p: 1,
        reasoning_effort: 'medium',
        stream: false
      })

      return completion.choices[0]?.message?.content || 'Unable to generate meeting notes.'
    } catch (error) {
      console.error('AI meeting notes error:', error)
      return 'Unable to generate meeting notes at this time.'
    }
  }
}

export const chatAI = ChatAI.getInstance()
