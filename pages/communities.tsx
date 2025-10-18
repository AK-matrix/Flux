import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { motion } from 'framer-motion'
import Layout from '../components/Layout'
import { useAuth } from '../hooks/useAuth'
import { formatTimeAgo } from '../lib/utils'
import {
  UserGroupIcon,
  ClockIcon,
  UsersIcon,
  FireIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline'

interface Community {
  id: string
  post: {
    id: string
    title: string
    description: string
    category: string
    urgency: string
    isEphemeral: boolean
    ttlHours?: number
    createdAt: string
    author: {
      id: string
      displayName?: string
      anonymousCode?: string
    }
  }
  maxMembers?: number
  members: {
    id: string
    displayName?: string
    anonymousCode?: string
  }[]
  createdAt: string
  ttlHours: number
  isActive: boolean
}

export default function CommunitiesPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [communities, setCommunities] = useState<Community[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    fetchCommunities()
  }, [filter])

  const fetchCommunities = async () => {
    try {
      setLoading(true)
      const headers: HeadersInit = {}
      const token = localStorage.getItem('flux_token') || 'mock-token'
      if (token) {
        headers['Authorization'] = `Bearer ${token}`
      }
      
      const response = await fetch('/api/communities', { headers })
      if (response.ok) {
        const data = await response.json()
        setCommunities(data.communities)
      }
    } catch (error) {
      console.error('Failed to fetch communities:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleJoinCommunity = async (communityId: string) => {
    try {
      const token = localStorage.getItem('flux_token') || 'mock-token'
      console.log('Joining community:', communityId, 'with token:', token)
      const response = await fetch(`/api/communities/${communityId}/join`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      if (response.ok) {
        console.log('Successfully joined community')
        fetchCommunities()
        alert('Successfully joined community!')
      } else {
        const error = await response.json()
        console.error('Join community error:', error)
        alert(error.error || 'Failed to join community')
      }
    } catch (error) {
      console.error('Failed to join community:', error)
      alert('Failed to join community')
    }
  }

  const handleLeaveCommunity = async (communityId: string) => {
    try {
      const token = localStorage.getItem('flux_token') || 'mock-token'
      const response = await fetch(`/api/communities/${communityId}/leave`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      if (response.ok) {
        fetchCommunities()
        alert('Successfully left community!')
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to leave community')
      }
    } catch (error) {
      console.error('Failed to leave community:', error)
      alert('Failed to leave community')
    }
  }

  const getTimeRemaining = (createdAt: string, ttlHours: number) => {
    const created = new Date(createdAt)
    const expires = new Date(created.getTime() + ttlHours * 60 * 60 * 1000)
    const now = new Date()
    const remaining = expires.getTime() - now.getTime()
    
    if (remaining <= 0) return 'Expired'
    
    const hours = Math.floor(remaining / (1000 * 60 * 60))
    const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60))
    
    if (hours > 0) return `${hours}h ${minutes}m left`
    return `${minutes}m left`
  }

  const isMember = (community: Community) => {
    if (!user) return false
    const isUserMember = community.members.some(member => member.id === user.id)
    console.log('Checking membership:', { userId: user.id, members: community.members.map(m => m.id), isMember: isUserMember })
    return isUserMember
  }

  const isFull = (community: Community) => {
    return community.maxMembers && community.members.length >= community.maxMembers
  }

  const filteredCommunities = communities.filter(community => {
    if (filter === 'all') return true
    if (filter === 'active') return community.isActive
    if (filter === 'expired') return !community.isActive
    return true
  })

  return (
    <Layout>
      <div className="max-w-6xl mx-auto px-6 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">Communities</h1>
              <p className="text-gray-400">Join ephemeral communities and connect with others</p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="glass-card rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-purple-400 mb-1">
                {communities.length}
              </div>
              <div className="text-sm text-gray-400">Total Communities</div>
            </div>
            <div className="glass-card rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-green-400 mb-1">
                {communities.filter(c => c.isActive).length}
              </div>
              <div className="text-sm text-gray-400">Active</div>
            </div>
            <div className="glass-card rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-blue-400 mb-1">
                {communities.reduce((sum, c) => sum + c.members.length, 0)}
              </div>
              <div className="text-sm text-gray-400">Total Members</div>
            </div>
            <div className="glass-card rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-orange-400 mb-1">
                {communities.filter(c => c.post.urgency === 'Instant').length}
              </div>
              <div className="text-sm text-gray-400">Instant</div>
            </div>
          </div>

          {/* Filters */}
          <div className="flex items-center space-x-2">
            {['all', 'active', 'expired'].map((filterOption) => (
              <button
                key={filterOption}
                onClick={() => setFilter(filterOption)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filter === filterOption
                    ? 'bg-purple-500 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                {filterOption.charAt(0).toUpperCase() + filterOption.slice(1)}
              </button>
            ))}
          </div>

          {/* Communities */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="glass-card rounded-xl p-6 animate-pulse">
                  <div className="skeleton h-4 w-3/4 mb-4"></div>
                  <div className="skeleton h-3 w-full mb-2"></div>
                  <div className="skeleton h-3 w-2/3"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCommunities.map((community, index) => (
                <motion.div
                  key={community.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="glass-card rounded-xl p-6 hover:shadow-soft transition-all duration-300"
                >
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-2">
                      <UserGroupIcon className="w-5 h-5 text-purple-400" />
                      <span className="text-sm font-medium text-purple-300">
                        {community.post.category}
                      </span>
                    </div>
                    {community.post.isEphemeral && (
                      <div className="flex items-center space-x-1 text-xs text-orange-400">
                        <FireIcon className="w-4 h-4" />
                        <span>Ephemeral</span>
                      </div>
                    )}
                  </div>

                  {/* Post Info */}
                  <div className="mb-4">
                    <h3 className="text-lg font-semibold text-white mb-2 line-clamp-2">
                      {community.post.title}
                    </h3>
                    <p className="text-gray-300 text-sm line-clamp-2 mb-3">
                      {community.post.description}
                    </p>
                    <div className="flex items-center space-x-2 text-xs text-gray-400">
                      <span>by {community.post.author.displayName || community.post.author.anonymousCode || 'Anonymous'}</span>
                      <span>•</span>
                      <span>{formatTimeAgo(new Date(community.post.createdAt))}</span>
                    </div>
                  </div>

                  {/* Community Stats */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-4 text-sm text-gray-400">
                      <div className="flex items-center space-x-1">
                        <UsersIcon className="w-4 h-4" />
                        <span>{community.members.length} / {community.maxMembers || '∞'}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <ClockIcon className="w-4 h-4" />
                        <span>{getTimeRemaining(community.createdAt, community.ttlHours)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Members */}
                  <div className="mb-4">
                    <div className="text-xs text-gray-400 mb-2">Members</div>
                    <div className="flex flex-wrap gap-1">
                      {community.members.slice(0, 5).map((member, index) => (
                        <div
                          key={index}
                          className="w-6 h-6 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center text-white text-xs font-medium"
                        >
                          {member.displayName?.[0] || member.anonymousCode?.[4] || '?'}
                        </div>
                      ))}
                      {community.members.length > 5 && (
                        <div className="w-6 h-6 rounded-full bg-gray-600 flex items-center justify-center text-white text-xs">
                          +{community.members.length - 5}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex space-x-2">
                    {isMember(community) ? (
                      <>
                        <button
                          onClick={() => router.push(`/communities/${community.id}/chat`)}
                          className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm"
                        >
                          Chat
                        </button>
                        <button
                          onClick={() => handleLeaveCommunity(community.id)}
                          className="flex-1 px-4 py-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 transition-colors text-sm"
                        >
                          Leave
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => handleJoinCommunity(community.id)}
                        disabled={isFull(community) || !community.isActive}
                        className="flex-1 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                      >
                        {isFull(community) ? 'Full' : !community.isActive ? 'Expired' : 'Join'}
                      </button>
                    )}
                  </div>

                  {/* Warning for expiring communities */}
                  {community.isActive && community.post.isEphemeral && (
                    <div className="mt-3 p-2 bg-orange-500/10 border border-orange-500/20 rounded-lg">
                      <div className="flex items-center space-x-1 text-xs text-orange-400">
                        <ExclamationTriangleIcon className="w-3 h-3" />
                        <span>This community will disappear in {getTimeRemaining(community.createdAt, community.ttlHours)}</span>
                      </div>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          )}

          {!loading && filteredCommunities.length === 0 && (
            <div className="text-center py-12">
              <UserGroupIcon className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <div className="text-gray-400 text-lg mb-2">No communities found</div>
              <div className="text-gray-500">Create a post with an ephemeral community to get started!</div>
            </div>
          )}
        </motion.div>
      </div>
    </Layout>
  )
}

