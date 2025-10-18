import { useState } from 'react'
import { motion } from 'framer-motion'
import { formatTimeAgo, getCreditScoreColor } from '../lib/utils'
import {
  HeartIcon,
  ChatBubbleLeftIcon,
  UserGroupIcon,
  ClockIcon,
  MapPinIcon,
  FlagIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline'
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid'
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

interface PostCardProps {
  post: Post
  onUpvote: (postId: string) => Promise<void>
  onJoinCommunity: (communityId: string) => Promise<void>
  onReport: (postId: string, reason: string) => Promise<void>
  onComplete?: (postId: string) => Promise<void>
}

export default function PostCard({ 
  post, 
  onUpvote, 
  onJoinCommunity, 
  onReport, 
  onComplete 
}: PostCardProps) {
  const { user } = useAuth()
  const [isExpanded, setIsExpanded] = useState(false)
  const [isUpvoting, setIsUpvoting] = useState(false)
  const [isJoining, setIsJoining] = useState(false)
  const [showReportModal, setShowReportModal] = useState(false)

  const isUpvoted = user ? post.upvotedBy.includes(user.id) : false
  const isAuthor = user ? post.author.id === user.id : false
  const canJoinCommunity = post.community && user && !post.community.members.some(m => m.id === user.id)
  const isCommunityFull = post.community && post.community.maxMembers && post.community.members.length >= post.community.maxMembers

  const handleUpvote = async () => {
    if (!user || isUpvoting) return
    
    setIsUpvoting(true)
    try {
      await onUpvote(post.id)
    } finally {
      setIsUpvoting(false)
    }
  }

  const handleJoinCommunity = async () => {
    if (!post.community || !user || isJoining) return
    
    setIsJoining(true)
    try {
      await onJoinCommunity(post.community.id)
    } finally {
      setIsJoining(false)
    }
  }

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'Instant': return 'text-red-400 bg-red-500/20'
      case 'Today': return 'text-orange-400 bg-orange-500/20'
      case 'Week': return 'text-yellow-400 bg-yellow-500/20'
      default: return 'text-gray-400 bg-gray-500/20'
    }
  }

  const getCategoryColor = (category: string) => {
    const colors = {
      'Project': 'text-blue-400 bg-blue-500/20',
      'Hackathon': 'text-purple-400 bg-purple-500/20',
      'Startup': 'text-green-400 bg-green-500/20',
      'Sport/Game': 'text-orange-400 bg-orange-500/20',
      'Assignment/Homework': 'text-yellow-400 bg-yellow-500/20',
      'Hangout': 'text-pink-400 bg-pink-500/20',
      'Misc/Random': 'text-gray-400 bg-gray-500/20',
      'Study Session': 'text-indigo-400 bg-indigo-500/20',
      'Volunteer': 'text-teal-400 bg-teal-500/20'
    }
    return colors[category as keyof typeof colors] || colors['Misc/Random']
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -6 }}
      className="glass-card rounded-xl p-6 mb-4 hover:shadow-soft transition-all duration-300"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(post.category)}`}>
              {post.category}
            </span>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getUrgencyColor(post.urgency)}`}>
              {post.urgency}
            </span>
            {post.isEphemeral && (
              <span className="px-2 py-1 rounded-full text-xs font-medium text-purple-400 bg-purple-500/20">
                Ephemeral
              </span>
            )}
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          {!isAuthor && (
            <button
              onClick={() => setShowReportModal(true)}
              className="p-1 text-gray-400 hover:text-red-400 transition-colors"
            >
              <FlagIcon className="w-4 h-4" />
            </button>
          )}
          {isAuthor && !post.isCompleted && (
            <button
              onClick={() => onComplete?.(post.id)}
              className="p-1 text-gray-400 hover:text-green-400 transition-colors"
            >
              <CheckCircleIcon className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Author Info */}
      <div className="flex items-center space-x-2 mb-3">
        <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center text-white text-sm font-medium">
          {post.isAnonymous ? '?' : (post.author.displayName?.[0] || post.author.anonymousCode?.[4] || 'A')}
        </div>
        <div>
          <div className="text-sm font-medium text-white">
            {post.isAnonymous ? post.author.anonymousCode : (post.author.displayName || 'Anonymous')}
          </div>
          <div className="flex items-center space-x-2">
            <div 
              className="w-2 h-2 rounded-full" 
              style={{ backgroundColor: getCreditScoreColor(post.author.creditScore) }}
            />
            <span className="text-xs text-gray-400">
              {post.author.creditScore.toFixed(0)} credit
            </span>
          </div>
        </div>
      </div>

      {/* Title and Description */}
      <h3 className="text-lg font-semibold text-white mb-2">{post.title}</h3>
      
      <div className="text-gray-300 mb-4">
        {isExpanded ? (
          <p className="whitespace-pre-wrap">{post.description}</p>
        ) : (
          <p className="line-clamp-2">{post.description}</p>
        )}
        {post.description.length > 100 && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-purple-400 hover:text-purple-300 text-sm mt-1"
          >
            {isExpanded ? 'Show less' : 'Read more'}
          </button>
        )}
      </div>

      {/* Details */}
      <div className="flex flex-wrap items-center gap-4 mb-4 text-sm text-gray-400">
        {post.location && (
          <div className="flex items-center space-x-1">
            <MapPinIcon className="w-4 h-4" />
            <span>{post.location}</span>
          </div>
        )}
        {post.timeStart && (
          <div className="flex items-center space-x-1">
            <ClockIcon className="w-4 h-4" />
            <span>{new Date(post.timeStart).toLocaleString()}</span>
          </div>
        )}
        {post.durationMins && (
          <div className="flex items-center space-x-1">
            <ClockIcon className="w-4 h-4" />
            <span>{post.durationMins} min</span>
          </div>
        )}
        {post.maxPeople && (
          <div className="flex items-center space-x-1">
            <UserGroupIcon className="w-4 h-4" />
            <span>Max {post.maxPeople} people</span>
          </div>
        )}
      </div>

      {/* Tags */}
      {post.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {post.tags.map((tag, index) => (
            <span
              key={index}
              className="px-2 py-1 bg-gray-700/50 text-gray-300 text-xs rounded-full"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}

      {/* Community Info */}
      {post.community && (
        <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-3 mb-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-purple-300">Ephemeral Community</div>
              <div className="text-xs text-gray-400">
                {post.community.members.length} / {post.community.maxMembers || '∞'} members
              </div>
            </div>
            {canJoinCommunity && !isCommunityFull && (
              <button
                onClick={handleJoinCommunity}
                disabled={isJoining}
                className="px-3 py-1 bg-purple-500 text-white text-sm rounded-lg hover:bg-purple-600 transition-colors disabled:opacity-50"
              >
                {isJoining ? 'Joining...' : 'Join'}
              </button>
            )}
            {isCommunityFull && (
              <span className="text-xs text-red-400">Full</span>
            )}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={handleUpvote}
            disabled={!user || isUpvoting}
            className={`flex items-center space-x-1 px-3 py-1 rounded-lg transition-colors ${
              isUpvoted 
                ? 'text-red-400 bg-red-500/20' 
                : 'text-gray-400 hover:text-red-400 hover:bg-red-500/10'
            } disabled:opacity-50`}
          >
            {isUpvoted ? (
              <HeartSolidIcon className="w-4 h-4" />
            ) : (
              <HeartIcon className="w-4 h-4" />
            )}
            <span className="text-sm">{post.upvotes}</span>
          </button>

          <div className="flex items-center space-x-1 text-gray-400">
            <ChatBubbleLeftIcon className="w-4 h-4" />
            <span className="text-sm">{post.comments.length}</span>
          </div>
        </div>

        <div className="text-xs text-gray-500">
          {formatTimeAgo(new Date(post.createdAt))}
        </div>
      </div>

      {/* Report Modal */}
      {showReportModal && (
        <ReportModal
          postId={post.id}
          onClose={() => setShowReportModal(false)}
          onReport={onReport}
        />
      )}
    </motion.div>
  )
}

function ReportModal({ postId, onClose, onReport }: { 
  postId: string
  onClose: () => void
  onReport: (postId: string, reason: string) => Promise<void>
}) {
  const [reason, setReason] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!reason) return

    setIsSubmitting(true)
    try {
      await onReport(postId, reason)
      onClose()
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="glass rounded-xl p-6 w-96">
        <h3 className="text-lg font-semibold text-white mb-4">Report Post</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Reason
            </label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="">Select a reason</option>
              <option value="spam">Spam</option>
              <option value="abusive">Abusive content</option>
              <option value="scam">Scam</option>
              <option value="no-show">No show</option>
              <option value="harassment">Harassment</option>
            </select>
          </div>
          <div className="flex space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!reason || isSubmitting}
              className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50"
            >
              {isSubmitting ? 'Reporting...' : 'Report'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

