import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { motion } from 'framer-motion'
import Layout from '../../../components/Layout'
import { useAuth } from '../../../hooks/useAuth'
import { formatTimeAgo } from '../../../lib/utils'
import {
  PaperAirplaneIcon,
  UserIcon,
  ArrowLeftIcon,
  SparklesIcon,
  ChartBarIcon
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

interface DM {
  id: string
  sender: {
    id: string
    displayName?: string
    anonymousCode?: string
  }
  receiver: {
    id: string
    displayName?: string
    anonymousCode?: string
  }
  post?: {
    id: string
    title: string
    minCreditScore?: number
    requireRealName?: boolean
  }
}

export default function DMChatPage() {
  const router = useRouter()
  const { id } = router.query
  const { user } = useAuth()
  const [dm, setDM] = useState<DM | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [isAnonymous, setIsAnonymous] = useState(false)
  const [loading, setLoading] = useState(true)
  const [aiLoading, setAiLoading] = useState(false)
  const [aiResponse, setAiResponse] = useState('')

  useEffect(() => {
    if (id) {
      fetchDM()
      fetchMessages()
    }
  }, [id])

  const fetchDM = async () => {
    try {
      const token = localStorage.getItem('flux_token') || 'mock-token'
      const response = await fetch('/api/dms', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (response.ok) {
        const data = await response.json()
        const foundDM = data.dms.find((d: any) => d.id === id)
        setDM(foundDM)
      }
    } catch (error) {
      console.error('Failed to fetch DM:', error)
    }
  }

  const fetchMessages = async () => {
    try {
      const token = localStorage.getItem('flux_token') || 'mock-token'
      const response = await fetch(`/api/dms/${id}/messages`, {
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
      const response = await fetch(`/api/dms/${id}/messages`, {
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
      const response = await fetch(`/api/dms/${id}/ai/summarize`, {
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
      const response = await fetch(`/api/dms/${id}/ai/ask`, {
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

  const getOtherUser = () => {
    if (!dm || !user) return null
    return dm.sender.id === user.id ? dm.receiver : dm.sender
  }

  if (loading) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto px-6 py-8">
          <div className="text-center">Loading...</div>
        </div>
      </Layout>
    )
  }

  if (!dm) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto px-6 py-8">
          <div className="text-center">Conversation not found</div>
        </div>
      </Layout>
    )
  }

  const otherUser = getOtherUser()

  return (
        <div className="h-screen flex flex-col bg-gradient-to-br from-gray-900 via-black to-gray-900">
      {/* Header */}
      <div className="flex items-center justify-between p-6 bg-gradient-to-r from-gray-900 to-black border-b border-gray-700/50 backdrop-blur-xl">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => router.push('/dms')}
            className="p-3 rounded-xl bg-gray-800/80 text-white hover:bg-gray-700/80 transition-all duration-200 hover:scale-105 backdrop-blur-sm border border-gray-700/30"
          >
            <ArrowLeftIcon className="w-5 h-5" />
          </button>
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500 rounded-full flex items-center justify-center text-white font-bold shadow-2xl ring-2 ring-red-500/30">
              {otherUser?.displayName?.[0] || otherUser?.anonymousCode?.[4] || 'U'}
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                {otherUser?.displayName || otherUser?.anonymousCode || 'Anonymous'}
              </h1>
              {dm.post && (
                <div className="bg-gradient-to-r from-gray-800/60 to-gray-700/60 rounded-xl p-3 mt-3 backdrop-blur-sm border border-gray-600/30">
                  <p className="text-sm text-gray-300">Re: {dm.post.title}</p>
                  {dm.post.minCreditScore && (
                    <p className="text-xs text-orange-400">Min Credit: {dm.post.minCreditScore}</p>
                  )}
                  {dm.post.requireRealName && (
                    <p className="text-xs text-blue-400">Real name required</p>
                  )}
                </div>
              )}
            </div>
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
              <div className="flex-1 overflow-y-auto p-8 space-y-6 bg-gradient-to-b from-transparent via-gray-900/20 to-transparent">
            {messages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex items-start space-x-3 ${message.author.id === user?.id ? 'flex-row-reverse space-x-reverse' : ''}`}
              >
                    <div className="w-12 h-12 bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500 rounded-full flex items-center justify-center text-white font-bold shadow-2xl ring-2 ring-red-500/30">
                  {message.isAnonymous ? 'A' : message.author.displayName?.[0] || 'U'}
                </div>
                <div className={`flex-1 ${message.author.id === user?.id ? 'text-right' : ''}`}>
                  <div className={`flex items-baseline space-x-2 mb-1 ${message.author.id === user?.id ? 'flex-row-reverse space-x-reverse' : ''}`}>
                    <span className="font-semibold text-white">
                      {message.isAnonymous ? message.author.anonymousCode : message.author.displayName}
                    </span>
                    <span className="text-xs text-gray-400">
                      {formatTimeAgo(new Date(message.createdAt))}
                    </span>
                  </div>
                  <div className={`max-w-xs lg:max-w-md xl:max-w-lg backdrop-blur-xl rounded-2xl p-4 text-white shadow-2xl ${
                    message.author.id === user?.id 
                      ? 'rounded-tr-sm bg-gradient-to-r from-red-500/20 via-orange-500/20 to-yellow-500/20 ml-auto border border-red-400/40 shadow-red-500/20' 
                      : 'rounded-tl-sm bg-gradient-to-r from-gray-800/90 to-gray-700/90 border border-gray-600/40 shadow-gray-500/20'
                  }`}>
                    {message.content}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Message Input */}
              <div className="p-6 bg-gradient-to-r from-gray-900/95 to-black/95 border-t border-gray-700/50 backdrop-blur-xl">
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setIsAnonymous(!isAnonymous)}
                className={`p-4 rounded-full transition-all duration-200 hover:scale-110 ${
                  isAnonymous 
                    ? 'bg-gradient-to-r from-red-500/30 to-pink-500/30 text-red-300 border-2 border-red-400/50 shadow-lg shadow-red-500/20' 
                    : 'bg-gradient-to-r from-gray-700/80 to-gray-600/80 text-white border-2 border-gray-500/50 shadow-lg shadow-gray-500/20'
                }`}
              >
                {isAnonymous ? 'A' : 'U'}
              </button>
              <input
                type="text"
                className="flex-1 bg-gradient-to-r from-gray-800/90 to-gray-700/90 text-white rounded-2xl p-4 focus:outline-none focus:ring-2 focus:ring-red-500/50 border border-gray-600/50 placeholder-gray-400 backdrop-blur-sm shadow-lg"
                placeholder="Type your message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
              />
                  <button
                    onClick={sendMessage}
                    className="bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500 text-white p-4 rounded-full hover:from-red-400 hover:via-orange-400 hover:to-yellow-400 transition-all duration-200 shadow-2xl hover:shadow-red-500/30 hover:scale-110 border border-red-400/30"
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
            <div className="bg-gray-800 rounded-xl p-4">
              <div className="flex items-center space-x-2 mb-4">
                <ChartBarIcon className="w-5 h-5 text-orange-400" />
                <h3 className="font-semibold text-white">Dashboard</h3>
              </div>
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-300 mb-2">Shared Files</h4>
                  <div className="space-y-2">
                    <div className="bg-gray-700 rounded-lg p-3">
                      <p className="text-sm text-white">Project proposal.pdf</p>
                      <p className="text-xs text-gray-400">2.3 MB • 2 days ago</p>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium text-gray-300 mb-2">Quick Actions</h4>
                  <div className="space-y-2">
                    <button className="w-full text-left p-3 bg-gray-700 rounded-lg text-white hover:bg-gray-600 transition-colors">
                      Schedule meeting
                    </button>
                    <button className="w-full text-left p-3 bg-gray-700 rounded-lg text-white hover:bg-gray-600 transition-colors">
                      Share file
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Members */}
            <div className="bg-gradient-to-br from-gray-800/90 to-gray-700/90 rounded-xl p-4 backdrop-blur-sm border border-gray-600/30">
              <h3 className="font-semibold text-white mb-4">Members (2)</h3>
              <div className="space-y-3">
                {/* You */}
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-red-500 to-orange-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                    {user?.displayName?.[0] || 'Y'}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">You</p>
                    <p className="text-xs text-green-400">Online</p>
                  </div>
                </div>
                
                {/* Other User */}
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                    {otherUser?.displayName?.[0] || otherUser?.anonymousCode?.[4] || 'U'}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">
                      {otherUser?.displayName || otherUser?.anonymousCode || 'Unknown'}
                    </p>
                    <p className="text-xs text-gray-400">Online</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
