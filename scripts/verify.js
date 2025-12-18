const { run } = require("hardhat");
const fs = require("fs");

async function main() {
  const deploymentFile = process.argv[2];
  if (!deploymentFile) {
    console.error("Usage: node scripts/verify.js <deployment-file.json>");
    process.exit(1);
  }

  const deployment = JSON.parse(fs.readFileSync(deploymentFile, "utf8"));

  console.log("Verifying contracts for network:", deployment.network);

  // Verify ImpactToken
  console.log("\n=== Verifying ImpactToken ===");
  try {
    await run("verify:verify", {
      address: deployment.contracts.ImpactToken,
      constructorArguments: [deployment.deployer],
    });
    console.log("ImpactToken verified!");
  } catch (error) {
    console.error("Error verifying ImpactToken:", error.message);
  }

  // Verify BatteryContract
  console.log("\n=== Verifying BatteryContract ===");
  try {
    await run("verify:verify", {
      address: deployment.contracts.BatteryContract,
      constructorArguments: [],
    });
    console.log("BatteryContract verified!");
  } catch (error) {
    console.error("Error verifying BatteryContract:", error.message);
  }

  // Verify GameContract
  console.log("\n=== Verifying GameContract ===");
  try {
    await run("verify:verify", {
      address: deployment.contracts.GameContract,
      constructorArguments: [
        deployment.configuration.VRF_COORDINATOR,
        deployment.configuration.VRF_KEY_HASH,
        deployment.configuration.VRF_SUBSCRIPTION_ID,
        deployment.contracts.ImpactToken,
        deployment.contracts.BatteryContract,
        deployment.configuration.DEV_WALLET,
        deployment.deployer,
      ],
    });
    console.log("GameContract verified!");
  } catch (error) {
    console.error("Error verifying GameContract:", error.message);
  }

  console.log("\n=== Verification Complete ===");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

