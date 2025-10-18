import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  PaperAirplaneIcon, 
  UserIcon,
  ShieldCheckIcon,
  SparklesIcon,
  CalendarIcon
} from '@heroicons/react/24/outline'
import { useAuth } from '../hooks/useAuth'

interface Message {
  id: string
  content: string
  author: {
    id: string
    displayName?: string
    anonymousCode?: string
    creditScore: number
  }
  createdAt: string
  isAnonymous: boolean
  reactions: { emoji: string; count: number; users: string[] }[]
}

interface DirectMessageProps {
  dmId: string
  otherUser: {
    id: string
    displayName?: string
    anonymousCode?: string
    creditScore: number
  }
  post?: {
    id: string
    title: string
    minCreditScore?: number
    requireRealName: boolean
  }
  onClose: () => void
}

export default function DirectMessage({ dmId, otherUser, post, onClose }: DirectMessageProps) {
  const { user } = useAuth()
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [isAnonymous, setIsAnonymous] = useState(false)
  const [showAI, setShowAI] = useState(false)
  const [aiQuestion, setAiQuestion] = useState('')
  const [aiResponse, setAiResponse] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Check if user can be anonymous
  const canBeAnonymous = !post?.requireRealName
  const meetsCreditRequirement = !post?.minCreditScore || (user?.creditScore || 0) >= post.minCreditScore

  const sendMessage = async () => {
    if (!newMessage.trim() || !user || !meetsCreditRequirement) return

    try {
      const response = await fetch(`/api/dms/${dmId}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer mock-token`
        },
        body: JSON.stringify({
          content: newMessage,
          isAnonymous: isAnonymous && canBeAnonymous
        })
      })

      if (response.ok) {
        setNewMessage('')
      }
    } catch (error) {
      console.error('Failed to send message:', error)
    }
  }

  const addReaction = async (messageId: string, emoji: string) => {
    try {
      await fetch(`/api/messages/${messageId}/react`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer mock-token`
        },
        body: JSON.stringify({ emoji })
      })
    } catch (error) {
      console.error('Failed to add reaction:', error)
    }
  }

  const askAI = async () => {
    if (!aiQuestion.trim()) return

    try {
      const response = await fetch(`/api/dms/${dmId}/ai/ask`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer mock-token`
        },
        body: JSON.stringify({ question: aiQuestion })
      })

      if (response.ok) {
        const data = await response.json()
        setAiResponse(data.answer)
      }
    } catch (error) {
      console.error('Failed to ask AI:', error)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-elevated-bg rounded-2xl shadow-2xl w-full max-w-4xl h-[80vh] flex overflow-hidden"
      >
        {/* Chat Area */}
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-4 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                  <UserIcon className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-xl font-bold">
                    {otherUser.displayName || otherUser.anonymousCode}
                  </h2>
                  <div className="flex items-center space-x-2 text-sm opacity-90">
                    <span>Credit: {otherUser.creditScore.toFixed(0)}</span>
                    {post && (
                      <>
                        <span>•</span>
                        <span>Re: {post.title}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setShowAI(!showAI)}
                  className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                  title="AI Assistant"
                >
                  <SparklesIcon className="w-5 h-5" />
                </button>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                >
                  ✕
                </button>
              </div>
            </div>
          </div>

          {/* Credit Score Warning */}
          {post?.minCreditScore && !meetsCreditRequirement && (
            <div className="bg-red-500/20 border-l-4 border-red-500 p-3 text-red-200">
              <div className="flex items-center space-x-2">
                <ShieldCheckIcon className="w-5 h-5" />
                <span className="text-sm">
                  This conversation requires a minimum credit score of {post.minCreditScore}. 
                  Your current score: {user?.creditScore || 0}
                </span>
              </div>
            </div>
          )}

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex ${message.author.id === user?.id ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-xs lg:max-w-md ${message.author.id === user?.id ? 'order-2' : 'order-1'}`}>
                  <div className={`flex ${message.author.id === user?.id ? 'justify-end' : 'justify-start'} mb-1`}>
                    <span className="text-xs text-gray-400">
                      {message.isAnonymous 
                        ? message.author.anonymousCode 
                        : message.author.displayName
                      }
                    </span>
                  </div>
                  <div
                    className={`p-3 rounded-2xl ${
                      message.author.id === user?.id
                        ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white'
                        : 'bg-gray-700 text-gray-200'
                    }`}
                  >
                    <p className="text-sm">{message.content}</p>
                  </div>
                  <div className={`flex ${message.author.id === user?.id ? 'justify-end' : 'justify-start'} mt-1`}>
                    <span className="text-xs text-gray-400">
                      {new Date(message.createdAt).toLocaleTimeString()}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Message Input */}
          <div className="p-4 border-t border-gray-700">
            <div className="flex items-center space-x-3">
              <div className="flex-1 flex items-center space-x-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                  placeholder={
                    !meetsCreditRequirement 
                      ? "You don't meet the credit score requirement"
                      : "Type a message..."
                  }
                  disabled={!meetsCreditRequirement}
                  className="flex-1 bg-gray-700/50 border border-gray-600 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed"
                />
                {canBeAnonymous && (
                  <button
                    onClick={() => setIsAnonymous(!isAnonymous)}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isAnonymous 
                        ? 'bg-purple-500 text-white' 
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                  >
                    {isAnonymous ? 'Anonymous' : 'Named'}
                  </button>
                )}
              </div>
              <button
                onClick={sendMessage}
                disabled={!newMessage.trim() || !meetsCreditRequirement}
                className="bg-gradient-to-r from-purple-500 to-blue-500 text-white p-2 rounded-lg hover:from-purple-600 hover:to-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                <PaperAirplaneIcon className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* AI Assistant Sidebar */}
        <AnimatePresence>
          {showAI && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 300, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              className="bg-gray-800/50 border-l border-gray-700 overflow-hidden"
            >
              <div className="p-4">
                <div className="flex items-center space-x-2 mb-4">
                  <SparklesIcon className="w-5 h-5 text-yellow-400" />
                  <h3 className="text-lg font-bold text-white">AI Assistant</h3>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <input
                      type="text"
                      value={aiQuestion}
                      onChange={(e) => setAiQuestion(e.target.value)}
                      placeholder="Ask about the conversation..."
                      className="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-500 text-sm"
                    />
                    <button
                      onClick={askAI}
                      className="w-full mt-2 bg-gradient-to-r from-yellow-500 to-orange-500 text-white py-2 rounded-lg hover:from-yellow-600 hover:to-orange-600 transition-all text-sm"
                    >
                      Ask AI
                    </button>
                  </div>
                  
                  {aiResponse && (
                    <div className="bg-gray-700/50 p-3 rounded-lg">
                      <p className="text-sm text-gray-200">{aiResponse}</p>
                    </div>
                  )}
                  
                  <div className="space-y-2">
                    <button className="w-full text-left text-sm text-gray-300 hover:text-white p-2 hover:bg-gray-700/50 rounded">
                      📝 Summarize conversation
                    </button>
                    <button className="w-full text-left text-sm text-gray-300 hover:text-white p-2 hover:bg-gray-700/50 rounded">
                      🎯 Extract action items
                    </button>
                    <button className="w-full text-left text-sm text-gray-300 hover:text-white p-2 hover:bg-gray-700/50 rounded">
                      📅 Schedule follow-up
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  )
}
