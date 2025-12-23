export function trackEvent(eventName: string, properties?: Record<string, any>) {
  if (typeof window !== "undefined" && (window as any).gtag) {
    (window as any).gtag("event", eventName, properties);
  }
  console.log("Analytics event:", eventName, properties);
}

export function trackError(error: Error, context?: Record<string, any>) {
  console.error("Error tracked:", error, context);
  
  if (typeof window !== "undefined" && (window as any).Sentry) {
    (window as any).Sentry.captureException(error, { extra: context });
  }
}

export function trackPerformance(metricName: string, value: number) {
  if (typeof window !== "undefined" && (window as any).gtag) {
    (window as any).gtag("event", "timing_complete", {
      name: metricName,
      value: Math.round(value),
    });
  }
}


