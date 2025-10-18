# Flux - NUS Social Matching App

A dark, modern, NUS-only social matching app to get students meeting in minutes/hours. Built with Next.js, TypeScript, and Prisma.

## Features

- **Dark Modern UI** - Glassmorphism design with custom design tokens
- **NUS-Only Access** - Email verification with NUS domain preference
- **Anonymous Posting** - Optional anonymous mode with generated codes
- **Ephemeral Communities** - Self-disappearing group threads
- **Trending Algorithm** - Server-side scoring for content discovery
- **Credit Score System** - Trust metrics and reporting system
- **Real-time Updates** - Framer Motion animations and micro-interactions

## Tech Stack

- **Frontend**: Next.js 14, TypeScript, Tailwind CSS, Framer Motion
- **Backend**: Next.js API Routes, JWT Authentication
- **Database**: PostgreSQL with Prisma ORM
- **UI Components**: Headless UI, Heroicons
- **Testing**: Jest, React Testing Library

## Getting Started

### Prerequisites

- Node.js 18+ 
- PostgreSQL database
- npm or pnpm

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd flux-app
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   # or
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp env.example .env.local
   ```
   
   Update `.env.local` with your values:
   ```env
   DATABASE_URL="postgresql://username:password@localhost:5432/flux_db"
   JWT_SECRET="your-super-secret-jwt-key-here"
   SMTP_HOST="smtp.gmail.com"
   SMTP_PORT="587"
   SMTP_USER="your-email@gmail.com"
   SMTP_PASS="your-app-password"
   ```

4. **Set up the database**
   ```bash
   pnpm db:generate
   pnpm db:push
   ```

5. **Run the development server**
   ```bash
   pnpm dev
   ```

   Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
flux-app/
├── components/           # React components
│   ├── Layout.tsx       # Main layout wrapper
│   ├── Navigation.tsx   # Side navigation
│   ├── PostCard.tsx     # Post display component
│   ├── CreateModal.tsx  # Post creation modal
│   └── TrendingSidebar.tsx
├── pages/               # Next.js pages
│   ├── api/            # API routes
│   │   ├── auth/       # Authentication endpoints
│   │   ├── posts/      # Post management
│   │   ├── communities/ # Community management
│   │   ├── reports/    # Reporting system
│   │   └── admin/      # Admin endpoints
│   ├── auth/           # Auth pages
│   ├── index.tsx       # Home page
│   ├── trending.tsx    # Trending page
│   ├── communities.tsx # Communities page
│   ├── settings.tsx    # Settings page
│   └── create.tsx      # Create page
├── lib/                # Utility functions
│   ├── auth.ts         # JWT utilities
│   ├── db.ts          # Database connection
│   ├── middleware.ts  # API middleware
│   └── utils.ts       # Helper functions
├── styles/             # Styling
│   ├── globals.css    # Global styles
│   └── tokens.ts      # Design tokens
├── prisma/            # Database schema
│   └── schema.prisma  # Prisma schema
└── __tests__/         # Test files
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `GET /api/auth/verify` - Verify email
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user

### Posts
- `GET /api/posts` - List posts with filters
- `POST /api/posts` - Create new post
- `GET /api/posts/[id]` - Get post details
- `PUT /api/posts/[id]` - Update post
- `POST /api/posts/[id]/upvote` - Upvote post
- `POST /api/posts/[id]/comments` - Add comment

### Communities
- `POST /api/communities/[id]/join` - Join community
- `POST /api/communities/[id]/leave` - Leave community

### Trending
- `GET /api/trending` - Get trending posts

### Reports
- `POST /api/reports` - File report
- `GET /api/admin/reports` - List reports (admin)
- `POST /api/admin/reports/[id]/resolve` - Resolve report (admin)

### Jobs
- `DELETE /api/jobs/cleanup` - Cleanup expired content

## Database Schema

### User
- Basic profile information
- Anonymous code generation
- Credit score system
- Interests and preferences

### Post
- Content and metadata
- Ephemeral settings
- Upvote tracking
- Completion status

### Community
- Member management
- TTL settings
- Activity tracking

### Report
- Reporting system
- Moderation workflow
- Credit score impact

## Design System

### Colors
- Primary: `#0b0f14` (background)
- Elevated: `#0f1418` (cards)
- Accent: `#7C5CFF` (primary)
- Secondary: `#00D4A2` (teal)
- Text: `#E6EEF3` (primary), `#A6B2BD` (secondary)

### Typography
- Font: Inter
- Weights: 400 (body), 500 (medium), 600 (semibold), 700 (bold)

### Components
- Glassmorphism cards with backdrop blur
- Rounded corners (12px default, 20px large)
- Soft shadows and gradients
- Micro-interactions with Framer Motion

## Testing

Run tests with:
```bash
pnpm test
```

Run tests in watch mode:
```bash
pnpm test:watch
```

## Deployment

### Vercel (Recommended)

1. **Connect your repository to Vercel**
2. **Set environment variables in Vercel dashboard**
3. **Deploy automatically on push**

### Manual Deployment

1. **Build the application**
   ```bash
   pnpm build
   ```

2. **Start the production server**
   ```bash
   pnpm start
   ```

### Database Setup

For production, use a managed PostgreSQL service:
- **Supabase** (recommended)
- **PlanetScale**
- **Railway**
- **Render**

### Environment Variables

Required for production:
```env
DATABASE_URL="postgresql://..."
JWT_SECRET="your-production-secret"
SMTP_HOST="your-smtp-host"
SMTP_PORT="587"
SMTP_USER="your-email"
SMTP_PASS="your-password"
```

## Features in Detail

### Anonymous Posting
- Users can choose to post anonymously
- Generated codes (e.g., FLX-7G3K) replace names
- Email verification still required for safety

### Ephemeral Communities
- Self-disappearing group threads
- Configurable TTL (default 48 hours)
- Automatic cleanup via cron jobs

### Trending Algorithm
```javascript
score = 1.5 * log(1 + upvotes)
      + 1.0 * log(1 + comments)
      + 0.8 * recencyFactor
      + 5.0 * instantBoost
```

### Credit Score System
- Default: 85 points
- Reports: -10 points
- Repeated reports: -20 points
- Positive completions: +2 points
- Low scores restrict features

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For questions or support, please open an issue on GitHub.

---

**Flux** - Normalising talking to strangers. Make real connections fast.

