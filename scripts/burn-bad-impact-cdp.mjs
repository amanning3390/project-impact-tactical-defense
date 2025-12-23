import dotenv from "dotenv";
import { CdpClient } from "@coinbase/cdp-sdk";
import { encodeFunctionData, erc20Abi } from "viem";

// Load environment variables (prefers .env.local, falls back to .env)
dotenv.config({ path: ".env.local" });
dotenv.config();

const BURN_ADDRESS = "0x000000000000000000000000000000000000dEaD";
const OWNER_ADDRESS = process.env.OWNER_WALLET_ADDRESS || "0x6a1b085645674fF5E3eB853046cD51de16CAa1D0";

const API_KEY_ID = process.env.CDP_API_KEY_NAME || process.env.CDP_API_KEY_ID;
const API_KEY_SECRET = process.env.CDP_API_PRIVATE_KEY || process.env.CDP_API_KEY_SECRET;
const WALLET_SECRET = process.env.COINBASE_WALLET_SECRET || process.env.CDP_WALLET_SECRET;

if (!API_KEY_ID || !API_KEY_SECRET || !WALLET_SECRET) {
  throw new Error("Missing CDP credentials. Please set CDP_API_KEY_NAME (or CDP_API_KEY_ID), CDP_API_PRIVATE_KEY (or CDP_API_KEY_SECRET), and COINBASE_WALLET_SECRET (or CDP_WALLET_SECRET).");
}

const CORRECT_IMPACT = "0x15EE34646b4daeF37680B278F2B0D0af838D3Bcb";
const TOKENS_TO_BURN = [
  "0xE8E299f6F62d2fa3809C20133eCa0bA6cA54B1Fd",
  "0xFa612911446796d4Bea6872bBcabE5BA27FAED4A",
  "0x2eeE05B6727bF32F28cdd09cd069F5433F284aFd",
  "0x14bA43bBB1E4c40aeCD62774C098152f28A87CDd",
];

async function listBalances(cdp) {
  const balances = [];
  let pageToken;

  do {
    const resp = await cdp.evm.listTokenBalances({
      address: OWNER_ADDRESS,
      network: "base",
      pageToken,
    });
    balances.push(...resp.balances);
    pageToken = resp.nextPageToken;
  } while (pageToken);

  return balances;
}

async function main() {
  console.log("Owner address:", OWNER_ADDRESS);
  console.log("Correct IMPACT (kept):", CORRECT_IMPACT);
  console.log("Burn list:", TOKENS_TO_BURN);

  const cdp = new CdpClient({
    apiKeyId: API_KEY_ID,
    apiKeySecret: API_KEY_SECRET,
    walletSecret: WALLET_SECRET,
  });

  // Ensure account exists
  await cdp.evm.getAccount({ address: OWNER_ADDRESS });

  const initialBalances = await listBalances(cdp);
  const balanceMap = new Map(
    initialBalances.map((b) => [b.token.contractAddress.toLowerCase(), b])
  );

  for (const token of TOKENS_TO_BURN) {
    const entry = balanceMap.get(token.toLowerCase());
    if (!entry) {
      console.log(`${token}: not found in balances, skipping`);
      continue;
    }

    const { amount, decimals } = entry.amount;
    if (amount === 0n) {
      console.log(`${token}: balance 0, skipping`);
      continue;
    }

    // Build ERC-20 transfer(to burn address, full balance)
    const data = encodeFunctionData({
      abi: erc20Abi,
      functionName: "transfer",
      args: [BURN_ADDRESS, amount],
    });

    console.log(`${token}: burning ${amount} (raw, decimals=${decimals})`);
    const { transactionHash } = await cdp.evm.sendTransaction({
      address: OWNER_ADDRESS,
      transaction: {
        to: token,
        data,
        value: 0n,
      },
      network: "base",
    });
    console.log(`  tx: ${transactionHash}`);
  }

  const finalBalances = await listBalances(cdp);
  const finalMap = new Map(
    finalBalances.map((b) => [b.token.contractAddress.toLowerCase(), b])
  );

  for (const token of TOKENS_TO_BURN) {
    const entry = finalMap.get(token.toLowerCase());
    const remaining = entry ? entry.amount.amount : 0n;
    console.log(`${token}: remaining balance ${remaining}`);
  }
}

main().catch((err) => {
  console.error("Fatal error:", err?.message || err);
  process.exit(1);
});

