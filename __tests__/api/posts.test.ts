import { createMocks } from 'node-mocks-http'
import handler from '../../pages/api/posts/index'

// Mock the middleware and database
jest.mock('../../lib/middleware', () => ({
  withAuth: (handler: any) => handler
}))

jest.mock('../../lib/db', () => ({
  prisma: {
    post: {
      findMany: jest.fn(),
      create: jest.fn()
    }
  }
}))

describe('/api/posts', () => {
  it('should return 405 for non-GET/POST methods', async () => {
    const { req, res } = createMocks({
      method: 'PUT',
    })

    await handler(req as any, res as any)

    expect(res._getStatusCode()).toBe(405)
  })

  it('should return 401 for unauthenticated requests', async () => {
    const { req, res } = createMocks({
      method: 'GET',
    })

    await handler(req as any, res as any)

    expect(res._getStatusCode()).toBe(401)
  })
})
