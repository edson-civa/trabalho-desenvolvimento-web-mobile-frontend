'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Gamepad2, Pencil, Search, Users, Wallet } from 'lucide-react';
import Header from '@/components/Header';
import Pagination from '@/components/Pagination';
import ApiState from '@/components/ApiState';
import { apiRequest } from '@/lib/api';
import type { ApiGame } from '@/lib/games';
import type { AdminUser, AdminSummary } from '@/lib/admin';
import type { GameCategory } from '@/types/category';

type AdminGame = ApiGame & { categoryIds: number[] };
import styles from './page.module.css';

const PAGE_SIZE = 4;
const normalizeText = (value: string) => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
const formatCurrency = (value: number) => value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
const formatDate = (value: string) => new Date(value).toLocaleDateString('pt-BR');
const roleLabel = (role: AdminUser['role']) => role === 'ADMIN' ? 'Administrador' : 'Usuário';

function UserInfo({ user }: { user: AdminUser }) {
    const initials = user.name.split(' ').filter(Boolean).map((part) => part[0]).slice(0, 2).join('');

    return (
        <div className="d-flex align-items-center gap-3" style={{ minWidth: 0 }}>
            <div className="rounded-circle d-flex align-items-center justify-content-center flex-shrink-0 small fw-semibold" style={{ width: '40px', height: '40px', backgroundColor: 'rgba(124, 58, 237, 0.09)', color: '#7C3AED' }} aria-hidden="true">{initials}</div>
            <div style={{ minWidth: 0 }}>
                <p className="fw-semibold small text-break mb-1">{user.name}</p>
                <p className="text-body-secondary small text-break mb-0">{user.email}</p>
            </div>
        </div>
    );
}

function GameInfo({ game }: { game: AdminGame }) {
    const [imageFailed, setImageFailed] = useState(false);

    return (
        <div className="d-flex align-items-center gap-3" style={{ minWidth: 0 }}>
            <div className="rounded-3 bg-body overflow-hidden flex-shrink-0 d-flex align-items-center justify-content-center" style={{ width: '48px', height: '72px' }}>
                {imageFailed || !game.imageUrl ? <Gamepad2 size={24} className="text-body-secondary" aria-hidden="true" /> : (
                    <img src={game.imageUrl} alt="" loading="lazy" className="w-100 h-100 object-fit-cover" onError={() => setImageFailed(true)} />
                )}
            </div>
            <h3 className="fw-semibold fs-6 text-break mb-0">{game.name}</h3>
        </div>
    );
}

function EmptyResults({ message }: { message: string }) {
    return (
        <div className="text-center py-5" role="status">
            <Search size={28} className="text-body-secondary mb-3" aria-hidden="true" />
            <p className="fw-semibold mb-2">{message}</p>
            <p className="text-body-secondary small mb-0">Tente alterar a busca ou os filtros.</p>
        </div>
    );
}

