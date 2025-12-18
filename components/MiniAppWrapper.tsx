"use client";

import { ReactNode } from "react";

interface MiniAppWrapperProps {
  children: ReactNode;
  isInMiniApp: boolean;
}

export function MiniAppWrapper({ children, isInMiniApp }: MiniAppWrapperProps) {
  return (
    <div className={isInMiniApp ? "miniapp-container" : ""}>
      {children}
    </div>
  );
}

