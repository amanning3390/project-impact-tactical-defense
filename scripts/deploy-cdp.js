/**
 * Deployment script using CDP Server Wallet
 * Uses the funded owner wallet to deploy contracts
 */

require("dotenv").config({ path: ".env.local" });
const { CdpClient } = require("@coinbase/cdp-sdk");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("=== Deploying Contracts to Base Mainnet using CDP Server Wallet ===\n");

  // Load environment variables
  const apiKeyId = process.env.CDP_API_KEY_NAME || process.env.CDP_API_KEY_ID;
  const apiKeySecret = process.env.CDP_API_PRIVATE_KEY || process.env.CDP_API_KEY_SECRET;
  const walletSecret = process.env.COINBASE_WALLET_SECRET || process.env.CDP_WALLET_SECRET;
  const OWNER_WALLET = process.env.OWNER_WALLET_ADDRESS || "";
  const VRF_COORDINATOR = process.env.VRF_COORDINATOR || process.env.NEXT_PUBLIC_CHAINLINK_VRF_COORDINATOR || "";
  const VRF_KEY_HASH = process.env.VRF_KEY_HASH || process.env.NEXT_PUBLIC_CHAINLINK_VRF_KEY_HASH || "";
  const VRF_SUBSCRIPTION_ID = process.env.VRF_SUBSCRIPTION_ID || process.env.NEXT_PUBLIC_CHAINLINK_VRF_SUBSCRIPTION_ID || "0";
  const DEV_WALLET = process.env.DEV_WALLET || process.env.DEV_WALLET_ADDRESS || "";

  if (!apiKeyId || !apiKeySecret || !walletSecret) {
    console.error("ERROR: CDP credentials must be set");
    console.error("Required: CDP_API_KEY_NAME, CDP_API_PRIVATE_KEY, COINBASE_WALLET_SECRET");
    process.exit(1);
  }

  if (!OWNER_WALLET) {
    console.error("ERROR: OWNER_WALLET_ADDRESS must be set");
    process.exit(1);
  }

  if (!VRF_COORDINATOR || !VRF_KEY_HASH) {
    console.error("ERROR: VRF_COORDINATOR and VRF_KEY_HASH must be set");
    process.exit(1);
  }

  // Initialize CDP Client
  console.log("Initializing CDP Client...");
  const cdp = new CdpClient({
    apiKeyId,
    apiKeySecret,
    walletSecret,
  });

  // Check owner wallet balance
  try {
    const balance = await cdp.evm.getBalance({
      address: OWNER_WALLET,
      network: "base-mainnet",
    });
    console.log("Owner wallet balance:", balance.toString(), "ETH");
    if (balance === 0n) {
      console.error("ERROR: Owner wallet has no ETH. Please fund it first.");
      process.exit(1);
    }
  } catch (error) {
    console.log("⚠️  Could not check balance, proceeding anyway...");
  }

  console.log("\n=== Deployment Configuration ===");
  console.log("Network: Base Mainnet");
  console.log("Owner Wallet:", OWNER_WALLET);
  console.log("VRF Coordinator:", VRF_COORDINATOR);
  console.log("VRF Key Hash:", VRF_KEY_HASH);
  console.log("VRF Subscription ID:", VRF_SUBSCRIPTION_ID);
  console.log("Dev Wallet:", DEV_WALLET || OWNER_WALLET);
  console.log("");

  // Load Foundry artifacts
  function loadArtifact(contractName) {
    const artifactPath = path.join(__dirname, "..", "out", `${contractName}.sol`, `${contractName}.json`);
    if (!fs.existsSync(artifactPath)) {
      throw new Error(`Artifact not found: ${artifactPath}. Run 'npm run compile' first.`);
    }
    return JSON.parse(fs.readFileSync(artifactPath, "utf8"));
  }

  // Note: CDP SDK v2 doesn't have direct contract deployment yet
  // We'll need to use the sendTransaction method with contract creation data
  console.log("⚠️  CDP SDK v2 contract deployment requires converting contracts to Solidity input JSON format.");
  console.log("For now, please use a standard deployer wallet with PRIVATE_KEY set.");
  console.log("\nAlternatively, you can:");
  console.log("1. Use Remix IDE to compile and get Solidity input JSON");
  console.log("2. Use CDP SDK's deployContract method with the input JSON");
  console.log("\nFor immediate deployment, set PRIVATE_KEY in .env.local and run:");
  console.log("  npm run deploy:mainnet");
  
  process.exit(1);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("\n❌ Deployment failed:", error.message);
    process.exit(1);
  });


