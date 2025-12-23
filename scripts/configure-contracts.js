/**
 * Script to configure contracts using CDP Server Wallet
 * Calls setGameContract on ImpactToken from the owner wallet
 */

require("dotenv").config({ path: ".env.local" });
const { CdpClient } = require("@coinbase/cdp-sdk");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("=== Configuring Contracts with CDP Server Wallet ===\n");

  // Load environment variables
  const apiKeyId = process.env.CDP_API_KEY_NAME || process.env.CDP_API_KEY_ID;
  const apiKeySecret = process.env.CDP_API_PRIVATE_KEY || process.env.CDP_API_KEY_SECRET;
  const walletSecret = process.env.COINBASE_WALLET_SECRET || process.env.CDP_WALLET_SECRET;
  const OWNER_WALLET = process.env.OWNER_WALLET_ADDRESS || "";

  // Load deployment info
  const deploymentFile = path.join(__dirname, "..", "deployments", "base-mainnet-summary.json");
  let deploymentInfo;
  if (fs.existsSync(deploymentFile)) {
    deploymentInfo = JSON.parse(fs.readFileSync(deploymentFile, "utf8"));
  } else {
    console.error("ERROR: Deployment info not found. Run deployment first.");
    process.exit(1);
  }

  const IMPACT_TOKEN_ADDRESS = deploymentInfo.contracts.ImpactToken;
  const GAME_CONTRACT_ADDRESS = deploymentInfo.contracts.GameContract;

  if (!apiKeyId || !apiKeySecret || !walletSecret) {
    console.error("ERROR: CDP credentials must be set");
    console.error("Required: CDP_API_KEY_NAME, CDP_API_PRIVATE_KEY, COINBASE_WALLET_SECRET");
    process.exit(1);
  }

  if (!OWNER_WALLET) {
    console.error("ERROR: OWNER_WALLET_ADDRESS must be set");
    process.exit(1);
  }

  if (OWNER_WALLET.toLowerCase() !== deploymentInfo.owner.toLowerCase()) {
    console.error("ERROR: OWNER_WALLET_ADDRESS doesn't match deployment owner");
    console.error("Expected:", deploymentInfo.owner);
    console.error("Got:", OWNER_WALLET);
    process.exit(1);
  }

  // Initialize CDP Client
  console.log("Initializing CDP Client...");
  const cdp = new CdpClient({
    apiKeyId,
    apiKeySecret,
    walletSecret,
  });

  console.log("\n=== Configuration ===");
  console.log("Network: Base Mainnet");
  console.log("Owner Wallet:", OWNER_WALLET);
  console.log("ImpactToken:", IMPACT_TOKEN_ADDRESS);
  console.log("GameContract:", GAME_CONTRACT_ADDRESS);
  console.log("");

  // ImpactToken ABI (just the setGameContract function)
  const impactTokenABI = [
    {
      inputs: [{ internalType: "address", name: "_gameContract", type: "address" }],
      name: "setGameContract",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },
  ];

  try {
    console.log("=== Step 1: Calling setGameContract on ImpactToken ===");
    console.log(`Setting GameContract to: ${GAME_CONTRACT_ADDRESS}`);

    // Encode function call
    const functionData = encodeFunctionCall("setGameContract", [GAME_CONTRACT_ADDRESS], impactTokenABI);
    
    // Use CDP SDK to send transaction (correct format)
    // Note: CDP SDK uses "base" for Base Mainnet, not "base-mainnet"
    // Value must be 0n (bigint) not "0" (string)
    const transaction = await cdp.evm.sendTransaction({
      address: OWNER_WALLET,
      network: "base",
      transaction: {
        to: IMPACT_TOKEN_ADDRESS,
        data: functionData,
        value: 0n,
      },
    });

    // Handle both transaction.hash and transaction.transactionHash
    const txHash = transaction.transactionHash || transaction.hash;
    
    if (!txHash) {
      console.error("ERROR: Transaction hash not found in response");
      console.log("Transaction response:", JSON.stringify(transaction, null, 2));
      process.exit(1);
    }

    console.log("Transaction hash:", txHash);
    console.log("Waiting for confirmation...");

    // Wait for transaction to be mined using public RPC
    const { ethers } = require("ethers");
    const baseProvider = new ethers.JsonRpcProvider("https://mainnet.base.org");
    
    let receipt;
    let attempts = 0;
    const maxAttempts = 90; // 90 seconds timeout

    while (attempts < maxAttempts) {
      try {
        receipt = await baseProvider.getTransactionReceipt(txHash);
        if (receipt) break;
      } catch (error) {
        // Transaction not mined yet
      }
      await new Promise((resolve) => setTimeout(resolve, 2000)); // Wait 2 seconds
      attempts++;
      if (attempts % 5 === 0) {
        console.log(`Still waiting... (${attempts * 2} seconds)`);
      }
    }

    if (!receipt) {
      console.error("ERROR: Transaction not confirmed within timeout");
      console.log("Transaction hash:", txHash);
      console.log("Check status on BaseScan:", `https://basescan.org/tx/${txHash}`);
      process.exit(1);
    }

    if (receipt.status === "success" || receipt.status === 1) {
      console.log("✅ Successfully set GameContract in ImpactToken");
      console.log("Transaction confirmed:", receipt.transactionHash);
      console.log("Block number:", receipt.blockNumber);
    } else {
      console.error("❌ Transaction failed");
      console.log("Transaction hash:", receipt.transactionHash);
      process.exit(1);
    }

    // Update deployment info
    deploymentInfo.configured = true;
    deploymentInfo.configurationTimestamp = new Date().toISOString();
    fs.writeFileSync(deploymentFile, JSON.stringify(deploymentInfo, null, 2));

    console.log("\n=== Configuration Complete ===");
    console.log("✅ ImpactToken is now linked to GameContract");
    console.log("\nNext Steps:");
    console.log("1. Verify on BaseScan:");
    console.log(`   https://basescan.org/address/${IMPACT_TOKEN_ADDRESS}`);
    console.log("2. Ensure Chainlink VRF subscription has GameContract as consumer");
    console.log("3. Fund VRF subscription with LINK tokens");
  } catch (error) {
    console.error("\n❌ Configuration failed:", error.message);
    if (error.response) {
      console.error("Response:", JSON.stringify(error.response.data, null, 2));
    }
    process.exit(1);
  }
}

// Helper function to encode function call
function encodeFunctionCall(functionName, params, abi) {
  const { ethers } = require("ethers");
  const iface = new ethers.Interface(abi);
  return iface.encodeFunctionData(functionName, params);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("\n❌ Error:", error.message);
    process.exit(1);
  });

