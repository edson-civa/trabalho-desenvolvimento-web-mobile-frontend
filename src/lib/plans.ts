export interface Plan {
    id: number;
    name: string;
    price: number;
    maxGames: number;
    minDiscount: number;
    maxDiscount: number;
}

export interface PlanSubscription {
    id: number;
    userId: number;
    planId: number;
    startedAt: string;
    expiresAt: string;
    plan: Plan;
}

export interface PlanGame {
    planId: number;
    gameId: number;
    game: {
        id: number;
        name: string;
        price: number;
        currentDiscount: number;
        categories: { id: number; name: string }[];
        imageUrl?: string | null;
    };
}

export function getPlanGamePrices(game: PlanGame['game'], plan: Pick<Plan, 'minDiscount' | 'maxDiscount'>) {
    const netPrice = (discount: number) => Number((game.price * (1 - discount / 100)).toFixed(2));

    return {
        storePrice: netPrice(game.currentDiscount),
        minPrice: netPrice(Math.max(game.currentDiscount, plan.maxDiscount)),
        maxPrice: netPrice(Math.max(game.currentDiscount, plan.minDiscount)),
        storeIsBest: game.currentDiscount > 0 && game.currentDiscount >= plan.maxDiscount,
    };
}

export function formatPlanDiscount(plan: Pick<Plan, 'minDiscount' | 'maxDiscount'>): string {
    const format = (value: number) => value.toLocaleString('pt-BR', { maximumFractionDigits: 2 });

    if (plan.minDiscount === plan.maxDiscount) return `${format(plan.maxDiscount)}%`;
    return `De ${format(plan.minDiscount)}% a ${format(plan.maxDiscount)}%`;
}
