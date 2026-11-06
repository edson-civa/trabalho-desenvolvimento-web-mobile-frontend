'use client';

import { Suspense, useRef, useState } from 'react';
import type { FormEvent } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, Eye, EyeOff, Play } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { ApiError } from '@/lib/api';
import { getSafeReturnPath } from '@/lib/auth-redirect';

function LoginForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const returnPath = getSafeReturnPath(searchParams.get('next'));
    const registerHref = returnPath === '/' ? '/cadastro' : `/cadastro?next=${encodeURIComponent(returnPath)}`;
    const { login } = useAuth();
    const submitting = useRef(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [touched, setTouched] = useState({ email: false, password: false });

    const emailError = !email.trim()
        ? 'Informe seu e-mail.'
        : !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
            ? 'Digite um e-mail válido, como nome@site.com.'
            : '';

    const passwordError = !password
        ? 'Informe sua senha.'
        : password.length < 8
            ? 'A senha deve ter pelo menos 8 caracteres.'
            : '';

    const showEmailError = touched.email && Boolean(emailError);
    const showPasswordError = touched.password && Boolean(passwordError);

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (submitting.current) return;

        setSubmitError('');
        setTouched({ email: true, password: true });

        if (emailError || passwordError) {
            event.currentTarget.querySelector<HTMLInputElement>(emailError ? '#email' : '#password')?.focus();
            return;
        }

        submitting.current = true;
        setIsSubmitting(true);

        try {
            await login(email, password);
            router.replace(returnPath);
        } catch (error) {
            if (error instanceof ApiError && error.status === 401) {
                setSubmitError('E-mail ou senha incorretos. Confira seus dados.');
            } else if (error instanceof ApiError && error.status >= 500) {
                setSubmitError('Não foi possível entrar agora. Tente novamente mais tarde.');
            } else {
                setSubmitError(error instanceof Error ? error.message : 'Não foi possível entrar. Tente novamente.');
            }
        } finally {
            submitting.current = false;
            setIsSubmitting(false);
        }
    };

    return (
        <main className="min-vh-100 bg-body text-body d-flex align-items-center justify-content-center px-3 py-5">
            <div className="w-100" style={{ maxWidth: '440px' }}>
                <Link
                    href="/"
                    className="d-inline-flex align-items-center gap-2 text-body-secondary text-decoration-none small mb-4"
                >
                    <ArrowLeft size={16} />
                    Voltar para a loja
                </Link>

                <div className="bg-body-tertiary border rounded-4 p-4 p-sm-5">
                    {/* Marca e apresentação */}
                    <Link href="/" className="d-inline-flex align-items-center gap-2 text-decoration-none text-body mb-4">
                        <div
                            className="rounded-3 d-flex align-items-center justify-content-center text-white"
                            style={{ width: '34px', height: '34px', backgroundColor: '#7C3AED' }}
                        >
                            <Play size={16} fill="white" className="ms-1" />
                        </div>
                        <span className="fw-bold fs-5">Playce</span>
                    </Link>

                    <h1 className="fw-bold fs-3 mb-2">Entrar na Playce</h1>
                    <p className="text-body-secondary small mb-4">
                        Acesse sua conta para continuar.
                    </p>

                    <form method="post" onSubmit={handleSubmit} onChange={() => setSubmitError('')} aria-busy={isSubmitting} noValidate>
                        <fieldset disabled={isSubmitting} className="border-0 p-0 m-0">
                            <div className="mb-3">
                                <label htmlFor="email" className="form-label small fw-semibold">
                                    E-mail
                                </label>
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    autoComplete="email"
                                    autoCapitalize="none"
                                    spellCheck={false}
                                    placeholder="seu@email.com"
                                    value={email}
                                    onChange={(event) => setEmail(event.target.value)}
                                    onBlur={() => {
                                        setEmail(email.trim());
                                        setTouched((previous) => ({ ...previous, email: true }));
                                    }}
                                    className={`form-control bg-body text-body rounded-3 py-2 ${showEmailError ? 'is-invalid' : ''}`}
                                    aria-invalid={showEmailError}
                                    aria-describedby={showEmailError ? 'email-error' : undefined}
                                    required
                                />
                                
                                <div
                                    id="email-error"
                                    className="invalid-feedback d-block"
                                    style={{ minHeight: '1em', lineHeight: 1.5 }}
                                    aria-live="polite"
                                >
                                    {showEmailError ? emailError : ''}
                                </div>
                            </div>

                            <div className="mb-4">
                                <label htmlFor="password" className="form-label small fw-semibold">
                                    Senha
                                </label>
                                <div className="position-relative">
                                    <input
                                        id="password"
                                        name="password"
                                        type={showPassword ? 'text' : 'password'}
                                        autoComplete="current-password"
                                        placeholder="Digite sua senha"
                                        value={password}
                                        onChange={(event) => setPassword(event.target.value)}
                                        onBlur={() => setTouched((previous) => ({ ...previous, password: true }))}
                                        minLength={8}
                                        className={`form-control bg-body text-body rounded-3 py-2 pe-5 ${showPasswordError ? 'is-invalid' : ''}`}
                                        style={{ backgroundImage: 'none' }}
                                        aria-invalid={showPasswordError}
                                        aria-describedby={showPasswordError ? 'password-error' : undefined}
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="btn position-absolute top-50 end-0 translate-middle-y text-body-secondary border-0 d-flex align-items-center justify-content-center"
                                        aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                                        aria-controls="password"
                                        aria-pressed={showPassword}
                                    >
                                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                                <div
                                    id="password-error"
                                    className="invalid-feedback d-block"
                                    style={{ minHeight: '1em', lineHeight: 1.5 }}
                                    aria-live="polite"
                                >
                                    {showPasswordError ? passwordError : ''}
                                </div>
                            </div>

                            {submitError && (
                                <div className="alert alert-danger small py-2" role="alert">
                                    {submitError}
                                </div>
                            )}

                            <button
                                type="submit"
                                className="btn w-100 text-white fw-semibold rounded-3 py-2 buy-btn-hover"
                                style={{ backgroundColor: '#7C3AED' }}
                            >
                                {isSubmitting ? 'Entrando...' : 'Entrar'}
                            </button>
                        </fieldset>
                    </form>

                    <p className="text-body-secondary small text-center border-top pt-4 mt-4 mb-0">
                        Ainda não tem uma conta?{' '}
                        <Link href={registerHref} className="fw-semibold text-decoration-none" style={{ color: '#7C3AED' }}>
                            Criar conta
                        </Link>
                    </p>
                </div>
            </div>
        </main>
    );
}

export default function LoginPage() {
    return (
        <Suspense fallback={
            <main className="min-vh-100 bg-body text-body d-flex align-items-center justify-content-center px-3">
                <p className="text-body-secondary small mb-0" role="status">Carregando...</p>
            </main>
        }>
            <LoginForm />
        </Suspense>
    );
}
