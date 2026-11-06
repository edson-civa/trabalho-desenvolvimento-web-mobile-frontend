'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ArrowLeft, CheckCircle2, CircleAlert, Gamepad2, RefreshCw } from 'lucide-react';
import Header from '@/components/Header';
import PlanGameCard from '@/components/PlanGameCard';
import PlanInformation from '@/components/PlanInformation';
import { useAuth } from '@/contexts/AuthContext';
import { ApiError, apiRequest } from '@/lib/api';
import { formatPlanDiscount } from '@/lib/plans';
import type { Plan, PlanGame } from '@/lib/plans';
import styles from '../page.module.css';

function PlanDetails({ planId }: { planId: number | null }) {
    const { user, isReady } = useAuth();
    const [plan, setPlan] = useState<Plan | null>(null);
    const [games, setGames] = useState<PlanGame[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [notFound, setNotFound] = useState(false);
    const [error, setError] = useState('');
    const [gamesError, setGamesError] = useState('');
    const [requestCount, setRequestCount] = useState(0);

    useEffect(() => {
        const controller = new AbortController();

        async function loadPlan() {
            if (planId === null) {
                setNotFound(true);
                setIsLoading(false);
                return;
            }

            setIsLoading(true);
            setError('');
            setGamesError('');
            setNotFound(false);

            const [planResult, gamesResult] = await Promise.allSettled([
                apiRequest<Plan>(`/plans/${planId}`, { signal: controller.signal }),
                apiRequest<PlanGame[]>(`/plans/${planId}/games`, { signal: controller.signal }),
            ]);

            if (controller.signal.aborted) return;

            if (planResult.status === 'rejected') {
                setPlan(null);
                if (planResult.reason instanceof ApiError && planResult.reason.status === 404) {
                    setNotFound(true);
                } else {
                    setError('Não foi possível carregar o plano. Tente novamente.');
                }
            } else {
                setPlan(planResult.value);
                if (gamesResult.status === 'fulfilled' && Array.isArray(gamesResult.value)) {
                    setGames(gamesResult.value);
                } else {
                    setGamesError('Não foi possível carregar os jogos deste plano. Tente novamente.');
                }
            }

            setIsLoading(false);
        }

        loadPlan();
        return () => controller.abort();
    }, [planId, requestCount]);

    const retryButton = (
        <button type="button" onClick={() => setRequestCount((count) => count + 1)} className="btn text-white rounded-3 px-4 d-inline-flex align-items-center gap-2" style={{ backgroundColor: '#7C3AED' }}>
            <RefreshCw size={16} aria-hidden="true" />
            Tentar novamente
        </button>
    );

    return (
        <div className="min-vh-100 bg-body text-body">
            <Header />
            <main className="container-xxl my-4 px-3 px-md-4 pb-5" style={{ paddingTop: '100px', maxWidth: '1360px' }}>
                <Link href="/planos" className="d-inline-flex align-items-center gap-2 text-body-secondary text-decoration-none small mb-4">
                    <ArrowLeft size={16} aria-hidden="true" />
                    Voltar para planos
                </Link>

                {isLoading ? (
                    <div className={`${styles.card} rounded-4 p-5 d-flex align-items-center justify-content-center gap-3 text-body-secondary`} role="status">
                        <span className="spinner-border spinner-border-sm flex-shrink-0" style={{ color: '#7C3AED' }} aria-hidden="true" />
                        <span className="small">Carregando plano...</span>
                    </div>
                ) : notFound ? (
                    <div className={`${styles.card} rounded-4 p-4 p-md-5 text-center`}>
                        <h1 className="fs-4 fw-bold mb-2">Plano não encontrado</h1>
                        <p className="small text-body-secondary mb-0">Esse plano não está disponível. Consulte as opções na lista de planos.</p>
                    </div>
                ) : error ? (
                    <div className={`${styles.card} rounded-4 p-4 p-md-5 text-center`}>
                        <CircleAlert size={30} className="text-body-secondary mb-3" aria-hidden="true" />
                        <p className="small mb-3" role="alert">{error}</p>
                        {retryButton}
                    </div>
                ) : plan && (
                    <>
                        <section className={`${styles.card} rounded-4 p-4 p-md-5 mb-4`} aria-labelledby="plan-title">
                            <div className="row g-4 align-items-center">
                                <div className="col-12 col-lg-8">
                                    <h1 id="plan-title" className="fw-bold fs-2 text-break mb-3">Plano {plan.name}</h1>
                                    <ul className="list-unstyled d-flex flex-column gap-3 small text-body-secondary mb-0">
                                        {[
                                            `Acesso temporário a até ${plan.maxGames.toLocaleString('pt-BR')} ${plan.maxGames === 1 ? 'jogo vinculado' : 'jogos vinculados'}`,
                                            `${formatPlanDiscount(plan)} de desconto na compra dos jogos do plano`,
                                            'O acesso termina após 30 dias. Os jogos comprados permanecem na sua biblioteca.',
                                        ].map((benefit) => (
                                            <li key={benefit} className="d-flex align-items-start gap-2">
                                                <CheckCircle2 size={17} className={styles.benefitIcon} aria-hidden="true" />
                                                <span>{benefit}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                                <div className="col-12 col-lg-4">
                                    <div className="mx-lg-auto" style={{ maxWidth: '320px' }}>
                                        <p className="fw-bold fs-2 text-break mb-1">{plan.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
                                        <p className="small text-body-secondary mb-3">por 30 dias</p>
                                        <Link href={`/planos/${plan.id}/assinar`} className="btn text-white fw-semibold rounded-pill w-100 py-2 buy-btn-hover" style={{ backgroundColor: '#7C3AED' }} aria-label={`Assinar ${plan.name}`}>Assinar</Link>
                                        <p className="small text-body-secondary mt-2 mb-0">Sem renovação automática.</p>
                                    </div>
                                </div>
                            </div>
                        </section>

                        {isReady && !user && (
                            <div className={`${styles.accountNotice} rounded-3 px-3 px-md-4 py-3 d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4`}>
                                <p className="small text-body-secondary mb-0">Entre na sua conta para assinar.</p>
                                <Link href={`/login?next=${encodeURIComponent(`/planos/${plan.id}`)}`} className={`${styles.textLink} text-decoration-none small fw-semibold`}>Entrar</Link>
                            </div>
                        )}

                        <section aria-labelledby="plan-games-title" className="mb-4">
                            <div className="mb-4">
                                <div className="d-flex flex-wrap align-items-center gap-3 mb-2">
                                    <h2 id="plan-games-title" className="fs-4 fw-bold mb-0">Jogos do plano</h2>
                                    {!gamesError && <span className="badge rounded-pill fw-normal" style={{ color: '#7C3AED', backgroundColor: 'rgba(124, 58, 237, 0.09)' }}>{games.length} {games.length === 1 ? 'jogo' : 'jogos'}</span>}
                                </div>
                                <p className="small text-body-secondary mb-1">O acesso é válido durante a assinatura. O preço “Com este plano” é para comprar e manter o jogo na biblioteca.</p>
                                <p className="small text-body-secondary mb-0">Na compra, vale o maior desconto entre o plano e a promoção da loja.</p>
                            </div>

                            {gamesError ? (
                                <div className={`${styles.card} rounded-4 p-4 p-md-5 text-center`}>
                                    <p className="small mb-3" role="alert">{gamesError}</p>
                                    {retryButton}
                                </div>
                            ) : games.length === 0 ? (
                                <div className={`${styles.card} rounded-4 p-4 p-md-5 text-center`} role="status">
                                    <Gamepad2 size={30} className="text-body-secondary mb-3" aria-hidden="true" />
                                    <h3 className="fs-5 fw-semibold mb-2">Nenhum jogo vinculado a este plano</h3>
                                    <p className="small text-body-secondary mb-0">Os jogos aparecerão aqui quando forem adicionados ao catálogo do plano.</p>
                                </div>
                            ) : (
                                <div className="row g-3 g-xl-4">
                                    {games.map((entry) => (
                                        <div key={entry.gameId} className="col-12 col-sm-6 col-lg-3">
                                            <PlanGameCard game={entry.game} plan={plan} />
                                        </div>
                                    ))}
                                </div>
                            )}
                        </section>

                        <PlanInformation />
                    </>
                )}
            </main>
        </div>
    );
}

export default function PlanDetailPage() {
    const { id } = useParams<{ id: string }>();
    const numericId = Number(id);
    const planId = /^[1-9]\d*$/.test(id) && Number.isSafeInteger(numericId) ? numericId : null;

    return <PlanDetails key={id} planId={planId} />;
}
