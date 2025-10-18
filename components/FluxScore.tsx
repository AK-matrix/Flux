import { motion } from 'framer-motion'
import { 
  StarIcon, 
  TrophyIcon, 
  FireIcon, 
  UserGroupIcon,
  HeartIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline'
import { fluxScoreCalculator } from '../lib/flux-score'

interface FluxScoreProps {
  score: {
    overall: number
    social: number
    helpfulness: number
    reliability: number
    engagement: number
  }
  badges: string[]
  tier: string
  showDetails?: boolean
}

export default function FluxScore({ score, badges, tier, showDetails = false }: FluxScoreProps) {
  const getScoreColor = (value: number) => {
    if (value >= 90) return 'text-yellow-400'
    if (value >= 80) return 'text-purple-400'
    if (value >= 70) return 'text-blue-400'
    if (value >= 60) return 'text-green-400'
    if (value >= 50) return 'text-gray-300'
    return 'text-red-400'
  }

  const getScoreBg = (value: number) => {
    if (value >= 90) return 'bg-gradient-to-r from-yellow-500/20 to-yellow-600/20'
    if (value >= 80) return 'bg-gradient-to-r from-purple-500/20 to-purple-600/20'
    if (value >= 70) return 'bg-gradient-to-r from-blue-500/20 to-blue-600/20'
    if (value >= 60) return 'bg-gradient-to-r from-green-500/20 to-green-600/20'
    return 'bg-gradient-to-r from-gray-500/20 to-gray-600/20'
  }

  return (
    <div className="space-y-4">
      {/* Overall Score */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`${getScoreBg(score.overall)} rounded-xl p-6 border border-gray-700`}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
              <StarIcon className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">Flux Score</h3>
              <p className="text-sm text-gray-400">{tier}</p>
            </div>
          </div>
          <div className="text-right">
            <div className={`text-3xl font-bold ${getScoreColor(score.overall)}`}>
              {score.overall.toFixed(0)}
            </div>
            <div className="text-sm text-gray-400">/ 100</div>
          </div>
        </div>
        
        {/* Progress Bar */}
        <div className="w-full bg-gray-700 rounded-full h-3 mb-4">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${score.overall}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
            className={`h-3 rounded-full ${
              score.overall >= 90 ? 'bg-gradient-to-r from-yellow-400 to-yellow-500' :
              score.overall >= 80 ? 'bg-gradient-to-r from-purple-400 to-purple-500' :
              score.overall >= 70 ? 'bg-gradient-to-r from-blue-400 to-blue-500' :
              score.overall >= 60 ? 'bg-gradient-to-r from-green-400 to-green-500' :
              'bg-gradient-to-r from-gray-400 to-gray-500'
            }`}
          />
        </div>

        {/* Badges */}
        {badges.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {badges.map((badge, index) => (
              <motion.span
                key={index}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                className="bg-purple-500/20 text-purple-300 px-3 py-1 rounded-full text-sm font-medium"
              >
                {badge}
              </motion.span>
            ))}
          </div>
        )}
      </motion.div>

      {/* Detailed Breakdown */}
      {showDetails && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-2 gap-4"
        >
          <div className="bg-gray-800/50 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-3">
              <UserGroupIcon className="w-5 h-5 text-blue-400" />
              <span className="text-sm font-medium text-white">Social</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="w-full bg-gray-700 rounded-full h-2 mr-3">
                <div 
                  className="bg-blue-400 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${score.social}%` }}
                />
              </div>
              <span className={`text-sm font-bold ${getScoreColor(score.social)}`}>
                {score.social.toFixed(0)}
              </span>
            </div>
          </div>

          <div className="bg-gray-800/50 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-3">
              <HeartIcon className="w-5 h-5 text-green-400" />
              <span className="text-sm font-medium text-white">Helpfulness</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="w-full bg-gray-700 rounded-full h-2 mr-3">
                <div 
                  className="bg-green-400 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${score.helpfulness}%` }}
                />
              </div>
              <span className={`text-sm font-bold ${getScoreColor(score.helpfulness)}`}>
                {score.helpfulness.toFixed(0)}
              </span>
            </div>
          </div>

          <div className="bg-gray-800/50 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-3">
              <ShieldCheckIcon className="w-5 h-5 text-purple-400" />
              <span className="text-sm font-medium text-white">Reliability</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="w-full bg-gray-700 rounded-full h-2 mr-3">
                <div 
                  className="bg-purple-400 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${score.reliability}%` }}
                />
              </div>
              <span className={`text-sm font-bold ${getScoreColor(score.reliability)}`}>
                {score.reliability.toFixed(0)}
              </span>
            </div>
          </div>

          <div className="bg-gray-800/50 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-3">
              <FireIcon className="w-5 h-5 text-orange-400" />
              <span className="text-sm font-medium text-white">Engagement</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="w-full bg-gray-700 rounded-full h-2 mr-3">
                <div 
                  className="bg-orange-400 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${score.engagement}%` }}
                />
              </div>
              <span className={`text-sm font-bold ${getScoreColor(score.engagement)}`}>
                {score.engagement.toFixed(0)}
              </span>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  )
}

