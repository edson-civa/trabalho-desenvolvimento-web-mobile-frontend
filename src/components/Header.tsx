'use client';

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { useRouter } from 'next/navigation';
import { Play, Search, ShoppingBag, User, LogOut, Sun, Moon, Gamepad2, ShieldCheck } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { apiRequest } from '@/lib/api';
import { toStoreGame } from '@/lib/games';
import type { ApiGame, StoreGame } from '@/lib/games';
import { readCartIds } from '@/lib/cart';

export default function Header() {
    const router = useRouter();
    const { user, isReady, logout } = useAuth();

    const [cartCount, setCartCount] = useState(0);

    const [searchQuery, setSearchQuery] = useState('');
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
    const [theme, setTheme] = useState<'light' | 'dark'>('light');

    const searchRef = useRef<HTMLDivElement>(null);
    const userMenuRef = useRef<HTMLDivElement>(null);

    const [catalog, setCatalog] = useState<StoreGame[]>([]);
    const [searchLoading, setSearchLoading] = useState(true);
    const [searchError, setSearchError] = useState(false);

    useEffect(() => {
        const controller = new AbortController();
        apiRequest<ApiGame[]>('/games', { signal: controller.signal })
            .then((games) => { if (!controller.signal.aborted) setCatalog(games.map((game) => toStoreGame(game))); })
            .catch(() => { if (!controller.signal.aborted) setSearchError(true); })
            .finally(() => { if (!controller.signal.aborted) setSearchLoading(false); });
        return () => controller.abort();
    }, []);

    const normalize = (value: string) => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
    const filteredGames = catalog.filter((game) => normalize(game.title).includes(normalize(searchQuery.trim()))).slice(0, 5);
    const updateCartCount = () => setCartCount(readCartIds().length);

    useEffect(() => {
        updateCartCount();

        window.addEventListener('storage', updateCartCount);
        window.addEventListener('cartUpdated', updateCartCount);

        return () => {
            window.removeEventListener('storage', updateCartCount);
            window.removeEventListener('cartUpdated', updateCartCount);
        };
    }, []);
    

    useEffect(() => {
        const savedTheme = (localStorage.getItem('playce-theme') as 'light' | 'dark') || 'light';
        setTheme(savedTheme);

        document.documentElement.setAttribute('data-bs-theme', savedTheme);
    }, []);


    const toggleTheme = () => {
        const newTheme = theme === 'light' ? 'dark' : 'light';
        setTheme(newTheme);

        document.documentElement.setAttribute('data-bs-theme', newTheme);

        localStorage.setItem('playce-theme', newTheme);
    };

        useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
                setIsSearchOpen(false);
            }

            if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
                setIsUserMenuOpen(false);
            }
        }

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);


    return (
        <header className="fixed-top bg-body border-bottom py-3 px-3 px-md-4 shadow-sm" style={{ zIndex: 1050 }}>
            <div className="container-fluid d-flex align-items-center justify-content-between">

                {/* Lado Esquerdo: Logo e Navegação */}
                <div className="d-flex align-items-center gap-3">
                    <Link href="/" className="d-flex align-items-center gap-2 text-decoration-none">
                        <div
                            className="text-white rounded-3 d-flex align-items-center justify-content-center"
                            style={{ width: '38px', height: '38px', backgroundColor: '#7C3AED' }}
                        >
                            <Play size={18} fill="white" className="ms-1" />
                        </div>
                        <span className="fw-bold fs-4 text-body ms-1 d-none d-sm-inline">Playce</span>
                    </Link>

                    <nav className="d-flex gap-2 gap-sm-3 ms-sm-3 small" aria-label="Navegação principal">
                        <Link href="/" className="text-decoration-none fw-semibold text-body">
                            Loja
                        </Link>

                        <Link href="/biblioteca" className="text-decoration-none fw-semibold text-body">
                            Biblioteca
                        </Link>
                        <Link href="/planos" className="text-decoration-none fw-semibold text-body">
                            Planos
                        </Link>
                    </nav>
                </div>


                {/* Lado Direito: Busca Interativa e Ícones */}
                <div className="d-flex align-items-center gap-2 gap-md-3">

                    {/* campo de busca  */}

                    <div ref={searchRef} className="position-relative d-none d-lg-block" style={{ width: '220px' }}>
                        <Search
                            size={18}
                            className="position-absolute top-50 start-0 translate-middle-y ms-3 text-muted"
                        />

                        <input
                            type="text"
                            className="form-control form-control-sm bg-body-tertiary text-body border-0 ps-5 py-2 rounded-3"
                            placeholder="Buscar jogos..."
                            aria-label="Buscar jogos na loja"
                            value={searchQuery}
                            onChange={(e) => {
                                setSearchQuery(e.target.value);
                                setIsSearchOpen(e.target.value.trim().length > 0);
                            }}
                            onFocus={() => searchQuery.trim().length > 0 && setIsSearchOpen(true)}
                        />

                        {/* Pop-up de Resultados de Busca */}


                        {isSearchOpen && (
                            <div
                                className="position-absolute start-0 end-0 mt-2 bg-body rounded-3 shadow-lg p-2 border z-3"
                                style={{ top: '100%', zIndex: 1060 }}
                            >
                                {filteredGames.length > 0 ? (
                                    filteredGames.map((game) => (
                                        <Link
                                            key={game.id}
                                            href={`/jogo/${game.id}`}
                                            className="d-flex justify-content-between align-items-center p-2 text-decoration-none text-body hover-bg-body-tertiary text-body rounded-2"
                                            onClick={() => setIsSearchOpen(false)}
                                        >

                                            <div>
                                                <div className="fw-bold small">{game.title}</div>
                                                <div className="text-muted" style={{ fontSize: '0.75rem' }}>{game.category}</div>
                                            </div>
                                            <span className="badge fw-semibold" style={{ color: '#7C3AED', backgroundColor: '#F3E8FF' }}>
                                                {game.price}
                                            </span>
                                        </Link>
                                    ))
                                ) : (
                                    <div className="p-2 text-muted small text-center">{searchLoading ? 'Buscando jogos...' : searchError ? 'Busca indisponível no momento.' : 'Nenhum jogo encontrado'}</div>
                                )}

                            </div>
                        )}

                    </div>

                    {/* Botão Carrinho */}

                    <Link
                        href="/carrinho"
                        className="btn btn-body-tertiary text-body rounded-3 d-flex align-items-center justify-content-center p-0 border-0 btn-header-hover position-relative"
                        style={{ width: '40px', height: '40px' }}
                        aria-label="Carrinho"
                    >
                        <ShoppingBag size={20} className="text-body" />

                        {cartCount > 0 && (
                            <span
                            className="position-absolute badge rounded-circle text-white shadow-sm"
                            style={{
                                backgroundColor: '#7C3AED',
                                fontSize: '0.65rem',
                                top: '-3px',
                                right: '-3px',
                                width: '18px',
                                height: '18px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                padding: 0
                            }}
                            >
                            {cartCount}
                            </span>
                        )}
                    </Link>

                    {/* Botão Perfil com Menu Dropdown */}

                    <div ref={userMenuRef} className="position-relative">
                        <button
                            onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                            className="btn btn-body-tertiary text-body rounded-3 d-flex align-items-center justify-content-center p-0 border-0 btn-header-hover"
                            style={{ width: '40px', height: '40px' }}
                            aria-label="Perfil"
                        >
                            <User size={20} className="text-body" />
                        </button>

                        {/* Menu Dropdown do Usuário */}

                        {isUserMenuOpen && (
                            <div
                                className="position-absolute end-0 mt-2 bg-body border rounded-3 shadow-lg p-2 border z-3"
                                style={{ width: '220px', top: '100%', zIndex: 1060}}
                            >
                                {!isReady ? (
                                    <p className="text-body-secondary small p-2 mb-0">Carregando conta...</p>
                                ) : user ? (
                                <>
                                <div className="px-2 py-2 border-bottom mb-1">
                                    <p className="fw-semibold small text-break mb-0">{user.name}</p>
                                    {user.role === 'ADMIN' && <span className="text-body-secondary small">Administrador</span>}
                                </div>
                                <Link
                                    href="/meus-jogos"
                                    className="d-flex align-items-center gap-2 p-2 text-decoration-none text-body small rounded hover-bg-body-tertiary"
                                    onClick={() => setIsUserMenuOpen(false)}
                                >
                                    <Gamepad2 size={16} />
                                    <span>Meus jogos</span>
                                </Link>
                                {user.role === 'ADMIN' && (
                                    <Link
                                        href="/admin"
                                        className="d-flex align-items-center gap-2 p-2 text-decoration-none text-body small rounded hover-bg-body-tertiary"
                                        onClick={() => setIsUserMenuOpen(false)}
                                    >
                                        <ShieldCheck size={16} />
                                        <span>Administração</span>
                                    </Link>
                                )}
                                </>
                                ) : (
                                <>
                                    <Link
                                        href="/login"
                                        className="d-block p-2 text-decoration-none text-body small rounded"
                                        onClick={() => setIsUserMenuOpen(false)}
                                    >
                                        Entrar
                                    </Link>
                                    <Link
                                        href="/cadastro"
                                        className="d-block p-2 text-decoration-none text-body small rounded"
                                        onClick={() => setIsUserMenuOpen(false)}
                                    >
                                        Criar conta
                                    </Link>
                                </>
                                )}

                                <button
                                    onClick={toggleTheme}
                                    className="w-100 text-start d-flex align-items-center justify-content-between p-2 btn btn-link text-body text-decoration-none small"
                                >
                                    <div className="d-flex align-items-center gap-2">
                                        {theme === 'light' ? <Moon size={16} /> : <Sun size={16} />}
                                        <span>{theme === 'light' ? 'Modo Escuro' : 'Modo Claro'}</span>
                                    </div>

                                    <div className="form-check form-switch m-0 p-0">
                                        <input
                                        className="form-check-input ms-0"
                                        type="checkbox"
                                        role="switch"
                                        checked={theme === 'dark'}
                                        readOnly
                                        />
                                    </div>

                                    </button>
                                {user && (
                                <>
                                <hr className="my-1" />
                                <button
                                    onClick={() => {
                                        logout();
                                        setIsUserMenuOpen(false);
                                        router.replace('/');
                                    }}
                                    className="w-100 text-start d-flex align-items-center gap-2 p-2 btn btn-link text-danger text-decoration-none small"
                                >
                                    <LogOut size={16} />
                                    <span>Sair</span>
                                </button>
                                </>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
}
