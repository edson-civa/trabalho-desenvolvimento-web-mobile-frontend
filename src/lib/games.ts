import type { Game } from '@/types/game';
import type { GameFormValues } from './game-form';
import type { Plan } from './plans';
import { apiRequest } from './api';

export interface ApiGame {
    id: number;
    name: string;
    price: number;
    currentDiscount: number;
    imageUrl: string | null;
    description: string | null;
    longDescription: string | null;
    createdAt: string;
    status: string;
    ownerId: number;
    owner: { id: number; name: string };
    categories: { id: number; name: string }[];
    screenshots: { id: number; url: string }[];
}

export interface StoreGame extends Game {
    basePrice: number;
    finalPrice: number;
    lowestPrice: number;
    currentDiscount: number;
    ownerId: number;
}

export const formatCurrency = (value: number) => value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

export function toStoreGame(game: ApiGame, plan?: Plan): StoreGame {
    const discount = Math.max(game.currentDiscount, plan?.minDiscount ?? 0);
    const finalPrice = Number((game.price * (1 - discount / 100)).toFixed(2));
    const lowestPrice = Number((game.price * (1 - Math.max(game.currentDiscount, plan?.maxDiscount ?? 0) / 100)).toFixed(2));

    return {
        id: game.id,
        title: game.name,
        category: game.categories.map((category) => category.name).join(' · '),
        tags: game.categories.map((category) => category.name),
        price: formatCurrency(finalPrice),
        originalPrice: discount > 0 ? formatCurrency(game.price) : undefined,
        discountBadge: discount > 0 ? `-${discount.toLocaleString('pt-BR')}%` : undefined,
        imageUrl: game.imageUrl ?? '',
        description: game.description ?? '',
        longDescription: game.longDescription ?? '',
        screenshots: game.screenshots?.map((image) => image.url) ?? [],
        publisher: game.owner?.name ?? '',
        releaseDate: new Date(game.createdAt).toLocaleDateString('pt-BR'),
        basePrice: game.price,
        finalPrice,
        lowestPrice,
        currentDiscount: discount,
        ownerId: game.ownerId,
    };
}

export function toGameForm(game: ApiGame): GameFormValues {
    return {
        name: game.name,
        imageUrl: game.imageUrl ?? '',
        description: game.description ?? '',
        longDescription: game.longDescription ?? '',
        categoryIds: game.categories.map((category) => category.id),
        price: game.price,
        currentDiscount: game.currentDiscount,
        screenshots: game.screenshots.map((image) => image.url),
    };
}

export async function getUserGameAccess(signal: AbortSignal) {
    const [planGames, libraries] = await Promise.all([
        apiRequest<{ id: number; planId: number }[]>('/plans/me/games', { signal }),
        apiRequest<{ games: { gameId: number }[] }[]>('/libraries', { signal }),
    ]);
    const plans = planGames.length ? await apiRequest<Plan[]>('/plans', { signal }) : [];
    const discounts = new Map<number, Plan>();
    // O backend usa o primeiro plano ativo que contém o jogo.
    for (const game of planGames) {
        const plan = plans.find((entry) => entry.id === game.planId);
        if (plan && !discounts.has(game.id)) discounts.set(game.id, plan);
    }
    return { discounts, purchasedIds: new Set(libraries.flatMap((library) => library.games.map((game) => game.gameId))) };
}
