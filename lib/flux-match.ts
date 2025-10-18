import { chatAI } from './ai'

interface User {
  id: string
  interests: string[]
  year: string
  major: string
  creditScore: number
  fluxScore: number
  availability: string[]
  skills: string[]
  goals: string[]
}

interface MatchResult {
  score: number
  reasons: string[]
  compatibility: {
    interests: number
    schedule: number
    skills: number
    goals: number
  }
}

export class FluxMatcher {
  static async findOptimalGroups(users: User[], groupSize: number = 4): Promise<User[][]> {
    const groups: User[][] = []
    const used = new Set<string>()
    
    // Sort users by flux score (highest first)
    const sortedUsers = users.sort((a, b) => b.fluxScore - a.fluxScore)
    
    for (let i = 0; i < sortedUsers.length; i++) {
      if (used.has(sortedUsers[i].id)) continue
      
      const group = [sortedUsers[i]]
      used.add(sortedUsers[i].id)
      
      // Find best matches for this group
      for (let j = i + 1; j < sortedUsers.length && group.length < groupSize; j++) {
        if (used.has(sortedUsers[j].id)) continue
        
        const matchScore = this.calculateMatchScore(group, sortedUsers[j])
        if (matchScore.score > 0.6) { // 60% compatibility threshold
          group.push(sortedUsers[j])
          used.add(sortedUsers[j].id)
        }
      }
      
      if (group.length >= 2) { // Only add groups with at least 2 members
        groups.push(group)
      }
    }
    
    return groups
  }

  static calculateMatchScore(group: User[], candidate: User): MatchResult {
    let totalScore = 0
    const reasons: string[] = []
    const compatibility = {
      interests: 0,
      schedule: 0,
      skills: 0,
      goals: 0
    }

    // Interest compatibility
    const groupInterests = group.flatMap(u => u.interests)
    const commonInterests = candidate.interests.filter(interest => 
      groupInterests.includes(interest)
    ).length
    compatibility.interests = commonInterests / candidate.interests.length
    if (compatibility.interests > 0.3) {
      reasons.push(`Shared interests: ${commonInterests} common topics`)
    }

    // Schedule compatibility
    const groupAvailability = group.flatMap(u => u.availability)
    const commonAvailability = candidate.availability.filter(time => 
      groupAvailability.includes(time)
    ).length
    compatibility.schedule = commonAvailability / candidate.availability.length
    if (compatibility.schedule > 0.5) {
      reasons.push(`Schedule alignment: ${commonAvailability} common time slots`)
    }

    // Skills complementarity
    const groupSkills = group.flatMap(u => u.skills)
    const uniqueSkills = candidate.skills.filter(skill => 
      !groupSkills.includes(skill)
    ).length
    compatibility.skills = uniqueSkills / candidate.skills.length
    if (compatibility.skills > 0.4) {
      reasons.push(`Skill diversity: ${uniqueSkills} unique skills`)
    }

    // Goal alignment
    const groupGoals = group.flatMap(u => u.goals)
    const commonGoals = candidate.goals.filter(goal => 
      groupGoals.includes(goal)
    ).length
    compatibility.goals = commonGoals / candidate.goals.length
    if (compatibility.goals > 0.3) {
      reasons.push(`Goal alignment: ${commonGoals} shared objectives`)
    }

    // Calculate weighted total
    totalScore = (
      compatibility.interests * 0.3 +
      compatibility.schedule * 0.25 +
      compatibility.skills * 0.2 +
      compatibility.goals * 0.25
    )

    return {
      score: totalScore,
      reasons,
      compatibility
    }
  }

  static async generateGroupInsights(group: User[]): Promise<string> {
    const userProfiles = group.map(user => ({
      name: user.id,
      interests: user.interests,
      major: user.major,
      year: user.year,
      skills: user.skills,
      goals: user.goals
    }))

    const prompt = `Analyze this group of ${group.length} people and provide insights about:
1. Group dynamics and potential strengths
2. Areas where they might need support
3. Suggested project roles based on their profiles
4. Potential challenges and how to address them

Group profiles: ${JSON.stringify(userProfiles, null, 2)}`

    try {
      const response = await chatAI.answerQuestion(prompt, [], 'Group Analysis')
      return response
    } catch (error) {
      console.error('Error generating group insights:', error)
      return 'Unable to generate group insights at this time.'
    }
  }

  static getMatchQuality(score: number): { level: string; color: string; description: string } {
    if (score >= 0.9) return {
      level: 'Perfect Match',
      color: 'text-green-400',
      description: 'Exceptional compatibility across all factors'
    }
    if (score >= 0.8) return {
      level: 'Great Match',
      color: 'text-blue-400',
      description: 'High compatibility with strong potential'
    }
    if (score >= 0.7) return {
      level: 'Good Match',
      color: 'text-purple-400',
      description: 'Solid compatibility with good synergy'
    }
    if (score >= 0.6) return {
      level: 'Decent Match',
      color: 'text-yellow-400',
      description: 'Moderate compatibility, worth exploring'
    }
    return {
      level: 'Low Match',
      color: 'text-red-400',
      description: 'Limited compatibility, may need more alignment'
    }
  }
}

export const fluxMatcher = FluxMatcher

