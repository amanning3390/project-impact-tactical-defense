# Deployment Readiness Checklist

## Pre-Deployment Requirements

### 1. Environment Variables
- [ ] `PRIVATE_KEY` - Deployer wallet private key (with ETH for gas)
- [ ] `BASE_RPC_URL` - Base Mainnet RPC endpoint
- [ ] `BASESCAN_API_KEY` - BaseScan API key for verification
- [ ] `DEV_WALLET` - Developer wallet address (for 8% rake)
- [ ] `VRF_COORDINATOR` - Chainlink VRF Coordinator address for Base Mainnet
- [ ] `VRF_KEY_HASH` - Chainlink VRF Key Hash for Base Mainnet
- [ ] `VRF_SUBSCRIPTION_ID` - Your Chainlink VRF subscription ID

### 2. Chainlink VRF Setup
- [ ] Created VRF subscription on Base Mainnet
- [ ] Funded subscription with LINK tokens (recommend at least 5-10 LINK)
- [ ] Obtained VRF Coordinator address from Chainlink docs
- [ ] Obtained Key Hash from Chainlink docs
- [ ] Copied subscription ID

### 3. Wallet Preparation
- [ ] Deployer wallet has sufficient ETH (recommend 0.05+ ETH for gas)
- [ ] Deployer wallet is secure and backed up
- [ ] Dev wallet address is correct and accessible

### 4. Contract Verification
- [ ] All contracts compile successfully (`npm run compile`)
- [ ] No compilation errors or warnings
- [ ] Contracts tested on Base Sepolia (recommended)

## Deployment Commands

### Test on Base Sepolia First (Recommended)
```bash
# Set Base Sepolia environment variables
export BASE_SEPOLIA_RPC_URL=https://sepolia.base.org
export PRIVATE_KEY=your_testnet_private_key
export VRF_COORDINATOR=<base_sepolia_vrf_coordinator>
export VRF_KEY_HASH=<base_sepolia_key_hash>
export VRF_SUBSCRIPTION_ID=<testnet_subscription_id>
export DEV_WALLET=your_dev_wallet

# Deploy
npm run deploy:sepolia
```

### Deploy to Base Mainnet
```bash
# Set Base Mainnet environment variables
export BASE_RPC_URL=https://mainnet.base.org
export PRIVATE_KEY=your_mainnet_private_key
export VRF_COORDINATOR=<base_mainnet_vrf_coordinator>
export VRF_KEY_HASH=<base_mainnet_key_hash>
export VRF_SUBSCRIPTION_ID=<mainnet_subscription_id>
export DEV_WALLET=your_dev_wallet
export BASESCAN_API_KEY=your_basescan_api_key

# Deploy
npm run deploy:mainnet
```

## Post-Deployment Steps

1. **Verify Contracts on BaseScan**
   - Use the verification commands provided by deployment script
   - Or use: `npm run verify <deployment-file.json>`

2. **Add GameContract as VRF Consumer**
   - Go to https://vrf.chain.link/
   - Open your subscription
   - Add GameContract address as consumer

3. **Update Frontend Configuration**
   - Update `.env.local` with deployed contract addresses
   - Update Vercel environment variables

4. **Test Contract Interactions**
   - Test token transfers
   - Test coordinate submission
   - Test daily cycle functions (when appropriate time)

5. **Monitor Deployment**
   - Check contract addresses on BaseScan
   - Verify all functions are accessible
   - Monitor gas usage

## Important Notes

- **Never commit private keys to git**
- **Test thoroughly on Sepolia before mainnet**
- **Ensure VRF subscription has sufficient LINK**
- **Keep deployment info file secure (contains addresses)**

