import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { XMarkIcon } from '@heroicons/react/24/outline'
import { useAuth } from '../hooks/useAuth'

interface CreateModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: CreatePostData) => Promise<void>
}

interface CreatePostData {
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
  ttlHours: number
}

const categories = [
  'Project',
  'Hackathon', 
  'Startup',
  'Sport/Game',
  'Assignment/Homework',
  'Hangout',
  'Misc/Random',
  'Study Session',
  'Volunteer'
]

const urgencyOptions = [
  { value: 'Instant', label: 'Instant — Meet within 1 hour' },
  { value: 'Today', label: 'Today' },
  { value: 'Week', label: 'This week' },
  { value: 'Longterm', label: 'Long-term' }
]

export default function CreateModal({ isOpen, onClose, onSubmit }: CreateModalProps) {
  const { user } = useAuth()
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState<CreatePostData>({
    title: '',
    description: '',
    category: '',
    tags: [],
    location: '',
    timeStart: '',
    durationMins: undefined,
    maxPeople: undefined,
    urgency: 'Today',
    isAnonymous: false,
    isEphemeral: false,
    ttlHours: 48
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [customTag, setCustomTag] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (step < 3) {
      setStep(step + 1)
      return
    }

    setIsSubmitting(true)
    try {
      await onSubmit(formData)
      onClose()
      setStep(1)
      setFormData({
        title: '',
        description: '',
        category: '',
        tags: [],
        location: '',
        timeStart: '',
        durationMins: undefined,
        maxPeople: undefined,
        urgency: 'Today',
        isAnonymous: false,
        isEphemeral: false,
        ttlHours: 48
      })
    } catch (error) {
      console.error('Submit error:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const addTag = () => {
    if (customTag.trim() && !formData.tags.includes(customTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, customTag.trim()]
      }))
      setCustomTag('')
    }
  }

  const removeTag = (tag: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(t => t !== tag)
    }))
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="glass rounded-2xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto"
        >
          <div className="p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">Create Post</h2>
              <button
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-white transition-colors"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>

            {/* Progress */}
            <div className="flex items-center space-x-2 mb-6">
              {[1, 2, 3].map((num) => (
                <div
                  key={num}
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    step >= num
                      ? 'bg-purple-500 text-white'
                      : 'bg-gray-700 text-gray-400'
                  }`}
                >
                  {num}
                </div>
              ))}
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Step 1: Basic Info */}
              {step === 1 && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-4"
                >
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Category *
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {categories.map((category) => (
                        <button
                          key={category}
                          type="button"
                          onClick={() => setFormData(prev => ({ ...prev, category }))}
                          className={`p-2 rounded-lg text-sm font-medium transition-colors ${
                            formData.category === category
                              ? 'bg-purple-500 text-white'
                              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                          }`}
                        >
                          {category}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Title *
                    </label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                      className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="What are you looking for?"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Description *
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent h-24 resize-none"
                      placeholder="Tell us more about what you're looking for..."
                      required
                    />
                  </div>
                </motion.div>
              )}

              {/* Step 2: Details */}
              {step === 2 && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-4"
                >
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Urgency *
                    </label>
                    <div className="space-y-2">
                      {urgencyOptions.map((option) => (
                        <label key={option.value} className="flex items-center space-x-3">
                          <input
                            type="radio"
                            name="urgency"
                            value={option.value}
                            checked={formData.urgency === option.value}
                            onChange={(e) => setFormData(prev => ({ ...prev, urgency: e.target.value }))}
                            className="w-4 h-4 text-purple-500 bg-gray-800 border-gray-700 focus:ring-purple-500"
                          />
                          <span className="text-gray-300">{option.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Location
                      </label>
                      <input
                        type="text"
                        value={formData.location}
                        onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                        className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="e.g., NUS Campus, Online"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Max People
                      </label>
                      <input
                        type="number"
                        value={formData.maxPeople || ''}
                        onChange={(e) => setFormData(prev => ({ ...prev, maxPeople: e.target.value ? parseInt(e.target.value) : undefined }))}
                        className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="Optional"
                        min="1"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Tags
                    </label>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {formData.tags.map((tag) => (
                        <span
                          key={tag}
                          className="px-2 py-1 bg-purple-500/20 text-purple-300 text-sm rounded-full flex items-center space-x-1"
                        >
                          <span>#{tag}</span>
                          <button
                            type="button"
                            onClick={() => removeTag(tag)}
                            className="text-purple-400 hover:text-purple-300"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                    <div className="flex space-x-2">
                      <input
                        type="text"
                        value={customTag}
                        onChange={(e) => setCustomTag(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                        className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="Add a tag"
                      />
                      <button
                        type="button"
                        onClick={addTag}
                        className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
                      >
                        Add
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Step 3: Privacy & Community */}
              {step === 3 && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-4"
                >
                  <div>
                    <label className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        checked={formData.isAnonymous}
                        onChange={(e) => setFormData(prev => ({ ...prev, isAnonymous: e.target.checked }))}
                        className="w-4 h-4 text-purple-500 bg-gray-800 border-gray-700 rounded focus:ring-purple-500"
                      />
                      <div>
                        <span className="text-gray-300 font-medium">Stay Anonymous</span>
                        <p className="text-sm text-gray-400">
                          Your Flux code will be shown instead of your name
                        </p>
                      </div>
                    </label>
                  </div>

                  <div>
                    <label className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        checked={formData.isEphemeral}
                        onChange={(e) => setFormData(prev => ({ ...prev, isEphemeral: e.target.checked }))}
                        className="w-4 h-4 text-purple-500 bg-gray-800 border-gray-700 rounded focus:ring-purple-500"
                      />
                      <div>
                        <span className="text-gray-300 font-medium">Create Ephemeral Community</span>
                        <p className="text-sm text-gray-400">
                          Create a self-disappearing community for this post
                        </p>
                      </div>
                    </label>
                  </div>

                  {formData.isEphemeral && (
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Community Duration (hours)
                      </label>
                      <input
                        type="number"
                        value={formData.ttlHours}
                        onChange={(e) => setFormData(prev => ({ ...prev, ttlHours: parseInt(e.target.value) }))}
                        className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        min="1"
                        max="168"
                      />
                    </div>
                  )}

                  <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-4">
                    <h4 className="text-sm font-medium text-purple-300 mb-2">Ready to post?</h4>
                    <p className="text-xs text-gray-400">
                      Your post will be visible to all NUS students. Make sure your information is accurate and respectful.
                    </p>
                  </div>
                </motion.div>
              )}

              {/* Actions */}
              <div className="flex justify-between pt-4 border-t border-gray-700">
                <button
                  type="button"
                  onClick={step > 1 ? () => setStep(step - 1) : onClose}
                  className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
                >
                  {step > 1 ? 'Back' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors disabled:opacity-50"
                >
                  {isSubmitting ? 'Posting...' : step < 3 ? 'Next' : 'Post'}
                </button>
              </div>
            </form>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}

