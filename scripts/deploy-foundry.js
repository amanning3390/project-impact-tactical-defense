/**
 * Deployment script using Foundry artifacts directly
 * Bypasses Hardhat compilation to use Foundry's via-ir compiled contracts
 */

require("dotenv").config({ path: ".env.local" });
const { ethers } = require("ethers");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("=== Deploying Contracts to Base Mainnet ===\n");

  // Load environment variables
  const PRIVATE_KEY = process.env.PRIVATE_KEY;
  const RPC_URL = process.env.BASE_RPC_URL || "https://mainnet.base.org";
  
  // Get VRF config, filtering out placeholder values
  let VRF_COORDINATOR = process.env.VRF_COORDINATOR || process.env.NEXT_PUBLIC_CHAINLINK_VRF_COORDINATOR || "";
  let VRF_KEY_HASH = process.env.VRF_KEY_HASH || process.env.NEXT_PUBLIC_CHAINLINK_VRF_KEY_HASH || "";
  let VRF_SUBSCRIPTION_ID = process.env.VRF_SUBSCRIPTION_ID || process.env.NEXT_PUBLIC_CHAINLINK_VRF_SUBSCRIPTION_ID || "0";
  let DEV_WALLET = process.env.DEV_WALLET || process.env.DEV_WALLET_ADDRESS || "";
  const OWNER_WALLET = process.env.OWNER_WALLET_ADDRESS || "";
  
  // Filter out placeholder values that weren't expanded
  if (VRF_COORDINATOR.includes("${") || VRF_COORDINATOR === "0x...") VRF_COORDINATOR = "";
  if (VRF_KEY_HASH.includes("${") || VRF_KEY_HASH === "0x...") VRF_KEY_HASH = "";
  if (VRF_SUBSCRIPTION_ID.includes("${") || VRF_SUBSCRIPTION_ID === "your_subscription_id") VRF_SUBSCRIPTION_ID = "0";
  if (DEV_WALLET.includes("${") || DEV_WALLET === "0x..." || !DEV_WALLET) {
    // Will be set to deployer address after wallet is created
    DEV_WALLET = "";
  }

  if (!PRIVATE_KEY) {
    console.error("ERROR: PRIVATE_KEY must be set in .env.local");
    process.exit(1);
  }

  if (!VRF_COORDINATOR || !VRF_KEY_HASH) {
    console.error("ERROR: VRF_COORDINATOR and VRF_KEY_HASH must be set");
    console.error("Set VRF_COORDINATOR, VRF_KEY_HASH, and VRF_SUBSCRIPTION_ID in .env.local");
    console.error("\nBase Mainnet VRF addresses:");
    console.error("VRF_COORDINATOR=0x4b09e2edbebc8b3e37913c35b7d24e1855218645");
    console.error("VRF_KEY_HASH=0x5881eea62f9876043df723cf89f0c2bb6f950da25e9dfe66995c24f919c8f8b0");
    console.error("\nCreate subscription at: https://vrf.chain.link/");
    process.exit(1);
  }
  
  // Warn if subscription ID is not set (can be added later)
  if (!VRF_SUBSCRIPTION_ID || VRF_SUBSCRIPTION_ID === "0" || VRF_SUBSCRIPTION_ID.includes("your_")) {
    console.warn("\n⚠️  WARNING: VRF_SUBSCRIPTION_ID not set or is placeholder");
    console.warn("   Contracts will deploy but VRF won't work until subscription is created and ID is set");
    console.warn("   Create subscription at: https://vrf.chain.link/");
    console.warn("   Then add GameContract as consumer after deployment\n");
  }

  if (!OWNER_WALLET) {
    console.error("ERROR: OWNER_WALLET_ADDRESS must be set");
    process.exit(1);
  }

  // Setup provider and wallet
  const provider = new ethers.JsonRpcProvider(RPC_URL);
  const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
  
  console.log("Deploying with account:", wallet.address);
  const balance = await provider.getBalance(wallet.address);
  console.log("Account balance:", ethers.formatEther(balance), "ETH");
  
  if (balance === 0n) {
    console.error("ERROR: Deployer wallet has no ETH. Please fund the wallet first.");
    process.exit(1);
  }

  // Set DEV_WALLET to deployer if not set
  if (!DEV_WALLET || DEV_WALLET === "") {
    DEV_WALLET = wallet.address;
  }

  console.log("\n=== Deployment Configuration ===");
  console.log("Network: Base Mainnet");
  console.log("RPC URL:", RPC_URL);
  console.log("VRF Coordinator:", VRF_COORDINATOR);
  console.log("VRF Key Hash:", VRF_KEY_HASH);
  console.log("VRF Subscription ID:", VRF_SUBSCRIPTION_ID);
  console.log("Dev Wallet:", DEV_WALLET);
  console.log("Owner Wallet:", OWNER_WALLET);
  console.log("");

  // Load Foundry artifacts
  function loadArtifact(contractName) {
    const artifactPath = path.join(__dirname, "..", "out", `${contractName}.sol`, `${contractName}.json`);
    if (!fs.existsSync(artifactPath)) {
      throw new Error(`Artifact not found: ${artifactPath}. Run 'npm run compile' first.`);
    }
    return JSON.parse(fs.readFileSync(artifactPath, "utf8"));
  }

  // Step 1: Deploy ImpactToken
  console.log("=== Step 1: Deploying ImpactToken ===");
  const impactTokenArtifact = loadArtifact("ImpactToken");
  const impactTokenFactory = new ethers.ContractFactory(
    impactTokenArtifact.abi,
    impactTokenArtifact.bytecode.object,
    wallet
  );
  const impactToken = await impactTokenFactory.deploy(OWNER_WALLET);
  await impactToken.waitForDeployment();
  const impactTokenAddress = await impactToken.getAddress();
  console.log("✅ ImpactToken deployed to:", impactTokenAddress);

  // Step 2: Deploy BatteryContract
  console.log("\n=== Step 2: Deploying BatteryContract ===");
  const batteryArtifact = loadArtifact("BatteryContract");
  const batteryFactory = new ethers.ContractFactory(
    batteryArtifact.abi,
    batteryArtifact.bytecode.object,
    wallet
  );
  const batteryContract = await batteryFactory.deploy();
  await batteryContract.waitForDeployment();
  const batteryContractAddress = await batteryContract.getAddress();
  console.log("✅ BatteryContract deployed to:", batteryContractAddress);

  // Step 3: Deploy GameContract
  console.log("\n=== Step 3: Deploying GameContract ===");
  const gameArtifact = loadArtifact("GameContract");
  const gameFactory = new ethers.ContractFactory(
    gameArtifact.abi,
    gameArtifact.bytecode.object,
    wallet
  );
  
  // Get current gas price and increase by 50% to avoid replacement issues
  const feeData = await provider.getFeeData();
  const gasPrice = feeData.gasPrice ? (feeData.gasPrice * 150n / 100n) : undefined;
  
  console.log("Deploying with gas price:", gasPrice ? ethers.formatUnits(gasPrice, "gwei") + " gwei" : "auto");
  
  const deployTx = await gameFactory.getDeployTransaction(
    VRF_COORDINATOR,
    VRF_KEY_HASH,
    VRF_SUBSCRIPTION_ID,
    impactTokenAddress,
    batteryContractAddress,
    DEV_WALLET,
    OWNER_WALLET
  );
  
  if (gasPrice) {
    deployTx.gasPrice = gasPrice;
  }
  
  const gameContractTx = await wallet.sendTransaction(deployTx);
  console.log("Transaction hash:", gameContractTx.hash);
  console.log("Waiting for confirmation...");
  const receipt = await gameContractTx.wait();
  const gameContractAddress = receipt.contractAddress;
  
  if (!gameContractAddress) {
    throw new Error("Contract address not found in receipt");
  }
  
  console.log("✅ GameContract deployed to:", gameContractAddress);

  // Step 4: Configure ImpactToken
  console.log("\n=== Step 4: Configuring ImpactToken ===");
  // Note: setGameContract must be called by the owner (CDP Server Wallet), not the deployer
  if (OWNER_WALLET.toLowerCase() === wallet.address.toLowerCase()) {
    const impactTokenContract = new ethers.Contract(impactTokenAddress, impactTokenArtifact.abi, wallet);
    const setGameContractTx = await impactTokenContract.setGameContract(gameContractAddress);
    await setGameContractTx.wait();
    console.log("✅ GameContract set in ImpactToken");
  } else {
    console.log("⚠️  Skipping setGameContract - must be called by owner wallet");
    console.log("   Owner wallet:", OWNER_WALLET);
    console.log("   Deployer wallet:", wallet.address);
    console.log("   Action required: Call setGameContract(" + gameContractAddress + ") from owner wallet");
  }

  // Save deployment info
  const deploymentInfo = {
    network: "base-mainnet",
    chainId: 8453,
    deployer: wallet.address,
    owner: OWNER_WALLET,
    contracts: {
      ImpactToken: impactTokenAddress,
      BatteryContract: batteryContractAddress,
      GameContract: gameContractAddress,
    },
    configuration: {
      VRF_COORDINATOR,
      VRF_KEY_HASH,
      VRF_SUBSCRIPTION_ID,
      DEV_WALLET: DEV_WALLET || wallet.address,
    },
    timestamp: new Date().toISOString(),
  };

  const deploymentsDir = path.join(__dirname, "..", "deployments");
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir, { recursive: true });
  }

  const deploymentFile = path.join(deploymentsDir, `base-mainnet-${Date.now()}.json`);
  fs.writeFileSync(deploymentFile, JSON.stringify(deploymentInfo, null, 2));

  console.log("\n=== Deployment Summary ===");
  console.log("ImpactToken:", impactTokenAddress);
  console.log("BatteryContract:", batteryContractAddress);
  console.log("GameContract:", gameContractAddress);
  console.log("\n📝 Deployment info saved to:", deploymentFile);

  console.log("\n=== Next Steps ===");
  console.log("1. Verify contracts on BaseScan");
  console.log("2. Add GameContract as VRF consumer in Chainlink VRF portal");
  console.log("3. Update frontend environment variables with contract addresses");
  console.log("4. Test contract interactions");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("\n❌ Deployment failed:", error);
    process.exit(1);
  });

