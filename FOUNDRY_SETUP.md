# Foundry Compilation Setup

## Overview

This project now uses **Foundry** for contract compilation instead of Hardhat. Foundry has better support for `via-ir` compilation, which resolves the "Stack too deep" errors we were experiencing with Hardhat.

## Installation

Foundry is already installed. If you need to reinstall:

```bash
curl -L https://foundry.paradigm.xyz | bash
source ~/.bashrc
foundryup
```

## Configuration

The `foundry.toml` file configures:
- Solidity version: `0.8.20`
- Optimizer: Enabled with 1000 runs
- Via-IR: Enabled (resolves stack too deep errors)
- Source directory: `contracts/`
- Output directory: `out/`

## Compilation

### Using npm script (recommended):
```bash
npm run compile
```

### Using Foundry directly:
```bash
forge build --via-ir
```

### Using Hardhat (fallback):
```bash
npm run compile:hardhat
```

## Compilation Output

- **Artifacts**: `out/` directory
- **ABIs**: Available in `out/<ContractName>.sol/<ContractName>.json`
- **Bytecode**: Available in the same JSON files

## Remappings

Foundry uses remappings to resolve imports:
- `@openzeppelin/` → `node_modules/@openzeppelin/`
- `@chainlink/` → `node_modules/@chainlink/`

These are configured in `foundry.toml`.

## Deployment

Deployment still uses Hardhat scripts (`scripts/deploy.js`) because:
1. Hardhat has better network configuration
2. Deployment scripts are already written for Hardhat
3. Foundry artifacts are compatible with Hardhat

The workflow is:
1. **Compile with Foundry**: `npm run compile`
2. **Deploy with Hardhat**: `npm run deploy:mainnet`

## Benefits of Foundry

1. ✅ **Resolves stack too deep errors** with better via-ir support
2. ✅ **Faster compilation** times
3. ✅ **Better error messages** and warnings
4. ✅ **Modern tooling** with active development

## Troubleshooting

### "Compiler run successful!" but no output
- Check `out/` directory exists
- Artifacts are in `out/<ContractName>.sol/`

### Remapping errors
- Ensure `node_modules` are installed: `npm install`
- Check `foundry.toml` remappings are correct

### Still getting stack too deep
- Ensure `via_ir = true` in `foundry.toml`
- Use `forge build --via-ir` explicitly

## Related Files

- `foundry.toml` - Foundry configuration
- `contracts/` - Solidity source files
- `out/` - Compilation artifacts (gitignored)
- `hardhat.config.js` - Still used for deployment

