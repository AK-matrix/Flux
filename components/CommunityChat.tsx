import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  PaperAirplaneIcon, 
  PlusIcon,
  UserGroupIcon,
  CogIcon,
  ChartBarIcon,
  CalendarIcon,
  SparklesIcon,
  FaceSmileIcon
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
  replies?: Message[]
}

interface Community {
  id: string
  post: {
    title: string
    description: string
  }
  members: Array<{
    id: string
    displayName?: string
    anonymousCode?: string
    creditScore: number
  }>
  admins: string[]
  settings: {
    allowAnonymous: boolean
    requireRealName: boolean
  }
}

interface CommunityChatProps {
  community: Community
  onClose: () => void
}

export default function CommunityChat({ community, onClose }: CommunityChatProps) {
  const { user } = useAuth()
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [isAnonymous, setIsAnonymous] = useState(false)
  const [showDashboard, setShowDashboard] = useState(false)
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

  const sendMessage = async () => {
    if (!newMessage.trim() || !user) return

    try {
      const response = await fetch(`/api/communities/${community.id}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer mock-token`
        },
        body: JSON.stringify({
          content: newMessage,
          isAnonymous
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
      const response = await fetch(`/api/communities/${community.id}/ai/ask`, {
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

  const isAdmin = user && community.admins.includes(user.id)

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-elevated-bg rounded-2xl shadow-2xl w-full max-w-6xl h-[90vh] flex overflow-hidden"
      >
        {/* Chat Area */}
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-4 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <UserGroupIcon className="w-6 h-6" />
                <div>
                  <h2 className="text-xl font-bold">{community.post.title}</h2>
                  <p className="text-sm opacity-90">{community.members.length} members</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setShowDashboard(!showDashboard)}
                  className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                  title="Dashboard"
                >
                  <ChartBarIcon className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setShowAI(!showAI)}
                  className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                  title="AI Assistant"
                >
                  <SparklesIcon className="w-5 h-5" />
                </button>
                {isAdmin && (
                  <button
                    className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                    title="Settings"
                  >
                    <CogIcon className="w-5 h-5" />
                  </button>
                )}
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                >
                  ✕
                </button>
              </div>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex space-x-3"
              >
                <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                  {message.isAnonymous 
                    ? message.author.anonymousCode?.slice(-2) 
                    : message.author.displayName?.charAt(0)
                  }
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="font-medium text-white">
                      {message.isAnonymous 
                        ? message.author.anonymousCode 
                        : message.author.displayName
                      }
                    </span>
                    <span className="text-xs text-gray-400">
                      {new Date(message.createdAt).toLocaleTimeString()}
                    </span>
                    <span className="text-xs bg-purple-500/20 text-purple-300 px-2 py-1 rounded">
                      {message.author.creditScore.toFixed(0)}
                    </span>
                  </div>
                  <p className="text-gray-200 mb-2">{message.content}</p>
                  <div className="flex items-center space-x-2">
                    {message.reactions?.map((reaction, index) => (
                      <button
                        key={index}
                        onClick={() => addReaction(message.id, reaction.emoji)}
                        className="flex items-center space-x-1 bg-gray-700/50 hover:bg-gray-600/50 px-2 py-1 rounded-full text-sm transition-colors"
                      >
                        <span>{reaction.emoji}</span>
                        <span>{reaction.count}</span>
                      </button>
                    ))}
                    <button
                      onClick={() => addReaction(message.id, '👍')}
                      className="text-gray-400 hover:text-white transition-colors"
                    >
                      <FaceSmileIcon className="w-4 h-4" />
                    </button>
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
                  placeholder="Type a message..."
                  className="flex-1 bg-gray-700/50 border border-gray-600 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
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
              </div>
              <button
                onClick={sendMessage}
                disabled={!newMessage.trim()}
                className="bg-gradient-to-r from-purple-500 to-blue-500 text-white p-2 rounded-lg hover:from-purple-600 hover:to-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                <PaperAirplaneIcon className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Dashboard Sidebar */}
        <AnimatePresence>
          {showDashboard && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 300, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              className="bg-gray-800/50 border-l border-gray-700 overflow-hidden"
            >
              <div className="p-4">
                <h3 className="text-lg font-bold text-white mb-4">Community Dashboard</h3>
                
                {/* Goals Section */}
                <div className="mb-6">
                  <div className="flex items-center space-x-2 mb-3">
                    <ChartBarIcon className="w-5 h-5 text-purple-400" />
                    <h4 className="font-medium text-white">Goals</h4>
                  </div>
                  <div className="space-y-2">
                    <div className="bg-gray-700/50 p-3 rounded-lg">
                      <p className="text-sm text-gray-300">Complete project proposal</p>
                      <div className="w-full bg-gray-600 rounded-full h-2 mt-2">
                        <div className="bg-purple-500 h-2 rounded-full" style={{ width: '60%' }}></div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Meetings Section */}
                <div className="mb-6">
                  <div className="flex items-center space-x-2 mb-3">
                    <CalendarIcon className="w-5 h-5 text-blue-400" />
                    <h4 className="font-medium text-white">Upcoming Meetings</h4>
                  </div>
                  <div className="space-y-2">
                    <div className="bg-gray-700/50 p-3 rounded-lg">
                      <p className="text-sm font-medium text-white">Project Discussion</p>
                      <p className="text-xs text-gray-400">Tomorrow 2:00 PM</p>
                      <button className="text-xs text-blue-400 hover:text-blue-300 mt-1">
                        Join Meeting
                      </button>
                    </div>
                  </div>
                </div>

                {/* Members */}
                <div>
                  <h4 className="font-medium text-white mb-3">Members ({community.members.length})</h4>
                  <div className="space-y-2">
                    {community.members.map((member) => (
                      <div key={member.id} className="flex items-center space-x-2">
                        <div className="w-6 h-6 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-white text-xs">
                          {member.displayName?.charAt(0) || member.anonymousCode?.charAt(0)}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm text-white">
                            {member.displayName || member.anonymousCode}
                          </p>
                          <p className="text-xs text-gray-400">
                            Credit: {member.creditScore.toFixed(0)}
                          </p>
                        </div>
                        {isAdmin && (
                          <button className="text-red-400 hover:text-red-300 text-xs">
                            Kick
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* AI Assistant */}
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
                      ❓ Find unanswered questions
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
