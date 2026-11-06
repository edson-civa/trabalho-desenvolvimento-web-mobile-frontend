'use client';

import { useRef, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, CheckCircle2, ImageOff, LockKeyhole, QrCode } from 'lucide-react';
import Header from '@/components/Header';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/hooks/useCart';
import { apiRequest, ApiError } from '@/lib/api';
import { readCartIds, writeCartIds } from '@/lib/cart';
import { formatCurrency } from '@/lib/games';
import ApiState from '@/components/ApiState';

interface PurchaseResult {
    id: number;
    totalPrice: number;
    purchases: { gameId: number; acquisitionPrice: number; discount: number; game: { name: string } }[];
}

export default function CheckoutPage() {
    const { user } = useAuth();
    const { items: cartItems, loading, error: cartError, notice, subtotal, total, discount, estimated, retry } = useCart();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState('');
    const [purchase, setPurchase] = useState<PurchaseResult | null>(null);
    const [cartNotice, setCartNotice] = useState('');
    const submitting = useRef(false);

    async function confirmPurchase() {
        if (!user || loading || !cartItems.length || submitting.current || purchase) return;
        submitting.current = true;
        setIsSubmitting(true);
        setSubmitError('');
        try {
            const response = await apiRequest<PurchaseResult>('/purchases', { method: 'POST', body: { items: cartItems.map((game) => ({ gameId: game.id })) } });
            setPurchase(response);
            const boughtIds = new Set(response.purchases.map((entry) => entry.gameId));
            try { writeCartIds(readCartIds().filter((id) => !boughtIds.has(id))); }
            catch { setCartNotice('Compra confirmada. Não foi possível atualizar o carrinho neste navegador.'); }
        } catch (error) {
            setSubmitError(error instanceof ApiError ? error.message : 'Não foi possível concluir a compra. Tente novamente.');
            submitting.current = false;
            if (error instanceof ApiError && error.status === 409) retry();
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <div className="min-vh-100 bg-body text-body">
            <Header />

            <main className="container-xxl my-4 px-3 px-md-4 pb-5" style={{ paddingTop: '100px', maxWidth: '1280px' }}>
                <Link
                    href="/carrinho"
                    className="text-body-secondary text-decoration-none small d-inline-flex align-items-center gap-2 mb-4"
                >
                    <ArrowLeft size={16} />
                    Voltar para o carrinho
                </Link>

                <h1 className="fw-bold fs-2 text-body mb-4 pb-2">Confirmar compra</h1>
                {!purchase && notice && <p className="small text-body-secondary" role="status">{notice}</p>}

                {purchase ? (
                    <section className="p-4 p-md-5 rounded-4 bg-body-tertiary border border-body-subtle mx-auto" style={{ maxWidth: '800px' }}>
                        <CheckCircle2 size={32} className="text-success mb-3" aria-hidden="true" />
                        <h2 className="fw-bold fs-3 mb-2" role="status">Compra confirmada</h2>
                        <p className="small text-body-secondary mb-4">Pedido #{purchase.id}</p>
                        <ul className="list-unstyled mb-4">
                            {purchase.purchases.map((entry) => <li key={entry.gameId} className="d-flex justify-content-between gap-3 border-bottom border-body-subtle py-3"><span>{entry.game.name}</span><span className="fw-semibold text-nowrap">{formatCurrency(entry.acquisitionPrice - entry.discount)}</span></li>)}
                        </ul>
                        <p className="small text-body-secondary">Desconto: {formatCurrency(purchase.purchases.reduce((sum, entry) => sum + entry.discount, 0))}</p>
                        <p className="d-flex justify-content-between fw-bold fs-4 mb-4"><span>Total</span><span>{formatCurrency(purchase.totalPrice)}</span></p>
                        {cartNotice && <p className="small text-body-secondary">{cartNotice}</p>}
                        <Link href="/biblioteca" className="btn w-100 text-white fw-semibold rounded-pill py-2" style={{ backgroundColor: '#7C3AED' }}>Ir para a biblioteca</Link>
                    </section>
                ) : loading ? (
                    <p className="text-body-secondary py-4" role="status">Carregando pedido...</p>
                ) : cartError ? (
                    <ApiState message={cartError} onRetry={retry} />
                ) : cartItems.length === 0 ? (
                    <div className="text-center p-5 rounded-4 bg-body-tertiary border border-body-subtle">
                        <h2 className="fs-4 fw-bold mb-4">Seu carrinho está vazio</h2>
                        <Link
                            href="/"
                            className="btn text-white fw-semibold rounded-3 py-2 px-4"
                            style={{ backgroundColor: '#7C3AED' }}
                        >
                            Voltar para a loja
                        </Link>
                    </div>
                ) : (
                    <div className="row g-4 g-xl-5 align-items-start">
                        <div className="col-12 col-lg-7 d-flex flex-column gap-4">
                            <section className="p-4 rounded-4 bg-body-tertiary border border-body-subtle shadow-sm" aria-labelledby="account-title">
                                <div className="d-flex align-items-center justify-content-between gap-3 mb-4">
                                    <h2 id="account-title" className="fw-bold fs-5 mb-0">Sua conta</h2>
                                    <span className="d-inline-flex align-items-center gap-1 text-success small">
                                        <CheckCircle2 size={15} aria-hidden="true" />
                                        Conectado
                                    </span>
                                </div>
                                <p className="fw-semibold text-break mb-1">{user?.name}</p>
                                <p className="text-body-secondary small text-break mb-0">{user?.email}</p>
                            </section>

                            <section className="p-4 rounded-4 bg-body-tertiary border border-body-subtle shadow-sm" aria-labelledby="payment-title">
                                <h2 id="payment-title" className="fw-bold fs-5 mb-4">Forma de pagamento</h2>

                                <label
                                    htmlFor="payment-pix"
                                    className="d-flex align-items-center justify-content-between gap-3 p-3 rounded-3 w-100"
                                    style={{ backgroundColor: 'rgba(124, 58, 237, 0.05)', border: '1px solid #7C3AED' }}
                                >
                                    <span className="d-flex align-items-center gap-3">
                                        <QrCode size={24} style={{ color: '#7C3AED' }} aria-hidden="true" />
                                        <span className="fw-semibold">Pix</span>
                                    </span>
                                    <span className="d-flex align-items-center gap-3">
                                        <input
                                            id="payment-pix"
                                            name="paymentMethod"
                                            type="radio"
                                            value="pix"
                                            className="form-check-input m-0"
                                            style={{ backgroundColor: '#7C3AED', borderColor: '#7C3AED' }}
                                            checked
                                            readOnly
                                        />
                                    </span>
                                </label>
                            </section>
                        </div>

                        <div className="col-12 col-lg-5">
                            <section className="p-4 rounded-4 bg-body-tertiary border border-body-subtle shadow-sm" aria-labelledby="summary-title">
                                <h2 id="summary-title" className="fw-bold fs-4 mb-4">Resumo do pedido</h2>

                                <ul className="list-unstyled d-flex flex-column gap-4 mb-0">
                                    {cartItems.map((item) => (
                                        <li key={item.id} className="d-flex align-items-center gap-3 pb-4 border-bottom border-body-subtle">
                                            <div
                                                className="position-relative bg-body rounded-3 overflow-hidden flex-shrink-0 d-flex align-items-center justify-content-center"
                                                style={{ width: '64px', height: '96px' }}
                                            >
                                                <ImageOff size={22} className="text-body-secondary" aria-hidden="true" />
                                                {(item.imageUrl || item.screenshots?.[0]) && (
                                                    <img
                                                        src={item.imageUrl || item.screenshots?.[0]}
                                                        alt={item.title}
                                                        className="position-absolute top-0 start-0 w-100 h-100 object-fit-cover"
                                                        onError={(event) => { event.currentTarget.style.display = 'none'; }}
                                                    />
                                                )}
                                            </div>
                                            <div className="flex-grow-1" style={{ minWidth: 0 }}>
                                                <h3 className="fw-semibold fs-6 text-break mb-2">{item.title}</h3>
                                                <span className="fw-bold text-nowrap">{item.price}</span>
                                            </div>
                                        </li>
                                    ))}
                                </ul>

                                <div className="d-flex justify-content-between small mt-4"><span>Subtotal</span><span>{formatCurrency(subtotal)}</span></div>
                                <div className="d-flex justify-content-between small mt-2 text-body-secondary"><span>Descontos</span><span>{formatCurrency(discount)}</span></div>
                                <div className="d-flex justify-content-between align-items-baseline gap-3 my-4">
                                    <span className="fw-bold fs-5">Total</span>
                                    <span className="fw-bold fs-3 text-nowrap">{formatCurrency(total)}</span>
                                </div>

                                <button
                                    type="button"
                                    className="btn w-100 text-white fw-semibold rounded-3 py-3 d-flex align-items-center justify-content-center gap-2"
                                    style={{ backgroundColor: '#7C3AED' }}
                                    disabled={isSubmitting}
                                    onClick={confirmPurchase}
                                >
                                    <LockKeyhole size={17} aria-hidden="true" />
                                    {isSubmitting ? 'Confirmando...' : 'Confirmar compra'}
                                </button>
                                {submitError && <p className="small text-danger mt-3 mb-0" role="alert">{submitError}</p>}
                                {estimated && <p className="small text-body-secondary mt-3 mb-0">O desconto do plano varia. O total final será mostrado após concluir a compra.</p>}
                            </section>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
