import { createWalletClient, http, createPublicClient } from "viem";
import { base } from "viem/chains";
import { privateKeyToAccount } from "viem/accounts";
import { GAME_CONTRACT_ADDRESS, gameContractABI } from "./contracts";

const SERVER_WALLET_PRIVATE_KEY = process.env.SERVER_WALLET_PRIVATE_KEY as `0x${string}`;
const BASE_RPC_URL = process.env.BASE_RPC_URL || "https://mainnet.base.org";

export async function lockTargeting() {
  if (!SERVER_WALLET_PRIVATE_KEY) {
    throw new Error("SERVER_WALLET_PRIVATE_KEY not configured");
  }

  if (!GAME_CONTRACT_ADDRESS) {
    throw new Error("NEXT_PUBLIC_GAME_CONTRACT_ADDRESS not configured");
  }

  const account = privateKeyToAccount(SERVER_WALLET_PRIVATE_KEY);
  const client = createWalletClient({
    account,
    chain: base,
    transport: http(BASE_RPC_URL),
  });

  try {
    const hash = await client.writeContract({
      address: GAME_CONTRACT_ADDRESS,
      abi: gameContractABI,
      functionName: "lockTargeting",
    });

    // Wait for transaction receipt
    const publicClient = createPublicClient({
      chain: base,
      transport: http(BASE_RPC_URL),
    });

    const receipt = await publicClient.waitForTransactionReceipt({ hash });
    
    return { 
      success: true, 
      txHash: hash,
      receipt 
    };
  } catch (error) {
    console.error("Error locking targeting:", error);
    throw error;
  }
}

export async function requestWinningCoordinates() {
  if (!SERVER_WALLET_PRIVATE_KEY) {
    throw new Error("SERVER_WALLET_PRIVATE_KEY not configured");
  }

  if (!GAME_CONTRACT_ADDRESS) {
    throw new Error("NEXT_PUBLIC_GAME_CONTRACT_ADDRESS not configured");
  }

  const account = privateKeyToAccount(SERVER_WALLET_PRIVATE_KEY);
  const client = createWalletClient({
    account,
    chain: base,
    transport: http(BASE_RPC_URL),
  });

  try {
    const hash = await client.writeContract({
      address: GAME_CONTRACT_ADDRESS,
      abi: gameContractABI,
      functionName: "requestWinningCoordinates",
    });

    // Wait for transaction receipt
    const publicClient = createPublicClient({
      chain: base,
      transport: http(BASE_RPC_URL),
    });

    const receipt = await publicClient.waitForTransactionReceipt({ hash });
    
    return { 
      success: true, 
      txHash: hash,
      receipt 
    };
  } catch (error) {
    console.error("Error requesting winning coordinates:", error);
    throw error;
  }
}

export async function resetDailyCycle() {
  if (!SERVER_WALLET_PRIVATE_KEY) {
    throw new Error("SERVER_WALLET_PRIVATE_KEY not configured");
  }

  if (!GAME_CONTRACT_ADDRESS) {
    throw new Error("NEXT_PUBLIC_GAME_CONTRACT_ADDRESS not configured");
  }

  const account = privateKeyToAccount(SERVER_WALLET_PRIVATE_KEY);
  const client = createWalletClient({
    account,
    chain: base,
    transport: http(BASE_RPC_URL),
  });

  try {
    const hash = await client.writeContract({
      address: GAME_CONTRACT_ADDRESS,
      abi: gameContractABI,
      functionName: "resetDailyCycle",
    });

    // Wait for transaction receipt
    const publicClient = createPublicClient({
      chain: base,
      transport: http(BASE_RPC_URL),
    });

    const receipt = await publicClient.waitForTransactionReceipt({ hash });
    
    return { 
      success: true, 
      txHash: hash,
      receipt 
    };
  } catch (error) {
    console.error("Error resetting daily cycle:", error);
    throw error;
  }
}

export async function waitForVRFFulfillment(day: number, maxWaitTime = 120000) {
  if (!GAME_CONTRACT_ADDRESS) {
    throw new Error("NEXT_PUBLIC_GAME_CONTRACT_ADDRESS not configured");
  }

  const publicClient = createPublicClient({
    chain: base,
    transport: http(BASE_RPC_URL),
  });

  const startTime = Date.now();
  const pollInterval = 3000; // Check every 3 seconds

  while (Date.now() - startTime < maxWaitTime) {
    try {
      const dailyCycle = await publicClient.readContract({
        address: GAME_CONTRACT_ADDRESS,
        abi: gameContractABI,
        functionName: "dailyCycles",
        args: [BigInt(day)],
      });

      // Check if coordinates have been set (VRF fulfilled)
      if (dailyCycle.coordinatesSet) {
        return {
          success: true,
          winningCoordinates: {
            x: Number(dailyCycle.winningX),
            y: Number(dailyCycle.winningY),
            z: Number(dailyCycle.winningZ),
          },
        };
      }
    } catch (error) {
      console.error("Error checking VRF fulfillment:", error);
    }

    await new Promise((resolve) => setTimeout(resolve, pollInterval));
  }

  throw new Error("VRF fulfillment timeout");
}


