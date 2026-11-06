'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { apiRequest } from '@/lib/api';
import { readCartIds, writeCartIds } from '@/lib/cart';
import { getUserGameAccess, toStoreGame } from '@/lib/games';
import type { ApiGame, StoreGame } from '@/lib/games';

export function useCart() {
    const { user, isReady } = useAuth();
    const [items, setItems] = useState<StoreGame[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [notice, setNotice] = useState('');
    const [requestCount, setRequestCount] = useState(0);

    useEffect(() => {
        if (!isReady) return;
        let controller: AbortController | null = null;

        async function loadCart() {
            controller?.abort();
            const request = new AbortController();
            controller = request;
            setLoading(true);
            setError('');
            try {
                const ids = readCartIds();
                if (!ids.length) {
                    setItems([]);
                    return;
                }
                const [games, access] = await Promise.all([
                    apiRequest<ApiGame[]>('/games', { signal: request.signal }),
                    user ? getUserGameAccess(request.signal) : Promise.resolve(null),
                ]);
                if (request.signal.aborted) return;
                const available = ids.flatMap((id) => {
                    const game = games.find((entry) => entry.id === id);
                    return game && !access?.purchasedIds.has(id) ? [toStoreGame(game, access?.discounts.get(id))] : [];
                });
                setItems(available);
                if (available.length !== ids.length) {
                    setNotice('Jogos indisponíveis ou já adquiridos foram retirados do carrinho.');
                    writeCartIds(available.map((game) => game.id));
                }
            } catch {
                if (!request.signal.aborted) setError('Não foi possível carregar o carrinho. Tente novamente.');
            } finally {
                if (!request.signal.aborted) setLoading(false);
            }
        }

        loadCart();
        window.addEventListener('cartUpdated', loadCart);
        window.addEventListener('storage', loadCart);
        window.addEventListener('focus', loadCart);
        return () => {
            controller?.abort();
            window.removeEventListener('cartUpdated', loadCart);
            window.removeEventListener('storage', loadCart);
            window.removeEventListener('focus', loadCart);
        };
    }, [user?.sub, isReady, requestCount]);

    const subtotal = items.reduce((sum, item) => sum + item.basePrice, 0);
    const total = items.reduce((sum, item) => sum + item.finalPrice, 0);
    return {
        items, loading, error, notice,
        subtotal: Number(subtotal.toFixed(2)),
        total: Number(total.toFixed(2)),
        discount: Number((subtotal - total).toFixed(2)),
        estimated: items.some((item) => item.lowestPrice !== item.finalPrice),
        retry: () => setRequestCount((count) => count + 1),
        remove: (id: number) => writeCartIds(readCartIds().filter((entry) => entry !== id)),
    };
}
