const { ethers } = require("hardhat");
const fs = require("fs");

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);
  console.log("Account balance:", (await ethers.provider.getBalance(deployer.address)).toString());

  // Get network info
  const network = await ethers.provider.getNetwork();
  console.log("Network:", network.name, "Chain ID:", network.chainId);

  // Configuration from environment variables
  // Try both prefixed and non-prefixed versions
  const VRF_COORDINATOR = process.env.VRF_COORDINATOR || process.env.NEXT_PUBLIC_CHAINLINK_VRF_COORDINATOR || "";
  const VRF_KEY_HASH = process.env.VRF_KEY_HASH || process.env.NEXT_PUBLIC_CHAINLINK_VRF_KEY_HASH || "";
  const VRF_SUBSCRIPTION_ID = process.env.VRF_SUBSCRIPTION_ID || process.env.NEXT_PUBLIC_CHAINLINK_VRF_SUBSCRIPTION_ID || "0";
  const DEV_WALLET = process.env.DEV_WALLET || process.env.DEV_WALLET_ADDRESS || deployer.address;
  // Use CDP Server Wallet as owner if specified, otherwise use deployer
  const OWNER_WALLET = process.env.OWNER_WALLET_ADDRESS || deployer.address;

  if (!VRF_COORDINATOR || !VRF_KEY_HASH) {
    console.error("ERROR: VRF_COORDINATOR and VRF_KEY_HASH must be set in environment variables");
    process.exit(1);
  }

  console.log("\n=== Deployment Configuration ===");
  console.log("VRF Coordinator:", VRF_COORDINATOR);
  console.log("VRF Key Hash:", VRF_KEY_HASH);
  console.log("VRF Subscription ID:", VRF_SUBSCRIPTION_ID);
  console.log("Dev Wallet:", DEV_WALLET);
  console.log("Deployer:", deployer.address);
  console.log("Owner Wallet:", OWNER_WALLET);
  if (OWNER_WALLET !== deployer.address) {
    console.log("  ⚠️  Note: Owner is different from deployer (CDP Server Wallet)");
  }

  // Step 1: Deploy ImpactToken
  console.log("\n=== Step 1: Deploying ImpactToken ===");
  // Use Foundry artifacts if available, otherwise compile
  let ImpactToken;
  try {
    const artifact = require("../out/ImpactToken.sol/ImpactToken.json");
    ImpactToken = await ethers.getContractFactoryFromArtifact(artifact);
  } catch (e) {
    ImpactToken = await ethers.getContractFactory("ImpactToken");
  }
  const impactToken = await ImpactToken.deploy(OWNER_WALLET);
  await impactToken.waitForDeployment();
  const impactTokenAddress = await impactToken.getAddress();
  console.log("ImpactToken deployed to:", impactTokenAddress);
  console.log("ImpactToken owner:", OWNER_WALLET);

  // Step 2: Deploy BatteryContract
  console.log("\n=== Step 2: Deploying BatteryContract ===");
  let BatteryContract;
  try {
    const artifact = require("../out/BatteryContract.sol/BatteryContract.json");
    BatteryContract = await ethers.getContractFactoryFromArtifact(artifact);
  } catch (e) {
    BatteryContract = await ethers.getContractFactory("BatteryContract");
  }
  const batteryContract = await BatteryContract.deploy();
  await batteryContract.waitForDeployment();
  const batteryContractAddress = await batteryContract.getAddress();
  console.log("BatteryContract deployed to:", batteryContractAddress);

  // Step 3: Deploy GameContract
  console.log("\n=== Step 3: Deploying GameContract ===");
  let GameContract;
  try {
    const artifact = require("../out/GameContract.sol/GameContract.json");
    GameContract = await ethers.getContractFactoryFromArtifact(artifact);
  } catch (e) {
    GameContract = await ethers.getContractFactory("GameContract");
  }
  const gameContract = await GameContract.deploy(
    VRF_COORDINATOR,
    VRF_KEY_HASH,
    VRF_SUBSCRIPTION_ID,
    impactTokenAddress,
    batteryContractAddress,
    DEV_WALLET,
    OWNER_WALLET // owner (CDP Server Wallet)
  );
  await gameContract.waitForDeployment();
  const gameContractAddress = await gameContract.getAddress();
  console.log("GameContract deployed to:", gameContractAddress);
  console.log("GameContract owner:", OWNER_WALLET);

  // Step 4: Configure ImpactToken
  console.log("\n=== Step 4: Configuring ImpactToken ===");
  const setGameContractTx = await impactToken.setGameContract(gameContractAddress);
  await setGameContractTx.wait();
  console.log("GameContract set in ImpactToken");

  // Verify configuration
  const gameContractInToken = await impactToken.gameContract();
  console.log("Verified gameContract in ImpactToken:", gameContractInToken);

  // Summary
  console.log("\n=== Deployment Summary ===");
  console.log("ImpactToken:", impactTokenAddress);
  console.log("BatteryContract:", batteryContractAddress);
  console.log("GameContract:", gameContractAddress);
  console.log("\n=== Next Steps ===");
  console.log("1. Verify contracts on BaseScan:");
  console.log(`   npx hardhat verify --network base ${impactTokenAddress} "${OWNER_WALLET}"`);
  console.log(`   npx hardhat verify --network base ${batteryContractAddress}`);
  console.log(`   npx hardhat verify --network base ${gameContractAddress} "${VRF_COORDINATOR}" "${VRF_KEY_HASH}" "${VRF_SUBSCRIPTION_ID}" "${impactTokenAddress}" "${batteryContractAddress}" "${DEV_WALLET}" "${OWNER_WALLET}"`);
  console.log("\n2. Add GameContract as VRF consumer in Chainlink VRF portal");
  console.log("\n3. Update environment variables with contract addresses");
  console.log("\n4. Transfer initial token supply to game contract or distribute as needed");

  // Save deployment info
  const deploymentInfo = {
    network: network.name,
    chainId: network.chainId.toString(),
    deployer: deployer.address,
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
      DEV_WALLET,
    },
    timestamp: new Date().toISOString(),
  };

  fs.writeFileSync(
    `deployments/${network.name}-${Date.now()}.json`,
    JSON.stringify(deploymentInfo, null, 2)
  );
  console.log("\nDeployment info saved to deployments/");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

