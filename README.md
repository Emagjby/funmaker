# 🎲 FunMaker

Virtual sports betting platform where you can place wagers using points instead of real money. The betting odds change dynamically based on how people bet - just like in real betting markets!

![Status: In Development](https://img.shields.io/badge/Status-In%20Development-yellow)

## What's this all about?

Ever wanted to try sports betting without risking actual money? FunMaker lets you:

- Bet on sports/events with virtual points (everybody starts with 1000)
- Watch odds change in real-time based on betting patterns
- Compete with friends on the leaderboard
- Experience the thrill of betting without the financial risk

The cool part is our dynamic odds system - as more people bet on an outcome, the odds for that outcome decrease automatically. This creates a realistic market-driven experience.

## Tech Stack

### Backend
- Node.js & Express with TypeScript
- Supabase (PostgreSQL) 
- JWT auth

### Frontend
- Next.js 13+ (App Router)
- React & TailwindCSS
- TypeScript

## Getting Started

### Prerequisites
- Node.js (v18+)
- npm
- Supabase account (free tier works fine)

### Quick Start

Clone the repo:
```bash
git clone https://github.com/Emagjby/funmaker.git
cd funmaker
```

Setup client:
```bash
cd client
npm install
cp .env.example .env.local  # then edit with your Supabase details
npm run dev
```

Setup server: 
```bash
cd server
npm install
cp .env.example .env  # then edit with your credentials
npm run dev
```

## Project Structure

- `/client` - Next.js frontend
- `/server` - Express backend API

More details in each folder's README.

## Roadmap

- [x] Project setup and architecture
- [x] Database schema design
- [ ] Auth flow implementation 
- [ ] Event creation/management
- [ ] Betting functionality
- [ ] Odds calculation algorithm
- [ ] User dashboard
- [ ] Leaderboards

Check [roadmap.md](roadmap.md) for the detailed development plan.

## Contributing

Contributions welcome! Have a look at [CONTRIBUTING.md](CONTRIBUTING.md) to get started.

## License

MIT License - see the [LICENSE](LICENSE) file for details. 