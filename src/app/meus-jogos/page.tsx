'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Gamepad2, Pencil, Plus, Search, ShoppingBag, Wallet } from 'lucide-react';
import Header from '@/components/Header';
import ApiState from '@/components/ApiState';
import { apiRequest } from '@/lib/api';
import type { PublishedGame, PublisherDashboard } from '@/lib/admin';
import styles from './page.module.css';

type SortOrder = 'sales' | 'revenue' | 'price' | 'name';

function PublishedGameInfo({ game }: { game: PublishedGame }) {
    const [imageFailed, setImageFailed] = useState(false);
    const genres = game.categories.map((category) => category.name).join(' · ');

    return (
        <div className="d-flex align-items-center gap-3" style={{ minWidth: 0 }}>
            <div
                className="rounded-3 bg-body overflow-hidden flex-shrink-0 d-flex align-items-center justify-content-center"
                style={{ width: '48px', height: '72px' }}
            >
                {imageFailed || !game.imageUrl ? (
                    <Gamepad2 size={24} className="text-body-secondary" aria-hidden="true" />
                ) : (
                    <img src={game.imageUrl} alt="" loading="lazy" className="w-100 h-100 object-fit-cover" onError={() => setImageFailed(true)} />
                )}
            </div>
            <div style={{ minWidth: 0 }}>
                <h3 className="fw-semibold fs-6 text-break mb-1">{game.name}</h3>
                <p className="text-body-secondary small mb-0">{genres}</p>
            </div>
        </div>
    );
}

