# API Documentation

## Frontend API

### Hooks

#### `useGameState()`
Returns current game state including phase and day.

```typescript
const gameState = useGameState();
// { currentDay: number, phase: "targeting" | "locked" | "strike" | "outcome" | "reset" }
```

## Smart Contract Functions

### GameContract

#### `submitCoordinates(uint8 x, uint8 y, uint8 z)`
Submit coordinates for the current day. Must be called before 21:00 UTC.

**Requirements:**
- Coordinates must be 0-10
- Player must have 1,000 IMPACT tokens
- Must be current day
- Must be before 21:00 UTC

#### `lockTargeting()`
Lock all submissions and execute burn. Called at 21:00 UTC.

#### `requestWinningCoordinates()`
Request Chainlink VRF for random winning coordinates. Called at 22:00 UTC.

#### `checkMatch(address player, uint256 day)`
Check how many coordinates match (0-3).

## Cron Jobs

### `/api/cron/daily-drawing`

Automated daily game cycle management.

**Authentication:** Bearer token with `CRON_SECRET`

**Schedule:**
- 21:00 UTC - Lock targeting
- 22:00 UTC - Request winning coordinates
- 23:00 UTC - Reset cycle

## Events

### Onchain Events

Listen for these events to track game state:

- `CoordinatesSubmitted` - New coordinate submission
- `TargetingLocked` - Targeting phase locked
- `WinningCoordinatesSet` - Winning coordinates determined
- `RewardsDistributed` - Rewards distributed
- `VoucherMinted` - Voucher minted for 2/3 match

