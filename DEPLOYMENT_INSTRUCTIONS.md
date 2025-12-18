# Contract Deployment Instructions

## Prerequisites

1. **Environment Variables Setup**
   Create a `.env` file in the project root with:
   ```
   PRIVATE_KEY=your_deployer_private_key
   BASE_RPC_URL=https://mainnet.base.org
   BASE_SEPOLIA_RPC_URL=https://sepolia.base.org
   BASESCAN_API_KEY=your_basescan_api_key
   DEV_WALLET=0x... (your dev wallet address)
   
   # Chainlink VRF Configuration
   VRF_COORDINATOR=0x... (Base Mainnet VRF Coordinator)
   VRF_KEY_HASH=0x... (Base Mainnet Key Hash)
   VRF_SUBSCRIPTION_ID=your_subscription_id
   ```

2. **Fund Your Deployer Wallet**
   - Ensure your deployer wallet has sufficient ETH for gas fees
   - For Base Mainnet: ~0.01-0.05 ETH should be sufficient
   - For Base Sepolia: Use the Base Sepolia faucet

3. **Chainlink VRF Setup** (Required before deploying GameContract)
   - Create a VRF subscription at https://vrf.chain.link/
   - Fund the subscription with LINK tokens
   - Note the subscription ID
   - Get the VRF Coordinator address and key hash for Base Mainnet

## Deployment Steps

### Step 1: Compile Contracts

```bash
npm run compile
```

### Step 2: Deploy to Base Sepolia (Testing)

```bash
npm run deploy:sepolia
```

This will:
1. Deploy ImpactToken
2. Deploy BatteryContract
3. Deploy GameContract
4. Configure ImpactToken with GameContract address
5. Save deployment info to `deployments/` directory

### Step 3: Verify Contracts on BaseScan

After deployment, verify each contract:

```bash
# Verify ImpactToken
npx hardhat verify --network baseSepolia <IMPACT_TOKEN_ADDRESS> <DEPLOYER_ADDRESS>

# Verify BatteryContract
npx hardhat verify --network baseSepolia <BATTERY_CONTRACT_ADDRESS>

# Verify GameContract
npx hardhat verify --network baseSepolia <GAME_CONTRACT_ADDRESS> \
  "<VRF_COORDINATOR>" "<VRF_KEY_HASH>" "<VRF_SUBSCRIPTION_ID>" \
  "<IMPACT_TOKEN_ADDRESS>" "<BATTERY_CONTRACT_ADDRESS>" "<DEV_WALLET>" "<OWNER_ADDRESS>"
```

### Step 4: Test on Sepolia

1. Get testnet IMPACT tokens (mint or transfer from deployer)
2. Test coordinate submission
3. Test daily cycle functions
4. Verify VRF integration works

### Step 5: Deploy to Base Mainnet

Once testing is complete:

```bash
npm run deploy:mainnet
```

**Important:** Ensure all environment variables are set correctly for mainnet!

### Step 6: Post-Deployment Configuration

1. **Add GameContract as VRF Consumer**
   - Go to Chainlink VRF portal
   - Add GameContract address as consumer to your subscription

2. **Transfer Initial Token Supply**
   - Decide how to distribute the initial 1 billion IMPACT tokens
   - Transfer tokens to game contract or distribute to users

3. **Update Frontend Environment Variables**
   - Update `.env.local` with deployed contract addresses
   - Update Vercel environment variables

## Contract Addresses

After deployment, you'll receive:
- ImpactToken address
- BatteryContract address  
- GameContract address

Save these addresses and update your frontend configuration.

## Troubleshooting

**"Stack too deep" error:**
- Already fixed with `viaIR: true` in hardhat.config.js

**VRF not working:**
- Ensure GameContract is added as consumer in VRF subscription
- Check subscription has LINK balance
- Verify VRF Coordinator and Key Hash are correct for Base Mainnet

**Gas estimation failed:**
- Ensure deployer wallet has sufficient ETH
- Check contract constructor parameters are correct

