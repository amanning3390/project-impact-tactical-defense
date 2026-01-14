"use client";

interface LoadingStateProps {
  variant?: "spinner" | "skeleton" | "pulse";
  size?: "sm" | "md" | "lg";
  text?: string;
}

export function LoadingState({ variant = "spinner", size = "md", text }: LoadingStateProps) {
  if (variant === "skeleton") {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-4 bg-surface rounded w-3/4"></div>
        <div className="h-4 bg-surface rounded w-1/2"></div>
        <div className="h-4 bg-surface rounded w-5/6"></div>
      </div>
    );
  }

  if (variant === "pulse") {
    const sizes = {
      sm: "w-8 h-8",
      md: "w-12 h-12",
      lg: "w-16 h-16",
    };

    return (
      <div className="flex flex-col items-center justify-center gap-3">
        <div className={`${sizes[size]} rounded-full bg-primary animate-neon-pulse`}></div>
        {text && <p className="text-sm text-gray-400">{text}</p>}
      </div>
    );
  }

  // Default: spinner
  const sizes = {
    sm: "w-6 h-6 border-2",
    md: "w-10 h-10 border-3",
    lg: "w-14 h-14 border-4",
  };

  return (
    <div className="flex flex-col items-center justify-center gap-3">
      <div
        className={`${sizes[size]} border-primary border-t-transparent rounded-full animate-spin`}
      ></div>
      {text && <p className="text-sm text-gray-400 font-mono">{text}</p>}
    </div>
  );
}

export function LoadingError({ error, onRetry }: { error: string; onRetry?: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 p-6 border border-error/40 bg-error/10 rounded-lg">
      <div className="text-error text-4xl">⚠</div>
      <div className="text-center">
        <h3 className="text-lg font-bold text-error mb-2">Error Loading Data</h3>
        <p className="text-sm text-gray-400">{error}</p>
      </div>
      {onRetry && (
        <button
          onClick={onRetry}
          className="px-4 py-2 bg-primary text-black font-bold rounded hover:bg-primary-light transition-colors"
        >
          Retry
        </button>
      )}
    </div>
  );
}

export function EmptyState({ message, action }: { message: string; action?: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 p-8 text-center">
      <div className="text-gray-500 text-5xl">∅</div>
      <p className="text-gray-400">{message}</p>
      {action}
    </div>
  );
}
