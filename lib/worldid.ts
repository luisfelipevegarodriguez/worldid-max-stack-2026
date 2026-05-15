export const WORLD_APP_ID = process.env.NEXT_PUBLIC_WORLD_APP_ID!;
export const RP_ID = process.env.WORLD_RP_ID!;

export const config = {
  environment: process.env.NEXT_PUBLIC_WORLD_ENVIRONMENT as 'production' | 'staging',
  allowLegacy: process.env.ALLOW_LEGACY_PROOFS === 'true',
};

export function getActionConfig(action: string) {
  return {
    app_id: WORLD_APP_ID,
    action,
    allow_legacy_proofs: config.allowLegacy,
  };
}

export const ACTIONS = {
  LOGIN: 'login',
  PAYMENTS: 'mini-app-payment',
  GRANTS: 'apply-grant-latam',
  REWARDS: 'claim-viral-reward',
} as const;
