# Deployment Status

## Current Issue

The `PRIVATE_KEY` in `.env.local` is still set to a placeholder value (`your_deployer_private_key`). 

## Two Options for Deployment

### Option 1: Use Separate Deployer Wallet (Recommended)

1. Create a new Ethereum wallet (or use an existing one)
2. Export its private key (64 hex characters starting with `0x`)
3. Update `.env.local`:
   ```
   PRIVATE_KEY=0x...your_actual_private_key_here
   ```
4. Fund this wallet with ETH on Base Mainnet (for gas fees)
5. Run: `npm run deploy:mainnet`

**Note:** This wallet only needs ETH for gas. The contracts will be owned by the CDP Server Wallet (`OWNER_WALLET_ADDRESS`).

### Option 2: Deploy Using CDP SDK (Advanced)

We can modify the deployment script to use the CDP Server Wallet API for deployment. This would require:
- Using CDP SDK to sign transactions
- Converting Foundry artifacts to CDP's deployment format
- More complex setup

## Current Configuration

✅ Owner Wallet: `0x6a1b085645674fF5E3eB853046cD51de16CAa1D0` (funded)
✅ Contracts compiled with Foundry
✅ Deployment script ready
❌ Deployer wallet private key needed

## Next Steps

Once `PRIVATE_KEY` is set with a real private key, run:
```bash
npm run deploy:mainnet
```

The deployment will:
1. Deploy ImpactToken (owned by CDP Server Wallet)
2. Deploy BatteryContract
3. Deploy GameContract (owned by CDP Server Wallet)
4. Link contracts together
5. Save deployment info to `deployments/` directory


