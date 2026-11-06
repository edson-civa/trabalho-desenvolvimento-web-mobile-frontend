'use client';

import { useState, useEffect, useRef } from 'react';
import Header from '@/components/Header';
import { Download, Play, MoreHorizontal, Search, ImageOff, RefreshCw } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { apiRequest } from '@/lib/api';
import { buildLibrary, formatLibraryHours } from '@/lib/library';
import type { LibraryItem, LibraryResponse, PlanLibraryGame } from '@/lib/library';
import Link from 'next/link';

export default function LibraryPage() {
    const { user } = useAuth();
    const [games, setGames] = useState<LibraryItem[]>([]);
    const [totalHoursPlayed, setTotalHoursPlayed] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [loadError, setLoadError] = useState('');
    const [requestCount, setRequestCount] = useState(0);
    const downloadInterval = useRef<ReturnType<typeof setInterval> | null>(null);
    const [downloadingId, setDownloadingId] = useState<number | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [openMenuId, setOpenMenuId] = useState<number | null>(null);
    const [notification, setNotification] = useState<{
        message: string;
    } | null>(null);

    useEffect(() => {
        if (!user) return;
        let controller: AbortController | null = null;
        setIsLoading(true);

        async function loadLibrary() {
            controller?.abort();
            const request = new AbortController();
            controller = request;

            try {
                const [libraries, planGames] = await Promise.all([
                    apiRequest<LibraryResponse[]>('/libraries', { signal: request.signal }),
                    apiRequest<PlanLibraryGame[]>('/plans/me/games', { signal: request.signal }),
                ]);
                if (request.signal.aborted) return;
                if (!Array.isArray(libraries) || !Array.isArray(planGames)) throw new Error('Biblioteca inválida.');

                const library = buildLibrary(libraries, planGames);
                setGames((current) => library.games.map((game) => {
                    const previous = current.find((entry) => entry.id === game.id);
                    return { ...game, installed: previous?.installed ?? false, downloadProgress: previous?.downloadProgress };
                }));
                setTotalHoursPlayed(library.totalHoursPlayed);
                setLoadError('');
            } catch {
                if (!request.signal.aborted) setLoadError('Não foi possível carregar sua biblioteca. Tente novamente.');
            } finally {
                if (!request.signal.aborted) setIsLoading(false);
            }
        }

        loadLibrary();
        const refreshLibrary = () => { if (document.visibilityState === 'visible') loadLibrary(); };
        window.addEventListener('focus', refreshLibrary);
        const refreshInterval = window.setInterval(refreshLibrary, 60000);

        return () => {
            controller?.abort();
            window.removeEventListener('focus', refreshLibrary);
            window.clearInterval(refreshInterval);
        };
    }, [user?.sub, requestCount]);

    useEffect(() => () => {
        if (downloadInterval.current !== null) clearInterval(downloadInterval.current);
    }, []);

    useEffect(() => {
        if (!notification) return;

        const timeout = window.setTimeout(() => {
            setNotification(null);
        }, 4000);

        return () => window.clearTimeout(timeout);
    }, [notification]);

    useEffect(() => {
        if (openMenuId === null) return;

        const handleOutsideClick = (event: MouseEvent) => {
            const target = event.target;

            if (
                target instanceof Element &&
                !target.closest('[data-library-menu]')
            ) {
                setOpenMenuId(null);
            }
        };

        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                setOpenMenuId(null);
            }
        };

        document.addEventListener('click', handleOutsideClick);
        document.addEventListener('keydown', handleKeyDown);

        return () => {
            document.removeEventListener('click', handleOutsideClick);
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [openMenuId]);


    const handleInstall = (gameId: number) => {
        if (downloadInterval.current !== null) return;
        setDownloadingId(gameId);

        setGames((prev) =>
            prev.map((g) => (g.id === gameId ? { ...g, downloadProgress: 0 } : g))
        );

        let progress = 0;
        const interval = setInterval(() => {
            progress += 20;
            if (progress >= 100) {
                clearInterval(interval);
                downloadInterval.current = null;
                setDownloadingId(null);
                setGames((prev) =>
                    prev.map((g) =>
                        g.id === gameId ? { ...g, installed: true, downloadProgress: undefined } : g
                    )
                );
            } else {
                setGames((prev) =>
                    prev.map((g) =>
                        g.id === gameId ? { ...g, downloadProgress: progress } : g
                    )
                );
            }
        }, 400);
        downloadInterval.current = interval;
    };

    const normalizeText = (value: string) => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
    const filteredGames = games.filter((g) =>
        normalizeText(g.title).includes(normalizeText(searchTerm.trim()))
    );

    return (
        <div className="min-vh-100 bg-body text-body">
            <Header />

            {notification && (
                <div
                    role="status"
                    className="position-fixed bottom-0 end-0 m-3 p-3 rounded-3
                        bg-body-tertiary border border-body-subtle shadow
                        d-flex align-items-center gap-3"
                    style={{ zIndex: 1080, maxWidth: 'calc(100vw - 2rem)' }}
                >
                    <span>{notification.message}</span>

                    <button
                        type="button"
                        className="btn-close flex-shrink-0"
                        aria-label="Fechar notificação"
                        onClick={() => setNotification(null)}
                    />
                </div>
            )}

            <main className="container-xxl my-4 px-3 px-md-4" style={{ paddingTop: '90px' }}>

                <div
                    className="p-4 p-md-5 rounded-4 mb-5 shadow-sm bg-body-tertiary border border-body-subtle d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-4"
                >
                    <div>
                        <span className="text-uppercase tracking-wider extra-small text-body-secondary fw-semibold">
                            Sua coleção
                        </span>
                        <h1 className="fw-bold fs-1 mb-0 text-body">Biblioteca</h1>
                    </div>

                    <div className="d-flex gap-4 gap-md-5 align-items-center">
                        <div>
                            <div className="fs-2 fw-bold text-body">{isLoading || loadError ? '—' : games.length}</div>
                            <div className="extra-small text-body-secondary">Jogos</div>
                        </div>
                        <div className="border-end border-body-subtle" style={{ height: '35px' }} />
                        <div>
                            <div className="fs-2 fw-bold text-body">{isLoading || loadError ? '—' : `${totalHoursPlayed.toLocaleString('pt-BR', { maximumFractionDigits: 2 })} h`}</div>
                            <div className="extra-small text-body-secondary">Tempo jogado</div>
                            <div className="small text-body-secondary">Nos jogos comprados</div>
                        </div>
                    </div>
                </div>

                <div className="d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-3 mb-4">
                    <div>
                        <span className="text-uppercase tracking-wider extra-small text-body-secondary fw-semibold">
                            Todos os jogos
                        </span>
                        <h2 className="fw-bold fs-3 text-body mb-0">Sua coleção</h2>
                    </div>

                    <div className="position-relative style-search" style={{ minWidth: '240px' }}>
                        <Search size={16} className="position-absolute top-50 start-0 translate-middle-y ms-3 text-body-secondary" />
                        <input
                            type="search"
                            aria-label="Buscar na biblioteca"
                            className="form-control ps-5 bg-body-tertiary border-body-subtle text-body rounded-3"
                            placeholder="Buscar na biblioteca..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <div className="row g-4">
                    {isLoading ? (
                        <div className="col-12">
                            <div className="text-center p-5 rounded-4 bg-body-tertiary border border-body-subtle" role="status">
                                <span className="spinner-border spinner-border-sm me-2" style={{ color: '#7C3AED' }} aria-hidden="true" />
                                Carregando biblioteca...
                            </div>
                        </div>
                    ) : loadError ? (
                        <div className="col-12">
                            <div className="text-center p-5 rounded-4 bg-body-tertiary border border-body-subtle">
                                <p role="alert">{loadError}</p>
                                <button type="button" onClick={() => setRequestCount((count) => count + 1)} className="btn text-white rounded-3 px-4 d-inline-flex align-items-center gap-2" style={{ backgroundColor: '#7C3AED' }}>
                                    <RefreshCw size={16} aria-hidden="true" />
                                    Tentar novamente
                                </button>
                            </div>
                        </div>
                    ) : filteredGames.length === 0 && (
                        <div className="col-12">
                            <div
                                role="status"
                                className="text-center p-5 rounded-4
                                    bg-body-tertiary border border-body-subtle"
                            >
                                <Search
                                    size={32}
                                    className="text-body-secondary mb-3"
                                    aria-hidden="true"
                                />

                                <h3 className="fs-5 fw-semibold">
                                    {searchTerm.trim()
                                        ? `Nenhum jogo encontrado para “${searchTerm}”.`
                                        : 'Sua biblioteca ainda está vazia.'}
                                </h3>

                                <p className="text-body-secondary mb-0">
                                    {searchTerm.trim()
                                        ? 'Tente buscar por outro nome.'
                                        : 'Os jogos comprados e os acessos dos seus planos aparecerão aqui.'}
                                </p>
                            </div>
                        </div>
                    )}

                    {!isLoading && !loadError && filteredGames.map((game) => (
                        <div key={game.id} className="col-12 col-xl-6">
                            <div className="p-3 p-sm-4 rounded-4 bg-body-tertiary border border-body-subtle shadow-sm h-100 d-flex flex-column flex-sm-row gap-3">

                                <div className="position-relative rounded-3 overflow-hidden bg-body flex-shrink-0 d-flex align-items-center justify-content-center" style={{ width: '112px', height: '168px' }}>
                                    <ImageOff size={28} className="text-body-secondary" aria-hidden="true" />
                                    {game.imageUrl && <img key={game.imageUrl} src={game.imageUrl} alt="" className="position-absolute top-0 start-0 w-100 h-100 object-fit-cover" onError={(event) => { event.currentTarget.style.display = 'none'; }} />}
                                </div>

                                <div className="flex-grow-1 d-flex flex-column justify-content-between" style={{ minWidth: 0 }}>
                                    <div>
                                        <div className="d-flex justify-content-between align-items-start mb-1">
                                            <div>
                                                <h3 className="fw-bold fs-5 text-body text-break mb-0">{game.title}</h3>
                                                <span className="text-body-secondary extra-small">{game.category}</span>
                                                <div className="mt-2">
                                                    <span className={`badge rounded-pill fw-normal ${game.access === 'PURCHASED' ? 'bg-success-subtle text-success' : ''}`} style={game.access === 'PLAN' ? { backgroundColor: 'rgba(124, 58, 237, 0.09)', color: '#7C3AED' } : undefined}>
                                                        {game.access === 'PLAN' ? 'Plano' : 'Comprado'}
                                                    </span>
                                                </div>
                                            </div>
                                            {game.installed && (
                                                <span className="badge bg-primary-subtle text-primary extra-small rounded-pill px-2 py-1">
                                                    INSTALADO
                                                </span>
                                            )}
                                        </div>

                                        <div className="d-flex justify-content-between text-center my-3 py-2 bg-body rounded-3 border border-body-subtle px-2">
                                            <div>
                                                <div className="fw-bold text-body small">{formatLibraryHours(game.timePlayed)}</div>
                                                <div className="extra-small text-body-secondary">Jogados</div>
                                            </div>
                                            <div>
                                                <div className="fw-bold text-body small">—</div>
                                                <div className="extra-small text-body-secondary">Última sessão</div>
                                            </div>
                                            <div>
                                                <div className="fw-bold text-body small">0%</div>
                                                <div className="extra-small text-body-secondary">Conquistas</div>
                                            </div>
                                        </div>
                                    </div>

                                    {game.downloadProgress !== undefined && (
                                        <div className="progress mb-2" style={{ height: '6px' }}>
                                            <div
                                                className="progress-bar progress-bar-striped progress-bar-animated"
                                                style={{ width: `${game.downloadProgress}%`, backgroundColor: '#7C3AED' }}
                                            />
                                        </div>
                                    )}

                                    <div className="d-flex align-items-center gap-2">
                                        {game.installed ? (
                                            <button
                                                type="button"
                                                onClick={() => setNotification({
                                                    message: 'Jogar está indisponível no momento.',
                                                })}
                                                className="btn w-100 py-2 rounded-3 fw-bold text-white d-flex align-items-center justify-content-center gap-2 buy-btn-hover"
                                                style={{ backgroundColor: '#7C3AED' }}
                                            >
                                                <Play size={16} fill="white" />
                                                Jogar
                                            </button>
                                        ) : (
                                            <button
                                                onClick={() => handleInstall(game.id)}
                                                disabled={downloadingId !== null}
                                                className="btn w-100 py-2 rounded-3 fw-semibold bg-body border border-body-subtle text-body d-flex align-items-center justify-content-center gap-2 hover-bg-tertiary"
                                            >
                                                <Download size={16} />
                                                {downloadingId === game.id
                                                    ? `Baixando... ${game.downloadProgress}%`
                                                    : 'Baixar'}
                                            </button>
                                        )}

                                        <div
                                            className="position-relative flex-shrink-0"
                                            data-library-menu
                                        >
                                            <button
                                                type="button"
                                                className="btn btn-outline-secondary p-2 rounded-3 border-body-subtle d-flex align-items-center justify-content-center"
                                                aria-label={`Opções de ${game.title}`}
                                                aria-expanded={openMenuId === game.id}
                                                aria-controls={`game-options-${game.id}`}
                                                onClick={() => setOpenMenuId((currentId) =>
                                                    currentId === game.id ? null : game.id
                                                )}
                                            >
                                                <MoreHorizontal size={18} />
                                            </button>

                                            {openMenuId === game.id && (
                                                <div
                                                    id={`game-options-${game.id}`}
                                                    className="position-absolute end-0 top-100 mt-2 p-2 rounded-3 bg-body border border-body-subtle shadow"
                                                    style={{ zIndex: 10, minWidth: '190px' }}
                                                >
                                                    <Link
                                                        href={`/jogo/${game.id}`}
                                                        className="btn btn-outline-secondary border-0 w-100 text-start text-body text-nowrap"
                                                        onClick={() => setOpenMenuId(null)}
                                                    >
                                                        Ver jogo na loja
                                                    </Link>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                </div>

                            </div>
                        </div>
                    ))}
                </div>

            </main>
        </div>
    );
}
