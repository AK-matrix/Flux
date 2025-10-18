#!/bin/bash

echo "🐳 Setting up Flux with Docker..."

# Create .env.local if it doesn't exist
if [ ! -f .env.local ]; then
    echo "📝 Creating .env.local file..."
    cat > .env.local << EOF
# Database
DATABASE_URL="postgresql://flux_user:flux_password@localhost:5432/flux?schema=public"

# Firebase (Client-side)
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyBIBaf703RDDTcyjCH0jUXcxwZGEq2w3PI
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=flux-8e4c3.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=flux-8e4c3
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=flux-8e4c3.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=246291782641
NEXT_PUBLIC_FIREBASE_APP_ID=1:246291782641:web:c20cc52938eeebf4d94250
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-77MG5WZKLD

# Firebase Admin (Server-side) - Optional for now
FIREBASE_PROJECT_ID=flux-8e4c3
FIREBASE_PRIVATE_KEY=""
FIREBASE_CLIENT_EMAIL=""

# JWT (for fallback auth)
JWT_SECRET=your-super-secret-jwt-key-here

# App Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-nextauth-secret-here
EOF
    echo "✅ .env.local created"
else
    echo "✅ .env.local already exists"
fi

# Start Docker services
echo "🐳 Starting Docker services..."
docker-compose up -d

# Wait for PostgreSQL to be ready
echo "⏳ Waiting for PostgreSQL to be ready..."
sleep 10

# Check if PostgreSQL is running
if docker-compose ps postgres | grep -q "Up"; then
    echo "✅ PostgreSQL is running"
else
    echo "❌ PostgreSQL failed to start"
    exit 1
fi

# Generate Prisma client
echo "🔧 Generating Prisma client..."
npx prisma generate

# Run database migrations
echo "🗄️ Running database migrations..."
npx prisma migrate dev --name init

echo "🎉 Setup complete! You can now run 'npm run dev' to start the application."
echo "📊 Database will be available at: postgresql://flux_user:flux_password@localhost:5432/flux"
