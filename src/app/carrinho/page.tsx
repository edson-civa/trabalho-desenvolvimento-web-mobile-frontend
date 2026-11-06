'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Trash2, ArrowLeft, ShieldCheck } from 'lucide-react';
import Header from '@/components/Header';
import ApiState from '@/components/ApiState';
import { useCart } from '@/hooks/useCart';
import { formatCurrency } from '@/lib/games';

export default function CartPage() {
    const router = useRouter();
    const { items: cartItems, loading, error, notice, subtotal, total, discount, estimated, retry, remove } = useCart();
    const [removeError, setRemoveError] = useState('');
    const handleRemoveItem = (id: number) => {
        try { remove(id); setRemoveError(''); }
        catch { setRemoveError('Não foi possível remover o jogo. Tente novamente.'); }
    };
    const handleProceedToCheckout = () => router.push('/checkout');

    if (loading || error) return <div className="min-vh-100 bg-body text-body"><Header /><main className="container my-4" style={{ paddingTop: '100px' }}><ApiState loading={loading} message={loading ? 'Carregando carrinho...' : error} onRetry={error ? retry : undefined} /></main></div>;

    return (
        <div className='min-vh-100 bg-body text-body'>

            <Header />

            <main className="container-xxl my-4 px-3 px-md-4" style={{ paddingTop: '90px' }}>
                {notice && <p className="small text-body-secondary" role="status">{notice}</p>}
                {removeError && <p className="small text-danger" role="alert">{removeError}</p>}

                {/* Botão de voltar */}
                <div className="mb-3">
                    <Link
                        href="/"
                        className="text-body-secondary text-decoration-none small d-inline-flex align-items-center gap-1 hover-opacity"
                    >
                        <ArrowLeft size={16} />
                        Voltar para a loja
                    </Link>
                </div>

                <div className="mb-4">
                    <h1 className="fw-bold fs-2 text-body mb-1">Seu carrinho</h1>
                    <p className="text-body-secondary mb-0">
                        Confira seus jogos antes de continuar para a confirmação.
                    </p>
                    {cartItems.length === 0 ? (
                        /* Estado Vazio */
                        <div className="p-5 text-center bg-body-tertiary rounded-4 border border-body my-4">
                            <h2 className="fs-4 fw-bold text-body mb-2">Seu carrinho está vazio</h2>
                            <p className="text-body-secondary mb-4">
                                Você ainda não adicionou nenhum jogo ao seu carrinho.
                            </p>
                            <Link
                                href="/"
                                className="btn py-2 px-4 rounded-3 fw-bold text-white"
                                style={{ backgroundColor: '#7C3AED' }}
                            >
                                Explorar Loja
                            </Link>
                        </div>
                    ) : (
                        /* Grid Principal do Carrinho */
                        <div className="d-flex flex-column flex-lg-row align-items-start gap-4 gap-xl-5">

                            {/* COLUNA ESQUERDA*/}
                            <div className="flex-grow-1 w-100" style={{ maxWidth: '820px' }}>
                                <div className="p-4 rounded-4 bg-body-tertiary border border-body-subtle shadow-sm">

                                    <div className="d-flex justify-content-between align-items-center pb-3 border-bottom border-body">
                                        <h2 className="fw-bold fs-5 text-body mb-0">Jogos no carrinho</h2>
                                        <span className="text-body-secondary small">
                                            {cartItems.length} {cartItems.length === 1 ? 'item' : 'itens'}
                                        </span>
                                    </div>

                                    {/* Lista dinâmica de itens */}
                                    <div className="d-flex flex-column gap-3 py-3">
                                        {cartItems.map((item) => (
                                            <div
                                                key={item.id}
                                                className="d-flex flex-column flex-sm-row align-items-start align-items-sm-center justify-content-between gap-3 pb-3 border-bottom border-body-subtle"
                                            >
                                                <div className="d-flex align-items-center gap-3">
                                                    <img
                                                        src={item.imageUrl || item.screenshots?.[0] || undefined}
                                                        alt={item.title}
                                                        className="rounded-3 object-fit-cover flex-shrink-0"
                                                        style={{ width: '64px', height: '96px' }}
                                                    />
                                                    <div>
                                                        <h3 className="fw-bold fs-6 text-body mb-1">{item.title}</h3>

                                                        <button
                                                            onClick={() => handleRemoveItem(item.id)}
                                                            className="btn btn-link p-0 text-danger text-decoration-none small d-inline-flex align-items-center gap-1 mt-1"
                                                            style={{ fontSize: '0.85rem' }}
                                                        >
                                                            <Trash2 size={14} />
                                                            Remover
                                                        </button>
                                                    </div>
                                                </div>

                                                <div className="fw-bold fs-5 text-body align-self-end align-self-sm-center">
                                                    {item.price}
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Subtotal inferior do card */}
                                    <div className="d-flex justify-content-between align-items-center pt-2">
                                        <span className="text-body-secondary small">
                                            Subtotal ({cartItems.length} {cartItems.length === 1 ? 'item' : 'itens'})
                                        </span>
                                        <span className="fw-bold fs-5 text-body">
                                            {formatCurrency(subtotal)}
                                        </span>
                                    </div>

                                </div>

                                {/* Link para continuar comprando */}
                                <div className="mt-4">
                                    <Link
                                        href="/"
                                        className="text-body-secondary text-decoration-none small d-inline-flex align-items-center gap-2 hover-opacity"
                                    >
                                        <ArrowLeft size={16} />
                                        Continuar comprando
                                    </Link>
                                </div>
                            </div>

                            {/* COLUNA DIREITA*/}
                            <div className="w-100" style={{ maxWidth: '380px' }}>
                                <div className="p-4 rounded-4 bg-body-tertiary border border-body-subtle shadow-sm">

                                    <h2 className="fw-bold fs-5 text-body mb-4">Resumo do pedido</h2>

                                    <div className="d-flex flex-column gap-2 small pb-3 border-bottom border-body">
                                        <div className="d-flex justify-content-between text-body-secondary">
                                            <span>Subtotal ({cartItems.length} {cartItems.length === 1 ? 'item' : 'itens'})</span>
                                            <span className="text-body fw-semibold">{formatCurrency(subtotal)}</span>
                                        </div>
                                        <div className="d-flex justify-content-between text-body-secondary">
                                            <span>Descontos</span>
                                            <span className="text-body fw-semibold">{formatCurrency(discount)}</span>
                                        </div>
                                        <div className="d-flex justify-content-between text-body-secondary">
                                            <span>Taxas adicionais</span>
                                            <span className="text-body fw-semibold">R$ 0,00</span>
                                        </div>
                                    </div>

                                    {/* Total final */}
                                    <div className="my-4">
                                        <div className="d-flex justify-content-between align-items-baseline mb-1">
                                            <span className="fw-bold fs-5 text-body">Total</span>
                                            <span className="fw-bold fs-3 text-body">{formatCurrency(total)}</span>
                                        </div>
                                        {estimated && <p className="small text-body-secondary mb-0">Total estimado. O desconto do plano varia e o valor final é definido ao concluir a compra.</p>}

                                    </div>

                                    {/* Botão de Checkout */}
                                    <button
                                        onClick={handleProceedToCheckout}
                                        className="btn w-100 py-3 rounded-3 fw-bold text-white mb-3 buy-btn-hover"
                                        style={{ backgroundColor: '#7C3AED' }}
                                    >
                                        Continuar para confirmação →
                                    </button>

                                    <div className="text-body-secondary extra-small d-flex align-items-center justify-content-center gap-1 text-center" style={{ fontSize: '0.8rem' }}>
                                        <ShieldCheck size={16} className="text-success" />
                                        Compra segura e dados protegidos
                                    </div>

                                </div>
                            </div>

                        </div>
                    )}
                </div>

            </main>
        </div>
    );
}
