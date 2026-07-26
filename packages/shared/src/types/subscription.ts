import type { SubscriptionStatus, SubscriptionPlan } from '../enums/index.js';

export interface Subscription {
  id: string;
  userId: string;
  status: SubscriptionStatus;
  plan: SubscriptionPlan;
  price: number;
  startDate: Date;
  trialStartDate?: Date | null;
  trialEndDate?: Date | null;
  renewalDate: Date;
  cancellationDate?: Date | null;
  cancellationReason?: string | null;
  googlePlaySubscriptionId: string;
  googlePlayToken: string;
  autoRenew: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface VerifySubscriptionRequest {
  packageName: string;
  subscriptionId: string;
  purchaseToken: string;
}

export interface VerifySubscriptionResponse {
  isPremium: boolean;
  subscriptionId: string;
  purchaseTime: Date;
  expiryTime: Date;
  autoRenewing: boolean;
  orderId: string;
}

export interface SubscriptionStatusResponse {
  status: SubscriptionStatus;
  plan: SubscriptionPlan;
  isPremium: boolean;
  renewalDate: Date;
  price: number;
  currency: string;
  startDate: Date;
  trialEndDate?: Date;
  cancelledDate?: Date;
}
