'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, CheckCircle2, QrCode, RefreshCw } from 'lucide-react';
import Header from '@/components/Header';
import { useAuth } from '@/contexts/AuthContext';
import { ApiError, apiRequest } from '@/lib/api';
import { formatPlanDiscount } from '@/lib/plans';
import type { Plan, PlanSubscription } from '@/lib/plans';
import { saveSubscriptionReceipt } from '@/lib/subscription-receipt';
import styles from '../../page.module.css';

function SubscribeContent({ planId }: { planId: number | null }) {
    const { user } = useAuth();
    const router = useRouter();
    const [plan, setPlan] = useState<Plan | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [notFound, setNotFound] = useState(false);
    const [loadError, setLoadError] = useState('');
    const [requestCount, setRequestCount] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState('');
    const [subscription, setSubscription] = useState<PlanSubscription | null>(null);
    const submitting = useRef(false);

    useEffect(() => {
        const controller = new AbortController();

        async function loadPlan() {
            if (planId === null) {
                setNotFound(true);
                setIsLoading(false);
                return;
            }

            setIsLoading(true);
            setLoadError('');
            setNotFound(false);

            try {
                const response = await apiRequest<Plan>(`/plans/${planId}`, { signal: controller.signal });
                if (!controller.signal.aborted) setPlan(response);
            } catch (error) {
                if (controller.signal.aborted) return;
                if (error instanceof ApiError && error.status === 404) {
                    setNotFound(true);
                } else {
                    setLoadError('Não foi possível carregar o plano. Tente novamente.');
                }
            } finally {
                if (!controller.signal.aborted) setIsLoading(false);
            }
        }

        loadPlan();
        return () => controller.abort();
    }, [planId, requestCount]);

    async function confirmSubscription() {
        if (!plan || !user || submitting.current || subscription) return;
        submitting.current = true;
        setIsSubmitting(true);
        setSubmitError('');

        try {
            const response = await apiRequest<PlanSubscription>(`/plans/${plan.id}/subscribe`, { method: 'POST' });
            setSubscription(response);
            if (saveSubscriptionReceipt(response)) {
                router.replace(`/planos/${plan.id}/confirmado`);
            }
        } catch (error) {
            setSubmitError(error instanceof ApiError && error.status > 0
                ? error.message
                : 'Não foi possível confirmar a assinatura. Tente novamente.');
            submitting.current = false;
        } finally {
            setIsSubmitting(false);
        }
    }

    const selectedPlan = subscription?.plan ?? plan;

    return (
        <div className="min-vh-100 bg-body text-body">
            <Header />
            <main className="container-xxl my-4 px-3 px-md-4 pb-5" style={{ paddingTop: '100px', maxWidth: '1280px' }}>
                <Link href={planId === null ? '/planos' : `/planos/${planId}`} className="d-inline-flex align-items-center gap-2 text-body-secondary text-decoration-none small mb-4">
                    <ArrowLeft size={16} aria-hidden="true" />
                    {selectedPlan ? `Voltar para ${selectedPlan.name}` : 'Voltar para planos'}
                </Link>

                <h1 className="fw-bold fs-2 mb-4 pb-2">Confirmar assinatura</h1>

                {isLoading ? (
                    <div className={`${styles.card} rounded-4 p-5 d-flex align-items-center justify-content-center gap-3 text-body-secondary`} role="status">
                        <span className="spinner-border spinner-border-sm" style={{ color: '#7C3AED' }} aria-hidden="true" />
                        <span className="small">Carregando plano...</span>
                    </div>
                ) : notFound ? (
                    <div className={`${styles.card} rounded-4 p-4 p-md-5 text-center`}>
                        <h2 className="fs-4 fw-bold mb-2">Plano não encontrado</h2>
                        <p className="small text-body-secondary mb-0">Consulte as opções disponíveis na lista de planos.</p>
                    </div>
                ) : loadError ? (
                    <div className={`${styles.card} rounded-4 p-4 p-md-5 text-center`}>
                        <p className="small mb-3" role="alert">{loadError}</p>
                        <button type="button" onClick={() => setRequestCount((count) => count + 1)} className="btn text-white rounded-3 px-4 d-inline-flex align-items-center gap-2" style={{ backgroundColor: '#7C3AED' }}>
                            <RefreshCw size={16} aria-hidden="true" />
                            Tentar novamente
                        </button>
                    </div>
                ) : selectedPlan && (
                    <div className="row g-4 g-xl-5 align-items-start">
                        <div className="col-12 col-lg-7 d-flex flex-column gap-4">
                            <section className={`${styles.card} p-4 rounded-4`} aria-labelledby="subscription-account-title">
                                <div className="d-flex align-items-center justify-content-between gap-3 mb-4">
                                    <h2 id="subscription-account-title" className="fw-bold fs-5 mb-0">Sua conta</h2>
                                    <span className="d-inline-flex align-items-center gap-1 text-success small">
                                        <CheckCircle2 size={15} aria-hidden="true" />
                                        Conectado
                                    </span>
                                </div>
                                <p className="fw-semibold text-break mb-1">{user?.name}</p>
                                <p className="small text-body-secondary text-break mb-3">{user?.email}</p>
                                <p className="small text-body-secondary mb-0">A assinatura será ativada nesta conta.</p>
                            </section>

                            <section className={`${styles.card} p-4 rounded-4`} aria-labelledby="subscription-payment-title">
                                <h2 id="subscription-payment-title" className="fw-bold fs-5 mb-4">Forma de pagamento</h2>
                                <label htmlFor="subscription-pix" className="d-flex align-items-center justify-content-between gap-3 p-3 rounded-3" style={{ backgroundColor: 'rgba(124, 58, 237, 0.05)', border: '1px solid #7C3AED' }}>
                                    <span className="d-flex align-items-center gap-3">
                                        <QrCode size={24} style={{ color: '#7C3AED' }} aria-hidden="true" />
                                        <span className="fw-semibold">Pix</span>
                                    </span>
                                    <input id="subscription-pix" name="paymentMethod" type="radio" value="pix" checked readOnly className="form-check-input m-0" style={{ backgroundColor: '#7C3AED', borderColor: '#7C3AED' }} />
                                </label>
                            </section>
                        </div>

                        <div className="col-12 col-lg-5">
                            <section className={`${styles.card} p-4 rounded-4`} aria-labelledby="subscription-summary-title">
                                <h2 id="subscription-summary-title" className="fw-bold fs-4 mb-4">Resumo da assinatura</h2>
                                <h3 className="fw-semibold fs-5 text-break mb-1">{selectedPlan.name}</h3>
                                <p className="small text-body-secondary mb-4">Validade de 30 dias</p>
                                <ul className="list-unstyled d-flex flex-column gap-3 small text-body-secondary mb-4">
                                    {[
                                        `Acesso temporário a até ${selectedPlan.maxGames.toLocaleString('pt-BR')} ${selectedPlan.maxGames === 1 ? 'jogo vinculado' : 'jogos vinculados'}`,
                                        `${formatPlanDiscount(selectedPlan)} de desconto na compra dos jogos do plano`,
                                    ].map((benefit) => (
                                        <li key={benefit} className="d-flex align-items-start gap-2">
                                            <CheckCircle2 size={17} className={styles.benefitIcon} aria-hidden="true" />
                                            <span>{benefit}</span>
                                        </li>
                                    ))}
                                </ul>

                                <div className="border-top border-bottom border-body-subtle py-3 small text-body-secondary">
                                    <p className="mb-2">{subscription ? `Válida até ${new Date(subscription.expiresAt).toLocaleDateString('pt-BR')}` : 'Ativação após a confirmação.'}</p>
                                    <p className="mb-0">Sem renovação automática.</p>
                                </div>
                                <div className="d-flex align-items-baseline justify-content-between gap-3 my-4">
                                    <span className="fw-bold">Total</span>
                                    <span className="fw-bold fs-3 text-break">{selectedPlan.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                                </div>

                                {subscription ? (
                                    <div>
                                        <p className="text-success fw-semibold d-flex align-items-center gap-2 mb-3" role="status">
                                            <CheckCircle2 size={19} aria-hidden="true" />
                                            Assinatura confirmada
                                        </p>
                                        <Link href={`/planos/${selectedPlan.id}`} className="btn w-100 text-white fw-semibold rounded-pill py-2" style={{ backgroundColor: '#7C3AED' }}>Ver jogos do plano</Link>
                                    </div>
                                ) : (
                                    <>
                                        <button type="button" onClick={confirmSubscription} disabled={isSubmitting} className="btn w-100 text-white fw-semibold rounded-pill py-2" style={{ backgroundColor: '#7C3AED' }}>
                                            {isSubmitting ? 'Confirmando...' : 'Confirmar assinatura'}
                                        </button>
                                        <div className="mt-2" style={{ minHeight: '2.5rem' }} aria-live="polite">
                                            {submitError && <p className="small text-danger mb-0" role="alert">{submitError}</p>}
                                        </div>
                                    </>
                                )}

                                <p className="small text-body-secondary mt-3 mb-2">O acesso aos jogos termina ao expirar. Os jogos comprados permanecem na biblioteca.</p>
                                <p className="small text-body-secondary mb-0">O desconto vale apenas nos jogos vinculados e não acumula com promoções.</p>
                            </section>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}

export default function SubscribePage() {
    const { id } = useParams<{ id: string }>();
    const numericId = Number(id);
    const planId = /^[1-9]\d*$/.test(id) && Number.isSafeInteger(numericId) ? numericId : null;

    return <SubscribeContent key={id} planId={planId} />;
}
