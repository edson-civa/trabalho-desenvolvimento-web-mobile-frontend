'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { GAMES_LIST, Game } from '@/data/games';
import Header from '@/components/Header';

export default function GameDetailPage() {
    const params = useParams();
    const gameId = Number(params.id);

    const game: Game = GAMES_LIST.find((g) => g.id === gameId) || GAMES_LIST[0];

    const images = game.screenshots && game.screenshots.length > 0
        ? game.screenshots
        : [game.imageUrl];

    const [selectedImage, setSelectedImage] = useState<string>(images[0]);
    const [addedToCart, setAddedToCart] = useState<boolean>(false);

    useEffect(() => {
        if (images.length > 0) {
            setSelectedImage(images[0]);
        }
    }, [gameId]);

    useEffect(() => {
        if (game?.id) {
            const savedCart = localStorage.getItem('playce_cart');
            if (savedCart) {
                try {
                    const currentCart = JSON.parse(savedCart);
                    const exists = currentCart.some((item: any) => item.id === game.id);
                    setAddedToCart(exists); // Usa setAddedToCart em vez de setIsInCart
                } catch {
                    setAddedToCart(false);
                }
            }
        }
    }, [game?.id]);

    const handleAddToCart = () => {
        try {
            const existigCart = JSON.parse(localStorage.getItem('playce_cart') || '[]');

            const exists = existigCart.some((item: Game) => item.id === game.id);
            if (!exists) {
                existigCart.push(game);
                localStorage.setItem('playce_cart', JSON.stringify(existigCart));
            }

            setAddedToCart(true);
            window.dispatchEvent(new Event('cartUpdated'));

        } catch (err) {
            console.error('Erro ao salvar no carrinho: ', err);
        }
    };

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
                            className="position-relative rounded-4 overflow-hidden mb-3 shadow-sm bg-body-tertiary"
                            style={{ aspectRatio: '16/9', width: '100%' }}
                        >
                            <img
                                src={selectedImage}
                                alt={game.title}
                                className="w-100 h-100 object-fit-cover"
                            />
                        </div>

                        {/* Miniaturas */}
                        {images.length > 1 && (
                            <div className="row g-2 mb-4">
                                {images.map((img, idx) => (
                                    <div key={idx} className="col-3 col-md-2">
                                        <button
                                            onClick={() => setSelectedImage(img)}
                                            className={`btn p-0 w-100 rounded-3 overflow-hidden border-2 thumb-hover ${selectedImage === img ? 'border-primary' : 'border-transparent opacity-75'
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
                                                className="w-100 h-100 object-fit-cover"
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
                                    {game.title}: Sua jornada começa.
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
                                <div className="text-body-secondary small mt-1">
                                    Em até 3x sem juros no cartão
                                </div>
                            </div>

                            <button
                                onClick={handleAddToCart}
                                className="btn w-100 py-3 rounded-3 fw-bold text-white mb-3 buy-btn-hover"
                                style={{ backgroundColor: '#7C3AED' }}
                            >
                                {addedToCart ? '✓ Adicionado ao Carrinho!' : 'Comprar agora'}
                            </button>

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
                                    <span className="text-body-secondary">Desenvolvedora</span>
                                    <span className="fw-semibold text-body">{game.developer || 'Playce Studio'}</span>
                                </div>
                                <div className="d-flex justify-content-between align-items-center">
                                    <span className="text-body-secondary">Distribuidora</span>
                                    <span className="fw-semibold text-body">{game.publisher || 'Playce Studio'}</span>
                                </div>
                                <div className="d-flex justify-content-between align-items-center">
                                    <span className="text-body-secondary">Lançamento</span>
                                    <span className="fw-semibold text-body">{game.releaseDate || '2026'}</span>
                                </div>
                            </div>
                        </div>

                    </div>

                </div>

            </main>
        </div>
    );
}