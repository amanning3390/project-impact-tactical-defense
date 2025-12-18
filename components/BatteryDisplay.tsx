"use client";

export function BatteryDisplay() {
  // TODO: Fetch battery data from contract
  const batteryMembers = Array.from({ length: 10 }, (_, i) => ({
    id: i + 1,
    address: `0x${"0".repeat(40)}`,
    coordinates: { x: 0, y: 0, z: 0 },
  }));

  return (
    <div className="w-full p-6 border-2 border-cyan-500 rounded-lg bg-black/30">
      <h2 className="text-2xl font-bold mb-4 text-cyan-400">Automated Battery</h2>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {batteryMembers.map((member) => (
          <div
            key={member.id}
            className="p-4 border border-cyan-500/50 rounded bg-black/50"
          >
            <div className="text-sm text-gray-400">Member {member.id}</div>
            <div className="text-xs font-mono text-cyan-300 mt-2 truncate">
              {member.address}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              ({member.coordinates.x}, {member.coordinates.y}, {member.coordinates.z})
            </div>
          </div>
        ))}
      </div>
      <div className="mt-4 text-sm text-gray-400">
        Coverage: 0.75% of coordinate universe (10 unique points)
      </div>
    </div>
  );
}

