# Deployment Guide

## Prerequisites

1. Coinbase Developer Platform account
2. Vercel account
3. Base Mainnet deployment wallet with ETH
4. Chainlink VRF subscription

## Step 1: Deploy Smart Contracts

1. Install Hardhat dependencies:
```bash
npm install
```

2. Configure `.env.local` with:
   - `PRIVATE_KEY` - Deployer wallet private key
   - `BASE_RPC_URL` - Base Mainnet RPC endpoint
   - `BASESCAN_API_KEY` - BaseScan API key for verification

3. Deploy contracts:
```bash
npx hardhat run scripts/deploy.js --network base
```

4. Verify contracts on BaseScan:
```bash
npx hardhat verify --network base <CONTRACT_ADDRESS> <CONSTRUCTOR_ARGS>
```

## Step 2: Configure Chainlink VRF

1. Create Chainlink VRF subscription on Base Mainnet
2. Fund subscription with LINK tokens
3. Add GameContract as consumer
4. Update environment variables with VRF configuration

## Step 3: Configure Base Paymaster

1. Navigate to Coinbase Developer Platform > Onchain Tools > Paymaster
2. Allowlist game contract addresses
3. Set sponsorship limits:
   - Per-user limit
   - Global monthly limit ($15k default)
4. Copy Paymaster service URL to environment variables:
   ```
   NEXT_PUBLIC_PAYMASTER_URL=https://api.developer.coinbase.com/rpc/v1/base/YOUR_API_KEY
   ```

## Step 4: Deploy to Vercel

1. Import Git repository to Vercel
2. Configure environment variables in Vercel dashboard:
   - All `NEXT_PUBLIC_*` variables
   - Server-side variables (CRON_SECRET, SERVER_WALLET_PRIVATE_KEY)
3. Configure build settings:
   - Build command: `npm run build`
   - Output directory: `.next`
4. Deploy

## Step 5: Configure Vercel Cron Jobs

Vercel Cron jobs are configured in `vercel.json`. The daily drawing cron runs at 21:00 UTC.

Verify cron jobs are active in Vercel dashboard.

## Step 6: Verify Deployment

- [ ] App accessible at Vercel URL
- [ ] Contracts deployed and verified on BaseScan
- [ ] Paymaster configured and working
- [ ] VRF subscription active
- [ ] Cron jobs scheduled
- [ ] Environment variables set correctly

## Monitoring

Set up monitoring for:
- Vercel Analytics
- Error tracking (Sentry)
- Onchain event monitoring
- Paymaster usage
- User engagement metrics

