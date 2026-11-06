import type { PlanSubscription } from './plans';

const RECEIPT_KEY = 'playce_subscription_receipt';

export function saveSubscriptionReceipt(subscription: PlanSubscription): boolean {
    try {
        window.sessionStorage.setItem(RECEIPT_KEY, JSON.stringify(subscription));
        return true;
    } catch {
        return false;
    }
}

export function getSubscriptionReceipt(userId: number, planId: number): PlanSubscription | null {
    try {
        const saved = window.sessionStorage.getItem(RECEIPT_KEY);
        if (!saved) return null;

        const receipt: PlanSubscription = JSON.parse(saved);
        if (!receipt || receipt.userId !== userId || receipt.planId !== planId
            || !receipt.plan || receipt.plan.id !== planId
            || typeof receipt.plan.name !== 'string'
            || typeof receipt.plan.price !== 'number' || !Number.isFinite(receipt.plan.price)
            || typeof receipt.plan.maxGames !== 'number' || !Number.isFinite(receipt.plan.maxGames)
            || typeof receipt.plan.minDiscount !== 'number' || !Number.isFinite(receipt.plan.minDiscount)
            || typeof receipt.plan.maxDiscount !== 'number' || !Number.isFinite(receipt.plan.maxDiscount)
            || typeof receipt.startedAt !== 'string' || !Number.isFinite(Date.parse(receipt.startedAt))
            || typeof receipt.expiresAt !== 'string' || !Number.isFinite(Date.parse(receipt.expiresAt))) {
            return null;
        }

        return receipt;
    } catch {
        return null;
    }
}
