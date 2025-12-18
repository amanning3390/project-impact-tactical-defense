import { getDefaultConfig } from "@coinbase/onchainkit/wagmi";
import { base } from "viem/chains";

export const config = getDefaultConfig({
  appName: "Project Impact",
  appIcon: "https://your-app.vercel.app/icon.png",
  chains: [base],
  walletConnectProjectId: process.env.NEXT_PUBLIC_WC_PROJECT_ID || "",
});

