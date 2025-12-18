# Chainlink VRF Configuration Guide

## Base Mainnet VRF Configuration

**Important:** You must verify these addresses from the official Chainlink VRF documentation for Base Mainnet.

**VRF Coordinator Address:** 
- Check: https://docs.chain.link/vrf/v2/supported-networks
- Base Mainnet coordinator address (verify before deployment)

**Key Hash:**
- Check: https://docs.chain.link/vrf/v2/supported-networks  
- Base Mainnet key hash (verify before deployment)

**Gas Lane:** Choose appropriate gas lane based on your needs:
- 30 gwei key hash (cheaper, slower)
- 50 gwei key hash (balanced)
- 100 gwei key hash (faster, more expensive)

## Base Sepolia Testnet VRF Configuration

For testing on Base Sepolia, use the following:
- **VRF Coordinator:** Check Chainlink VRF documentation for Base Sepolia
- **Key Hash:** Check Chainlink VRF documentation for Base Sepolia

## Setup Steps

1. Go to [Chainlink VRF Portal](https://vrf.chain.link/)
2. Create a new subscription
3. Fund the subscription with LINK tokens
4. Add your GameContract address as a consumer
5. Copy the subscription ID
6. Update environment variables:
   - `VRF_COORDINATOR`
   - `VRF_KEY_HASH`
   - `VRF_SUBSCRIPTION_ID`

## Important Notes

- VRF requests cost LINK tokens from your subscription
- Ensure subscription has sufficient LINK balance
- GameContract must be added as a consumer before it can request random numbers
- VRF fulfillment typically takes 1-2 blocks