export default function MyGamesPage() {
    const [searchQuery, setSearchQuery] = useState('');
    const [sortOrder, setSortOrder] = useState<SortOrder>('sales');
    const [data, setData] = useState<PublisherDashboard>({ games: [], totals: { gamesCount: 0, salesCount: 0, revenue: 0 } });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [requestCount, setRequestCount] = useState(0);
    const { games, totals } = data;

    useEffect(() => {
        const controller = new AbortController();
        setLoading(true);
        setError('');
        apiRequest<PublisherDashboard>('/games/mine', { signal: controller.signal })
            .then((response) => { if (!controller.signal.aborted) setData(response); })
            .catch(() => { if (!controller.signal.aborted) setError('Não foi possível carregar suas publicações.'); })
            .finally(() => { if (!controller.signal.aborted) setLoading(false); });
        return () => controller.abort();
    }, [requestCount]);

    const normalizeText = (value: string) => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
    const query = normalizeText(searchQuery.trim());
    const filteredGames = games.filter((game) => normalizeText(game.name).includes(query)).sort((a, b) => {
        if (sortOrder === 'revenue') return b.revenue - a.revenue || a.name.localeCompare(b.name, 'pt-BR');
        if (sortOrder === 'price') return a.price - b.price || a.name.localeCompare(b.name, 'pt-BR');
        if (sortOrder === 'name') return a.name.localeCompare(b.name, 'pt-BR');
        return b.salesCount - a.salesCount || a.name.localeCompare(b.name, 'pt-BR');
    });

    const formatCurrency = (value: number) => value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    const manageLinkClass = `${styles.manageLink} d-inline-flex align-items-center justify-content-center gap-2 text-decoration-none small fw-semibold rounded-3 px-2 py-2`;

    const indicators = [
        { label: 'Vendas', value: totals.salesCount.toLocaleString('pt-BR'), icon: ShoppingBag },
        { label: 'Receita total', value: formatCurrency(totals.revenue), icon: Wallet },
        { label: 'Jogos publicados', value: totals.gamesCount.toLocaleString('pt-BR'), icon: Gamepad2 },
    ];

    return (
        <div className="min-vh-100 bg-body text-body">
            <Header />

            <main className="container-xxl my-4 px-3 px-md-4 pb-5" style={{ paddingTop: '100px', maxWidth: '1360px' }}>
                <div className="d-flex flex-column flex-sm-row align-items-sm-center justify-content-between gap-3 mb-4 pb-2">
                    <h1 className="fw-bold fs-2 mb-0">Meus jogos</h1>
                    <Link
                        href="/publicar"
                        className="btn text-white fw-semibold rounded-3 px-4 py-2 d-inline-flex align-items-center justify-content-center gap-2 buy-btn-hover"
                        style={{ backgroundColor: '#7C3AED' }}
                    >
                        <Plus size={18} aria-hidden="true" />
                        Publicar novo jogo
                    </Link>
                </div>

                <div className="row g-3 g-xl-4 mb-4">
                    {indicators.map(({ label, value, icon: Icon }) => (
                        <div key={label} className="col-12 col-md-4">
                            <div className="p-4 h-100 rounded-4 bg-body-tertiary border border-body-subtle shadow-sm">
                                <div className="d-flex align-items-center justify-content-between gap-3 mb-3">
                                    <span className="small text-body-secondary">{label}</span>
                                    <Icon size={19} style={{ color: '#7C3AED' }} aria-hidden="true" />
                                </div>
                                <p className="fw-bold fs-3 text-break mb-0">{loading || error ? '—' : value}</p>
                            </div>
                        </div>
                    ))}
                </div>

                {loading ? <ApiState loading message="Carregando publicações..." /> : error ? <ApiState message={error} onRetry={() => setRequestCount((count) => count + 1)} /> : <section className="bg-body-tertiary border border-body-subtle rounded-4 p-3 p-md-4 shadow-sm" aria-labelledby="published-games-title">
                    <div className="d-flex align-items-center gap-3 mb-4">
                        <h2 id="published-games-title" className="fw-bold fs-4 mb-0">Suas publicações</h2>
                        <span className="badge rounded-pill fw-normal px-3 py-2" style={{ backgroundColor: 'rgba(124, 58, 237, 0.09)', color: '#7C3AED' }}>
                            {games.length} {games.length === 1 ? 'jogo' : 'jogos'}
                        </span>
                    </div>

                    <div className={`${styles.controls} row g-3 mb-4`}>
                        <div className="col-12 col-sm-7 col-lg-5">
                            <label htmlFor="published-games-search" className="visually-hidden">Buscar por nome do jogo</label>
                            <div className="position-relative">
                                <Search size={17} className="position-absolute top-50 start-0 translate-middle-y ms-3 text-body-secondary" aria-hidden="true" />
                                <input
                                    id="published-games-search"
                                    type="search"
                                    placeholder="Buscar nos seus jogos..."
                                    value={searchQuery}
                                    onChange={(event) => setSearchQuery(event.target.value)}
                                    className="form-control bg-body text-body rounded-3 ps-5 py-2"
                                />
                            </div>
                        </div>
                        <div className="col-12 col-sm-5 col-lg-3">
                            <label htmlFor="published-games-sort" className="visually-hidden">Ordenar jogos</label>
                            <select
                                id="published-games-sort"
                                value={sortOrder}
                                onChange={(event) => setSortOrder(event.target.value as SortOrder)}
                                className="form-select bg-body text-body rounded-3 py-2"
                            >
                                <option value="sales">Mais vendidos</option>
                                <option value="revenue">Maior receita</option>
                                <option value="price">Menor preço</option>
                                <option value="name">Nome: A–Z</option>
                            </select>
                        </div>
                    </div>

                    {filteredGames.length === 0 ? (
                        <div className="text-center py-5" role="status">
                            <Search size={28} className="text-body-secondary mb-3" aria-hidden="true" />
                            <h3 className="fs-5 fw-semibold mb-2">{query ? 'Nenhum jogo encontrado' : 'Você ainda não publicou jogos'}</h3>
                            <p className="text-body-secondary small mb-0">{query ? 'Tente buscar por outro nome.' : 'Suas publicações aparecerão aqui.'}</p>
                        </div>
                    ) : (
                        <>
                            <div className="d-none d-lg-block table-responsive">
                                <table className={`${styles.table} table table-hover align-middle mb-0`}>
                                    <caption className="visually-hidden">Jogos publicados, vendas e receita</caption>
                                    <thead>
                                        <tr>
                                            <th scope="col">Jogo</th>
                                            <th scope="col">Status</th>
                                            <th scope="col" className="text-end">Preço</th>
                                            <th scope="col" className="text-end">Vendas</th>
                                            <th scope="col" className="text-end">Receita</th>
                                            <th scope="col" className="text-end">Ações</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredGames.map((game) => (
                                            <tr key={game.id}>
                                                <td><PublishedGameInfo game={game} /></td>
                                                <td><span className="badge bg-success-subtle text-success rounded-pill fw-normal px-3 py-2">Publicado</span></td>
                                                <td className="text-end text-nowrap small">{formatCurrency(game.price)}</td>
                                                <td className="text-end small">{game.salesCount.toLocaleString('pt-BR')}</td>
                                                <td className="text-end text-nowrap small fw-semibold">{formatCurrency(game.revenue)}</td>
                                                <td className="text-end">
                                                    <Link href={`/publicar?editar=${game.id}`} className={manageLinkClass} aria-label={`Gerenciar ${game.name}`}>
                                                        <Pencil size={15} aria-hidden="true" />
                                                        Gerenciar
                                                    </Link>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            <div className="d-lg-none d-flex flex-column gap-3">
                                {filteredGames.map((game) => (
                                    <article key={game.id} className="border border-body-subtle rounded-3 p-3">
                                        <PublishedGameInfo game={game} />
                                        <span className="badge bg-success-subtle text-success rounded-pill fw-normal px-3 py-2 mt-3">Publicado</span>
                                        <dl className="row g-2 text-center border-top border-bottom border-body-subtle py-3 my-3">
                                            <div className="col-4">
                                                <dt className="small text-body-secondary fw-normal mb-1">Preço</dt>
                                                <dd className="small fw-semibold mb-0">{formatCurrency(game.price)}</dd>
                                            </div>
                                            <div className="col-4">
                                                <dt className="small text-body-secondary fw-normal mb-1">Vendas</dt>
                                                <dd className="small fw-semibold mb-0">{game.salesCount}</dd>
                                            </div>
                                            <div className="col-4">
                                                <dt className="small text-body-secondary fw-normal mb-1">Receita</dt>
                                                <dd className="small fw-semibold mb-0">{formatCurrency(game.revenue)}</dd>
                                            </div>
                                        </dl>
                                        <Link href={`/publicar?editar=${game.id}`} className={`${manageLinkClass} w-100`} aria-label={`Gerenciar ${game.name}`}>
                                            <Pencil size={15} aria-hidden="true" />
                                            Gerenciar
                                        </Link>
                                    </article>
                                ))}
                            </div>
                        </>
                    )}

                    <div className="d-flex flex-wrap align-items-center justify-content-between gap-2 border-top border-body-subtle pt-3 mt-3 small text-body-secondary">
                        <span aria-live="polite">Exibindo {filteredGames.length} de {games.length} {games.length === 1 ? 'jogo' : 'jogos'}</span>
                    </div>
                </section>}
            </main>
        </div>
    );
}
