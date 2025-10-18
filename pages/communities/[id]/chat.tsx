import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { motion } from 'framer-motion'
import Layout from '../../../components/Layout'
import { useAuth } from '../../../hooks/useAuth'
import { formatTimeAgo } from '../../../lib/utils'
import {
  PaperAirplaneIcon,
  UserGroupIcon,
  SparklesIcon,
  ChartBarIcon,
  ArrowLeftIcon
} from '@heroicons/react/24/outline'

interface Message {
  id: string
  content: string
  isAnonymous: boolean
  createdAt: string
  author: {
    id: string
    displayName?: string
    anonymousCode?: string
  }
}

interface Community {
  id: string
  post: {
    id: string
    title: string
    description: string
  }
  members: {
    id: string
    displayName?: string
    anonymousCode?: string
  }[]
}

export default function CommunityChatPage() {
  const router = useRouter()
  const { id } = router.query
  const { user } = useAuth()
  const [community, setCommunity] = useState<Community | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [isAnonymous, setIsAnonymous] = useState(false)
  const [loading, setLoading] = useState(true)
  const [aiLoading, setAiLoading] = useState(false)
  const [aiResponse, setAiResponse] = useState('')

  useEffect(() => {
    if (id) {
      fetchCommunity()
      fetchMessages()
    }
  }, [id])

  const fetchCommunity = async () => {
    try {
      const token = localStorage.getItem('flux_token') || 'mock-token'
      const response = await fetch('/api/communities', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (response.ok) {
        const data = await response.json()
        const foundCommunity = data.communities.find((c: any) => c.id === id)
        setCommunity(foundCommunity)
      }
    } catch (error) {
      console.error('Failed to fetch community:', error)
    }
  }

  const fetchMessages = async () => {
    try {
      const token = localStorage.getItem('flux_token') || 'mock-token'
      const response = await fetch(`/api/communities/${id}/messages`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (response.ok) {
        const data = await response.json()
        setMessages(data.messages)
      }
    } catch (error) {
      console.error('Failed to fetch messages:', error)
    } finally {
      setLoading(false)
    }
  }

  const sendMessage = async () => {
    if (!newMessage.trim()) return

    try {
      const token = localStorage.getItem('flux_token') || 'mock-token'
      const response = await fetch(`/api/communities/${id}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          content: newMessage,
          isAnonymous
        })
      })

      if (response.ok) {
        const data = await response.json()
        setMessages(prev => [...prev, data.message])
        setNewMessage('')
      }
    } catch (error) {
      console.error('Failed to send message:', error)
    }
  }

  const handleSummarize = async () => {
    try {
      setAiLoading(true)
      const token = localStorage.getItem('flux_token') || 'mock-token'
      const response = await fetch(`/api/communities/${id}/ai/summarize`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      if (response.ok) {
        const data = await response.json()
        setAiResponse(JSON.stringify(data.summary, null, 2))
      }
    } catch (error) {
      console.error('Failed to summarize:', error)
    } finally {
      setAiLoading(false)
    }
  }

  const handleAskAI = async () => {
    const question = prompt('What would you like to ask about this conversation?')
    if (!question) return

    try {
      setAiLoading(true)
      const token = localStorage.getItem('flux_token') || 'mock-token'
      const response = await fetch(`/api/communities/${id}/ai/ask`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ question })
      })
      if (response.ok) {
        const data = await response.json()
        setAiResponse(data.answer)
      }
    } catch (error) {
      console.error('Failed to ask AI:', error)
    } finally {
      setAiLoading(false)
    }
  }

  const isMember = community?.members.some(member => member.id === user?.id) || false

  if (loading) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto px-6 py-8">
          <div className="text-center">Loading...</div>
        </div>
      </Layout>
    )
  }

  if (!community) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto px-6 py-8">
          <div className="text-center">Community not found</div>
        </div>
      </Layout>
    )
  }

  if (!isMember) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto px-6 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-white mb-4">Access Denied</h1>
            <p className="text-gray-400">You need to join this community to access the chat.</p>
            <button
              onClick={() => router.push('/communities')}
              className="mt-4 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600"
            >
              Back to Communities
            </button>
          </div>
        </div>
      </Layout>
    )
  }

  return (
        <div className="h-screen flex flex-col bg-gradient-to-br from-gray-900 via-black to-gray-900">
      {/* Header */}
      <div className="flex items-center justify-between p-6 bg-gradient-to-r from-gray-900 to-black border-b border-gray-700/50 backdrop-blur-xl">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => router.push('/communities')}
            className="p-3 rounded-xl bg-gray-800/80 text-white hover:bg-gray-700/80 transition-all duration-200 hover:scale-105 backdrop-blur-sm border border-gray-700/30"
          >
            <ArrowLeftIcon className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">{community.post.title}</h1>
            <p className="text-sm text-gray-300">{community.members.length} members</p>
          </div>
        </div>
        <div className="flex space-x-3">
          <button 
            onClick={handleSummarize}
            disabled={aiLoading}
            className="p-3 rounded-xl bg-gradient-to-r from-purple-600/80 to-pink-600/80 text-white hover:from-purple-500 hover:to-pink-500 transition-all duration-200 hover:scale-105 backdrop-blur-sm border border-purple-500/30 shadow-lg disabled:opacity-50"
          >
            <SparklesIcon className="w-5 h-5" />
          </button>
          <button 
            onClick={handleAskAI}
            disabled={aiLoading}
            className="p-3 rounded-xl bg-gradient-to-r from-blue-600/80 to-cyan-600/80 text-white hover:from-blue-500 hover:to-cyan-500 transition-all duration-200 hover:scale-105 backdrop-blur-sm border border-blue-500/30 shadow-lg disabled:opacity-50">
            <ChartBarIcon className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Chat Messages */}
        <div className="flex-1 flex flex-col">
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {messages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-start space-x-3"
              >
                <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-white font-bold shadow-lg">
                  {message.isAnonymous ? 'A' : message.author.displayName?.[0] || 'U'}
                </div>
                <div className="flex-1">
                  <div className="flex items-baseline space-x-2 mb-1">
                    <span className="font-semibold text-white">
                      {message.isAnonymous ? message.author.anonymousCode : message.author.displayName}
                    </span>
                    <span className="text-xs text-gray-400">
                      {formatTimeAgo(new Date(message.createdAt))}
                    </span>
                  </div>
                  <div className="max-w-xs lg:max-w-md xl:max-w-lg bg-gray-800/80 backdrop-blur-sm rounded-2xl rounded-tl-sm p-3 text-white shadow-lg border border-gray-700/50">
                    {message.content}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Message Input */}
          <div className="p-6 bg-black/20 backdrop-blur-sm border-t border-white/10">
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setIsAnonymous(!isAnonymous)}
                className={`p-3 rounded-full transition-all duration-200 ${
                  isAnonymous 
                    ? 'bg-red-500/20 text-red-400 border border-red-500/30' 
                    : 'bg-white/10 text-white border border-white/20'
                }`}
              >
                {isAnonymous ? 'A' : 'U'}
              </button>
              <input
                type="text"
                className="flex-1 bg-white/10 backdrop-blur-sm text-white rounded-2xl p-4 focus:outline-none focus:ring-2 focus:ring-purple-500 border border-white/20 placeholder-gray-400"
                placeholder="Type your message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
              />
              <button
                onClick={sendMessage}
                className="bg-gradient-to-r from-purple-500 to-blue-500 text-white p-4 rounded-full hover:from-purple-600 hover:to-blue-600 transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                <PaperAirplaneIcon className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="w-80 bg-gradient-to-b from-gray-900/95 to-black/95 backdrop-blur-xl border-l border-gray-700/50 p-6 overflow-y-auto max-h-screen">
          <div className="space-y-6">
            {/* AI Chatbot */}
            <div className="bg-gradient-to-br from-gray-800/90 to-gray-700/90 rounded-xl p-4 backdrop-blur-sm border border-gray-600/30">
              <div className="flex items-center space-x-2 mb-4">
                <SparklesIcon className="w-5 h-5 text-red-400" />
                <h3 className="font-semibold text-white">AI Assistant</h3>
              </div>
              <div className="space-y-3">
                <button 
                  onClick={handleSummarize}
                  disabled={aiLoading}
                  className="w-full text-left p-3 bg-gradient-to-r from-purple-600/20 to-pink-600/20 rounded-lg text-white hover:from-purple-500/30 hover:to-pink-500/30 transition-all duration-200 border border-purple-500/30 disabled:opacity-50"
                >
                  {aiLoading ? 'Summarizing...' : 'Summarize conversation'}
                </button>
                <button 
                  onClick={handleAskAI}
                  disabled={aiLoading}
                  className="w-full text-left p-3 bg-gradient-to-r from-blue-600/20 to-cyan-600/20 rounded-lg text-white hover:from-blue-500/30 hover:to-cyan-500/30 transition-all duration-200 border border-blue-500/30 disabled:opacity-50"
                >
                  {aiLoading ? 'Thinking...' : 'Ask AI question'}
                </button>
              </div>
              {aiResponse && (
                <div className="mt-4 p-4 bg-gradient-to-r from-gray-700/60 to-gray-600/60 rounded-xl border border-gray-500/40 shadow-lg">
                  <div className="flex items-center space-x-2 mb-3">
                    <SparklesIcon className="w-4 h-4 text-purple-400" />
                    <h4 className="text-sm font-semibold text-white">AI Response</h4>
                  </div>
                  <div className="text-sm text-gray-200 whitespace-pre-wrap max-h-40 overflow-y-auto bg-gray-800/50 rounded-lg p-3 border border-gray-600/30">
                    {aiResponse}
                  </div>
                  <button 
                    onClick={() => setAiResponse('')}
                    className="mt-2 text-xs text-gray-400 hover:text-gray-300 transition-colors"
                  >
                    Clear
                  </button>
                </div>
              )}
            </div>

            {/* Dashboard */}
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <div className="flex items-center space-x-2 mb-4">
                <ChartBarIcon className="w-5 h-5 text-blue-400" />
                <h3 className="font-semibold text-white">Dashboard</h3>
              </div>
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-300 mb-2">Goals</h4>
                  <div className="space-y-2">
                    <div className="bg-white/5 rounded-lg p-3">
                      <p className="text-sm text-white">Complete project proposal</p>
                      <div className="w-full bg-gray-700 rounded-full h-2 mt-2">
                        <div className="bg-purple-500 h-2 rounded-full" style={{ width: '60%' }}></div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium text-gray-300 mb-2">Meetings</h4>
                  <div className="space-y-2">
                    <div className="bg-white/5 rounded-lg p-3">
                      <p className="text-sm text-white">Weekly sync</p>
                      <p className="text-xs text-gray-400">Tomorrow 2:00 PM</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Members */}
            <div className="bg-gradient-to-br from-gray-800/90 to-gray-700/90 rounded-xl p-4 backdrop-blur-sm border border-gray-600/30">
              <h3 className="font-semibold text-white mb-4">Members ({community.members.length})</h3>
              <div className="space-y-3 max-h-60 overflow-y-auto">
                {community.members.map((member, index) => (
                  <div key={index} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-700/50 transition-colors">
                    <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                      {member.displayName?.[0] || member.anonymousCode?.[4] || 'U'}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-white">
                        {member.displayName || member.anonymousCode}
                      </p>
                      <p className="text-xs text-gray-400">Online</p>
                    </div>
                    {member.id === user?.id && (
                      <span className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded-full">
                        You
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
