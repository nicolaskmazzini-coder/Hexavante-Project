export const PREMIUM_COIN_MULTIPLIER = 2;
export const BOOSTER_COIN_MULTIPLIER = 2;
export const BOOSTER_DURATION_HOURS = 24;
export const PREMIUM_TRIAL_DAYS = 30;

export type PremiumStatus = {
  isActive: boolean;
  expiresAt: Date | null;
  coinMultiplier: number;
  hasAdvancedStats: boolean;
  hasNoAds: boolean;
  hasExclusiveExams: boolean;
  hasExclusiveShopItems: boolean;
};

export function isPremiumActive(user: {
  isPremium: boolean;
  premiumExpiresAt: Date | null;
}): boolean {
  if (!user.isPremium) return false;
  if (!user.premiumExpiresAt) return true;
  return user.premiumExpiresAt > new Date();
}

export function buildPremiumStatus(user: {
  isPremium: boolean;
  premiumExpiresAt: Date | null;
}): PremiumStatus {
  const isActive = isPremiumActive(user);

  return {
    isActive,
    expiresAt: user.premiumExpiresAt,
    coinMultiplier: isActive ? PREMIUM_COIN_MULTIPLIER : 1,
    hasAdvancedStats: isActive,
    hasNoAds: isActive,
    hasExclusiveExams: isActive,
    hasExclusiveShopItems: isActive,
  };
}
