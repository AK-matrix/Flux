import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Layout from '../components/Layout'
import PostCard from '../components/PostCard'
import { useAuth } from '../hooks/useAuth'

interface Post {
  id: string
  title: string
  description: string
  category: string
  tags: string[]
  location?: string
  timeStart?: string
  durationMins?: number
  maxPeople?: number
  urgency: string
  isAnonymous: boolean
  isEphemeral: boolean
  ttlHours?: number
  createdAt: string
  upvotes: number
  upvotedBy: string[]
  isCompleted: boolean
  trendingScore: number
  author: {
    id: string
    displayName?: string
    anonymousCode?: string
    creditScore: number
  }
  comments: { id: string }[]
  community?: {
    id: string
    maxMembers?: number
    members: { id: string }[]
  }
}

export default function TrendingPage() {
  const { user } = useAuth()
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [sortBy, setSortBy] = useState('trending')

  useEffect(() => {
    fetchTrendingPosts()
  }, [sortBy])

  const fetchTrendingPosts = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/trending')
      if (response.ok) {
        const data = await response.json()
        setPosts(data.posts)
      }
    } catch (error) {
      console.error('Failed to fetch trending posts:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleUpvote = async (postId: string) => {
    try {
      const response = await fetch(`/api/posts/${postId}/upvote`, {
        method: 'POST'
      })
      if (response.ok) {
        const data = await response.json()
        setPosts(prev => prev.map(post => 
          post.id === postId 
            ? { ...post, upvotes: data.upvotes, upvotedBy: data.upvoted ? [...post.upvotedBy, user?.id || ''] : post.upvotedBy.filter(id => id !== user?.id) }
            : post
        ))
      }
    } catch (error) {
      console.error('Failed to upvote:', error)
    }
  }

  const handleJoinCommunity = async (communityId: string) => {
    try {
      const response = await fetch(`/api/communities/${communityId}/join`, {
        method: 'POST'
      })
      if (response.ok) {
        fetchTrendingPosts()
      }
    } catch (error) {
      console.error('Failed to join community:', error)
    }
  }

  const handleReport = async (postId: string, reason: string) => {
    try {
      const response = await fetch('/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postId, reason })
      })
      if (response.ok) {
        alert('Report submitted successfully')
      }
    } catch (error) {
      console.error('Failed to report:', error)
    }
  }

  const handleComplete = async (postId: string) => {
    try {
      const response = await fetch(`/api/posts/${postId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isCompleted: true })
      })
      if (response.ok) {
        setPosts(prev => prev.map(post => 
          post.id === postId ? { ...post, isCompleted: true } : post
        ))
      }
    } catch (error) {
      console.error('Failed to complete post:', error)
    }
  }

  const sortOptions = [
    { value: 'trending', label: 'Trending' },
    { value: 'new', label: 'Newest' },
    { value: 'active', label: 'Most Active' }
  ]

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
              <h1 className="text-3xl font-bold text-white mb-2">Trending</h1>
              <p className="text-gray-400">What's hot in the NUS community</p>
            </div>
            
            <div className="flex items-center space-x-2">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                {sortOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Trending Stats */}
          <div className="glass-card rounded-xl p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-400 mb-1">
                  {posts.filter(p => p.urgency === 'Instant').length}
                </div>
                <div className="text-sm text-gray-400">Instant Posts</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-400 mb-1">
                  {posts.filter(p => p.isEphemeral).length}
                </div>
                <div className="text-sm text-gray-400">Ephemeral Communities</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-400 mb-1">
                  {posts.reduce((sum, p) => sum + p.upvotes, 0)}
                </div>
                <div className="text-sm text-gray-400">Total Upvotes</div>
              </div>
            </div>
          </div>

          {/* Posts */}
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
              {posts.map((post, index) => (
                <motion.div
                  key={post.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <PostCard
                    post={post}
                    onUpvote={handleUpvote}
                    onJoinCommunity={handleJoinCommunity}
                    onReport={handleReport}
                    onComplete={handleComplete}
                  />
                </motion.div>
              ))}
              {posts.length === 0 && (
                <div className="text-center py-12">
                  <div className="text-gray-400 text-lg mb-2">No trending posts yet</div>
                  <div className="text-gray-500">Be the first to create something that trends!</div>
                </div>
              )}
            </div>
          )}
        </motion.div>
      </div>
    </Layout>
  )
}

