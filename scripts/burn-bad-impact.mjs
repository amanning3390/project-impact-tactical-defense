import { createWalletClient, http, erc20Abi, formatUnits } from "viem";
import { base } from "viem/chains";
import { privateKeyToAccount } from "viem/accounts";

// Correct IMPACT token to keep (do not burn)
const CORRECT_IMPACT = "0x15EE34646b4daeF37680B278F2B0D0af838D3Bcb";

// Known incorrect IMPACT token deployments to burn from the owner wallet
const TOKENS_TO_BURN = [
  "0xE8E299f6F62d2fa3809C20133eCa0bA6cA54B1Fd",
  "0xFa612911446796d4Bea6872bBcabE5BA27FAED4A",
  "0x2eeE05B6727bF32F28cdd09cd069F5433F284aFd",
  "0x14bA43bBB1E4c40aeCD62774C098152f28A87CDd",
];

const BURN_ADDRESS = "0x000000000000000000000000000000000000dEaD";

async function main() {
  const OWNER_PK = process.env.OWNER_WALLET_PRIVATE_KEY;
  if (!OWNER_PK) {
    throw new Error("OWNER_WALLET_PRIVATE_KEY is not set");
  }

  const account = privateKeyToAccount(OWNER_PK);
  const client = createWalletClient({
    account,
    chain: base,
    transport: http(),
  });

  console.log("Owner wallet:", account.address);
  console.log("Keeping correct IMPACT:", CORRECT_IMPACT);
  console.log("Burning incorrect tokens:", TOKENS_TO_BURN);

  for (const token of TOKENS_TO_BURN) {
    try {
      const [decimals, symbol, rawBalance] = await Promise.all([
        client.readContract({ address: token, abi: erc20Abi, functionName: "decimals" }),
        client.readContract({ address: token, abi: erc20Abi, functionName: "symbol" }),
        client.readContract({ address: token, abi: erc20Abi, functionName: "balanceOf", args: [account.address] }),
      ]);

      if (rawBalance === 0n) {
        console.log(`${symbol} (${token}): balance 0, skipping`);
        continue;
      }

      console.log(`${symbol} (${token}): balance ${formatUnits(rawBalance, decimals)} — sending to burn`);
      const hash = await client.writeContract({
        address: token,
        abi: erc20Abi,
        functionName: "transfer",
        args: [BURN_ADDRESS, rawBalance],
      });
      console.log(`  tx: ${hash}`);
    } catch (err) {
      console.error(`Error on ${token}:`, err?.message || err);
    }
  }

  console.log("Done.");
}

main().catch((err) => {
  console.error("Fatal error:", err?.message || err);
  process.exit(1);
});

