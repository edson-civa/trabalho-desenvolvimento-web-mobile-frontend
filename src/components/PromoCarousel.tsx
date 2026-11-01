'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronRight, ChevronLeft, ShoppingBag } from 'lucide-react';

interface PromoGame {
    id: number;
    badge: string;
    subtitle: string;
    title: string;
    description: string;
    originalPrice: string;
    discountPrice: string;
    imageUrl: string;
}

const PROMO_GAMES: PromoGame[] = [
    {
        id: 10,
        badge: '-30% DE DESCONTO',
        subtitle: 'Oferta Destaque',
        title: 'Afterlight: Reborn',
        description: 'Explore um reino de ruínas ancestrais e descubra os segredos de uma civilização esquecida.',
        originalPrice: 'R$ 185,90',
        discountPrice: 'R$ 129,90',
        imageUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=1000&auto=format&fit=crop',
    },
    {
        id: 20,
        badge: '-50% DE DESCONTO',
        subtitle: 'Especial da Semana',
        title: 'Cyber Realm 2088',
        description: 'Enfrente corporações em uma metrópole futurista repleta de perigos e segredos.',
        originalPrice: 'R$ 199,00',
        discountPrice: 'R$ 99,50',
        imageUrl: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=1000&auto=format&fit=crop',
    },
];

const CAROUSEL_DURATION = 5000;

export default function PromoCarousel() {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isPaused, setIsPaused] = useState(false);
    const [progress, setProgress] = useState(0);
    const router = useRouter();

    const currentGame = PROMO_GAMES[currentIndex];

    // Timer e Barra de Progresso
    useEffect(() => {
        if (isPaused) return;

        const intervalTime = 50; 
        const step = (intervalTime / CAROUSEL_DURATION) * 100;

        const timer = setInterval(() => {
            setProgress((prev) => {
                if (prev >= 100) {
                    return 100;
                }
                return prev + step;
            });
        }, intervalTime);

        return () => clearInterval(timer);
    }, [isPaused, currentIndex]);


    useEffect(() => {
        if (progress >= 100) {
            setCurrentIndex((prevIndex) => (prevIndex + 1) % PROMO_GAMES.length);
            setProgress(0);
        }
    }, [progress]);


    const goToSlide = (index: number, e?: React.MouseEvent) => {
        e?.stopPropagation();
        setCurrentIndex(index);
        setProgress(0);
    };

    const handleNext = (e?: React.MouseEvent) => {
        goToSlide((currentIndex + 1) % PROMO_GAMES.length, e);
    };

    const handlePrev = (e?: React.MouseEvent) => {
        goToSlide((currentIndex - 1 + PROMO_GAMES.length) % PROMO_GAMES.length, e);
    };

    const handleCardClick = () => {
        router.push(`/jogo/${currentGame.id}`);
    };

    const handleBuyNow = (e: React.MouseEvent) => {
        e.stopPropagation();
        router.push('/carrinho');
    };

    return (
        <section className="mb-5">
            <div
                onClick={handleCardClick}
                onMouseEnter={() => setIsPaused(true)}
                onMouseLeave={() => setIsPaused(false)}
                className="rounded-4 overflow-hidden border shadow-sm position-relative banner-hover bg-body-tertiary"
                style={{ 
                    cursor: 'pointer',
                    transition: 'transform 0.25s ease, box-shadow 0.25s ease',
                }}
            >
                {/* Barra de Progresso Superior */}
                <div
                    className="position-absolute top-0 start-0 z-3"
                    style={{
                        height: '4px',
                        backgroundColor: '#7C3AED',
                        width: `${progress}%`,
                        transition: isPaused ? 'none' : 'width 0.05s linear'
                    }}
                />

                <div className="row g-0 align-items-stretch">

                    {/* Coluna da Esquerda: Informações */}
                    <div className="col-lg-5 p-4 p-md-5 d-flex flex-column justify-content-between z-2">
                        <div>
                            <div
                                className="d-inline-flex align-items-center gap-1 px-3 py-1 rounded-pill mb-3 fw-bold shadow-sm"
                                style={{ backgroundColor: '#7C3AED', color: '#FFFFFF', fontSize: '0.75rem' }}
                            >
                                <span>✦</span> {currentGame.badge}
                            </div>

                            <div className="text-body-secondary small mb-1">{currentGame.subtitle}</div> 
                            <h1 className="fw-extrabold text-body display-5 mb-3" style={{ fontWeight: 800 }}>
                                {currentGame.title}
                            </h1>
                            <p className="text-secondary mb-4" style={{ fontSize: '0.95rem', lineHeight: '1.5' }}>
                                {currentGame.description}
                            </p>

                            <div className="d-flex align-items-center gap-3 mb-4">
                                <button
                                    onClick={handleBuyNow}
                                    className="btn text-white fw-semibold px-4 py-2 rounded-3 d-flex align-items-center gap-2 border-0 shadow-sm buy-btn-hover"
                                    style={{ backgroundColor: '#7C3AED' }}
                                >
                                    <ShoppingBag size={18} />
                                    <span>Comprar agora</span>
                                </button>

                                <div>
                                    <div className="text-decoration-line-through text-body-secondary small" style={{ fontSize: '0.75rem' }}>
                                        {currentGame.originalPrice}
                                    </div>
                                    <div className="fw-bold fs-4" style={{ color: '#7C3AED' }}>
                                        {currentGame.discountPrice}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Indicadores de Slide */}
                        <div className="d-flex align-items-center gap-2 mt-3">
                            {PROMO_GAMES.map((_, index) => (
                                <button
                                    key={index}
                                    onClick={(e) => goToSlide(index, e)}
                                    className="border-0 p-0 rounded-pill transition-all"
                                    style={{
                                        width: currentIndex === index ? '28px' : '8px',
                                        height: '6px',
                                        backgroundColor: currentIndex === index ? '#7C3AED' : 'var(--bs-border-color)',
                                    }}
                                    aria-label={`Ir para o slide ${index + 1}`}
                                />
                            ))}
                        </div>
                    </div>

                    {/* Coluna da Direita */}
                    <div className="col-lg-7 position-relative min-vh-25" style={{ minHeight: '380px' }}>
                        <img
                            src={currentGame.imageUrl}
                            alt={currentGame.title}
                            className="position-absolute top-0 start-0 w-100 h-100 object-fit-cover"
                        />

                        {/* Setas de Navegação */}
                        <div
                            className="position-absolute end-0 p-3 d-flex gap-2 z-3"
                            style={{ bottom: '15px' }}
                        >
                            <button
                                onClick={handlePrev}
                                className="btn btn-body bg-body text-body rounded-circle p-2 d-flex align-items-center justify-content-center shadow-sm border-0 nav-btn-hover"
                                style={{ width: '40px', height: '40px' }}
                                aria-label="Anterior"
                            >
                                <ChevronLeft size={20} />
                            </button>
                            <button
                                onClick={handleNext}
                                className="btn btn-body bg-body text-body rounded-circle p-2 d-flex align-items-center justify-content-center shadow-sm border-0 nav-btn-hover"
                                style={{ width: '40px', height: '40px' }}
                                aria-label="Próximo"
                            >
                                <ChevronRight size={20} />
                            </button>
                        </div>
                    </div>

                </div>
            </div>
        </section>
    );
}