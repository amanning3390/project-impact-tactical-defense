// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract BatteryContract {
    struct Battery {
        address[10] members;
        uint256 memberCount;
        uint256 day;
        bool isFull;
    }
    
    mapping(uint256 => mapping(uint256 => Battery)) public batteries; // day => batteryId => Battery
    mapping(uint256 => uint256) public batteryCount; // day => count
    mapping(uint256 => mapping(address => uint256)) public playerBattery; // day => player => batteryId
    
    uint256 public constant BATTERY_SIZE = 10;
    
    event BatteryAssigned(uint256 indexed day, uint256 indexed batteryId, address indexed player);
    event BatteryFull(uint256 indexed day, uint256 indexed batteryId);
    
    function assignToBattery(address player, uint256 day) external returns (uint256) {
        require(playerBattery[day][player] == 0, "Already in a battery");
        
        uint256 currentBatteryCount = batteryCount[day];
        Battery storage currentBattery;
        
        // Check if there's an incomplete battery
        if (currentBatteryCount > 0) {
            currentBattery = batteries[day][currentBatteryCount - 1];
            if (!currentBattery.isFull && currentBattery.memberCount < BATTERY_SIZE) {
                // Add to existing battery
                currentBattery.members[currentBattery.memberCount] = player;
                currentBattery.memberCount++;
                playerBattery[day][player] = currentBatteryCount - 1;
                
                if (currentBattery.memberCount == BATTERY_SIZE) {
                    currentBattery.isFull = true;
                    emit BatteryFull(day, currentBatteryCount - 1);
                }
                
                emit BatteryAssigned(day, currentBatteryCount - 1, player);
                return currentBatteryCount - 1;
            }
        }
        
        // Create new battery
        Battery storage newBattery = batteries[day][currentBatteryCount];
        newBattery.members[0] = player;
        newBattery.memberCount = 1;
        newBattery.day = day;
        newBattery.isFull = false;
        
        playerBattery[day][player] = currentBatteryCount;
        batteryCount[day] = currentBatteryCount + 1;
        
        emit BatteryAssigned(day, currentBatteryCount, player);
        return currentBatteryCount;
    }
    
    function getBatteryMembers(uint256 day, uint256 batteryId) external view returns (address[10] memory) {
        return batteries[day][batteryId].members;
    }
    
    function getBatteryInfo(uint256 day, uint256 batteryId) external view returns (uint256 memberCount, bool isFull) {
        Battery storage battery = batteries[day][batteryId];
        return (battery.memberCount, battery.isFull);
    }
}

