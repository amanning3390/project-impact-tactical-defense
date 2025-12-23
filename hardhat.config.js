require("@nomicfoundation/hardhat-toolbox");
const path = require("path");
const fs = require("fs");

// Convert Foundry artifacts to Hardhat format
function convertFoundryArtifacts() {
  const foundryOut = "./out";
  const hardhatArtifacts = "./artifacts";
  
  if (!fs.existsSync(foundryOut)) return;
  
  // Create artifacts directory structure
  if (!fs.existsSync(hardhatArtifacts)) {
    fs.mkdirSync(hardhatArtifacts, { recursive: true });
  }
  
  const contracts = ["ImpactToken", "BatteryContract", "GameContract"];
  contracts.forEach(contractName => {
    const foundryPath = `${foundryOut}/${contractName}.sol/${contractName}.json`;
    if (fs.existsSync(foundryPath)) {
      const artifact = JSON.parse(fs.readFileSync(foundryPath, "utf8"));
      const hardhatPath = `${hardhatArtifacts}/contracts/${contractName}.sol/${contractName}.json`;
      const dir = path.dirname(hardhatPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(hardhatPath, JSON.stringify(artifact, null, 2));
    }
  });
}

// Convert artifacts before Hardhat loads
convertFoundryArtifacts();

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: {
        enabled: true,
        runs: 1000,
      },
      viaIR: true,
    },
  },
  // Use converted artifacts
  paths: {
    artifacts: "./artifacts",
    cache: "./cache",
  },
  networks: {
    base: {
      url: process.env.BASE_RPC_URL || "https://mainnet.base.org",
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
    },
    baseSepolia: {
      url: process.env.BASE_SEPOLIA_RPC_URL || "https://sepolia.base.org",
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
    },
  },
  etherscan: {
    apiKey: {
      base: process.env.BASESCAN_API_KEY || "",
      baseSepolia: process.env.BASESCAN_API_KEY || "",
    },
  },
};
