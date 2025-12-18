/**
 * Script to create a CDP Server Wallet to be used as the owner wallet
 * This wallet will own the contracts (ImpactToken, GameContract, etc.)
 */

require("dotenv").config({ path: ".env.local" });
const { CdpClient } = require("@coinbase/cdp-sdk");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("=== Creating CDP Server Wallet Owner Account ===\n");

  // Validate environment variables
  // CDP SDK v2 uses apiKeyId and apiKeySecret
  const apiKeyId = process.env.CDP_API_KEY_NAME || process.env.CDP_API_KEY_ID;
  const apiKeySecret = process.env.CDP_API_PRIVATE_KEY || process.env.CDP_API_KEY_SECRET;
  const walletSecret = process.env.COINBASE_WALLET_SECRET || process.env.CDP_WALLET_SECRET;

  if (!apiKeyId || !apiKeySecret || !walletSecret) {
    console.error("ERROR: Missing required CDP credentials in .env.local");
    console.error("Required:");
    console.error("  - CDP_API_KEY_NAME (or CDP_API_KEY_ID)");
    console.error("  - CDP_API_PRIVATE_KEY (or CDP_API_KEY_SECRET)");
    console.error("  - COINBASE_WALLET_SECRET (or CDP_WALLET_SECRET)");
    process.exit(1);
  }

  try {
    // Initialize CDP Client
    console.log("Initializing CDP Client...");
    const cdp = new CdpClient({
      apiKeyId,
      apiKeySecret,
      walletSecret,
    });

    // Create a new EVM account on Base Mainnet
    console.log("\nCreating EVM account on Base Mainnet...");
    const account = await cdp.evm.createAccount({
      network: "base-mainnet",
    });

    console.log("\n✅ Successfully created owner wallet!");
    console.log("Address:", account.address);
    console.log("Network: base-mainnet");

    // Get account balance
    try {
      const balance = await cdp.evm.getBalance({
        address: account.address,
        network: "base-mainnet",
      });
      console.log("Balance:", balance.toString(), "ETH");
    } catch (error) {
      console.log("Balance: Unable to fetch (account may need funding)");
    }

    // Save wallet info to file
    const walletInfo = {
      address: account.address,
      network: "base-mainnet",
      createdAt: new Date().toISOString(),
      purpose: "Contract owner wallet",
      note: "This wallet will be used as the owner for ImpactToken, GameContract, and other contracts",
    };

    const outputDir = path.join(__dirname, "..", "deployments");
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const outputFile = path.join(outputDir, "owner-wallet.json");
    fs.writeFileSync(outputFile, JSON.stringify(walletInfo, null, 2));

    console.log("\n📝 Wallet info saved to:", outputFile);

    // Update .env.local with the owner wallet address
    console.log("\n=== Next Steps ===");
    console.log("1. Fund this wallet with ETH on Base Mainnet for deployment:");
    console.log(`   Address: ${account.address}`);
    console.log("\n2. Add to .env.local:");
    console.log(`   OWNER_WALLET_ADDRESS=${account.address}`);
    console.log("\n3. This wallet will be used as the owner for all contracts");
    console.log("   (ImpactToken, GameContract, etc.)");

    // Also suggest adding to .env.local
    const envFile = path.join(__dirname, "..", ".env.local");
    if (fs.existsSync(envFile)) {
      const envContent = fs.readFileSync(envFile, "utf8");
      if (!envContent.includes("OWNER_WALLET_ADDRESS")) {
        console.log("\n💡 Tip: Run this command to add to .env.local:");
        console.log(`   echo "OWNER_WALLET_ADDRESS=${account.address}" >> .env.local`);
      }
    }

    return account;
  } catch (error) {
    console.error("\n❌ Error creating wallet:", error.message);
    if (error.response) {
      console.error("Response:", JSON.stringify(error.response.data, null, 2));
    }
    process.exit(1);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

