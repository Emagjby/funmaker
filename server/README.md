# FunMaker API

Express/TypeScript backend for the FunMaker virtual betting platform.

## Quick Start

```bash
# Install dependencies 
npm install

# Setup environment variables
cp .env.example .env

# Start the development server
npm run dev
```

The API will be running at http://localhost:5000.

## Environment Setup

You'll need these in your `.env` file:

```
# Basic config
PORT=5000
NODE_ENV=development

# Supabase (important!)
SUPABASE_URL=your-project-url
SUPABASE_SERVICE_KEY=your-service-key

# Authentication
JWT_SECRET=something-super-secret-change-this
JWT_EXPIRES_IN=1d

# Optional Redis config
REDIS_URL=redis://localhost:6379
```

## API Endpoints

### Auth
- `POST /api/auth/register` - Create a new account
- `POST /api/auth/login` - Login and get JWT
- `POST /api/auth/refresh` - Refresh your token

### Events  
- `GET /api/events` - List all events
- `GET /api/events/:id` - Get a specific event
- `POST /api/events` - Create an event (admin)

### Betting
- `POST /api/bets` - Place a bet
- `GET /api/bets/user` - Your bet history
- `GET /api/bets/event/:id` - Bets for an event

### User
- `GET /api/users/profile` - Your profile
- `PUT /api/users/profile` - Update your profile

## Database Schema

Check out `/src/db/schema.sql` for the complete database schema with tables for:
- Users
- Events 
- Bets
- Transactions

## Development

### Folder Structure

```
src/
├── api/        # API routes/controllers
├── config/     # Configuration
├── middleware/ # Express middleware
├── services/   # Business logic
├── models/     # Data models
├── utils/      # Helper functions
└── db/         # Database stuff
```

### Database Setup

The SQL schema is in `src/db/schema.sql`. You can run this directly in Supabase's SQL editor to set up your tables.

### Testing

```bash
# Run tests
npm test
```

We use Jest for testing. Add your tests in `__tests__` folders or with `.test.ts` extensions. 