export function validateCoordinates(x: number, y: number, z: number): boolean {
  return (
    Number.isInteger(x) &&
    Number.isInteger(y) &&
    Number.isInteger(z) &&
    x >= 0 &&
    x <= 10 &&
    y >= 0 &&
    y <= 10 &&
    z >= 0 &&
    z <= 10
  );
}

export function sanitizeInput(input: string): string {
  return input.trim().slice(0, 1000); // Limit length
}

const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

export function checkRateLimit(
  identifier: string,
  maxRequests: number = 10,
  windowMs: number = 60000
): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(identifier);

  if (!record || now > record.resetTime) {
    rateLimitMap.set(identifier, {
      count: 1,
      resetTime: now + windowMs,
    });
    return true;
  }

  if (record.count >= maxRequests) {
    return false;
  }

  record.count++;
  return true;
}

export function validateTransaction(transaction: {
  to: string;
  value?: bigint;
  data?: string;
}): boolean {
  // Basic validation
  if (!transaction.to || !/^0x[a-fA-F0-9]{40}$/.test(transaction.to)) {
    return false;
  }

  if (transaction.value && transaction.value < 0n) {
    return false;
  }

  return true;
}

