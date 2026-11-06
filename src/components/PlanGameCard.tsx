'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Gamepad2 } from 'lucide-react';
import { formatPlanDiscount, getPlanGamePrices } from '@/lib/plans';
import type { Plan, PlanGame } from '@/lib/plans';

export default function PlanGameCard({ game, plan }: { game: PlanGame['game']; plan: Plan }) {
    const [imageFailed, setImageFailed] = useState(false);
    const imageUrl = game.imageUrl;
    const genres = game.categories.map((category) => category.name).join(' · ');
    const { storePrice, minPrice, maxPrice, storeIsBest } = getPlanGamePrices(game, plan);
    const formatCurrency = (value: number) => value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    const planPrice = minPrice === maxPrice ? formatCurrency(minPrice) : `${formatCurrency(minPrice)} a ${formatCurrency(maxPrice)}`;

    const content = (
        <>
            <div className="game-cover-frame rounded-3 mb-3 bg-body-secondary d-flex align-items-center justify-content-center">
                {imageUrl && !imageFailed ? (
                    <img src={imageUrl} alt="" loading="lazy" className="w-100 h-100 object-fit-cover" onError={() => setImageFailed(true)} />
                ) : <Gamepad2 size={48} className="text-body-secondary" aria-hidden="true" />}
            </div>
            <div className="d-flex flex-column flex-grow-1">
                <h3 className="fw-semibold fs-6 text-break mb-1">{game.name}</h3>
                {genres && <p className="small text-body-secondary mb-3">{genres}</p>}
                <span className="badge rounded-pill fw-normal align-self-start mb-3" style={{ color: '#7C3AED', backgroundColor: 'rgba(124, 58, 237, 0.09)' }}>Acesso com o plano</span>
                <div className="mt-auto">
                    <p className="small text-body-secondary mb-1">Com este plano</p>
                    <div className="d-flex flex-wrap align-items-baseline gap-2 mb-1">
                        <span className="fw-bold">{planPrice}</span>
                        {storePrice > maxPrice && <span className="small text-body-secondary text-decoration-line-through" aria-label={`Preço na loja: ${formatCurrency(storePrice)}`}>{formatCurrency(storePrice)}</span>}
                    </div>
                    <p className="small text-body-secondary mb-0">{storeIsBest ? 'Promoção da loja aplicada' : `${formatPlanDiscount(plan)} de desconto do plano`}</p>
                </div>
            </div>
        </>
    );

    return (
        <article className="border border-body-subtle rounded-4 p-2 h-100" style={{ backgroundColor: 'var(--bs-tertiary-bg)' }}>
                <Link href={`/jogo/${game.id}`} className="text-decoration-none text-body d-flex flex-column h-100 rounded-3 game-card-hover" aria-label={`Ver detalhes de ${game.name}`}>
                    {content}
                </Link>
        </article>
    );
}
