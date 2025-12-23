/**
 * Send ETH from Owner Wallet (CDP Server Wallet) to Deployer Address
 * This allows the deployer to bridge the ETH or use it directly
 */

require("dotenv").config({ path: ".env.local" });
const { CdpClient } = require("@coinbase/cdp-sdk");
const { parseEther } = require("viem");
const { ethers } = require("ethers");

async function main() {
  console.log("=== Send ETH from Owner Wallet to Deployer ===\n");

  const apiKeyId = process.env.CDP_API_KEY_NAME;
  const apiKeySecret = process.env.CDP_API_PRIVATE_KEY;
  const walletSecret = process.env.COINBASE_WALLET_SECRET;
  const OWNER_WALLET = process.env.OWNER_WALLET_ADDRESS;
  const DEPLOYER_ADDRESS = process.env.DEPLOYER_ADDRESS;

  // Get amount from command line or use default
  const amountArg = process.argv.find((arg) => arg.startsWith("--amount="));
  const amount = amountArg
    ? parseFloat(amountArg.split("=")[1])
    : 0.003; // Default: 0.003 ETH

  if (!apiKeyId || !apiKeySecret || !walletSecret) {
    console.error("ERROR: CDP credentials must be set");
    console.error("Required: CDP_API_KEY_NAME, CDP_API_PRIVATE_KEY, COINBASE_WALLET_SECRET");
    process.exit(1);
  }

  if (!OWNER_WALLET) {
    console.error("ERROR: OWNER_WALLET_ADDRESS must be set");
    process.exit(1);
  }

  // Get deployer address from deployment summary or env
  let deployerAddress = DEPLOYER_ADDRESS;
  if (!deployerAddress) {
    try {
      const fs = require("fs");
      const path = require("path");
      const deploymentFile = path.join(__dirname, "..", "deployments", "base-mainnet-summary.json");
      if (fs.existsSync(deploymentFile)) {
        const deploymentInfo = JSON.parse(fs.readFileSync(deploymentFile, "utf8"));
        deployerAddress = deploymentInfo.deployer;
      }
    } catch (error) {
      // Ignore
    }
  }

  if (!deployerAddress) {
    console.error("ERROR: Deployer address not found");
    console.error("Set DEPLOYER_ADDRESS in .env.local or ensure deployments/base-mainnet-summary.json exists");
    process.exit(1);
  }

  try {
    console.log("Initializing CDP Client...");
    const cdp = new CdpClient({
      apiKeyId,
      apiKeySecret,
      walletSecret,
    });

    // Check balances
    console.log("\n=== Checking Balances ===");
    const l1Provider = new ethers.JsonRpcProvider("https://eth.llamarpc.com");

    const ownerBalance = await l1Provider.getBalance(OWNER_WALLET);
    const deployerBalance = await l1Provider.getBalance(deployerAddress);

    const ownerBalanceEth = ethers.formatEther(ownerBalance);
    const deployerBalanceEth = ethers.formatEther(deployerBalance);

    console.log(`Owner Wallet (${OWNER_WALLET}): ${ownerBalanceEth} ETH`);
    console.log(`Deployer Address (${deployerAddress}): ${deployerBalanceEth} ETH`);

    if (parseFloat(ownerBalanceEth) < amount) {
      console.error(
        `\n❌ ERROR: Insufficient balance. Need ${amount} ETH, have ${ownerBalanceEth} ETH`
      );
      process.exit(1);
    }

    console.log("\n=== Sending ETH ===");
    console.log("Amount:", amount, "ETH");
    console.log("From:", OWNER_WALLET, "(Owner Wallet - CDP Server Wallet)");
    console.log("To:", deployerAddress, "(Deployer Address)");
    console.log("Network: Ethereum L1");

    // Send ETH transaction
    const transaction = await cdp.evm.sendTransaction({
      address: OWNER_WALLET,
      network: "ethereum", // Ethereum L1 mainnet
      transaction: {
        to: deployerAddress,
        value: parseEther(amount.toString()), // Amount of ETH to send
      },
    });

    console.log("\n✅ Transaction sent!");
    console.log("Transaction hash:", transaction.transactionHash || transaction.hash);
    console.log(
      `View on Etherscan: https://etherscan.io/tx/${transaction.transactionHash || transaction.hash}`
    );

    console.log("\n⏳ Waiting for confirmation...");
    let receipt;
    let attempts = 0;
    const maxAttempts = 60; // 5 minutes timeout

    while (attempts < maxAttempts) {
      try {
        const txHash = transaction.transactionHash || transaction.hash;
        receipt = await l1Provider.getTransactionReceipt(txHash);
        if (receipt) break;
      } catch (error) {
        // Transaction not mined yet
      }
      await new Promise((resolve) => setTimeout(resolve, 5000)); // Wait 5 seconds
      attempts++;
      if (attempts % 6 === 0) {
        console.log(`Still waiting... (${attempts * 5} seconds)`);
      }
    }

    if (!receipt) {
      console.error("ERROR: Transaction not confirmed within timeout");
      const txHash = transaction.transactionHash || transaction.hash;
      console.log("Transaction hash:", txHash);
      console.log("Check status on Etherscan:", `https://etherscan.io/tx/${txHash}`);
      process.exit(1);
    }

    if (receipt.status === 1) {
      console.log("✅ Transaction confirmed!");
      console.log("Block number:", receipt.blockNumber);

      // Check final balances
      const finalOwnerBalance = await l1Provider.getBalance(OWNER_WALLET);
      const finalDeployerBalance = await l1Provider.getBalance(deployerAddress);

      console.log("\n=== Final Balances ===");
      console.log(`Owner Wallet: ${ethers.formatEther(finalOwnerBalance)} ETH`);
      console.log(`Deployer Address: ${ethers.formatEther(finalDeployerBalance)} ETH`);

      console.log("\n✅ ETH successfully sent to deployer!");
      console.log("\nNext steps:");
      console.log("1. The deployer can now bridge this ETH to Base L2 if needed");
      console.log("2. Or use it directly on Ethereum L1");
      console.log(`3. Deployer can bridge at: https://superbridge.app/base`);
    } else {
      console.error("❌ Transaction failed");
      process.exit(1);
    }
  } catch (error) {
    console.error("\n❌ Transaction failed:", error.message);
    if (error.response) {
      console.error("Response:", JSON.stringify(error.response.data, null, 2));
    }
    if (error.stack) {
      console.error("Stack:", error.stack);
    }
    process.exit(1);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("\n❌ Error:", error.message);
    process.exit(1);
  });

