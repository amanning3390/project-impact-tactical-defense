"use client";

import { useEffect, useMemo, useState } from "react";
import { sdk } from "@farcaster/miniapp-sdk";
import { useAuthenticate, useMiniKit } from "@coinbase/onchainkit/minikit";
import { GameViewport } from "@/components/GameViewport";
import { MiniAppWrapper } from "@/components/MiniAppWrapper";
import { ToastProvider } from "@/components/NotificationToast";

export default function Home() {
  const [isInMiniApp, setIsInMiniApp] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authPending, setAuthPending] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const { context } = useMiniKit();
  const { signIn } = useAuthenticate();

  useEffect(() => {
    const initMiniApp = async () => {
      try {
        await sdk.actions.ready();
        const inMiniApp = await sdk.isInMiniApp();
        setIsInMiniApp(inMiniApp);
      } catch (initError) {
        console.error("Failed to initialize Mini App:", initError);
      }
    };
    initMiniApp();
  }, []);

  const displayName = useMemo(
    () => context?.user?.displayName ?? "Friend",
    [context?.user?.displayName]
  );
  const clientName = "Base App";

  const requestAuth = async () => {
    setAuthPending(true);
    setAuthError(null);
    try {
      const result = await signIn();
      setIsAuthenticated(Boolean(result));
      if (!result) {
        setAuthError("Sign-in was cancelled or declined.");
      }
    } catch (authError) {
      console.error("Authentication failed:", authError);
      setAuthError("Authentication failed. Please try again.");
    } finally {
      setAuthPending(false);
    }
  };

  return (
    <ToastProvider>
      <MiniAppWrapper isInMiniApp={isInMiniApp}>
        <main className="flex min-h-screen flex-col items-center justify-center p-4 sm:p-8">
        <div className="w-full max-w-6xl space-y-6 sm:space-y-8">
          {/* Header */}
          <header className="text-center space-y-3">
            <p className="text-xs sm:text-sm text-primary uppercase tracking-[0.2em] font-mono">
              Mini App on Base
            </p>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold font-mono text-primary shadow-neon-cyan">
              Project Impact
            </h1>
            <p className="text-lg sm:text-xl font-mono text-secondary">
              Tactical Defense
            </p>
            <p className="text-sm sm:text-base text-gray-400 max-w-2xl mx-auto">
              Welcome, <span className="text-primary">{displayName}</span>. Defend Earth by targeting the asteroid. 
              {!isAuthenticated && " Connect when ready to launch."}
            </p>
          </header>

          {/* Status Cards */}
          <section className="grid gap-3 sm:gap-4 sm:grid-cols-2">
            <div className="rounded-lg border border-primary/40 bg-black/40 backdrop-blur-sm p-4 transition-all hover:border-primary/60">
              <div className="flex items-center gap-2 text-sm text-gray-300 mb-2">
                <span>🌐</span>
                <span>Environment</span>
              </div>
              <div className="text-base sm:text-lg font-semibold font-mono text-primary">
                {isInMiniApp ? "Base Mini App" : "Browser"}
              </div>
              <p className="mt-2 text-xs text-gray-500">
                {isInMiniApp ? "Optimized for mobile" : "Desktop preview mode"}
              </p>
            </div>
            <div className="rounded-lg border border-primary/40 bg-black/40 backdrop-blur-sm p-4 transition-all hover:border-primary/60">
              <div className="flex items-center gap-2 text-sm text-gray-300 mb-2">
                <span>{isAuthenticated ? "🔓" : "🔒"}</span>
                <span>Account</span>
              </div>
              <div className="text-base sm:text-lg font-semibold font-mono text-primary">
                {isAuthenticated ? "Connected" : "Guest Mode"}
              </div>
              <p className="mt-2 text-xs text-gray-500">
                {isAuthenticated
                  ? "Wallet connected for transactions"
                  : "Connect on first launch"}
              </p>
              {authError && (
                <p className="mt-2 text-xs text-error">Error: {authError}</p>
              )}
            </div>
          </section>

          <GameViewport
            isAuthenticated={isAuthenticated}
            onRequireAuth={requestAuth}
            authPending={authPending}
          />
        </div>
        </main>
      </MiniAppWrapper>
    </ToastProvider>
  );
}


