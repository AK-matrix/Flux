import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Layout from '../components/Layout'
import { useAuth } from '../hooks/useAuth'
import { generateAnonymousCode } from '../lib/utils'
import {
  UserIcon,
  ShieldCheckIcon,
  BellIcon,
  CogIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline'

export default function SettingsPage() {
  const { user, updateUser } = useAuth()
  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(false)
  const [formData, setFormData] = useState({
    displayName: '',
    anonymousCode: '',
    interests: [] as string[],
    year: '',
    major: '',
    isAnonymous: false
  })

  useEffect(() => {
    if (user) {
      setFormData({
        displayName: user.displayName || '',
        anonymousCode: user.anonymousCode || '',
        interests: user.interests || [],
        year: user.year || '',
        major: user.major || '',
        isAnonymous: !!user.anonymousCode
      })
    }
  }, [user])

  const handleSave = async () => {
    if (!user) return

    setLoading(true)
    try {
      await updateUser(formData)
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (error) {
      console.error('Failed to update settings:', error)
    } finally {
      setLoading(false)
    }
  }

  const generateNewCode = () => {
    const newCode = generateAnonymousCode()
    setFormData(prev => ({ ...prev, anonymousCode: newCode }))
  }

  const toggleAnonymous = () => {
    const newIsAnonymous = !formData.isAnonymous
    setFormData(prev => ({
      ...prev,
      isAnonymous: newIsAnonymous,
      anonymousCode: newIsAnonymous ? (prev.anonymousCode || generateAnonymousCode()) : ''
    }))
  }

  const addInterest = (interest: string) => {
    if (interest.trim() && !formData.interests.includes(interest.trim())) {
      setFormData(prev => ({
        ...prev,
        interests: [...prev.interests, interest.trim()]
      }))
    }
  }

  const removeInterest = (interest: string) => {
    setFormData(prev => ({
      ...prev,
      interests: prev.interests.filter(i => i !== interest)
    }))
  }

  const getCreditScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-400'
    if (score >= 60) return 'text-yellow-400'
    return 'text-red-400'
  }

  const getCreditScoreLabel = (score: number) => {
    if (score >= 80) return 'High Trust'
    if (score >= 60) return 'Good Standing'
    if (score >= 50) return 'Low Trust'
    return 'Restricted'
  }

  if (!user) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-400">Please log in to view settings</div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-6 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-8"
        >
          {/* Header */}
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Settings</h1>
            <p className="text-gray-400">Manage your profile and preferences</p>
          </div>

          {/* Profile Section */}
          <div className="glass-card rounded-xl p-6">
            <div className="flex items-center space-x-3 mb-6">
              <UserIcon className="w-6 h-6 text-purple-400" />
              <h2 className="text-xl font-semibold text-white">Profile</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Display Name
                </label>
                <input
                  type="text"
                  value={formData.displayName}
                  onChange={(e) => setFormData(prev => ({ ...prev, displayName: e.target.value }))}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Your display name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Year
                </label>
                <select
                  value={formData.year}
                  onChange={(e) => setFormData(prev => ({ ...prev, year: e.target.value }))}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="">Select year</option>
                  <option value="Y1">Year 1</option>
                  <option value="Y2">Year 2</option>
                  <option value="Y3">Year 3</option>
                  <option value="Y4">Year 4</option>
                  <option value="Y5">Year 5</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Major
                </label>
                <input
                  type="text"
                  value={formData.major}
                  onChange={(e) => setFormData(prev => ({ ...prev, major: e.target.value }))}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="e.g., Computer Science"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={user.email}
                  disabled
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-gray-400 cursor-not-allowed"
                />
                <p className="text-xs text-gray-500 mt-1">
                  {user.isNUS ? 'NUS email verified' : 'Non-NUS email'}
                </p>
              </div>
            </div>
          </div>

          {/* Privacy Section */}
          <div className="glass-card rounded-xl p-6">
            <div className="flex items-center space-x-3 mb-6">
              <ShieldCheckIcon className="w-6 h-6 text-purple-400" />
              <h2 className="text-xl font-semibold text-white">Privacy</h2>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium text-white">Stay Anonymous</div>
                  <div className="text-xs text-gray-400">
                    Use your Flux code instead of your name
                  </div>
                </div>
                <button
                  onClick={toggleAnonymous}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    formData.isAnonymous ? 'bg-purple-500' : 'bg-gray-600'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      formData.isAnonymous ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              {formData.isAnonymous && (
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Anonymous Code
                  </label>
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={formData.anonymousCode}
                      onChange={(e) => setFormData(prev => ({ ...prev, anonymousCode: e.target.value }))}
                      className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="FLX-XXXX"
                    />
                    <button
                      type="button"
                      onClick={generateNewCode}
                      className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
                    >
                      Generate
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    This code will be shown instead of your name
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Interests Section */}
          <div className="glass-card rounded-xl p-6">
            <div className="flex items-center space-x-3 mb-6">
              <CogIcon className="w-6 h-6 text-purple-400" />
              <h2 className="text-xl font-semibold text-white">Interests</h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Add Interest
                </label>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        addInterest(e.currentTarget.value)
                        e.currentTarget.value = ''
                      }
                    }}
                    className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="e.g., Machine Learning, Basketball"
                  />
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                {formData.interests.map((interest) => (
                  <span
                    key={interest}
                    className="px-3 py-1 bg-purple-500/20 text-purple-300 text-sm rounded-full flex items-center space-x-1"
                  >
                    <span>{interest}</span>
                    <button
                      type="button"
                      onClick={() => removeInterest(interest)}
                      className="text-purple-400 hover:text-purple-300"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Trust Section */}
          <div className="glass-card rounded-xl p-6">
            <div className="flex items-center space-x-3 mb-6">
              <ExclamationTriangleIcon className="w-6 h-6 text-purple-400" />
              <h2 className="text-xl font-semibold text-white">Trust & History</h2>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium text-white">Credit Score</div>
                  <div className="text-xs text-gray-400">
                    {getCreditScoreLabel(user.creditScore)} • {user.creditScore.toFixed(0)}/100
                  </div>
                </div>
                <div className={`text-2xl font-bold ${getCreditScoreColor(user.creditScore)}`}>
                  {user.creditScore.toFixed(0)}
                </div>
              </div>

              <div className="w-full bg-gray-700 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-red-500 via-yellow-500 to-green-500 h-2 rounded-full"
                  style={{ width: `${user.creditScore}%` }}
                />
              </div>

              <div className="text-xs text-gray-400">
                <p>• Scores drop when reports are validated</p>
                <p>• Scores increase with positive completions</p>
                <p>• Low scores may restrict certain features</p>
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end">
            <button
              onClick={handleSave}
              disabled={loading}
              className="px-6 py-2 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-lg hover:from-purple-600 hover:to-blue-600 transition-all duration-300 font-medium disabled:opacity-50"
            >
              {loading ? 'Saving...' : saved ? 'Saved!' : 'Save Changes'}
            </button>
          </div>
        </motion.div>
      </div>
    </Layout>
  )
}

