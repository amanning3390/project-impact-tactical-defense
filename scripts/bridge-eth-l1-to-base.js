/**
 * Programmatically bridge ETH from Ethereum L1 to Base L2 using CDP Server Wallet
 * Uses the Base L1StandardBridge contract
 * 
 * Reference: https://docs.base.org/chain/bridges-mainnet
 */

require("dotenv").config({ path: ".env.local" });
const { CdpClient } = require("@coinbase/cdp-sdk");
const { parseEther } = require("viem");
const { ethers } = require("ethers");

// Base L1StandardBridge contract address on Ethereum L1
// Source: https://docs.base.org/chain/bridges-mainnet
const BASE_L1_STANDARD_BRIDGE = "0x49048044D57e1C92A77f79988d21Fa8fAF74E97e";

// ABI for depositETH function
const L1_STANDARD_BRIDGE_ABI = [
  {
    inputs: [
      { internalType: "uint32", name: "_l2Gas", type: "uint32" },
      { internalType: "bytes", name: "_data", type: "bytes" },
    ],
    name: "depositETH",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },
];

async function main() {
  console.log("=== Programmatic Bridge: ETH from Ethereum L1 to Base L2 ===\n");

  const apiKeyId = process.env.CDP_API_KEY_NAME;
  const apiKeySecret = process.env.CDP_API_PRIVATE_KEY;
  const walletSecret = process.env.COINBASE_WALLET_SECRET;
  const OWNER_WALLET = process.env.OWNER_WALLET_ADDRESS;

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
    const baseProvider = new ethers.JsonRpcProvider("https://mainnet.base.org");

    const l1Balance = await l1Provider.getBalance(OWNER_WALLET);
    const l2Balance = await baseProvider.getBalance(OWNER_WALLET);

    const l1BalanceEth = ethers.formatEther(l1Balance);
    const l2BalanceEth = ethers.formatEther(l2Balance);

    console.log(`Ethereum L1 balance: ${l1BalanceEth} ETH`);
    console.log(`Base L2 balance: ${l2BalanceEth} ETH`);

    if (parseFloat(l1BalanceEth) < amount) {
      console.error(
        `\n❌ ERROR: Insufficient L1 balance. Need ${amount} ETH, have ${l1BalanceEth} ETH`
      );
      process.exit(1);
    }

    console.log("\n=== Bridging Configuration ===");
    console.log("Amount to bridge:", amount, "ETH");
    console.log("From:", OWNER_WALLET, "(Ethereum L1)");
    console.log("To:", OWNER_WALLET, "(Base L2)");
    console.log("Bridge Contract:", BASE_L1_STANDARD_BRIDGE);

    // Encode the depositETH function call
    const iface = new ethers.Interface(L1_STANDARD_BRIDGE_ABI);
    const l2GasLimit = 200000; // Standard gas limit for ETH deposit
    const data = "0x"; // Empty data for ETH deposits
    const functionData = iface.encodeFunctionData("depositETH", [l2GasLimit, data]);

    // Send transaction on Ethereum L1
    console.log("\n=== Sending Bridge Transaction ===");
    console.log("Calling depositETH on L1StandardBridge contract...");

    // Get current gas price and nonce
    const feeData = await l1Provider.getFeeData();
    const nonce = await l1Provider.getTransactionCount(OWNER_WALLET);
    
    // Estimate gas manually first
    let gasLimit = 200000n;
    try {
      const estimatedGas = await l1Provider.estimateGas({
        to: BASE_L1_STANDARD_BRIDGE,
        value: parseEther(amount.toString()),
        data: functionData,
        from: OWNER_WALLET,
      });
      gasLimit = estimatedGas * 120n / 100n; // 20% buffer
      console.log("Estimated gas:", gasLimit.toString());
    } catch (error) {
      console.log("⚠️  Could not estimate gas, using default:", gasLimit.toString());
    }

    const maxFeePerGas = feeData.maxFeePerGas || feeData.gasPrice;
    const maxPriorityFeePerGas = feeData.maxPriorityFeePerGas || (maxFeePerGas ? maxFeePerGas / 10n : undefined);

    console.log("Gas limit:", gasLimit.toString());
    console.log("Max fee per gas:", maxFeePerGas ? ethers.formatUnits(maxFeePerGas, "gwei") + " gwei" : "auto");

    const transaction = await cdp.evm.sendTransaction({
      address: OWNER_WALLET,
      network: "ethereum", // Use "ethereum" for Ethereum L1 mainnet
      transaction: {
        to: BASE_L1_STANDARD_BRIDGE,
        value: parseEther(amount.toString()), // Amount of ETH to bridge
        data: functionData,
        gasLimit: gasLimit,
        nonce: nonce,
        ...(maxFeePerGas && { maxFeePerGas: maxFeePerGas }),
        ...(maxPriorityFeePerGas && { maxPriorityFeePerGas: maxPriorityFeePerGas }),
      },
    });

    console.log("\n✅ Bridge transaction sent!");
    console.log("Transaction hash:", transaction.transactionHash || transaction.hash);
    console.log(
      `View on Etherscan: https://etherscan.io/tx/${transaction.transactionHash || transaction.hash}`
    );

    console.log("\n⏳ Waiting for L1 confirmation...");
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
      console.log("✅ L1 transaction confirmed!");
      console.log("Block number:", receipt.blockNumber);
      console.log("\n⏳ Waiting for L2 deposit...");
      console.log("Note: Base bridge deposits typically take 1-2 minutes to appear on L2");

      // Poll L2 balance
      let l2BalanceUpdated = false;
      const initialL2Balance = parseFloat(l2BalanceEth);
      attempts = 0;
      const maxL2Attempts = 120; // 10 minutes

      while (attempts < maxL2Attempts && !l2BalanceUpdated) {
        await new Promise((resolve) => setTimeout(resolve, 5000));
        const newL2Balance = await baseProvider.getBalance(OWNER_WALLET);
        const newL2BalanceEth = parseFloat(ethers.formatEther(newL2Balance));

        if (newL2BalanceEth > initialL2Balance) {
          l2BalanceUpdated = true;
          console.log("\n✅ ETH successfully bridged to Base L2!");
          console.log(`New Base L2 balance: ${newL2BalanceEth} ETH`);
          console.log(
            `View on BaseScan: https://basescan.org/address/${OWNER_WALLET}`
          );
        } else {
          attempts++;
          if (attempts % 12 === 0) {
            console.log(`Still waiting for L2 deposit... (${attempts * 5} seconds)`);
          }
        }
      }

      if (!l2BalanceUpdated) {
        console.log("\n⚠️  L2 deposit not detected yet, but L1 transaction is confirmed.");
        console.log("The bridge may take a few minutes. Check your balance on BaseScan:");
        console.log(`https://basescan.org/address/${OWNER_WALLET}`);
      }
    } else {
      console.error("❌ L1 transaction failed");
      process.exit(1);
    }
  } catch (error) {
    console.error("\n❌ Bridge failed:", error.message);
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
