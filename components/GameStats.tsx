"use client";

import { useIsMobile } from "@/hooks/useMediaQuery";

interface GameStatsProps {
  stats?: {
    totalLaunches: number;
    bestMatch: number;
    currentStreak: number;
    totalImpactEarned: number;
    winRate: number;
  };
}

export function GameStats({ stats }: GameStatsProps) {
  const isMobile = useIsMobile();

  if (!stats) {
    return (
      <div className="w-full p-4 sm:p-6 border-2 border-primary/40 rounded-lg bg-black/30 backdrop-blur-sm">
        <h3 className="text-xl sm:text-2xl font-bold font-mono text-primary mb-4">
          📊 Your Statistics
        </h3>
        <p className="text-sm text-gray-400">
          Launch your first strike to start tracking statistics!
        </p>
      </div>
    );
  }

  const statItems = [
    {
      label: "Total Launches",
      value: stats.totalLaunches.toString(),
      icon: "🚀",
      color: "text-primary",
    },
    {
      label: "Best Match",
      value: `${stats.bestMatch}/3`,
      icon: "🎯",
      color: "text-warning",
    },
    {
      label: "Current Streak",
      value: stats.currentStreak.toString(),
      icon: "🔥",
      color: "text-error",
    },
    {
      label: "IMPACT Earned",
      value: stats.totalImpactEarned.toLocaleString(),
      icon: "💎",
      color: "text-success",
    },
    {
      label: "Win Rate",
      value: `${stats.winRate.toFixed(1)}%`,
      icon: "📈",
      color: "text-secondary",
    },
  ];

  return (
    <div className="w-full p-4 sm:p-6 border-2 border-primary/40 rounded-lg bg-black/30 backdrop-blur-sm">
      <h3 className="text-xl sm:text-2xl font-bold font-mono text-primary mb-4 sm:mb-6">
        📊 Your Statistics
      </h3>

      <div className={`grid gap-3 sm:gap-4 ${isMobile ? "grid-cols-2" : "grid-cols-5"}`}>
        {statItems.map((item) => (
          <div
            key={item.label}
            className="bg-surface/50 rounded-lg p-3 sm:p-4 border border-surface-light hover:border-primary/40 transition-colors"
          >
            <div className="text-2xl mb-2">{item.icon}</div>
            <div className={`text-xl sm:text-2xl font-bold font-mono ${item.color} mb-1`}>
              {item.value}
            </div>
            <div className="text-xs text-gray-500">{item.label}</div>
          </div>
        ))}
      </div>

      {/* Additional Info */}
      {stats.currentStreak >= 3 && (
        <div className="mt-4 p-3 bg-warning/10 border border-warning/30 rounded-lg">
          <p className="text-sm text-warning">
            🔥 You're on fire! {stats.currentStreak}-day streak active!
          </p>
        </div>
      )}
    </div>
  );
}
