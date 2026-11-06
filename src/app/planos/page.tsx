'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { CheckCircle2, CircleAlert, Layers3, RefreshCw } from 'lucide-react';
import Header from '@/components/Header';
import PlanInformation from '@/components/PlanInformation';
import { useAuth } from '@/contexts/AuthContext';
import { apiRequest } from '@/lib/api';
import { formatPlanDiscount } from '@/lib/plans';
import type { Plan } from '@/lib/plans';
import styles from './page.module.css';

const loginHref = '/login?next=%2Fplanos';

function PlanCard({ plan }: { plan: Plan }) {
    const price = plan.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    const isPro = plan.name.trim().toLowerCase() === 'pro';
    const benefits = [
        `Acesso a até ${plan.maxGames.toLocaleString('pt-BR')} ${plan.maxGames === 1 ? 'jogo' : 'jogos'} do plano`,
        `${formatPlanDiscount(plan)} de desconto na compra de jogos vinculados`,
        'Acesso temporário por 30 dias',
    ];

    return (
        <article className={`${styles.card} ${isPro ? styles.featured : ''} rounded-4 p-4 h-100 d-flex flex-column`} aria-labelledby={`plan-${plan.id}-title`}>
            <h2 id={`plan-${plan.id}-title`} className="fw-bold fs-4 text-break mb-4">{plan.name}</h2>
            <div className="border-bottom border-body-subtle pb-4 mb-4">
                <p className="fw-bold fs-2 text-break mb-1">{price}</p>
                <p className="small text-body-secondary mb-0">por 30 dias</p>
            </div>
            <ul className="list-unstyled d-flex flex-column gap-3 small text-body-secondary mb-4">
                {benefits.map((benefit) => (
                    <li key={benefit} className="d-flex align-items-start gap-2">
                        <CheckCircle2 size={17} className={styles.benefitIcon} aria-hidden="true" />
                        <span>{benefit}</span>
                    </li>
                ))}
            </ul>
            <div className="d-flex flex-column gap-2 mt-auto">
                <Link href={`/planos/${plan.id}/assinar`} className="btn text-white fw-semibold rounded-pill py-2 buy-btn-hover" style={{ backgroundColor: '#7C3AED' }} aria-label={`Assinar ${plan.name}`}>
                    Assinar
                </Link>
                <Link href={`/planos/${plan.id}`} className={`${styles.textLink} btn border-0 rounded-pill small py-2`} aria-label={`Ver jogos do plano ${plan.name}`}>
                    Ver jogos do plano
                </Link>
            </div>
        </article>
    );
}

export default function PlansPage() {
    const { user, isReady } = useAuth();
    const [plans, setPlans] = useState<Plan[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [requestCount, setRequestCount] = useState(0);

    useEffect(() => {
        const controller = new AbortController();

        async function loadPlans() {
            setIsLoading(true);
            setError('');

            try {
                const response = await apiRequest<Plan[]>('/plans', { signal: controller.signal });
                if (!Array.isArray(response)) throw new Error('Resposta de planos inválida.');
                if (!controller.signal.aborted) setPlans([...response].sort((a, b) => a.price - b.price || a.id - b.id));
            } catch {
                if (!controller.signal.aborted) setError('Não foi possível carregar os planos. Tente novamente.');
            } finally {
                if (!controller.signal.aborted) setIsLoading(false);
            }
        }

        loadPlans();
        return () => controller.abort();
    }, [requestCount]);

    return (
        <div className="min-vh-100 bg-body text-body">
            <Header />
            <main className="container-xxl my-4 px-3 px-md-4 pb-5" style={{ paddingTop: '100px', maxWidth: '1360px' }}>
                <div className="mb-4 pb-2">
                    <h1 className="fw-bold fs-2 mb-2">Planos</h1>
                    <p className="text-body-secondary small mb-0">Compare o acesso e os descontos de cada plano. A validade é de 30 dias.</p>
                </div>

                {isReady && !user && (
                    <div className={`${styles.accountNotice} rounded-3 px-3 px-md-4 py-3 d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4`}>
                        <p className="small text-body-secondary mb-0 d-flex align-items-center gap-2">
                            <span style={{ color: '#7C3AED' }} aria-hidden="true">•</span>
                            Entre na sua conta para assinar.
                        </p>
                        <Link href={loginHref} className={`${styles.textLink} text-decoration-none small fw-semibold`}>Entrar</Link>
                    </div>
                )}

                <section aria-label="Planos disponíveis" aria-busy={isLoading} className="mb-4">
                    {isLoading ? (
                        <div className={`${styles.card} rounded-4 p-5 d-flex align-items-center justify-content-center gap-3 text-body-secondary`} role="status">
                            <span className="spinner-border spinner-border-sm flex-shrink-0" style={{ color: '#7C3AED' }} aria-hidden="true" />
                            <span className="small">Carregando planos...</span>
                        </div>
                    ) : error ? (
                        <div className={`${styles.card} rounded-4 p-4 p-md-5 text-center`}>
                            <CircleAlert size={30} className="text-body-secondary mb-3" aria-hidden="true" />
                            <p className="small mb-3" role="alert">{error}</p>
                            <button type="button" onClick={() => setRequestCount((count) => count + 1)} className="btn text-white rounded-3 px-4 d-inline-flex align-items-center gap-2" style={{ backgroundColor: '#7C3AED' }}>
                                <RefreshCw size={16} aria-hidden="true" />
                                Tentar novamente
                            </button>
                        </div>
                    ) : plans.length === 0 ? (
                        <div className={`${styles.card} rounded-4 p-4 p-md-5 text-center`} role="status">
                            <Layers3 size={30} className="text-body-secondary mb-3" aria-hidden="true" />
                            <h2 className="fs-5 fw-semibold mb-2">Nenhum plano disponível</h2>
                            <p className="small text-body-secondary mb-0">Os planos aparecerão aqui quando estiverem disponíveis.</p>
                        </div>
                    ) : (
                        <div className="row g-3 g-xl-4">
                            {plans.map((plan) => <div key={plan.id} className="col-12 col-md-6 col-lg-4"><PlanCard plan={plan} /></div>)}
                        </div>
                    )}
                </section>

                <PlanInformation />
            </main>
        </div>
    );
}
