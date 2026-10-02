import { Business } from '../types';

/**
 * Checks whether a business subscription is currently active and within its valid date range.
 */
export function isSubscriptionActive(subscription?: Business['subscription']): boolean {
  if (!subscription) return false;
  if (subscription.status !== 'active') return false;
  if (!subscription.expiresAt) return true;
  
  const expiryTime = new Date(subscription.expiresAt).getTime();
  if (isNaN(expiryTime)) return false;
  
  return expiryTime >= Date.now();
}

/**
 * Calculates the exact number of days that have passed since a subscription expired without being renewed.
 * Uses calendar days comparison so that "yesterday" is 1 day, etc.
 */
export function getSubscriptionDaysExpired(subscription?: Business['subscription']): number {
  if (!subscription) return 0;

  // If the subscription is active and not expired in time, 0 days expired
  if (isSubscriptionActive(subscription)) {
    return 0;
  }

  if (subscription.expiresAt) {
    const exp = new Date(subscription.expiresAt);
    if (!isNaN(exp.getTime())) {
      const now = new Date();
      // Set to midnight in local timezone to compare pure calendar dates
      const todayMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
      const expMidnight = new Date(exp.getFullYear(), exp.getMonth(), exp.getDate()).getTime();

      const diffDays = Math.round((todayMidnight - expMidnight) / (1000 * 60 * 60 * 24));

      if (diffDays > 0) {
        return diffDays;
      }

      // If expiration was set for earlier today
      if (now.getTime() > exp.getTime()) {
        return 1;
      }
    }
  }

  // If status is explicitly expired or past_due without a valid past date
  if (subscription.status === 'expired' || subscription.status === 'past_due') {
    return 1;
  }

  return 0;
}

/**
 * Calculates days remaining until expiration (for active subscriptions).
 */
export function getSubscriptionDaysRemaining(subscription?: Business['subscription']): number {
  if (!subscription?.expiresAt) return 0;
  const exp = new Date(subscription.expiresAt);
  if (isNaN(exp.getTime())) return 0;

  const now = new Date();
  const todayMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const expMidnight = new Date(exp.getFullYear(), exp.getMonth(), exp.getDate()).getTime();

  const diffDays = Math.round((expMidnight - todayMidnight) / (1000 * 60 * 60 * 24));
  return Math.max(0, diffDays);
}

/**
 * Helper to get user-friendly label for days without renewal
 */
export function formatDaysSinRenovarLabel(days: number): string {
  if (days <= 0) return 'Suscripción Activa';
  return `${days} ${days === 1 ? 'Día' : 'Días'} sin renovar`;
}
