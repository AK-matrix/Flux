import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Layout from '../components/Layout'
import PostCard from '../components/PostCard'
import CreateModal from '../components/CreateModal'
import TrendingSidebar from '../components/TrendingSidebar'
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

export default function Home() {
  const { user } = useAuth()
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    fetchPosts()
  }, [filter])

  const fetchPosts = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (filter !== 'all') params.append('category', filter)
      
      // Get stored token for authentication
      const token = localStorage.getItem('flux_token') || 'mock-token'
      const headers: HeadersInit = {}
      if (token) {
        headers['Authorization'] = `Bearer ${token}`
      }
      
      const response = await fetch(`/api/posts?${params}`, { headers })
      if (response.ok) {
        const data = await response.json()
        setPosts(data.posts)
      }
    } catch (error) {
      console.error('Failed to fetch posts:', error)
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
      const token = localStorage.getItem('flux_token') || 'mock-token'
      const response = await fetch(`/api/communities/${communityId}/join`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      if (response.ok) {
        // Refresh posts to update community membership
        fetchPosts()
        alert('Successfully joined community!')
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to join community')
      }
    } catch (error) {
      console.error('Failed to join community:', error)
      alert('Failed to join community')
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

  const handleCreatePost = async (data: any) => {
    try {
      const token = localStorage.getItem('flux_token') || 'mock-token'
      const headers: HeadersInit = { 'Content-Type': 'application/json' }
      if (token) {
        headers['Authorization'] = `Bearer ${token}`
      }
      
      const response = await fetch('/api/posts', {
        method: 'POST',
        headers,
        body: JSON.stringify(data)
      })
      if (response.ok) {
        const newPost = await response.json()
        setPosts(prev => [newPost.post, ...prev])
      }
    } catch (error) {
      console.error('Failed to create post:', error)
    }
  }

  const categories = [
    'all', 'Project', 'Hackathon', 'Startup', 'Sport/Game', 
    'Assignment/Homework', 'Hangout', 'Misc/Random', 'Study Session', 'Volunteer'
  ]

  return (
    <Layout>
      <div className="flex">
        {/* Main Feed */}
        <div className="flex-1 max-w-4xl mx-auto px-6 py-8">
          {/* Hero Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card rounded-xl p-6 mb-6"
          >
            <h1 className="text-2xl font-bold text-white mb-2">
              Flux
            </h1>
            <p className="text-gray-300 mb-4">
              Make real connections fast. Need someone in 20 mins? Post 'Instant'. 
              Want a durable team for a project? Post 'Project' and start a self-disappearing community. 
              Only NUS students.
            </p>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowCreateModal(true)}
                className="px-6 py-2 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-lg hover:from-purple-600 hover:to-blue-600 transition-all duration-300 font-medium"
              >
                Create Post
              </button>
              <div className="text-sm text-gray-400">
                {user ? `Welcome back, ${user.displayName || user.anonymousCode || 'Anonymous'}!` : 'Join the community'}
              </div>
            </div>
          </motion.div>

          {/* Filters */}
          <div className="flex items-center space-x-2 mb-6 overflow-x-auto pb-2">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setFilter(category)}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                  filter === category
                    ? 'bg-purple-500 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                {category === 'all' ? 'All' : category}
              </button>
            ))}
          </div>

          {/* Posts */}
          {loading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="glass-card rounded-xl p-6 animate-pulse">
                  <div className="skeleton h-4 w-3/4 mb-4"></div>
                  <div className="skeleton h-3 w-full mb-2"></div>
                  <div className="skeleton h-3 w-2/3"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {posts.map((post) => (
                <PostCard
                  key={post.id}
                  post={post}
                  onUpvote={handleUpvote}
                  onJoinCommunity={handleJoinCommunity}
                  onReport={handleReport}
                  onComplete={handleComplete}
                />
              ))}
              {posts.length === 0 && (
                <div className="text-center py-12">
                  <div className="text-gray-400 text-lg mb-2">No posts yet</div>
                  <div className="text-gray-500">Be the first to create a post!</div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="w-80 p-6">
          <TrendingSidebar />
        </div>
      </div>

      {/* Create Modal */}
      <CreateModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleCreatePost}
      />
    </Layout>
  )
}

