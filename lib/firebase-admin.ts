import { initializeApp, getApps, cert } from 'firebase-admin/app'
import { getAuth } from 'firebase-admin/auth'

// Validate required environment variables for Firebase Admin
const requiredAdminEnvVars = {
  FIREBASE_PROJECT_ID: process.env.FIREBASE_PROJECT_ID,
  FIREBASE_CLIENT_EMAIL: process.env.FIREBASE_CLIENT_EMAIL,
  FIREBASE_PRIVATE_KEY: process.env.FIREBASE_PRIVATE_KEY,
}

// Check for missing environment variables
const missingAdminVars = Object.entries(requiredAdminEnvVars)
  .filter(([key, value]) => !value)
  .map(([key]) => key)

if (missingAdminVars.length > 0) {
  console.warn(
    `Missing Firebase Admin environment variables: ${missingAdminVars.join(', ')}\n` +
    'Firebase Admin SDK will not be available. Please add them to your .env.local file.'
  )
}

// Initialize Firebase Admin SDK (only if all required variables are present)
let adminApp: any
let adminAuth: any

if (missingAdminVars.length === 0) {
  try {
    adminApp = getApps().length === 0 
      ? initializeApp({
          credential: cert({
            projectId: requiredAdminEnvVars.FIREBASE_PROJECT_ID,
            clientEmail: requiredAdminEnvVars.FIREBASE_CLIENT_EMAIL,
            privateKey: requiredAdminEnvVars.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
          }),
        })
      : getApps()[0]

    adminAuth = getAuth(adminApp)
  } catch (error) {
    console.error('Firebase Admin initialization error:', error)
    adminAuth = null
  }
} else {
  adminAuth = null
}

export { adminAuth }
export default adminApp

// Type exports for better TypeScript support
export type { Auth } from 'firebase-admin/auth'
