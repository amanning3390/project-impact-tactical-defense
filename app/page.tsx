"use client";

import { useEffect, useState } from "react";
import { sdk } from "@farcaster/miniapp-sdk";
import { GameViewport } from "@/components/GameViewport";
import { MiniAppWrapper } from "@/components/MiniAppWrapper";

export default function Home() {
  const [isInMiniApp, setIsInMiniApp] = useState(false);

  useEffect(() => {
    const initMiniApp = async () => {
      try {
        await sdk.actions.ready();
        const inMiniApp = await sdk.isInMiniApp();
        setIsInMiniApp(inMiniApp);
      } catch (error) {
        console.error("Failed to initialize Mini App:", error);
      }
    };
    initMiniApp();
  }, []);

  return (
    <MiniAppWrapper isInMiniApp={isInMiniApp}>
      <main className="flex min-h-screen flex-col items-center justify-center p-8">
        <div className="w-full max-w-6xl">
          <h1 className="text-4xl font-bold mb-8 text-center">
            Project Impact - Tactical Defense
          </h1>
          <GameViewport />
        </div>
      </main>
    </MiniAppWrapper>
  );
}

