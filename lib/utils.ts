import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function generateAnonymousCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let result = 'FLX-'
  for (let i = 0; i < 4; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

export function isNUSEmail(email: string): boolean {
  return email.endsWith('@u.nus.edu')
}

export function formatTimeAgo(date: Date): string {
  const now = new Date()
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)
  
  if (diffInSeconds < 60) return 'just now'
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`
  
  return date.toLocaleDateString()
}

export function calculateTrendingScore(
  upvotes: number,
  comments: number,
  ageHours: number,
  urgency: string
): number {
  const w1 = 1.5 // upvotes weight
  const w2 = 1.0 // comments weight
  const w3 = 0.8 // recency weight
  const w4 = 5.0 // instant boost
  
  const recencyFactor = Math.max(0, (72 - ageHours) / 72) * 10
  const instantBoost = urgency === 'Instant' ? w4 : 0
  
  return (
    w1 * Math.log(1 + upvotes) +
    w2 * Math.log(1 + comments) +
    w3 * recencyFactor +
    instantBoost
  )
}

export function getCreditScoreColor(score: number): string {
  if (score >= 80) return '#00D4A2' // teal
  if (score >= 60) return '#FFA500' // orange
  return '#FF4444' // red
}

export function getCreditScoreLabel(score: number): string {
  if (score >= 80) return 'High Trust'
  if (score >= 60) return 'Good Standing'
  if (score >= 50) return 'Low Trust'
  return 'Restricted'
}

