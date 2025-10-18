import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { useRouter } from 'next/router'
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  User as FirebaseUser
} from 'firebase/auth'
import { auth } from '../lib/firebase'

interface User {
  id: string
  email: string
  displayName?: string
  anonymousCode?: string
  emailVerified: boolean
  isNUS: boolean
  needsSetup: boolean
  creditScore: number
  interests: string[]
  year?: string
  major?: string
}

interface AuthContextType {
  user: User | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  register: (email: string, password: string, displayName: string) => Promise<void>
  updateUser: (updates: Partial<User>) => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
      console.log('🔥 Firebase auth state changed:', firebaseUser ? 'User logged in' : 'User logged out')
      if (firebaseUser) {
        try {
          // For development, create a mock user since we're not using Firebase Admin
          const mockUser = {
            id: firebaseUser.uid,
            email: firebaseUser.email || '',
            displayName: firebaseUser.displayName || 'Test User',
            anonymousCode: 'FLX-TEST',
            emailVerified: firebaseUser.emailVerified,
            isNUS: true,
            needsSetup: false,
            creditScore: 85,
            interests: ['Technology', 'Social'],
            year: '2024',
            major: 'Computer Science'
          }
          console.log('👤 Setting user:', mockUser)
          setUser(mockUser)
        } catch (error) {
          console.error('Error setting user data:', error)
          setUser(null)
        }
      } else {
        console.log('👤 No user, setting to null')
        setUser(null)
      }
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  const login = async (email: string, password: string) => {
    try {
      console.log('🔐 Attempting login for:', email)
      const userCredential = await signInWithEmailAndPassword(auth, email, password)
      console.log('✅ Login successful:', userCredential.user.uid)
      const token = await userCredential.user.getIdToken()
      
      // The onAuthStateChanged will handle setting the user state
      router.push('/')
    } catch (error: any) {
      console.error('❌ Login error:', error)
      throw new Error(error.message || 'Login failed')
    }
  }

  const logout = async () => {
    try {
      await signOut(auth)
      router.push('/auth/login')
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  const register = async (email: string, password: string, displayName: string) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password)
      const token = await userCredential.user.getIdToken()
      
      // Create user in our database
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ email, password, displayName }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Registration failed')
      }

      // The onAuthStateChanged will handle setting the user state
      router.push('/')
    } catch (error: any) {
      console.error('Registration error:', error)
      throw new Error(error.message || 'Registration failed')
    }
  }

  const updateUser = async (updates: Partial<User>) => {
    try {
      const token = await auth.currentUser?.getIdToken()
      if (!token) throw new Error('Not authenticated')

      const response = await fetch('/api/me', {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updates)
      })

      if (!response.ok) {
        throw new Error('Update failed')
      }

      const updatedUser = await response.json()
      setUser(updatedUser)
    } catch (error) {
      console.error('Update user error:', error)
      throw error
    }
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, register, updateUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
