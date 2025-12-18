// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@chainlink/contracts/src/v0.8/vrf/VRFConsumerBaseV2.sol";
import "@chainlink/contracts/src/v0.8/vrf/interfaces/VRFCoordinatorV2Interface.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "./ImpactToken.sol";
import "./BatteryContract.sol";

contract GameContract is VRFConsumerBaseV2, Ownable, Pausable {
    VRFCoordinatorV2Interface COORDINATOR;
    ImpactToken public impactToken;
    BatteryContract public batteryContract;
    
    uint64 public subscriptionId;
    bytes32 public keyHash;
    uint32 public callbackGasLimit = 100000;
    
    // Admin functions
    function setDevWallet(address _devWallet) external onlyOwner {
        devWallet = _devWallet;
    }
    
    function setCallbackGasLimit(uint32 _callbackGasLimit) external onlyOwner {
        callbackGasLimit = _callbackGasLimit;
    }
    
    function pause() external onlyOwner {
        _pause();
    }
    
    function unpause() external onlyOwner {
        _unpause();
    }
    
    struct Submission {
        address player;
        uint8 x;
        uint8 y;
        uint8 z;
        uint256 timestamp;
        uint256 batteryId;
    }
    
    struct DailyCycle {
        uint256 lockTime;
        uint256 strikeTime;
        uint256 resetTime;
        uint8 winningX;
        uint8 winningY;
        uint8 winningZ;
        bool coordinatesSet;
        bool rewardsDistributed;
        uint256 totalParticipants;
        uint256 totalEntryFees;
    }
    
    mapping(uint256 => DailyCycle) public dailyCycles;
    mapping(uint256 => mapping(address => Submission)) public submissions;
    mapping(address => bool) public hasVoucher;
    
    uint256 public constant ENTRY_FEE = 1000 * 10**18; // 1,000 IMPACT
    address public devWallet;
    uint256 public currentDay;
    
    event CoordinatesSubmitted(address indexed player, uint8 x, uint8 y, uint8 z, uint256 batteryId);
    event TargetingLocked(uint256 day, uint256 participantCount, uint256 burnAmount);
    event WinningCoordinatesSet(uint256 day, uint8 x, uint8 y, uint8 z);
    event RewardsDistributed(uint256 day, address[] winners, uint256 jackpotAmount);
    event VoucherMinted(address indexed player, uint256 day);
    
    constructor(
        address _vrfCoordinator,
        bytes32 _keyHash,
        uint64 _subscriptionId,
        address _impactToken,
        address _batteryContract,
        address _devWallet,
        address _owner
    ) VRFConsumerBaseV2(_vrfCoordinator) Ownable(_owner) {
        COORDINATOR = VRFCoordinatorV2Interface(_vrfCoordinator);
        keyHash = _keyHash;
        subscriptionId = _subscriptionId;
        impactToken = ImpactToken(_impactToken);
        batteryContract = BatteryContract(_batteryContract);
        devWallet = _devWallet;
        currentDay = block.timestamp / 1 days;
    }
    
    function submitCoordinates(uint8 x, uint8 y, uint8 z) external whenNotPaused {
        require(x <= 10 && y <= 10 && z <= 10, "Coordinates must be 0-10");
        require(impactToken.balanceOf(msg.sender) >= ENTRY_FEE, "Insufficient IMPACT");
        
        uint256 day = block.timestamp / 1 days;
        require(day == currentDay, "Not current day");
        
        // Check if targeting is locked (21:00 UTC = 21:00 UTC)
        uint256 currentHour = (block.timestamp % 1 days) / 1 hours;
        require(currentHour < 21, "Targeting locked");
        
        require(submissions[day][msg.sender].player == address(0), "Already submitted");
        
        // Transfer entry fee
        impactToken.transferFrom(msg.sender, address(this), ENTRY_FEE);
        
        // Assign to battery
        uint256 batteryId = batteryContract.assignToBattery(msg.sender, day);
        
        submissions[day][msg.sender] = Submission({
            player: msg.sender,
            x: x,
            y: y,
            z: z,
            timestamp: block.timestamp,
            batteryId: batteryId
        });
        
        dailyCycles[day].totalParticipants++;
        dailyCycles[day].totalEntryFees += ENTRY_FEE;
        
        emit CoordinatesSubmitted(msg.sender, x, y, z, batteryId);
    }
    
    function lockTargeting() external whenNotPaused {
        uint256 day = block.timestamp / 1 days;
        uint256 currentHour = (block.timestamp % 1 days) / 1 hours;
        require(currentHour >= 21, "Too early to lock");
        require(dailyCycles[day].lockTime == 0, "Already locked");
        
        dailyCycles[day].lockTime = block.timestamp;
        
        // Calculate and execute burn
        uint256 participantCount = dailyCycles[day].totalParticipants;
        uint256 burnRateBasisPoints = getBurnRate(participantCount);
        // burnRateBasisPoints: 500 = 5%, 300 = 3%, 150 = 1.5%, 50 = 0.5%
        uint256 burnAmount = (dailyCycles[day].totalEntryFees * burnRateBasisPoints) / 10000;
        
        if (burnAmount > 0) {
            impactToken.burn(burnAmount);
        }
        
        emit TargetingLocked(day, participantCount, burnAmount);
    }
    
    function requestWinningCoordinates() external whenNotPaused {
        uint256 day = block.timestamp / 1 days;
        require(dailyCycles[day].lockTime > 0, "Targeting not locked");
        require(dailyCycles[day].strikeTime == 0, "Already requested");
        
        uint256 currentHour = (block.timestamp % 1 days) / 1 hours;
        require(currentHour >= 22, "Too early to request");
        
        dailyCycles[day].strikeTime = block.timestamp;
        
        COORDINATOR.requestRandomWords(
            keyHash,
            subscriptionId,
            3, // request 3 confirmations
            callbackGasLimit,
            3 // numWords - we need 3 random numbers for X, Y, Z
        );
    }
    
    function fulfillRandomWords(uint256 /* requestId */, uint256[] memory randomWords) internal override {
        uint256 day = block.timestamp / 1 days;
        
        // Convert random numbers to coordinates (0-10)
        uint8 x = uint8(randomWords[0] % 11);
        uint8 y = uint8(randomWords[1] % 11);
        uint8 z = uint8(randomWords[2] % 11);
        
        dailyCycles[day].winningX = x;
        dailyCycles[day].winningY = y;
        dailyCycles[day].winningZ = z;
        dailyCycles[day].coordinatesSet = true;
        
        emit WinningCoordinatesSet(day, x, y, z);
        
        // Automatically calculate and distribute rewards
        calculateAndDistributeRewards(day);
    }
    
    function calculateAndDistributeRewards(uint256 day) internal {
        require(dailyCycles[day].coordinatesSet, "Coordinates not set");
        require(!dailyCycles[day].rewardsDistributed, "Already distributed");
        
        dailyCycles[day].rewardsDistributed = true;
        
        uint8 winningX = dailyCycles[day].winningX;
        uint8 winningY = dailyCycles[day].winningY;
        uint8 winningZ = dailyCycles[day].winningZ;
        
        // Calculate allocations
        uint256 jackpotAmount = (dailyCycles[day].totalEntryFees * 90) / 100; // 90% to jackpot
        uint256 devRake = (dailyCycles[day].totalEntryFees * 8) / 100; // 8% to dev
        
        // Collect all direct hits (3/3 matches) and deflections (2/3 matches)
        // We need to iterate through all batteries to find matches
        // Note: We'll need to track battery count differently or use a different approach
        // For now, we'll iterate through a reasonable maximum
        uint256 maxBatteries = 1000; // Reasonable maximum for gas efficiency
        address[] memory directHits = new address[](dailyCycles[day].totalParticipants);
        address[] memory deflections = new address[](dailyCycles[day].totalParticipants);
        uint256 directHitCount = 0;
        uint256 deflectionCount = 0;
        
        // Iterate through batteries for this day
        // We'll check up to maxBatteries, stopping when we find empty batteries
        for (uint256 batteryId = 0; batteryId < maxBatteries; batteryId++) {
            (uint256 memberCount, ) = batteryContract.getBatteryInfo(day, batteryId);
            if (memberCount == 0) break; // No more batteries
            
            address[10] memory members = batteryContract.getBatteryMembers(day, batteryId);
            
            // Check each member in the battery
            for (uint256 i = 0; i < memberCount; i++) {
                address player = members[i];
                if (player == address(0)) continue; // Skip empty slots
                
                Submission memory sub = submissions[day][player];
                if (sub.player == address(0)) continue; // No submission
                
                // Count matches
                uint8 matches = 0;
                if (sub.x == winningX) matches++;
                if (sub.y == winningY) matches++;
                if (sub.z == winningZ) matches++;
                
                if (matches == 3) {
                    directHits[directHitCount] = player;
                    directHitCount++;
                } else if (matches == 2) {
                    deflections[deflectionCount] = player;
                    deflectionCount++;
                }
            }
        }
        
        // Transfer dev rake
        if (devRake > 0) {
            impactToken.transfer(devWallet, devRake);
        }
        
        // Distribute jackpot to direct hits (split among all 3/3 matches)
        if (directHitCount > 0 && jackpotAmount > 0) {
            uint256 sharePerWinner = jackpotAmount / directHitCount;
            for (uint256 i = 0; i < directHitCount; i++) {
                impactToken.transfer(directHits[i], sharePerWinner);
            }
        }
        
        // Mint vouchers for deflections
        for (uint256 i = 0; i < deflectionCount; i++) {
            hasVoucher[deflections[i]] = true;
            emit VoucherMinted(deflections[i], day);
        }
        
        emit RewardsDistributed(day, directHits, jackpotAmount);
    }
    
    function resetDailyCycle() external {
        uint256 day = block.timestamp / 1 days;
        uint256 currentHour = (block.timestamp % 1 days) / 1 hours;
        require(currentHour >= 23, "Too early to reset");
        require(day > currentDay, "Not next day");
        
        currentDay = day;
        // Reset logic would go here
    }
    
    function getBurnRate(uint256 participantCount) public pure returns (uint256) {
        // Returns basis points (500 = 5%, 300 = 3%, 150 = 1.5%, 50 = 0.5%)
        if (participantCount < 1000) return 500; // 5%
        if (participantCount < 5000) return 300; // 3%
        if (participantCount < 20000) return 150; // 1.5%
        return 50; // 0.5%
    }
    
    function checkMatch(address player, uint256 day) public view returns (uint8) {
        Submission memory sub = submissions[day][player];
        if (sub.player == address(0)) return 0;
        
        DailyCycle memory cycle = dailyCycles[day];
        if (!cycle.coordinatesSet) return 0;
        
        uint8 matches = 0;
        if (sub.x == cycle.winningX) matches++;
        if (sub.y == cycle.winningY) matches++;
        if (sub.z == cycle.winningZ) matches++;
        
        return matches;
    }
}

