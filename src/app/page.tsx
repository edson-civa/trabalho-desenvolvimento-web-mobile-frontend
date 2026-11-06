'use client';

import { useEffect, useState } from 'react';
import Header from '@/components/Header';
import PromoCarousel from '@/components/PromoCarousel';
import GameSection from '@/components/GameSection';
import ApiState from '@/components/ApiState';
import { apiRequest } from '@/lib/api';
import { toStoreGame } from '@/lib/games';
import type { ApiGame, StoreGame } from '@/lib/games';

export default function Home() {
  const [games, setGames] = useState<StoreGame[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [requestCount, setRequestCount] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError('');
    apiRequest<ApiGame[]>('/games', { signal: controller.signal })
      .then((response) => { if (!controller.signal.aborted) setGames(response.map((game) => toStoreGame(game))); })
      .catch(() => { if (!controller.signal.aborted) setError('Não foi possível carregar os jogos.'); })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [requestCount]);

  const promotions = games.filter((game) => game.currentDiscount > 0);
  return (
    <div className="min-vh-100 bg-body text-body">
      <Header />
      <main className="container my-4" style={{ paddingTop: '80px' }}>
        {loading ? <ApiState loading message="Carregando jogos..." /> : error ? <ApiState message={error} onRetry={() => setRequestCount((count) => count + 1)} /> : games.length === 0 ? <ApiState message="Nenhum jogo disponível no momento." /> : <>
        <PromoCarousel games={promotions.length ? promotions : games.slice(0, 3)} />

        <GameSection 
          title="Em destaque"
          games={games}
        />

        <GameSection 
          title="Jogos de Ação e Aventura"
          description="Explore mundos abertos e combates intensos."
          games={games.filter((game) => game.tags?.some((tag) => ['ação', 'aventura'].includes(tag.toLowerCase())))}
        />
        </>}
      </main>
    </div>
  );
}
