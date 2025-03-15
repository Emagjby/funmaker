# FunMaker - Frontend

The React/Next.js frontend for our virtual betting platform. Built with Next.js App Router, TailwindCSS and TypeScript.

## Development

### Setup
```bash
# Install dependencies
npm install

# Set up environment variables (don't forget this!)
cp .env.example .env.local
```

You'll need to fill out these values in your `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_API_URL=http://localhost:5000  # or wherever your API is running
```

### Running locally
```bash
npm run dev
```

This starts the app at [http://localhost:3000](http://localhost:3000).

### Building for production
```bash
npm run build
npm start
```

## Project Organization

```
src/
├── app/               # Next.js App Router pages
├── components/        # React components
├── hooks/             # Custom React hooks
├── lib/               # Utilities and API client
├── styles/            # CSS and Tailwind stuff
└── types/             # TypeScript type definitions
```

## Adding New Pages

Just create a new folder in `src/app/` with a `page.tsx` file - Next.js App Router will automatically create a route for it.

Example:
```
src/app/events/page.tsx → /events
src/app/profile/page.tsx → /profile
```

## Notes

- We're using the new App Router in Next.js 13+
- Auth is handled through Supabase
- Remember to run the API server also (see main README) 