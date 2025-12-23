# Smart Contracts Documentation

## ImpactToken.sol

ERC-20 token for the game with burn functionality.

### Functions

- `setGameContract(address)` - Set the game contract address (owner only)
- `burnFromGameContract(uint256)` - Burn tokens (game contract only)
- `transferFromGameContract(address, uint256)` - Transfer tokens (game contract only)

## GameContract.sol

Main game contract with VRF integration and automated reward distribution.

### Key Functions

- `submitCoordinates(uint8 x, uint8 y, uint8 z)` - Submit coordinates (before 21:00 UTC)
- `lockTargeting()` - Lock all submissions and execute burn (21:00 UTC)
- `requestWinningCoordinates()` - Request VRF for random coordinates (22:00 UTC)
- `fulfillRandomWords(uint256, uint256[])` - VRF callback, sets winning coordinates
- `calculateAndDistributeRewards(uint256)` - Automatically distribute rewards
- `resetDailyCycle()` - Reset for next day (23:00 UTC)
- `checkMatch(address, uint256)` - Check player's match result

### Events

- `CoordinatesSubmitted` - When player submits coordinates
- `TargetingLocked` - When targeting is locked
- `WinningCoordinatesSet` - When VRF fulfills
- `RewardsDistributed` - When rewards are distributed
- `VoucherMinted` - When 2/3 match gets voucher

## BatteryContract.sol

Manages battery assignment (10 players per battery).

### Functions

- `assignToBattery(address, uint256)` - Assign player to battery
- `getBatteryMembers(uint256, uint256)` - Get battery members
- `getBatteryInfo(uint256, uint256)` - Get battery info

## Deployment Order

1. Deploy ImpactToken
2. Deploy BatteryContract
3. Deploy GameContract (with token and battery addresses)
4. Set GameContract in ImpactToken
5. Configure Chainlink VRF subscription


