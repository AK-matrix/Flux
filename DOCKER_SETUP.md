# 🐳 Docker Setup for Flux

This guide will help you set up Flux with Docker and PostgreSQL for full database functionality.

## 🚀 Quick Start

### Prerequisites
- Docker Desktop installed and running
- Node.js 18+ installed
- npm or yarn

### Step 1: Start Docker Desktop
Make sure Docker Desktop is running on your machine.

### Step 2: Run Setup Script

**On Windows:**
```bash
setup-docker.bat
```

**On macOS/Linux:**
```bash
chmod +x setup-docker.sh
./setup-docker.sh
```

### Step 3: Start the Application
```bash
npm run dev
```

## 🔧 Manual Setup (if scripts don't work)

### 1. Create Environment File
Create `.env.local` with:
```env
DATABASE_URL="postgresql://flux_user:flux_password@localhost:5432/flux?schema=public"
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyBIBaf703RDDTcyjCH0jUXcxwZGEq2w3PI
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=flux-8e4c3.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=flux-8e4c3
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=flux-8e4c3.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=246291782641
NEXT_PUBLIC_FIREBASE_APP_ID=1:246291782641:web:c20cc52938eeebf4d94250
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-77MG5WZKLD
```

### 2. Start Docker Services
```bash
docker-compose up -d
```

### 3. Set Up Database
```bash
npx prisma generate
npx prisma migrate dev --name init
```

### 4. Start Application
```bash
npm run dev
```

## 🗄️ Database Information

- **Host:** localhost
- **Port:** 5432
- **Database:** flux
- **Username:** flux_user
- **Password:** flux_password

## 🛠️ Useful Commands

### Docker Commands
```bash
# Start services
docker-compose up -d

# Stop services
docker-compose down

# View logs
docker-compose logs postgres

# Access PostgreSQL directly
docker-compose exec postgres psql -U flux_user -d flux
```

### Database Commands
```bash
# Reset database
npx prisma migrate reset

# View database in Prisma Studio
npx prisma studio

# Generate Prisma client
npx prisma generate
```

## 🐛 Troubleshooting

### Docker Desktop Not Running
- Make sure Docker Desktop is installed and running
- Check if Docker Desktop is started in your system tray

### Port 5432 Already in Use
- Stop any existing PostgreSQL services
- Or change the port in `docker-compose.yml`

### Database Connection Issues
- Wait a few seconds for PostgreSQL to fully start
- Check if the container is running: `docker-compose ps`
- View logs: `docker-compose logs postgres`

## 🎉 What You Get

With this setup, you'll have:
- ✅ **Real PostgreSQL Database** - Data persists between restarts
- ✅ **Full CRUD Operations** - Create, read, update, delete posts
- ✅ **User Management** - Real user accounts and profiles
- ✅ **Comments & Communities** - Full social features
- ✅ **Firebase Authentication** - Secure login/logout
- ✅ **Docker Persistence** - Data survives container restarts

## 📊 Database Schema

The database includes:
- **Users** - User accounts with profiles
- **Posts** - Social posts with categories
- **Comments** - Threaded comments system
- **Communities** - Ephemeral communities
- **Reports** - Content moderation system

## 🔄 Development Workflow

1. **Make changes** to your code
2. **Update schema** in `prisma/schema.prisma` if needed
3. **Run migrations** with `npx prisma migrate dev`
4. **Test your changes** in the browser
5. **Data persists** between restarts

Your posts will now actually save to the database and persist! 🎉
