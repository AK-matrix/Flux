import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { FireIcon, MapPinIcon, UserGroupIcon } from '@heroicons/react/24/outline'

interface TrendingTopic {
  tag: string
  count: number
}

interface QuickAction {
  title: string
  description: string
  icon: React.ComponentType<any>
  onClick: () => void
}

export default function TrendingSidebar() {
  const [trendingTopics, setTrendingTopics] = useState<TrendingTopic[]>([])
  const [nearbyPosts, setNearbyPosts] = useState<any[]>([])

  useEffect(() => {
    fetchTrendingTopics()
    fetchNearbyPosts()
  }, [])

  const fetchTrendingTopics = async () => {
    try {
      const response = await fetch('/api/trending')
      if (response.ok) {
        const data = await response.json()
        // Extract trending tags from posts
        const tagCounts: { [key: string]: number } = {}
        data.posts.forEach((post: any) => {
          post.tags.forEach((tag: string) => {
            tagCounts[tag] = (tagCounts[tag] || 0) + 1
          })
        })
        
        const trending = Object.entries(tagCounts)
          .map(([tag, count]) => ({ tag, count }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 5)
        
        setTrendingTopics(trending)
      }
    } catch (error) {
      console.error('Failed to fetch trending topics:', error)
    }
  }

  const fetchNearbyPosts = async () => {
    try {
      const response = await fetch('/api/posts?urgent=true&limit=3')
      if (response.ok) {
        const data = await response.json()
        setNearbyPosts(data.posts)
      }
    } catch (error) {
      console.error('Failed to fetch nearby posts:', error)
    }
  }

  const quickActions: QuickAction[] = [
    {
      title: 'Create Instant Event',
      description: 'Meet within 1 hour',
      icon: FireIcon,
      onClick: () => {
        // This would open the create modal with instant urgency
        console.log('Create instant event')
      }
    },
    {
      title: 'Start Project Thread',
      description: 'Long-term collaboration',
      icon: UserGroupIcon,
      onClick: () => {
        // This would open the create modal with project category
        console.log('Start project thread')
      }
    }
  ]

  return (
    <div className="space-y-6">
      {/* Trending Topics */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card rounded-xl p-4"
      >
        <div className="flex items-center space-x-2 mb-4">
          <FireIcon className="w-5 h-5 text-orange-400" />
          <h3 className="text-lg font-semibold text-white">Trending Now</h3>
        </div>
        <div className="space-y-2">
          {trendingTopics.map((topic, index) => (
            <div
              key={topic.tag}
              className="flex items-center justify-between p-2 rounded-lg bg-gray-800/50 hover:bg-gray-700/50 transition-colors cursor-pointer"
            >
              <span className="text-sm text-gray-300">#{topic.tag}</span>
              <span className="text-xs text-gray-500">{topic.count} posts</span>
            </div>
          ))}
          {trendingTopics.length === 0 && (
            <div className="text-sm text-gray-500">No trending topics yet</div>
          )}
        </div>
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass-card rounded-xl p-4"
      >
        <h3 className="text-lg font-semibold text-white mb-4">Quick Actions</h3>
        <div className="space-y-3">
          {quickActions.map((action, index) => (
            <button
              key={index}
              onClick={action.onClick}
              className="w-full p-3 rounded-lg bg-gray-800/50 hover:bg-gray-700/50 transition-colors text-left"
            >
              <div className="flex items-center space-x-3">
                <action.icon className="w-5 h-5 text-purple-400" />
                <div>
                  <div className="text-sm font-medium text-white">{action.title}</div>
                  <div className="text-xs text-gray-400">{action.description}</div>
                </div>
              </div>
            </button>
          ))}
        </div>
      </motion.div>

      {/* Nearby Now */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="glass-card rounded-xl p-4"
      >
        <div className="flex items-center space-x-2 mb-4">
          <MapPinIcon className="w-5 h-5 text-teal-400" />
          <h3 className="text-lg font-semibold text-white">Nearby Now</h3>
        </div>
        <div className="space-y-3">
          {nearbyPosts.map((post) => (
            <div
              key={post.id}
              className="p-3 rounded-lg bg-gray-800/50 hover:bg-gray-700/50 transition-colors cursor-pointer"
            >
              <div className="text-sm font-medium text-white mb-1 line-clamp-1">
                {post.title}
              </div>
              <div className="text-xs text-gray-400 mb-2">
                {post.category} • {post.urgency}
              </div>
              <div className="flex items-center space-x-2 text-xs text-gray-500">
                <span>{post.upvotes} upvotes</span>
                <span>•</span>
                <span>{post.comments.length} comments</span>
              </div>
            </div>
          ))}
          {nearbyPosts.length === 0 && (
            <div className="text-sm text-gray-500">No nearby posts</div>
          )}
        </div>
      </motion.div>

      {/* Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="glass-card rounded-xl p-4"
      >
        <h3 className="text-lg font-semibold text-white mb-4">Community Stats</h3>
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-300">Active Posts</span>
            <span className="text-sm font-medium text-white">24</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-300">Communities</span>
            <span className="text-sm font-medium text-white">8</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-300">Online Now</span>
            <span className="text-sm font-medium text-green-400">156</span>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

