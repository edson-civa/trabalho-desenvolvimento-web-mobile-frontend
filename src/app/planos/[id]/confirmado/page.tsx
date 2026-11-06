'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { CheckCircle2 } from 'lucide-react';
import Header from '@/components/Header';
import { useAuth } from '@/contexts/AuthContext';
import { formatPlanDiscount } from '@/lib/plans';
import type { PlanSubscription } from '@/lib/plans';
import { getSubscriptionReceipt } from '@/lib/subscription-receipt';
import styles from '../../page.module.css';

function ConfirmationContent({ planId }: { planId: number | null }) {
    const { user } = useAuth();
    const [subscription, setSubscription] = useState<PlanSubscription | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        setSubscription(user && planId !== null ? getSubscriptionReceipt(user.sub, planId) : null);
        setIsLoading(false);
    }, [user, planId]);

    const formatDate = (value: string) => new Date(value).toLocaleDateString('pt-BR');
    const plan = subscription?.plan;

    return (
        <div className="min-vh-100 bg-body text-body">
            <Header />
            <main className="container-xxl my-4 px-3 px-md-4 pb-5" style={{ paddingTop: '100px' }}>
                <section className={`${styles.card} rounded-4 p-4 p-md-5 mx-auto`} style={{ maxWidth: '800px' }} aria-labelledby="subscription-confirmed-title">
                    {isLoading ? (
                        <p className="small text-body-secondary text-center mb-0" role="status">Carregando confirmação...</p>
                    ) : subscription && subscription.userId === user?.sub && plan ? (
                        <>
                            <div className="d-flex align-items-center justify-content-center rounded-circle mb-4" style={{ width: '44px', height: '44px', backgroundColor: 'rgba(124, 58, 237, 0.09)', color: '#7C3AED' }}>
                                <CheckCircle2 size={24} aria-hidden="true" />
                            </div>
                            <h1 id="subscription-confirmed-title" className="fw-bold fs-2 mb-4">Assinatura confirmada</h1>

                            <dl className="row g-3 mb-0 pb-4 border-bottom border-body-subtle">
                                <div className="col-12 col-sm-4">
                                    <dt className="small text-body-secondary fw-normal mb-2">Plano</dt>
                                    <dd className="fw-semibold text-break mb-0">{plan.name}</dd>
                                </div>
                                <div className="col-12 col-sm-4">
                                    <dt className="small text-body-secondary fw-normal mb-2">Valor da assinatura</dt>
                                    <dd className="fw-semibold text-break mb-0">{plan.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</dd>
                                </div>
                                <div className="col-12 col-sm-4">
                                    <dt className="small text-body-secondary fw-normal mb-2">Período</dt>
                                    <dd className="fw-semibold mb-0">30 dias</dd>
                                </div>
                            </dl>

                            <dl className="row g-3 my-0 py-4">
                                <div className="col-12 col-sm-6">
                                    <dt className="small text-body-secondary fw-normal mb-2">Ativada em</dt>
                                    <dd className="fw-semibold mb-0"><time dateTime={subscription.startedAt}>{formatDate(subscription.startedAt)}</time></dd>
                                </div>
                                <div className="col-12 col-sm-6">
                                    <dt className="small text-body-secondary fw-normal mb-2">Válida até</dt>
                                    <dd className="fw-semibold mb-0"><time dateTime={subscription.expiresAt}>{formatDate(subscription.expiresAt)}</time></dd>
                                </div>
                            </dl>

                            <h2 className="small fw-semibold mb-2">Benefícios do {plan.name}</h2>
                            <p className="small text-body-secondary mb-2">Acesso temporário a até {plan.maxGames.toLocaleString('pt-BR')} {plan.maxGames === 1 ? 'jogo vinculado' : 'jogos vinculados'} e {formatPlanDiscount(plan).toLowerCase()} de desconto na compra dos jogos do plano.</p>
                            <p className="small text-body-secondary mb-4">Na compra, vale o maior desconto entre o plano e a promoção da loja. O acesso termina ao expirar; os jogos comprados permanecem na biblioteca.</p>

                            <div className="row g-3">
                                <div className="col-12 col-sm-6">
                                    <Link href={`/planos/${plan.id}`} className="btn w-100 text-white fw-semibold rounded-pill py-2 buy-btn-hover" style={{ backgroundColor: '#7C3AED' }}>Ver jogos do plano</Link>
                                </div>
                                <div className="col-12 col-sm-6">
                                    <Link href="/biblioteca" className={`${styles.textLink} btn w-100 fw-semibold rounded-pill py-2`} style={{ backgroundColor: 'rgba(124, 58, 237, 0.09)' }}>Ir para a biblioteca</Link>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="text-center">
                            <h1 id="subscription-confirmed-title" className="fw-bold fs-4 mb-3">Confirmação indisponível</h1>
                            <p className="small text-body-secondary mb-4">Não encontramos os dados desta confirmação na sua sessão.</p>
                            <Link href="/planos" className="btn text-white fw-semibold rounded-pill px-4 py-2" style={{ backgroundColor: '#7C3AED' }}>Ver planos</Link>
                        </div>
                    )}
                </section>
            </main>
        </div>
    );
}

export default function SubscriptionConfirmedPage() {
    const { id } = useParams<{ id: string }>();
    const numericId = Number(id);
    const planId = /^[1-9]\d*$/.test(id) && Number.isSafeInteger(numericId) ? numericId : null;

    return <ConfirmationContent key={id} planId={planId} />;
}
