export const TOTAL_SUPPLY = 1_000_000_000; // 1 billion
export const ENTRY_FEE = 1_000; // 1,000 IMPACT
export const DECIMALS = 18;

export interface Tokenomics {
  totalEntryFees: number;
  participantCount: number;
  burnRate: number;
  jackpotPercentage: number;
  devRakePercentage: number;
  burnPercentage: number;
}

export function calculateTokenomics(
  totalEntryFees: number,
  participantCount: number
): Tokenomics {
  const burnRate = calculateBurnRate(participantCount);
  const burnPercentage = burnRate;
  const devRakePercentage = 8;
  const jackpotPercentage = 100 - devRakePercentage - burnPercentage;
  
  return {
    totalEntryFees,
    participantCount,
    burnRate,
    jackpotPercentage,
    devRakePercentage,
    burnPercentage,
  };
}

function calculateBurnRate(participantCount: number): number {
  if (participantCount < 1000) return 5;
  if (participantCount < 5000) return 3;
  if (participantCount < 20000) return 1.5;
  return 0.5;
}

export function calculateFundAllocation(tokenomics: Tokenomics) {
  const jackpotAmount = (tokenomics.totalEntryFees * tokenomics.jackpotPercentage) / 100;
  const devRakeAmount = (tokenomics.totalEntryFees * tokenomics.devRakePercentage) / 100;
  const burnAmount = (tokenomics.totalEntryFees * tokenomics.burnPercentage) / 100;
  
  return {
    jackpotAmount,
    devRakeAmount,
    burnAmount,
  };
}

