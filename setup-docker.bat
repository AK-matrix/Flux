@echo off
echo 🐳 Setting up Flux with Docker...

REM Create .env.local if it doesn't exist
if not exist .env.local (
    echo 📝 Creating .env.local file...
    (
        echo # Database
        echo DATABASE_URL="postgresql://flux_user:flux_password@localhost:5432/flux?schema=public"
        echo.
        echo # Firebase ^(Client-side^)
        echo NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyBIBaf703RDDTcyjCH0jUXcxwZGEq2w3PI
        echo NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=flux-8e4c3.firebaseapp.com
        echo NEXT_PUBLIC_FIREBASE_PROJECT_ID=flux-8e4c3
        echo NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=flux-8e4c3.firebasestorage.app
        echo NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=246291782641
        echo NEXT_PUBLIC_FIREBASE_APP_ID=1:246291782641:web:c20cc52938eeebf4d94250
        echo NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-77MG5WZKLD
        echo.
        echo # Firebase Admin ^(Server-side^) - Optional for now
        echo FIREBASE_PROJECT_ID=flux-8e4c3
        echo FIREBASE_PRIVATE_KEY=""
        echo FIREBASE_CLIENT_EMAIL=""
        echo.
        echo # JWT ^(for fallback auth^)
        echo JWT_SECRET=your-super-secret-jwt-key-here
        echo.
        echo # App Configuration
        echo NEXTAUTH_URL=http://localhost:3000
        echo NEXTAUTH_SECRET=your-nextauth-secret-here
    ) > .env.local
    echo ✅ .env.local created
) else (
    echo ✅ .env.local already exists
)

REM Start Docker services
echo 🐳 Starting Docker services...
docker-compose up -d

REM Wait for PostgreSQL to be ready
echo ⏳ Waiting for PostgreSQL to be ready...
timeout /t 10 /nobreak > nul

REM Check if PostgreSQL is running
docker-compose ps postgres | findstr "Up" > nul
if %errorlevel% equ 0 (
    echo ✅ PostgreSQL is running
) else (
    echo ❌ PostgreSQL failed to start
    exit /b 1
)

REM Generate Prisma client
echo 🔧 Generating Prisma client...
npx prisma generate

REM Run database migrations
echo 🗄️ Running database migrations...
npx prisma migrate dev --name init

echo 🎉 Setup complete! You can now run 'npm run dev' to start the application.
echo 📊 Database will be available at: postgresql://flux_user:flux_password@localhost:5432/flux
pause
