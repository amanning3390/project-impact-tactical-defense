// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract ImpactToken is ERC20, ERC20Burnable, Ownable {
    address public gameContract;
    
    constructor(address initialOwner) ERC20("Impact Token", "IMPACT") Ownable(initialOwner) {
        _mint(initialOwner, 1_000_000_000 * 10**decimals());
    }
    
    function setGameContract(address _gameContract) external onlyOwner {
        gameContract = _gameContract;
    }
    
    // Note: Game contract should use standard burn() and transfer() functions
    // since it holds the tokens. These functions are kept for backwards compatibility
    // but the game contract should call burn() and transfer() directly on its own balance.
}

