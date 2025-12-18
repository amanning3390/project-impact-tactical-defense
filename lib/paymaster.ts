export const PAYMASTER_SERVICE_URL = process.env.NEXT_PUBLIC_PAYMASTER_URL || "";

export interface PaymasterConfig {
  url: string;
  policyId?: string;
}

export function getPaymasterConfig(): PaymasterConfig {
  return {
    url: PAYMASTER_SERVICE_URL,
  };
}

export function isPaymasterAvailable(): boolean {
  return !!PAYMASTER_SERVICE_URL;
}

