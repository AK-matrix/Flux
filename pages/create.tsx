import { useState } from 'react'
import { motion } from 'framer-motion'
import Layout from '../components/Layout'
import CreateModal from '../components/CreateModal'
import { useAuth } from '../hooks/useAuth'
import { useRouter } from 'next/router'

export default function CreatePage() {
  const { user } = useAuth()
  const router = useRouter()
  const [showModal, setShowModal] = useState(true)

  const handleCreatePost = async (data: any) => {
    try {
      const response = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })
      if (response.ok) {
        const newPost = await response.json()
        router.push('/')
      }
    } catch (error) {
      console.error('Failed to create post:', error)
    }
  }

  if (!user) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-400">Please log in to create posts</div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <CreateModal
        isOpen={showModal}
        onClose={() => router.push('/')}
        onSubmit={handleCreatePost}
      />
    </Layout>
  )
}

