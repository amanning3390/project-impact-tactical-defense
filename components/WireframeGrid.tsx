"use client";

import { useEffect, useState } from "react";
import { useIsMobile, usePrefersReducedMotion } from "@/hooks/useMediaQuery";

interface Coordinates {
  x: number;
  y: number;
  z: number;
}

interface WireframeGridProps {
  userCoordinates?: Coordinates;
  teammateCoordinates?: Coordinates[];
  winningCoordinates?: Coordinates;
  className?: string;
}

export function WireframeGrid({
  userCoordinates,
  teammateCoordinates = [],
  winningCoordinates,
  className = "",
}: WireframeGridProps) {
  const [rotation, setRotation] = useState({ x: 20, y: 0 });
  const [isPaused, setIsPaused] = useState(false);
  const isMobile = useIsMobile();
  const prefersReducedMotion = usePrefersReducedMotion();

  // Auto-rotate animation
  useEffect(() => {
    if (isPaused || prefersReducedMotion) return;

    const interval = setInterval(() => {
      setRotation((prev) => ({
        x: 20,
        y: (prev.y + 0.5) % 360,
      }));
    }, 50);

    return () => clearInterval(interval);
  }, [isPaused, prefersReducedMotion]);

  // Calculate 3D position for coordinate markers
  const getMarkerPosition = (coords: Coordinates) => {
    const scale = isMobile ? 2 : 3;
    const offsetX = (coords.x - 5) * scale;
    const offsetY = (coords.y - 5) * scale;
    const offsetZ = (coords.z - 5) * scale;
    return { x: offsetX, y: offsetY, z: offsetZ };
  };

  return (
    <div className={`relative w-full h-full flex items-center justify-center ${className}`}>
      {/* 3D Container */}
      <div
        className="relative"
        style={{
          perspective: "1000px",
          transformStyle: "preserve-3d",
        }}
        onMouseEnter={() => !isMobile && setIsPaused(true)}
        onMouseLeave={() => !isMobile && setIsPaused(false)}
        onTouchStart={() => setIsPaused(true)}
        onTouchEnd={() => setTimeout(() => setIsPaused(false), 2000)}
      >
        {/* Grid Container */}
        <div
          className="relative"
          style={{
            width: isMobile ? "280px" : "400px",
            height: isMobile ? "280px" : "400px",
            transformStyle: "preserve-3d",
            transform: `rotateX(${rotation.x}deg) rotateY(${rotation.y}deg)`,
            transition: prefersReducedMotion ? "none" : "transform 0.05s linear",
          }}
        >
          {/* Grid Lines */}
          {[...Array(11)].map((_, i) => (
            <div key={`line-${i}`}>
              {/* X-axis lines */}
              <div
                className="absolute border-primary/30"
                style={{
                  width: "100%",
                  height: "1px",
                  top: `${i * 10}%`,
                  transform: `translateZ(${(i - 5) * 20}px)`,
                  boxShadow: "0 0 5px rgba(0, 255, 255, 0.3)",
                }}
              />
              {/* Y-axis lines */}
              <div
                className="absolute border-primary/30"
                style={{
                  width: "1px",
                  height: "100%",
                  left: `${i * 10}%`,
                  transform: `translateZ(${(i - 5) * 20}px)`,
                  boxShadow: "0 0 5px rgba(0, 255, 255, 0.3)",
                }}
              />
            </div>
          ))}

          {/* Coordinate Markers */}
          {userCoordinates && (
            <CoordinateMarker
              coords={userCoordinates}
              type="user"
              position={getMarkerPosition(userCoordinates)}
              isMobile={isMobile}
            />
          )}

          {teammateCoordinates.map((coords, index) => (
            <CoordinateMarker
              key={`teammate-${index}`}
              coords={coords}
              type="teammate"
              position={getMarkerPosition(coords)}
              isMobile={isMobile}
            />
          ))}

          {winningCoordinates && (
            <CoordinateMarker
              coords={winningCoordinates}
              type="winning"
              position={getMarkerPosition(winningCoordinates)}
              isMobile={isMobile}
            />
          )}

          {/* Corner Markers */}
          {[
            { x: 0, y: 0, z: 0 },
            { x: 10, y: 0, z: 0 },
            { x: 0, y: 10, z: 0 },
            { x: 0, y: 0, z: 10 },
            { x: 10, y: 10, z: 0 },
            { x: 10, y: 0, z: 10 },
            { x: 0, y: 10, z: 10 },
            { x: 10, y: 10, z: 10 },
          ].map((coords, i) => (
            <div
              key={`corner-${i}`}
              className="absolute w-2 h-2 bg-primary rounded-full"
              style={{
                left: `${coords.x * 10}%`,
                top: `${coords.y * 10}%`,
                transform: `translateZ(${(coords.z - 5) * 20}px)`,
                opacity: 0.5,
              }}
            />
          ))}
        </div>

        {/* Legend */}
        {!isMobile && (
          <div className="absolute -bottom-16 left-0 right-0 flex justify-center gap-4 text-xs">
            {userCoordinates && (
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-primary shadow-neon-cyan"></div>
                <span className="text-gray-400">Your Target</span>
              </div>
            )}
            {teammateCoordinates.length > 0 && (
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-secondary shadow-neon-amber"></div>
                <span className="text-gray-400">Battery</span>
              </div>
            )}
            {winningCoordinates && (
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-yellow-400 shadow-neon-gold"></div>
                <span className="text-gray-400">Impact Point</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Coordinate Info Overlay */}
      {userCoordinates && (
        <div className="absolute bottom-4 left-4 font-mono text-sm">
          <div className="bg-black/80 backdrop-blur-sm border border-primary/40 rounded px-3 py-2">
            <div className="text-gray-400">Target:</div>
            <div className="text-primary font-bold">
              ({userCoordinates.x}, {userCoordinates.y}, {userCoordinates.z})
            </div>
          </div>
        </div>
      )}

      {/* Pause Indicator */}
      {isPaused && !prefersReducedMotion && (
        <div className="absolute top-4 right-4 text-xs text-gray-500">
          Rotation Paused
        </div>
      )}
    </div>
  );
}

function CoordinateMarker({
  coords,
  type,
  position,
  isMobile,
}: {
  coords: Coordinates;
  type: "user" | "teammate" | "winning";
  position: { x: number; y: number; z: number };
  isMobile: boolean;
}) {
  const styles = {
    user: {
      size: isMobile ? "w-4 h-4" : "w-6 h-6",
      color: "bg-primary",
      shadow: "shadow-neon-cyan",
      label: "text-primary",
    },
    teammate: {
      size: isMobile ? "w-3 h-3" : "w-4 h-4",
      color: "bg-secondary",
      shadow: "shadow-neon-amber",
      label: "text-secondary",
    },
    winning: {
      size: isMobile ? "w-5 h-5" : "w-8 h-8",
      color: "bg-yellow-400",
      shadow: "shadow-neon-gold animate-neon-pulse",
      label: "text-yellow-400",
    },
  };

  const style = styles[type];

  return (
    <div
      className="absolute"
      style={{
        left: "50%",
        top: "50%",
        transform: `translate(-50%, -50%) translate3d(${position.x * 10}px, ${position.y * 10}px, ${position.z}px)`,
        transformStyle: "preserve-3d",
      }}
    >
      {/* Marker Sphere */}
      <div
        className={`${style.size} ${style.color} ${style.shadow} rounded-full animate-coordinate-reveal`}
      ></div>

      {/* Label */}
      {!isMobile && (
        <div
          className={`absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap text-xs font-mono ${style.label}`}
          style={{
            transform: `translateX(-50%) rotateX(-20deg) rotateY(-${position.x}deg)`,
          }}
        >
          ({coords.x},{coords.y},{coords.z})
        </div>
      )}
    </div>
  );
}
