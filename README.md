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

## Base Mini App Compliance (Base App)

- Manifest: see `public/miniapp-manifest.json` (update `homeUrl`, assets, and accountAssociation fields before launch). Reference: https://docs.base.org/mini-apps/llms-full.txt
- MiniKit wiring: `app/providers.tsx` enables `miniKit` inside `OnchainKitProvider` on Base chain with smart-wallet-only modal.
- Auth UX: `app/page.tsx` + `components/GameViewport.tsx` defer authentication; guest mode is allowed until a launch is attempted, then `useAuthenticate` is invoked just-in-time. Context from `useMiniKit` is used for UI hints only.
- Embedding/Security: `middleware.ts` allows Base/Farcaster frame embedding via CSP `frame-ancestors` while keeping `nosniff`, referrer, permissions, and `X-Robots-Tag: noindex`.
- Server verification scaffold: `app/api/verify/route.ts` uses `verifySignedPayload` from `lib/security.ts` for signed payload checks.
- Env vars: `NEXT_PUBLIC_ONCHAINKIT_API_KEY`, `NEXT_PUBLIC_WC_PROJECT_ID`, `NEXT_PUBLIC_PAYMASTER_URL`, `NEXT_PUBLIC_GAME_CONTRACT_ADDRESS`, `SERVER_WALLET_PRIVATE_KEY`, `CRON_SECRET`.

## License

MIT


