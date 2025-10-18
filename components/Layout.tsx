import { ReactNode } from 'react'
import Navigation from './Navigation'
import { useAuth } from '../hooks/useAuth'

interface LayoutProps {
  children: ReactNode
}

export default function Layout({ children }: LayoutProps) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen bg-primary-bg flex items-center justify-center">
        <div className="skeleton w-8 h-8 rounded-full"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-primary-bg">
      <div className="flex">
        <Navigation />
        <main className="flex-1 ml-16">
          {children}
        </main>
      </div>
    </div>
  )
}

