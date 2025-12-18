# Compilation Issue: Stack Too Deep - RESOLVED ✅

## Status: RESOLVED

The compilation issue has been resolved by switching to **Foundry** for compilation. Foundry has better support for `via-ir` compilation.

## Solution

We now use Foundry for compilation:
```bash
npm run compile  # Uses Foundry
```

Hardhat is still used for deployment scripts.

## Error Location

```
contracts/GameContract.sol:240:76
address[10] memory members = batteryContract.getBatteryMembers(day, batteryId);
```

## Attempted Fixes

1. ✅ Enabled `viaIR: true` in Hardhat config
2. ✅ Enabled optimizer with `runs: 200` (increased to 1000)
3. ✅ Refactored `calculateAndDistributeRewards` to extract helper functions
4. ✅ Simplified `collectMatches` function to reduce local variables

## Potential Solutions

### Option 1: Upgrade Hardhat (Recommended)
The current Hardhat version is `^2.19.4`. Try upgrading to the latest version:
```bash
npm install --save-dev hardhat@latest
```

### Option 2: Use Foundry Instead
Foundry has better support for viaIR and stack optimization:
```bash
# Install Foundry
curl -L https://foundry.paradigm.xyz | bash
foundryup

# Compile with Foundry
forge build --via-ir
```

### Option 3: Further Refactoring
Split the `collectMatches` function into even smaller pieces:
- Extract battery iteration into separate function
- Use storage variables instead of memory where possible
- Reduce function parameters

### Option 4: Use Assembly (Advanced)
For critical paths, inline assembly can help reduce stack usage.

## Temporary Workaround

For deployment, you can:
1. Comment out the problematic function temporarily
2. Deploy a simplified version
3. Add the full logic via a contract upgrade

## Next Steps

1. Try upgrading Hardhat: `npm install --save-dev hardhat@latest`
2. If that doesn't work, consider using Foundry for compilation
3. As a last resort, further refactor the contract logic

## Related Files

- `hardhat.config.js` - Compiler configuration
- `contracts/GameContract.sol` - Contract with stack issue
- `contracts/BatteryContract.sol` - Referenced contract

