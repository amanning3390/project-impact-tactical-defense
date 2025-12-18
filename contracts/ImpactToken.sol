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
    
    function burnFromGameContract(uint256 amount) external {
        require(msg.sender == gameContract, "Only game contract can burn");
        _burn(msg.sender, amount);
    }
    
    function transferFromGameContract(address to, uint256 amount) external {
        require(msg.sender == gameContract, "Only game contract can transfer");
        _transfer(address(this), to, amount);
    }
}

