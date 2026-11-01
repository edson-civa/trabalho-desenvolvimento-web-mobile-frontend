'use client'

import Link from 'next/link';
import { Game } from '@/data/games';

interface GameCardProps {
  game: Game;
}

export default function GameCard({ game }: GameCardProps) {
    return (
        <Link
            href={`/jogo/${game.id}`}
            className='tect-decoration-none text-body d-block h-100 group game-card-hover'
        >
            <div className='d-flex flex-column h-100'>

                <div
                    className="position-relative rounded-4 overflow-hidden mb-2 shadow-sm bg-body-tertiary "
                    style={{ aspectRatio: '3/4' }}
                >
                    <img    
                        src={game.imageUrl}
                        alt={game.title}
                        className='w-100 h-100 object-fit-cover transition-transform'
                        style={{ transition: 'transform 0.3s ease'}}
                    />

                    {game.discountBadge && (
                        <span
                            className='position-absolute top-0 start-0 m-3 badge rounded-pill fw-bold'
                            style={{ backgroundColor: '#7C3AED', fontSize: '0.75rem', padding: '6px 10px' }}
                        >
                            {game.discountBadge}
                        </span>
                    )}
                </div>

                <div className="d-flex flex-column justify-content-between flex-grow-1">
                    <div>
                        <h3 className='fw-bold fs-6 mb-0 text-truncate" title={game.title}'>
                            {game.title}
                        </h3>

                        <p className="text-body-secondary small mb-2 text-truncate" style={{ fontSize: '0.8rem' }}>
                            {game.category}
                        </p>
                    </div>

                    <div className="d-flex align-items-center gap-2">
                        <span className="fw-bold" style={{ color: 'var(--bs-body-color)' }}>
                            {game.price}
                        </span>
                        {game.originalPrice && (
                            <span className="text-body-secondary text-decoration-line-through small" style={{ fontSize: '0.75rem' }}>
                                {game.originalPrice}
                            </span>
                        )}
                    </div>
                </div>

            </div>
        </Link>
    );
}