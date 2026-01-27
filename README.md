# Rukny.io - Platform for Social Profiles, Stores, and Events

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn
- PostgreSQL (or Neon database)
- Redis (optional, for caching)

### Installation

```bash
# Install dependencies
npm install

# Setup environment variables
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env.local

# Setup database
cd apps/api
npx prisma migrate dev
npx prisma generate

# Start development servers
cd ../..
npm run dev
```

## 📁 Project Structure

```
rukny.io/
├── apps/
│   ├── api/          # NestJS Backend API
│   └── web/          # Next.js Frontend
├── packages/         # Shared packages
└── docs/            # Documentation
```

## 🌐 Deployment

### Vercel (Frontend)

1. Connect your GitHub repository to Vercel
2. Set root directory to `apps/web`
3. Configure environment variables:
   - `NEXT_PUBLIC_API_URL` - Your API URL
   - `NEXT_PUBLIC_APP_URL` - Your frontend URL
   - `API_BACKEND_URL` - Backend API URL

### Render (Backend API)

1. Create a new Web Service on Render
2. Connect your GitHub repository
3. Configure:
   - **Build Command**: `cd apps/api && npm install && npm run build`
   - **Start Command**: `cd apps/api && npm run start:prod`
   - **Environment**: Node
4. Add environment variables:
   - `DATABASE_URL` - Neon PostgreSQL connection string
   - `JWT_SECRET` - Secret key for JWT tokens
   - `FRONTEND_URL` - Your frontend URL
   - `REDIS_HOST` - Redis host (if using)
   - `PORT` - Server port (default: 3001)

## 🔐 Environment Variables

### Backend (apps/api/.env)
```env
DATABASE_URL=postgresql://...
JWT_SECRET=your-secret-key
FRONTEND_URL=https://your-frontend-url.com
REDIS_HOST=localhost
REDIS_PORT=6379
PORT=3001
NODE_ENV=production
```

### Frontend (apps/web/.env.local)
```env
NEXT_PUBLIC_API_URL=https://your-api-url.onrender.com
NEXT_PUBLIC_APP_URL=https://your-frontend-url.vercel.app
API_BACKEND_URL=https://your-api-url.onrender.com
```

## 📝 Database Migrations

```bash
# Development
cd apps/api
npx prisma migrate dev

# Production
npx prisma migrate deploy
```

## 🛠️ Scripts

```bash
# Development
npm run dev              # Start both frontend and backend
npm run dev:api          # Start backend only
npm run dev:web          # Start frontend only

# Build
npm run build            # Build all apps

# Database
npm run db:migrate       # Run migrations
npm run db:studio        # Open Prisma Studio
```

## 📚 Documentation

See `docs/` directory for detailed documentation.

## 🔗 Links

- [GitHub Repository](https://github.com/dhiaa67/ruknyio)
- [API Documentation](https://your-api-url.onrender.com/api/docs)

## 📄 License

Private - All rights reserved
