interface UserActivity {
  postsCreated: number
  commentsMade: number
  messagesSent: number
  communitiesJoined: number
  upvotesReceived: number
  upvotesGiven: number
  reportsMade: number
  reportsAgainst: number
  dmsSent: number
  dmsReceived: number
  goalsCompleted: number
  meetingsAttended: number
  timeActive: number // in minutes
  lastActive: Date
}

interface FluxScore {
  overall: number
  social: number
  helpfulness: number
  reliability: number
  engagement: number
  breakdown: {
    activity: number
    quality: number
    social: number
    consistency: number
  }
}

export class FluxScoreCalculator {
  static calculate(user: any, activity: UserActivity): FluxScore {
    // Base score starts at 50
    let baseScore = 50

    // Activity multiplier (0-30 points)
    const activityScore = Math.min(30, 
      (activity.postsCreated * 2) +
      (activity.commentsMade * 0.5) +
      (activity.messagesSent * 0.3) +
      (activity.communitiesJoined * 3) +
      (activity.timeActive / 60) // 1 point per hour active
    )

    // Quality multiplier (0-25 points)
    const qualityScore = Math.min(25,
      (activity.upvotesReceived * 2) +
      (activity.goalsCompleted * 5) +
      (activity.meetingsAttended * 3) -
      (activity.reportsAgainst * 5)
    )

    // Social multiplier (0-20 points)
    const socialScore = Math.min(20,
      (activity.dmsSent + activity.dmsReceived) * 0.5 +
      (activity.upvotesGiven * 0.2)
    )

    // Consistency multiplier (0-15 points)
    const daysSinceLastActive = (Date.now() - activity.lastActive.getTime()) / (1000 * 60 * 60 * 24)
    const consistencyScore = Math.min(15, Math.max(0, 15 - daysSinceLastActive))

    const totalScore = baseScore + activityScore + qualityScore + socialScore + consistencyScore

    return {
      overall: Math.min(100, Math.max(0, totalScore)),
      social: Math.min(100, socialScore + 20),
      helpfulness: Math.min(100, qualityScore + 30),
      reliability: Math.min(100, consistencyScore + 40),
      engagement: Math.min(100, activityScore + 25),
      breakdown: {
        activity: activityScore,
        quality: qualityScore,
        social: socialScore,
        consistency: consistencyScore
      }
    }
  }

  static getFluxTier(score: number): string {
    if (score >= 90) return 'Flux Legend'
    if (score >= 80) return 'Flux Master'
    if (score >= 70) return 'Flux Expert'
    if (score >= 60) return 'Flux Pro'
    if (score >= 50) return 'Flux Member'
    if (score >= 40) return 'Flux Newcomer'
    return 'Flux Rookie'
  }

  static getFluxColor(score: number): string {
    if (score >= 90) return 'text-yellow-400'
    if (score >= 80) return 'text-purple-400'
    if (score >= 70) return 'text-blue-400'
    if (score >= 60) return 'text-green-400'
    if (score >= 50) return 'text-gray-300'
    return 'text-red-400'
  }

  static getFluxBadges(score: FluxScore): string[] {
    const badges = []
    
    if (score.social >= 80) badges.push('🤝 Social Butterfly')
    if (score.helpfulness >= 80) badges.push('💡 Helpful Hero')
    if (score.reliability >= 80) badges.push('⭐ Reliable Rock')
    if (score.engagement >= 80) badges.push('🔥 Engagement Expert')
    
    if (score.overall >= 90) badges.push('👑 Flux Legend')
    if (score.overall >= 80) badges.push('🏆 Flux Master')
    if (score.overall >= 70) badges.push('🎯 Flux Expert')
    
    return badges
  }
}

export const fluxScoreCalculator = FluxScoreCalculator

