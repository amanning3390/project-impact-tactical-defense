// Script to help get VRF information
// This is a reference - actual addresses must be verified from Chainlink docs

console.log("Chainlink VRF Configuration Helper");
console.log("===================================\n");

console.log("Step 1: Visit https://vrf.chain.link/");
console.log("Step 2: Create a subscription for Base Mainnet");
console.log("Step 3: Fund subscription with LINK tokens");
console.log("Step 4: Get your subscription ID");
console.log("\nStep 5: Get VRF Coordinator and Key Hash from:");
console.log("   https://docs.chain.link/vrf/v2/supported-networks");
console.log("\nStep 6: Update your .env file with:");
console.log("   VRF_COORDINATOR=<coordinator_address>");
console.log("   VRF_KEY_HASH=<key_hash>");
console.log("   VRF_SUBSCRIPTION_ID=<your_subscription_id>");
console.log("\nStep 7: After deploying GameContract, add it as a consumer");
console.log("   in the Chainlink VRF portal");

