"use client";

import { useEffect, useMemo, useState } from "react";
import { sdk } from "@farcaster/miniapp-sdk";
import { useAuthenticate, useMiniKit } from "@coinbase/onchainkit/minikit";
import { GameViewport } from "@/components/GameViewport";
import { MiniAppWrapper } from "@/components/MiniAppWrapper";

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
    <MiniAppWrapper isInMiniApp={isInMiniApp}>
      <main className="flex min-h-screen flex-col items-center justify-center p-8">
        <div className="w-full max-w-6xl space-y-6">
          <header className="text-center space-y-2">
            <p className="text-sm text-cyan-300 uppercase tracking-[0.2em]">
              Mini App on Base
            </p>
            <h1 className="text-4xl font-bold">Project Impact - Tactical Defense</h1>
            <p className="text-gray-400">
              Welcome, {displayName}. Optimized for {clientName}. Explore first; connect only
              when launching a strike.
            </p>
          </header>

          <section className="grid gap-4 md:grid-cols-2">
            <div className="rounded-lg border border-cyan-500/40 bg-black/40 p-4">
              <div className="text-sm text-gray-300">Environment</div>
              <div className="mt-1 text-lg font-semibold text-cyan-300">
                {isInMiniApp ? "Running in Base Mini App" : "Browser preview"}
              </div>
              <p className="mt-2 text-xs text-gray-400">
                Frame-safe layout with MiniKit context. No auth prompt until you launch.
              </p>
            </div>
            <div className="rounded-lg border border-cyan-500/40 bg-black/40 p-4">
              <div className="text-sm text-gray-300">Account</div>
              <div className="mt-1 text-lg font-semibold text-cyan-300">
                {isAuthenticated ? "Signed in" : "Guest mode"}
              </div>
              <p className="mt-2 text-xs text-gray-400">
                {isAuthenticated
                  ? "Using verified MiniKit identity for secure actions."
                  : "Stay in guest mode until you launch a strike; then we’ll request identity just-in-time."}
              </p>
              {authError ? (
                <p className="mt-2 text-xs text-red-400">Auth error: {authError}</p>
              ) : null}
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
  );
}


