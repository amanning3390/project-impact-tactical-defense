export interface Coordinates {
  x: number;
  y: number;
  z: number;
}

export interface GameState {
  currentDay: number;
  phase: "targeting" | "locked" | "strike" | "outcome" | "reset";
  winningCoordinates?: Coordinates;
  userSubmission?: Coordinates;
  matchResult?: 0 | 1 | 2 | 3;
}

export function validateCoordinates(x: number, y: number, z: number): boolean {
  return x >= 0 && x <= 10 && y >= 0 && y <= 10 && z >= 0 && z <= 10;
}

export function getCurrentUTCHour(): number {
  return new Date().getUTCHours();
}

export function getCurrentDay(): number {
  return Math.floor(Date.now() / (1000 * 60 * 60 * 24));
}

export function getGamePhase(): "targeting" | "locked" | "strike" | "outcome" | "reset" {
  const hour = getCurrentUTCHour();
  
  if (hour < 21) return "targeting";
  if (hour === 21) return "locked";
  if (hour === 22) return "strike";
  if (hour === 23) return "outcome";
  return "reset";
}

export function calculateBurnRate(participantCount: number): number {
  if (participantCount < 1000) return 5;
  if (participantCount < 5000) return 3;
  if (participantCount < 20000) return 1.5;
  return 0.5;
}

export function calculateMatch(
  userCoords: Coordinates,
  winningCoords: Coordinates
): 0 | 1 | 2 | 3 {
  let matches = 0;
  if (userCoords.x === winningCoords.x) matches++;
  if (userCoords.y === winningCoords.y) matches++;
  if (userCoords.z === winningCoords.z) matches++;
  return matches as 0 | 1 | 2 | 3;
}

export function assignToBattery(playerIndex: number): number {
  // First-come, first-served battery assignment
  return Math.floor(playerIndex / 10);
}


