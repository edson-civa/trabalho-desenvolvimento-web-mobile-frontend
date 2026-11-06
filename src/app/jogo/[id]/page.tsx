'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { ImageOff } from 'lucide-react';
import Header from '@/components/Header';
import Link from 'next/link';
import ApiState from '@/components/ApiState';
import { useAuth } from '@/contexts/AuthContext';
import { apiRequest, ApiError } from '@/lib/api';
import { getUserGameAccess, toStoreGame, formatCurrency } from '@/lib/games';
import type { ApiGame, StoreGame } from '@/lib/games';
import { addCartGame, readCartIds } from '@/lib/cart';

export default function GameDetailPage() {
    const { id } = useParams<{ id: string }>();
    const { user, isReady } = useAuth();
    const [game, setGame] = useState<StoreGame | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [requestCount, setRequestCount] = useState(0);
    const [selectedImage, setSelectedImage] = useState('');
    const [addedToCart, setAddedToCart] = useState(false);
    const [purchased, setPurchased] = useState(false);
    const [cartError, setCartError] = useState('');

    useEffect(() => {
        if (!isReady) return;
        const controller = new AbortController();
        setLoading(true);
        setError('');
        async function loadGame() {
            try {
                if (!/^[1-9]\d*$/.test(id) || !Number.isSafeInteger(Number(id))) throw new ApiError('Jogo não encontrado.', 404);
                const [response, access] = await Promise.all([
                    apiRequest<ApiGame>(`/games/${id}`, { signal: controller.signal }),
                    user ? getUserGameAccess(controller.signal) : Promise.resolve(null),
                ]);
                if (controller.signal.aborted) return;
                const result = toStoreGame(response, access?.discounts.get(response.id));
                setGame(result);
                setPurchased(access?.purchasedIds.has(result.id) ?? false);
                setSelectedImage(result.screenshots?.[0] || result.imageUrl || '');
            } catch (error) {
                if (!controller.signal.aborted) setError(error instanceof ApiError && error.status === 404 ? 'Jogo não encontrado.' : 'Não foi possível carregar o jogo.');
            } finally {
                if (!controller.signal.aborted) setLoading(false);
            }
        }
        loadGame();
        return () => controller.abort();
    }, [id, user?.sub, isReady, requestCount]);

    useEffect(() => {
        const update = () => setAddedToCart(readCartIds().includes(Number(id)));
        update();
        window.addEventListener('cartUpdated', update);
        return () => window.removeEventListener('cartUpdated', update);
    }, [id]);

    const handleAddToCart = () => {
        if (!game || purchased) return;
        try { addCartGame(game.id); setCartError(''); }
        catch { setCartError('Não foi possível adicionar o jogo ao carrinho.'); }
    };

    if (loading || error || !game) return <div className="min-vh-100 bg-body text-body"><Header /><main className="container my-4" style={{ paddingTop: '100px' }}><ApiState loading={loading} message={loading ? 'Carregando jogo...' : error || 'Jogo não encontrado.'} onRetry={!loading ? () => setRequestCount((count) => count + 1) : undefined} /><Link href="/" className="text-body-secondary">Voltar para a loja</Link></main></div>;
    const images = [...new Set([...(game.screenshots ?? []), game.imageUrl].filter(Boolean))];

    return (
        <div className="min-vh-100 bg-body text-body">
            <Header />

            <main className="container-fluid my-4 px-3 px-md-4" 
                style={{ paddingTop: '80px', maxWidth: 'clamp(1320px, 82vw, 1900px)' }}
            >

                {/* Título do Jogo e Tags */}
                <div className="mb-4">
                    <h1 className="fw-bold fs-2 mb-2 text-body">{game.title}</h1>
                    <div className="d-flex flex-wrap gap-2">
                        {(game.tags || [game.category]).map((tag, idx) => (
                            <span
                                key={idx}
                                className="tag-pill badge bg-body-tertiary text-body fw-normal px-3 py-2 rounded-pill"
                                style={{ fontSize: '0.85rem' }}
                            >
                                {tag}
                            </span>
                        ))}
                    </div>
                </div>

                <div className="d-flex flex-column justify-content-lg-between flex-lg-row align-items-start gap-4 gap-xl-5">

                    {/* COLUNA DA ESQUERDA*/}
                    <div className="flex-grow-1 w-100" 
                        style={{ maxWidth: 'clamp(820px, 50vw, 1250px)', minWidth: 0 }}
                    >

                        {/* Imagem Principal */}
                        <div
                            className="position-relative rounded-4 overflow-hidden mb-3 shadow-sm bg-body-tertiary d-flex align-items-center justify-content-center"
                            style={{ aspectRatio: '16/9', width: '100%' }}
                        >
                            <ImageOff size={40} className="text-body-secondary" aria-hidden="true" />
                            {selectedImage && <img
                                key={selectedImage}
                                src={selectedImage || undefined}
                                alt={game.title}
                                className="position-absolute top-0 start-0 w-100 h-100 object-fit-contain bg-body-tertiary"
                                onError={(event) => { event.currentTarget.style.display = 'none'; }}
                            />}
                        </div>

                        {/* Miniaturas */}
                        {images.length > 1 && (
                            <div className="row g-2 mb-4">
                                {images.map((img, idx) => (
                                    <div key={idx} className="col-3 col-md-2">
                                        <button
                                            onClick={() => setSelectedImage(img)}
                                            className={`btn position-relative p-0 w-100 rounded-3 overflow-hidden border-2 bg-body-tertiary thumb-hover ${selectedImage === img ? 'border-primary' : 'border-transparent opacity-75'
                                                }`}
                                            style={{
                                                aspectRatio: '16/9',
                                                borderColor: selectedImage === img ? '#7C3AED' : 'transparent',
                                                transition: 'all 0.2s ease'
                                            }}
                                        >
                                            <img
                                                src={img}
                                                alt={`Screenshot ${idx + 1}`}
                                                className="position-absolute top-0 start-0 w-100 h-100 object-fit-contain"
                                            />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}

                        <div className="mt-4">
                            <h2 className="fw-bold fs-4 mb-3 text-body">Sobre o jogo</h2>
                            <div className="text-body-secondary leading-relaxed" style={{ lineHeight: '1.8' }}>
                                <p className="fs-5 fw-semibold text-body mb-3">
                                    {game.description}
                                </p>
                                <p>
                                    {game.longDescription || game.description}
                                </p>
                            </div>
                        </div>

                    </div>

                    {/* COLUNA DA DIREITA */}
                    <div className="w-100" style={{ maxWidth: 'clamp(380px, 24vw, 540px)' }}>

                        {/* Card de Compra */}
                        <div className="p-4 rounded-4 bg-body-tertiary shadow-sm border border-body mb-4">
                            <p className="text-body-secondary mb-4" style={{ fontSize: '0.95rem', lineHeight: '1.6' }}>
                                {game.description || game.longDescription}
                            </p>

                            <hr className="my-3 text-body-secondary opacity-25" />

                            <div className="text-body-secondary small mb-1">
                                Edição padrão · Jogo completo
                            </div>

                            <div className="mb-4">
                                <div className="d-flex align-items-baseline gap-2">
                                    <span className="fw-bold display-6 text-body">
                                        {game.price}
                                    </span>
                                    {game.originalPrice && (
                                        <span className="text-body-secondary text-decoration-line-through fs-5">
                                            {game.originalPrice}
                                        </span>
                                    )}
                                </div>
                                {game.lowestPrice !== game.finalPrice && <p className="small text-body-secondary mt-2 mb-0">Com seu plano: de {formatCurrency(game.lowestPrice)} a {game.price}. O valor final é definido na compra.</p>}
                            </div>

                            {purchased ? <Link href="/biblioteca" className="btn w-100 py-3 rounded-3 fw-bold text-white mb-3" style={{ backgroundColor: '#7C3AED' }}>Na sua biblioteca</Link> : <button
                                onClick={handleAddToCart}
                                className="btn w-100 py-3 rounded-3 fw-bold text-white mb-3 buy-btn-hover"
                                style={{ backgroundColor: '#7C3AED' }}
                            >
                                {addedToCart ? '✓ Adicionado ao Carrinho!' : 'Comprar agora'}
                            </button>}
                            {cartError && <p className="small text-danger" role="alert">{cartError}</p>}

                            <div className="text-body-secondary small text-center d-flex align-items-center justify-content-center gap-2">
                                <span>⚡</span> Disponível na biblioteca após a compra
                            </div>
                        </div>

                        {/* Informações do Jogo */}
                        <div
                            className="p-4 rounded-4 shadow-sm"
                            style={{ backgroundColor: 'rgba(124, 58, 237, 0.08)' }}
                        >
                            <h3 className="fw-bold fs-6 mb-4 text-body">Informações do jogo</h3>

                            <div className="d-flex flex-column gap-3 small">
                                <div className="d-flex justify-content-between align-items-center">
                                    <span className="text-body-secondary">Publicado por</span>
                                    <span className="fw-semibold text-body">{game.publisher}</span>
                                </div>
                                <div className="d-flex justify-content-between align-items-center">
                                    <span className="text-body-secondary">Publicado em</span>
                                    <span className="fw-semibold text-body">{game.releaseDate}</span>
                                </div>
                            </div>
                        </div>

                    </div>

                </div>

            </main>
        </div>
    );
}
