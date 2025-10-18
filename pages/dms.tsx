import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { motion } from 'framer-motion'
import Layout from '../components/Layout'
import { useAuth } from '../hooks/useAuth'
import { formatTimeAgo } from '../lib/utils'
import {
  ChatBubbleLeftIcon,
  UserIcon,
  ShieldCheckIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline'

interface DM {
  id: string
  sender: {
    id: string
    displayName?: string
    anonymousCode?: string
    creditScore: number
  }
  receiver: {
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
  messages: {
    content: string
    createdAt: string
    isAnonymous: boolean
    author: {
      id: string
      displayName?: string
      anonymousCode?: string
    }
  }[]
  createdAt: string
  updatedAt: string
}

export default function DMsPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [dms, setDms] = useState<DM[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDMs()
  }, [])

  const fetchDMs = async () => {
    try {
      setLoading(true)
      const headers: HeadersInit = {}
      const token = localStorage.getItem('flux_token') || 'mock-token'
      if (token) {
        headers['Authorization'] = `Bearer ${token}`
      }
      
      const response = await fetch('/api/dms', { headers })
      if (response.ok) {
        const data = await response.json()
        setDms(data.dms)
      }
    } catch (error) {
      console.error('Failed to fetch DMs:', error)
    } finally {
      setLoading(false)
    }
  }

  const getOtherUser = (dm: DM) => {
    return dm.sender.id === user?.id ? dm.receiver : dm.sender
  }

  const getLastMessage = (dm: DM) => {
    return dm.messages[0] || null
  }

  const canAccessDM = (dm: DM) => {
    if (!dm.post) return true
    
    // Check credit score requirement
    if (dm.post.minCreditScore && (user?.creditScore || 0) < dm.post.minCreditScore) {
      return false
    }
    
    return true
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-6 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">Direct Messages</h1>
              <p className="text-gray-400">Your private conversations</p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="glass-card rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-blue-400 mb-1">
                {dms.length}
              </div>
              <div className="text-sm text-gray-400">Total Conversations</div>
            </div>
            <div className="glass-card rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-green-400 mb-1">
                {dms.filter(dm => canAccessDM(dm)).length}
              </div>
              <div className="text-sm text-gray-400">Accessible</div>
            </div>
            <div className="glass-card rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-purple-400 mb-1">
                {dms.filter(dm => dm.post).length}
              </div>
              <div className="text-sm text-gray-400">Post-Related</div>
            </div>
          </div>

          {/* DMs List */}
          {loading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="glass-card rounded-xl p-6 animate-pulse">
                  <div className="skeleton h-4 w-3/4 mb-4"></div>
                  <div className="skeleton h-3 w-full mb-2"></div>
                  <div className="skeleton h-3 w-2/3"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {dms.map((dm, index) => {
                const otherUser = getOtherUser(dm)
                const lastMessage = getLastMessage(dm)
                const canAccess = canAccessDM(dm)
                
                return (
                  <motion.div
                    key={dm.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="glass-card rounded-xl p-6 hover:shadow-soft transition-all duration-300"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4">
                        <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
                          <UserIcon className="w-6 h-6 text-white" />
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <h3 className="text-lg font-semibold text-white">
                              {otherUser.displayName || otherUser.anonymousCode || 'Anonymous'}
                            </h3>
                            <span className="text-xs bg-purple-500/20 text-purple-300 px-2 py-1 rounded">
                              Credit: {otherUser.creditScore.toFixed(0)}
                            </span>
                          </div>
                          
                          {dm.post && (
                            <div className="text-sm text-gray-400 mb-2">
                              Re: {dm.post.title}
                            </div>
                          )}
                          
                          {lastMessage && (
                            <div className="text-gray-300 text-sm mb-2">
                              <span className="text-gray-500">
                                {lastMessage.isAnonymous 
                                  ? lastMessage.author.anonymousCode 
                                  : lastMessage.author.displayName
                                }:
                              </span>
                              <span className="ml-2">{lastMessage.content}</span>
                            </div>
                          )}
                          
                          <div className="text-xs text-gray-500">
                            {formatTimeAgo(new Date(dm.updatedAt))}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex flex-col items-end space-y-2">
                        {!canAccess && (
                          <div className="flex items-center space-x-1 text-red-400 text-xs">
                            <ExclamationTriangleIcon className="w-4 h-4" />
                            <span>Access Restricted</span>
                          </div>
                        )}
                        
                        {dm.post?.minCreditScore && (
                          <div className="flex items-center space-x-1 text-orange-400 text-xs">
                            <ShieldCheckIcon className="w-4 h-4" />
                            <span>Min Credit: {dm.post.minCreditScore}</span>
                          </div>
                        )}
                        
                        <button
                          onClick={() => canAccess && router.push(`/dms/${dm.id}/chat`)}
                          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                            canAccess
                              ? 'bg-blue-500 text-white hover:bg-blue-600'
                              : 'bg-gray-700 text-gray-400 cursor-not-allowed'
                          }`}
                          disabled={!canAccess}
                        >
                          {canAccess ? 'Open Chat' : 'Restricted'}
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          )}

          {!loading && dms.length === 0 && (
            <div className="text-center py-12">
              <ChatBubbleLeftIcon className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <div className="text-gray-400 text-lg mb-2">No conversations yet</div>
              <div className="text-gray-500">Start a conversation by DMing someone from a post!</div>
            </div>
          )}
        </motion.div>
      </div>
    </Layout>
  )
}
