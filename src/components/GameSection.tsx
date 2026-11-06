'use client'

import type { Game } from '@/types/game';
import GameCard from './GameCard';

interface GameSectionProps {
    title: string;
    description?: string;
    games: Game[];
}


export default function gameSection({ title, description, games }: GameSectionProps) {
    return (
        <section className='mb-5'>

            <div className='mb-4'>
                <h2 className="fw-bold display-6 fs-3 mb-1 text-body">{title}</h2>
                {description && <p className="text-body-secondary mb-0">{description}</p>}
            </div>

            <div className="row g-3 row-cols-2 row-cols-sm-3 row-cols-md-4 row-cols-lg-6">
                {games.map((game) => (
                    <div key={game.id} className='col'>
                        <GameCard game={game} />
                    </div>
                ))}
            </div>
        </section>
    );
}
