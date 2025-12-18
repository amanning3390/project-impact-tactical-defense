# Project Impact - Tactical Defense

A daily 3D coordinate-mapping game to intercept a planet-killing asteroid, built as a Farcaster Mini App on Base L2 with 100% gasless transactions.

## Features

- Daily coordinate-mapping game (X, Y, Z: 0-10)
- Automated battery squad system (10 players per battery)
- $IMPACT token with dynamic burn mechanics
- Chainlink VRF for verifiable random winning coordinates
- Automated reward distribution
- 100% gasless transactions via Base Paymaster
- Farcaster Mini App integration

## Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript, Tailwind CSS
- **Blockchain**: Base L2, OnchainKit, Wagmi, Viem
- **Wallet**: Smart Wallets with Base Paymaster
- **Randomness**: Chainlink VRF
- **Automation**: Vercel Cron Jobs
- **Deployment**: Vercel

## Setup

1. Install dependencies:
```bash
npm install
```

2. Copy environment variables:
```bash
cp .env.local.example .env.local
```

3. Configure environment variables in `.env.local`:
   - CDP API keys
   - Contract addresses
   - Chainlink VRF configuration
   - Server wallet private key

4. Run development server:
```bash
npm run dev
```

## Smart Contracts

Contracts are located in `contracts/`:
- `ImpactToken.sol` - ERC-20 token
- `GameContract.sol` - Main game logic with VRF integration
- `BatteryContract.sol` - Battery assignment system

## Deployment

See `DEPLOYMENT.md` for detailed deployment instructions.

## Documentation

- `DEPLOYMENT.md` - Production deployment guide
- `CONTRACTS.md` - Smart contract documentation
- `API.md` - API/contract interaction documentation

## License

MIT