export default function AdminPage() {
    const [users, setUsers] = useState<AdminUser[]>([]);
    const [games, setGames] = useState<AdminGame[]>([]);
    const [categories, setCategories] = useState<GameCategory[]>([]);
    const [summary, setSummary] = useState<AdminSummary>({ totalUsers: 0, totalGames: 0, totalSales: 0, totalRevenue: 0 });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [requestCount, setRequestCount] = useState(0);

    useEffect(() => {
        const controller = new AbortController();
        setLoading(true);
        setError('');
        Promise.all([
            apiRequest<AdminUser[]>('/admin/users', { signal: controller.signal }),
            apiRequest<AdminSummary>('/admin/summary', { signal: controller.signal }),
            apiRequest<ApiGame[]>('/games/admin/catalog', { signal: controller.signal }),
            apiRequest<GameCategory[]>('/categories', { signal: controller.signal }),
        ]).then(([users, summary, games, categories]) => {
            if (controller.signal.aborted) return;
            setUsers(users);
            setSummary(summary);
            setGames(games.map((game) => ({ ...game, categoryIds: game.categories.map((category) => category.id) })));
            setCategories(categories);
        }).catch(() => { if (!controller.signal.aborted) setError('Não foi possível carregar a administração.'); })
          .finally(() => { if (!controller.signal.aborted) setLoading(false); });
        return () => controller.abort();
    }, [requestCount]);
    const [userSearch, setUserSearch] = useState('');
    const [userRole, setUserRole] = useState('');
    const [userPage, setUserPage] = useState(1);
    const [gameSearch, setGameSearch] = useState('');
    const [genreId, setGenreId] = useState('');
    const [gamePage, setGamePage] = useState(1);

    const userQuery = normalizeText(userSearch.trim());
    const gameQuery = normalizeText(gameSearch.trim());
    const filteredUsers = users.filter((user) =>
        (!userRole || user.role === userRole) && normalizeText(`${user.name} ${user.email}`).includes(userQuery)
    );
    const filteredGames = games.filter((game) =>
        (!genreId || game.categoryIds.includes(Number(genreId))) && normalizeText(`${game.name} ${game.owner.name}`).includes(gameQuery)
    );
    const visibleUsers = filteredUsers.slice((userPage - 1) * PAGE_SIZE, userPage * PAGE_SIZE);
    const visibleGames = filteredGames.slice((gamePage - 1) * PAGE_SIZE, gamePage * PAGE_SIZE);
    const genreNames = (game: AdminGame) => categories.filter((category) => game.categoryIds.includes(category.id)).map((category) => category.name).join(' · ');
    const manageLinkClass = `${styles.manageLink} d-inline-flex align-items-center justify-content-center gap-2 text-decoration-none small fw-semibold rounded-3 px-2 py-2`;
    const editHref = (id: number) => `/publicar?editar=${id}&origem=admin`;
    const indicators = [
        { label: 'Usuários cadastrados', value: summary.totalUsers.toLocaleString('pt-BR'), icon: Users },
        { label: 'Jogos no catálogo', value: summary.totalGames.toLocaleString('pt-BR'), icon: Gamepad2 },
        { label: 'Receita total', value: formatCurrency(summary.totalRevenue), icon: Wallet },
    ];

    return (
        <div className="min-vh-100 bg-body text-body">
            <Header />
            <main className="container-xxl my-4 px-3 px-md-4 pb-5" style={{ paddingTop: '100px', maxWidth: '1360px' }}>
                <h1 className="fw-bold fs-2 mb-4 pb-2">Administração</h1>

                <div className="row g-3 g-xl-4 mb-4">
                    {indicators.map(({ label, value, icon: Icon }) => (
                        <div key={label} className="col-12 col-md-4">
                            <div className="p-4 h-100 rounded-4 bg-body-tertiary border border-body-subtle shadow-sm">
                                <div className="d-flex align-items-center justify-content-between gap-3 mb-3">
                                    <span className="small text-body-secondary">{label}</span>
                                    <Icon size={19} style={{ color: '#7C3AED' }} aria-hidden="true" />
                                </div>
                                <p className="fw-bold fs-3 text-break mb-0">{loading || error ? '?' : value}</p>
                            </div>
                        </div>
                    ))}
                </div>

                {loading ? <ApiState loading message="Carregando administração..." /> : error ? <ApiState message={error} onRetry={() => setRequestCount((count) => count + 1)} /> : <>
                <section className="bg-body-tertiary border border-body-subtle rounded-4 p-3 p-md-4 shadow-sm mb-4" aria-labelledby="admin-users-title">
                    <div className="d-flex flex-wrap align-items-center gap-3 mb-4">
                        <h2 id="admin-users-title" className="fw-bold fs-4 mb-0">Usuários</h2>
                        <span className="badge rounded-pill fw-normal px-3 py-2" style={{ backgroundColor: 'rgba(124, 58, 237, 0.09)', color: '#7C3AED' }}>{users.length} cadastrados</span>
                    </div>

                    <div className={`${styles.controls} row g-3 mb-4`}>
                        <div className="col-12 col-sm-7 col-lg-5">
                            <label htmlFor="admin-users-search" className="visually-hidden">Buscar por nome ou e-mail</label>
                            <div className="position-relative">
                                <Search size={17} className="position-absolute top-50 start-0 translate-middle-y ms-3 text-body-secondary" aria-hidden="true" />
                                <input id="admin-users-search" type="search" placeholder="Buscar por nome ou e-mail..." value={userSearch} onChange={(event) => { setUserSearch(event.target.value); setUserPage(1); }} className="form-control bg-body text-body rounded-3 ps-5 py-2" />
                            </div>
                        </div>
                        <div className="col-12 col-sm-5 col-lg-3">
                            <label htmlFor="admin-users-role" className="visually-hidden">Filtrar por perfil</label>
                            <select id="admin-users-role" value={userRole} onChange={(event) => { setUserRole(event.target.value); setUserPage(1); }} className="form-select bg-body text-body rounded-3 py-2">
                                <option value="">Todos os perfis</option>
                                <option value="USER">Usuário</option>
                                <option value="ADMIN">Administrador</option>
                            </select>
                        </div>
                    </div>

                    {filteredUsers.length === 0 ? <EmptyResults message="Nenhum usuário encontrado" /> : (
                        <>
                            <div className="d-none d-lg-block table-responsive">
                                <table className={`${styles.table} table table-hover align-middle mb-0`}>
                                    <caption className="visually-hidden">Usuários cadastrados e seus perfis</caption>
                                    <thead><tr><th scope="col">Usuário</th><th scope="col">Perfil</th><th scope="col" className="text-end">Cadastro</th></tr></thead>
                                    <tbody>{visibleUsers.map((user) => (
                                        <tr key={user.id}>
                                            <td><UserInfo user={user} /></td>
                                            <td className="small">{roleLabel(user.role)}</td>
                                            <td className="small text-body-secondary text-end text-nowrap"><time dateTime={user.createdAt}>{formatDate(user.createdAt)}</time></td>
                                        </tr>
                                    ))}</tbody>
                                </table>
                            </div>
                            <div className="d-lg-none d-flex flex-column gap-3">
                                {visibleUsers.map((user) => (
                                    <article key={user.id} className="border border-body-subtle rounded-3 p-3">
                                        <UserInfo user={user} />
                                        <div className="d-flex flex-wrap justify-content-between gap-2 border-top border-body-subtle pt-3 mt-3 small text-body-secondary">
                                            <span>{roleLabel(user.role)}</span>
                                            <span>Cadastro: <time dateTime={user.createdAt}>{formatDate(user.createdAt)}</time></span>
                                        </div>
                                    </article>
                                ))}
                            </div>
                        </>
                    )}
                    <Pagination page={userPage} pageSize={PAGE_SIZE} totalItems={filteredUsers.length} label="Páginas de usuários" onPageChange={setUserPage} />
                </section>

                <section className="bg-body-tertiary border border-body-subtle rounded-4 p-3 p-md-4 shadow-sm" aria-labelledby="admin-games-title">
                    <div className="d-flex flex-wrap align-items-center gap-3 mb-4">
                        <h2 id="admin-games-title" className="fw-bold fs-4 mb-0">Jogos do catálogo</h2>
                        <span className="badge rounded-pill fw-normal px-3 py-2" style={{ backgroundColor: 'rgba(124, 58, 237, 0.09)', color: '#7C3AED' }}>{games.length} jogos</span>
                    </div>

                    <div className={`${styles.controls} row g-3 mb-4`}>
                        <div className="col-12 col-sm-7 col-lg-5">
                            <label htmlFor="admin-games-search" className="visually-hidden">Buscar por jogo ou publicador</label>
                            <div className="position-relative">
                                <Search size={17} className="position-absolute top-50 start-0 translate-middle-y ms-3 text-body-secondary" aria-hidden="true" />
                                <input id="admin-games-search" type="search" placeholder="Buscar jogo ou publicador..." value={gameSearch} onChange={(event) => { setGameSearch(event.target.value); setGamePage(1); }} className="form-control bg-body text-body rounded-3 ps-5 py-2" />
                            </div>
                        </div>
                        <div className="col-12 col-sm-5 col-lg-3">
                            <label htmlFor="admin-games-genre" className="visually-hidden">Filtrar por gênero</label>
                            <select id="admin-games-genre" value={genreId} onChange={(event) => { setGenreId(event.target.value); setGamePage(1); }} className="form-select bg-body text-body rounded-3 py-2">
                                <option value="">Todos os gêneros</option>
                                {categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
                            </select>
                        </div>
                    </div>

                    {filteredGames.length === 0 ? <EmptyResults message="Nenhum jogo encontrado" /> : (
                        <>
                            <div className="d-none d-lg-block table-responsive">
                                <table className={`${styles.table} table table-hover align-middle mb-0`}>
                                    <caption className="visually-hidden">Jogos do catálogo e seus publicadores</caption>
                                    <thead><tr><th scope="col">Jogo</th><th scope="col">Publicador</th><th scope="col">Gênero</th><th scope="col" className="text-end">Preço</th><th scope="col">Status</th><th scope="col" className="text-end">Ações</th></tr></thead>
                                    <tbody>{visibleGames.map((game) => (
                                        <tr key={game.id}>
                                            <td><GameInfo game={game} /></td>
                                            <td className="small">{game.owner.name}</td>
                                            <td className="small text-body-secondary">{genreNames(game)}</td>
                                            <td className="small text-end text-nowrap">{formatCurrency(game.price)}</td>
                                            <td><span className="badge bg-success-subtle text-success rounded-pill fw-normal px-3 py-2">Publicado</span></td>
                                            <td className="text-end"><Link href={editHref(game.id)} className={manageLinkClass} aria-label={`Gerenciar ${game.name}`}><Pencil size={15} aria-hidden="true" />Gerenciar</Link></td>
                                        </tr>
                                    ))}</tbody>
                                </table>
                            </div>
                            <div className="d-lg-none d-flex flex-column gap-3">
                                {visibleGames.map((game) => (
                                    <article key={game.id} className="border border-body-subtle rounded-3 p-3">
                                        <GameInfo game={game} />
                                        <p className="small text-body-secondary mt-3 mb-1">{game.owner.name}</p>
                                        <p className="small text-body-secondary mb-3">{genreNames(game)}</p>
                                        <div className="d-flex flex-wrap align-items-center justify-content-between gap-2 mb-3">
                                            <span className="badge bg-success-subtle text-success rounded-pill fw-normal px-3 py-2">Publicado</span>
                                            <span className="small fw-semibold">{formatCurrency(game.price)}</span>
                                        </div>
                                        <div className="border-top border-body-subtle pt-2"><Link href={editHref(game.id)} className={`${manageLinkClass} w-100`} aria-label={`Gerenciar ${game.name}`}><Pencil size={15} aria-hidden="true" />Gerenciar</Link></div>
                                    </article>
                                ))}
                            </div>
                        </>
                    )}
                    <Pagination page={gamePage} pageSize={PAGE_SIZE} totalItems={filteredGames.length} label="Páginas do catálogo" onPageChange={setGamePage} />
                </section>
                </>}
            </main>
        </div>
    );
}
