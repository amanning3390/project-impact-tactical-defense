"use client";

import { useEffect, useState } from "react";
import { useBatteryContract } from "@/lib/contractHooks";
import { GAME_CONTRACT_ADDRESS, gameContractABI } from "@/lib/contracts";
import { getCurrentDay } from "@/lib/gameLogic";
import { useIsMobile } from "@/hooks/useMediaQuery";
import { useAccount } from "wagmi";

interface BatteryMember {
  address: string;
  coordinates: { x: number; y: number; z: number } | null;
}

export function BatteryDisplay() {
  const { batteryId, batteryMembers, batteryInfo, refetch } = useBatteryContract();
  const { address: userAddress } = useAccount();
  const currentDay = getCurrentDay();
  const isMobile = useIsMobile();
  const [membersWithCoords, setMembersWithCoords] = useState<BatteryMember[]>([]);
  const [isCollapsed, setIsCollapsed] = useState(isMobile);

  // Fetch coordinates for each battery member from GameContract
  useEffect(() => {
    if (!batteryMembers || batteryMembers.length === 0 || !GAME_CONTRACT_ADDRESS) {
      setMembersWithCoords([]);
      return;
    }

    const fetchMemberCoordinates = async () => {
      const { createPublicClient, http } = await import("viem");
      const { base } = await import("viem/chains");
      
      const publicClient = createPublicClient({
        chain: base,
        transport: http(),
      });

      const members: BatteryMember[] = await Promise.all(
        batteryMembers.map(async (address) => {
          try {
            const submission = await publicClient.readContract({
              address: GAME_CONTRACT_ADDRESS,
              abi: gameContractABI,
              functionName: "submissions",
              args: [BigInt(currentDay), address as `0x${string}`],
            });

            if (submission && submission.player !== "0x0000000000000000000000000000000000000000") {
              return {
                address,
                coordinates: {
                  x: Number(submission.x),
                  y: Number(submission.y),
                  z: Number(submission.z),
                },
              };
            }
            return { address, coordinates: null };
          } catch (error) {
            console.error(`Error fetching coordinates for ${address}:`, error);
            return { address, coordinates: null };
          }
        })
      );
      setMembersWithCoords(members);
    };

    fetchMemberCoordinates();
  }, [batteryMembers, currentDay]);

  // Refetch periodically
  useEffect(() => {
    const interval = setInterval(() => {
      refetch();
    }, 30000);

    return () => clearInterval(interval);
  }, [refetch]);

  if (!batteryId && batteryId !== 0) {
    return (
      <div className="w-full p-4 sm:p-6 border-2 border-primary/40 rounded-lg bg-black/30 backdrop-blur-sm">
        <h2 className="text-xl sm:text-2xl font-bold font-mono mb-4 text-primary">
          ⚡ Automated Battery
        </h2>
        <div className="text-sm text-gray-400">
          Not assigned to a battery yet. Submit coordinates to join a battery.
        </div>
      </div>
    );
  }

  const displayMembers = membersWithCoords.length > 0 
    ? membersWithCoords 
    : batteryMembers?.map(addr => ({ address: addr, coordinates: null })) || [];

  const memberCount = batteryInfo?.memberCount || displayMembers.length;
  const isFull = batteryInfo?.isFull || false;

  return (
    <div className="w-full p-4 sm:p-6 border-2 border-primary/40 rounded-lg bg-black/30 backdrop-blur-sm">
      {/* Header with collapse toggle */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl sm:text-2xl font-bold font-mono text-primary flex items-center gap-2">
          ⚡ Battery #{batteryId}
          {isFull && <span className="text-xs text-success">(Full)</span>}
        </h2>
        {isMobile && (
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="text-gray-400 hover:text-primary transition-colors p-2"
            aria-label={isCollapsed ? "Expand battery" : "Collapse battery"}
          >
            {isCollapsed ? "▼" : "▲"}
          </button>
        )}
      </div>

      {/* Battery Status Bar */}
      <div className="mb-4">
        <div className="flex justify-between text-xs text-gray-400 mb-2">
          <span>{memberCount}/10 members</span>
          <span>{((memberCount / 10) * 0.75).toFixed(2)}% coverage</span>
        </div>
        <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-primary to-secondary transition-all duration-500"
            style={{ width: `${(memberCount / 10) * 100}%` }}
          ></div>
        </div>
      </div>

      {/* Members Grid (collapsible on mobile) */}
      {!isCollapsed && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 sm:gap-4 animate-slide-up">
        {displayMembers.map((member, index) => {
          const isCurrentUser = userAddress && member.address.toLowerCase() === userAddress.toLowerCase();
          
          return (
            <div
              key={member.address}
              className={`
                p-3 sm:p-4 rounded-lg transition-all
                ${isCurrentUser
                  ? "border-2 border-primary bg-primary/10 shadow-neon-cyan"
                  : "border border-surface-light bg-black/50"
                }
              `}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="text-xs text-gray-400">
                  {isCurrentUser ? "You" : `#${index + 1}`}
                </div>
                {member.coordinates && (
                  <div className="text-xs text-success">✓</div>
                )}
              </div>
              <div className="text-xs font-mono text-primary truncate">
                {member.address.slice(0, 6)}...{member.address.slice(-4)}
              </div>
              {member.coordinates && (
                <div className="text-xs text-secondary mt-1 font-mono">
                  ({member.coordinates.x},{member.coordinates.y},{member.coordinates.z})
                </div>
              )}
            </div>
          );
        })}
          {/* Fill empty slots */}
          {Array.from({ length: Math.max(0, 10 - displayMembers.length) }).map((_, index) => (
            <div
              key={`empty-${index}`}
              className="p-3 sm:p-4 border border-dashed border-surface-light rounded-lg bg-black/20 opacity-30"
            >
              <div className="text-xs text-gray-600">Empty</div>
              <div className="text-xs text-gray-700 mt-1">
                #{displayMembers.length + index + 1}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Coverage Info */}
      <div className="mt-4 text-xs text-gray-500 text-center">
        Coverage increases when all 10 slots are filled with unique coordinates
      </div>
    </div>
  );
}


