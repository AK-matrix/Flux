import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { motion } from 'framer-motion'
import {
  HomeIcon,
  FireIcon,
  PlusIcon,
  UserGroupIcon,
  CogIcon,
  UserIcon,
  ChatBubbleLeftIcon
} from '@heroicons/react/24/outline'
import { useAuth } from '../hooks/useAuth'

const navItems = [
  { name: 'Home', href: '/', icon: HomeIcon },
  { name: 'Trending', href: '/trending', icon: FireIcon },
  { name: 'Create', href: '/create', icon: PlusIcon },
  { name: 'Communities', href: '/communities', icon: UserGroupIcon },
  { name: 'Messages', href: '/dms', icon: ChatBubbleLeftIcon },
  { name: 'Settings', href: '/settings', icon: CogIcon },
]

export default function Navigation() {
  const router = useRouter()
  const { user, logout } = useAuth()
  const [isProfileOpen, setIsProfileOpen] = useState(false)

  return (
    <nav className="fixed left-0 top-0 h-full w-16 bg-elevated-bg border-r border-gray-800 z-50">
      <div className="flex flex-col h-full">
        {/* Logo */}
        <div className="flex items-center justify-center h-16 border-b border-gray-800">
          <Link href="/" className="text-2xl font-bold gradient-text">
            F
          </Link>
        </div>

        {/* Navigation Items */}
        <div className="flex-1 py-4">
          {navItems.map((item) => {
            const isActive = router.pathname === item.href
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center justify-center h-12 mx-2 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-purple-500/20 text-purple-400'
                    : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/50'
                }`}
              >
                <item.icon className="w-5 h-5" />
              </Link>
            )
          })}
        </div>

        {/* User Profile */}
        <div className="relative border-t border-gray-800">
          <button
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="flex items-center justify-center h-16 w-full text-gray-400 hover:text-gray-200 hover:bg-gray-800/50 transition-colors"
          >
            <UserIcon className="w-5 h-5" />
          </button>

          {isProfileOpen && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="absolute bottom-16 left-4 w-48 glass rounded-lg p-2 shadow-soft"
            >
              {user ? (
                <div className="space-y-2">
                  <div className="px-3 py-2 text-sm">
                    <div className="font-medium text-white">
                      {user.displayName || user.anonymousCode || 'Anonymous'}
                    </div>
                    <div className="text-gray-400 text-xs">
                      {user.email}
                    </div>
                    <div className="text-xs text-purple-400">
                      Credit: {user.creditScore?.toFixed(0) || 85}
                    </div>
                  </div>
                  <button
                    onClick={logout}
                    className="w-full text-left px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 rounded"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <div className="p-2">
                  <Link
                    href="/auth/login"
                    className="block px-3 py-2 text-sm text-gray-300 hover:text-white hover:bg-gray-700/50 rounded"
                  >
                    Login
                  </Link>
                </div>
              )}
            </motion.div>
          )}
        </div>
      </div>
    </nav>
  )
}

