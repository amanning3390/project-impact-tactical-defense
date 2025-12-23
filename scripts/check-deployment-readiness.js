/**
 * Script to check deployment readiness
 * Validates environment variables and configuration
 */

require("dotenv").config({ path: ".env.local" });
const fs = require("fs");
const path = require("path");

function checkEnvVar(name, description, required = true) {
  const value = process.env[name];
  const status = value ? "✅" : "❌";
  const display = value ? (name.includes("KEY") || name.includes("SECRET") || name.includes("PRIVATE") ? "***" : value) : "NOT SET";
  
  console.log(`${status} ${name.padEnd(30)} ${display}`);
  if (!value && required) {
    return false;
  }
  return true;
}

function checkFile(filePath, description) {
  const exists = fs.existsSync(filePath);
  const status = exists ? "✅" : "❌";
  console.log(`${status} ${description.padEnd(30)} ${exists ? "Found" : "Missing"}`);
  return exists;
}

async function main() {
  console.log("=== Deployment Readiness Check ===\n");

  let allReady = true;

  // Check CDP Credentials
  console.log("📋 CDP Credentials:");
  if (!checkEnvVar("CDP_API_KEY_NAME", "CDP API Key Name")) allReady = false;
  if (!checkEnvVar("CDP_API_PRIVATE_KEY", "CDP API Private Key")) allReady = false;
  if (!checkEnvVar("COINBASE_WALLET_SECRET", "Wallet Secret")) allReady = false;
  if (!checkEnvVar("OWNER_WALLET_ADDRESS", "Owner Wallet Address")) allReady = false;
  console.log("");

  // Check Hardhat Deployment Credentials
  console.log("📋 Hardhat Deployment Credentials:");
  if (!checkEnvVar("PRIVATE_KEY", "Deployer Private Key", false)) {
    console.log("   ⚠️  PRIVATE_KEY not set - needed for Hardhat deployment");
    console.log("   💡 You can use the CDP Server Wallet for owner, but need a separate deployer wallet");
  }
  if (!checkEnvVar("BASE_RPC_URL", "Base Mainnet RPC URL", false)) {
    console.log("   ⚠️  BASE_RPC_URL not set - will use default");
  }
  if (!checkEnvVar("BASESCAN_API_KEY", "BaseScan API Key", false)) {
    console.log("   ⚠️  BASESCAN_API_KEY not set - contract verification will fail");
  }
  if (!checkEnvVar("DEV_WALLET", "Dev Wallet Address", false)) {
    console.log("   ⚠️  DEV_WALLET not set - will use deployer address");
  }
  console.log("");

  // Check Chainlink VRF Configuration
  console.log("📋 Chainlink VRF Configuration:");
  const vrfReady = 
    checkEnvVar("VRF_COORDINATOR", "VRF Coordinator Address", false) &&
    checkEnvVar("VRF_KEY_HASH", "VRF Key Hash", false) &&
    checkEnvVar("VRF_SUBSCRIPTION_ID", "VRF Subscription ID", false);
  
  if (!vrfReady) {
    console.log("   ⚠️  VRF configuration incomplete");
    console.log("   📖 See VRF_CONFIG.md for setup instructions");
    console.log("   🔗 https://vrf.chain.link/");
  }
  console.log("");

  // Check Contract Files
  console.log("📋 Contract Files:");
  const contractsDir = path.join(__dirname, "..", "contracts");
  checkFile(path.join(contractsDir, "ImpactToken.sol"), "ImpactToken.sol");
  checkFile(path.join(contractsDir, "BatteryContract.sol"), "BatteryContract.sol");
  checkFile(path.join(contractsDir, "GameContract.sol"), "GameContract.sol");
  console.log("");

  // Check Owner Wallet Info
  console.log("📋 Owner Wallet:");
  const ownerWalletFile = path.join(__dirname, "..", "deployments", "owner-wallet.json");
  if (checkFile(ownerWalletFile, "owner-wallet.json")) {
    try {
      const ownerInfo = JSON.parse(fs.readFileSync(ownerWalletFile, "utf8"));
      console.log(`   Address: ${ownerInfo.address}`);
      console.log(`   Network: ${ownerInfo.network}`);
      console.log(`   Created: ${ownerInfo.createdAt}`);
    } catch (error) {
      console.log("   ⚠️  Could not read owner wallet info");
    }
  }
  console.log("");

  // Check Paymaster Configuration
  console.log("📋 Paymaster Configuration:");
  if (checkEnvVar("NEXT_PUBLIC_PAYMASTER_URL", "Paymaster URL", false)) {
    const paymasterUrl = process.env.NEXT_PUBLIC_PAYMASTER_URL;
    if (paymasterUrl.includes("api.developer.coinbase.com")) {
      console.log("   ✅ Paymaster URL format looks correct");
    } else {
      console.log("   ⚠️  Paymaster URL format may be incorrect");
    }
  }
  console.log("");

  // Summary
  console.log("=== Summary ===");
  if (allReady && vrfReady) {
    console.log("✅ All critical configurations are ready!");
    console.log("\nNext steps:");
    console.log("1. Fund the owner wallet with ETH for deployment");
    console.log("2. Ensure VRF subscription has LINK balance");
    console.log("3. Run: npm run compile");
    console.log("4. Run: npm run deploy:mainnet");
  } else {
    console.log("⚠️  Some configurations are missing");
    console.log("\nMissing items:");
    if (!process.env.PRIVATE_KEY) {
      console.log("  - PRIVATE_KEY (deployer wallet private key)");
    }
    if (!vrfReady) {
      console.log("  - Chainlink VRF configuration (see VRF_CONFIG.md)");
    }
    if (!process.env.BASESCAN_API_KEY) {
      console.log("  - BASESCAN_API_KEY (for contract verification)");
    }
  }
  console.log("");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });


