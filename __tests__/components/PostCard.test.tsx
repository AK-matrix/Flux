import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import PostCard from '../../components/PostCard'

// Mock the useAuth hook
jest.mock('../../hooks/useAuth', () => ({
  useAuth: () => ({
    user: {
      id: 'user1',
      email: 'test@example.com',
      displayName: 'Test User',
      creditScore: 85
    },
    loading: false,
    login: jest.fn(),
    logout: jest.fn(),
    updateUser: jest.fn()
  })
}))

const mockPost = {
  id: '1',
  title: 'Test Post',
  description: 'This is a test post description',
  category: 'Project',
  tags: ['test', 'example'],
  location: 'NUS Campus',
  timeStart: '2024-01-01T10:00:00Z',
  durationMins: 60,
  maxPeople: 5,
  urgency: 'Today',
  isAnonymous: false,
  isEphemeral: true,
  ttlHours: 48,
  createdAt: '2024-01-01T09:00:00Z',
  upvotes: 5,
  upvotedBy: [],
  isCompleted: false,
  author: {
    id: 'author1',
    displayName: 'Test User',
    anonymousCode: undefined,
    creditScore: 85
  },
  comments: [],
  community: {
    id: 'community1',
    maxMembers: 5,
    members: []
  }
}

const mockHandlers = {
  onUpvote: jest.fn(),
  onJoinCommunity: jest.fn(),
  onReport: jest.fn(),
  onComplete: jest.fn()
}

describe('PostCard', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders post information correctly', () => {
    render(<PostCard post={mockPost} {...mockHandlers} />)
    
    expect(screen.getByText('Test Post')).toBeInTheDocument()
    expect(screen.getByText('This is a test post description')).toBeInTheDocument()
    expect(screen.getByText('Project')).toBeInTheDocument()
    expect(screen.getByText('Today')).toBeInTheDocument()
  })

  it('handles upvote click', () => {
    render(<PostCard post={mockPost} {...mockHandlers} />)
    
    const upvoteButton = screen.getByText('5')
    fireEvent.click(upvoteButton)
    
    expect(mockHandlers.onUpvote).toHaveBeenCalledWith('1')
  })

  it('shows community information for ephemeral posts', () => {
    render(<PostCard post={mockPost} {...mockHandlers} />)
    
    expect(screen.getByText('Ephemeral Community')).toBeInTheDocument()
    expect(screen.getByText('0 / 5 members')).toBeInTheDocument()
  })

  it('expands description when "Read more" is clicked', () => {
    const longDescription = 'This is a very long description that should be truncated and then expanded when the user clicks read more to see the full content'
    const postWithLongDescription = {
      ...mockPost,
      description: longDescription
    }
    
    render(<PostCard post={postWithLongDescription} {...mockHandlers} />)
    
    const readMoreButton = screen.getByText('Read more')
    fireEvent.click(readMoreButton)
    
    expect(screen.getByText('Show less')).toBeInTheDocument()
  })
})
