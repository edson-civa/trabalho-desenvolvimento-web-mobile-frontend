'use client';

import { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import Header from '@/components/Header';
import GameForm from '@/components/GameForm';
import { useAuth } from '@/contexts/AuthContext';
import ApiState from '@/components/ApiState';
import { apiRequest, ApiError } from '@/lib/api';
import { toGameForm } from '@/lib/games';
import type { ApiGame } from '@/lib/games';
import type { GameCategory } from '@/types/category';
import type { GameFormValues } from '@/lib/game-form';

function PublishGameContent() {
    const { user } = useAuth();
    const searchParams = useSearchParams();
    const router = useRouter();
    const editId = searchParams.get('editar');
    const isEditing = editId !== null;
    const fromAdmin = isEditing && searchParams.get('origem') === 'admin' && user?.role === 'ADMIN';
    const [game, setGame] = useState<ApiGame | null>(null);
    const [categories, setCategories] = useState<GameCategory[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [requestCount, setRequestCount] = useState(0);
    const returnPath = fromAdmin ? '/admin' : '/meus-jogos';

    useEffect(() => {
        const controller = new AbortController();
        setLoading(true);
        setError('');
        async function loadForm() {
            try {
                if (isEditing && (!editId || !/^[1-9]\d*$/.test(editId))) throw new ApiError('Jogo não encontrado.', 404);
                const [categories, game] = await Promise.all([
                    apiRequest<GameCategory[]>('/categories', { signal: controller.signal }),
                    isEditing ? apiRequest<ApiGame>('/games/' + editId, { signal: controller.signal }) : Promise.resolve(null),
                ]);
                if (controller.signal.aborted) return;
                if (game && game.ownerId !== user?.sub && user?.role !== 'ADMIN') throw new ApiError('Você não pode editar este jogo.', 403);
                setCategories(categories);
                setGame(game);
            } catch (error) {
                if (!controller.signal.aborted) setError(error instanceof ApiError ? error.message : 'Não foi possível carregar o formulário.');
            } finally {
                if (!controller.signal.aborted) setLoading(false);
            }
        }
        loadForm();
        return () => controller.abort();
    }, [editId, isEditing, user?.sub, user?.role, requestCount]);

    async function saveGame(values: GameFormValues) {
        const { name, price, imageUrl, description, longDescription, screenshots, categoryIds } = values;
        await apiRequest(isEditing ? '/games/' + editId : '/games', {
            method: isEditing ? 'PUT' : 'POST',
            body: { name, price, imageUrl, description, longDescription, screenshots, categoryIds },
        });
        router.replace(returnPath);
    }

    return (
        <div className="min-vh-100 bg-body text-body">
            <Header />
            <main className="container-xxl my-4 px-3 px-md-4 pb-5" style={{ paddingTop: '100px', maxWidth: '1360px' }}>
                <Link href={returnPath} className="d-inline-flex align-items-center gap-2 text-body-secondary text-decoration-none small mb-4">
                    <ArrowLeft size={16} />
                    {fromAdmin ? 'Voltar para administração' : 'Voltar para meus jogos'}
                </Link>

                {loading ? <ApiState loading message="Carregando formulário..." /> : error ? <ApiState message={error} onRetry={() => setRequestCount((count) => count + 1)} /> : (
                    <GameForm
                        key={game?.id ?? 'new'}
                        categories={categories}
                        publisherName={game?.owner.name ?? user?.name ?? ''}
                        initialValues={game ? toGameForm(game) : undefined}
                        onSubmit={saveGame}
                        mode={isEditing ? 'edit' : 'create'}
                    />
                )}
            </main>
        </div>
    );
}

export default function PublishGamePage() {
    return (
        <Suspense fallback={
            <main className="min-vh-100 bg-body text-body d-flex align-items-center justify-content-center px-3">
                <p className="text-body-secondary small mb-0" role="status">Carregando jogo...</p>
            </main>
        }>
            <PublishGameContent />
        </Suspense>
    );
}
