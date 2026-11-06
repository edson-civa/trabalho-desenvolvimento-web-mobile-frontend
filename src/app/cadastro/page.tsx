'use client';

import { Suspense, useRef, useState } from 'react';
import type { FormEvent } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { ArrowLeft, Eye, EyeOff, Play } from 'lucide-react';
import { ApiError, apiRequest } from '@/lib/api';
import { getSafeReturnPath } from '@/lib/auth-redirect';

function RegisterForm() {
    const searchParams = useSearchParams();
    const returnPath = getSafeReturnPath(searchParams.get('next'));
    const loginHref = returnPath === '/' ? '/login' : `/login?next=${encodeURIComponent(returnPath)}`;
    const submitting = useRef(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [submitError, setSubmitError] = useState('');
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [touched, setTouched] = useState({ name: false, email: false, password: false, confirmPassword: false });

    // Os erros só aparecem depois de sair do campo ou tentar criar a conta.
    const nameError = !name.trim()
        ? 'Informe seu nome.'
        : name.trim().length < 3 || name.trim().length > 100
            ? 'Use entre 3 e 100 caracteres.'
            : '';

    const emailError = !email.trim()
        ? 'Informe seu e-mail.'
        : !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
            ? 'Digite um e-mail válido.'
            : '';

    const passwordError = !password
        ? 'Crie uma senha.'
        : password.length < 8
            ? 'Use pelo menos 8 caracteres.'
            : '';

    const confirmPasswordError = !confirmPassword
        ? 'Confirme sua senha.'
        : confirmPassword !== password
            ? 'As senhas precisam ser iguais.'
            : '';

    const showNameError = touched.name && Boolean(nameError);
    const showEmailError = touched.email && Boolean(emailError);
    const showPasswordError = touched.password && Boolean(passwordError);
    const showConfirmPasswordError = touched.confirmPassword && Boolean(confirmPasswordError);

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (submitting.current) return;

        setSubmitError('');
        setTouched({ name: true, email: true, password: true, confirmPassword: true });

        const firstInvalidField = nameError ? '#name'
            : emailError ? '#email'
                : passwordError ? '#password'
                    : confirmPasswordError ? '#confirm-password'
                        : '';

        if (firstInvalidField) {
            event.currentTarget.querySelector<HTMLInputElement>(firstInvalidField)?.focus();
            return;
        }

        submitting.current = true;
        setIsSubmitting(true);

        try {
            await apiRequest('/auth/register', {
                method: 'POST',
                // Apesar do nome do campo, o backend recebe a senha normal e gera o hash.
                body: { name: name.trim(), email: email.trim(), passwordHash: password },
            });

            setPassword('');
            setConfirmPassword('');
            setIsSuccess(true);
        } catch (error) {
            if (error instanceof ApiError && error.status === 409) {
                setSubmitError('Este e-mail já está cadastrado. Entre ou use outro e-mail.');
            } else if (error instanceof ApiError && error.status >= 500) {
                setSubmitError('Não foi possível criar sua conta agora. Tente novamente mais tarde.');
            } else {
                setSubmitError(error instanceof Error ? error.message : 'Não foi possível criar sua conta. Tente novamente.');
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

                    <h1 className="fw-bold fs-3 mb-2">Criar conta na Playce</h1>
                    {!isSuccess && (
                        <p className="text-body-secondary small mb-4">
                            Preencha seus dados para começar.
                        </p>
                    )}

                    {isSuccess ? (
                        <div>
                            <p className="text-body-secondary small mt-3 mb-4" role="status">
                                Conta criada com sucesso! Agora entre com seu e-mail e senha.
                            </p>
                            <Link
                                href={loginHref}
                                className="btn w-100 text-white fw-semibold rounded-3 py-2 buy-btn-hover"
                                style={{ backgroundColor: '#7C3AED' }}
                            >
                                Ir para o login
                            </Link>
                        </div>
                    ) : (
                        <form method="post" onSubmit={handleSubmit} onChange={() => setSubmitError('')} aria-busy={isSubmitting} noValidate>
                            <fieldset disabled={isSubmitting} className="border-0 p-0 m-0">
                                <div className="mb-3">
                                    <label htmlFor="name" className="form-label small fw-semibold">
                                        Nome
                                    </label>
                                    <input
                                        id="name"
                                        name="name"
                                        type="text"
                                        autoComplete="name"
                                        placeholder="Seu nome"
                                        value={name}
                                        onChange={(event) => setName(event.target.value)}
                                        onBlur={() => {
                                            setName(name.trim());
                                            setTouched((previous) => ({ ...previous, name: true }));
                                        }}
                                        minLength={3}
                                        maxLength={100}
                                        className={`form-control bg-body text-body rounded-3 py-2 ${showNameError ? 'is-invalid' : ''}`}
                                        aria-invalid={showNameError}
                                        aria-describedby={showNameError ? 'name-error' : undefined}
                                        required
                                    />
                                    <div
                                        id="name-error"
                                        className={`invalid-feedback ${showNameError ? 'd-block' : ''}`}
                                        aria-live="polite"
                                    >
                                        {showNameError ? nameError : ''}
                                    </div>
                                </div>

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
                                        className={`invalid-feedback ${showEmailError ? 'd-block' : ''}`}
                                        aria-live="polite"
                                    >
                                        {showEmailError ? emailError : ''}
                                    </div>
                                </div>

                                <div className="mb-3">
                                    <label htmlFor="password" className="form-label small fw-semibold">
                                        Senha
                                    </label>
                                    <div className="position-relative">
                                        <input
                                            id="password"
                                            name="password"
                                            type={showPassword ? 'text' : 'password'}
                                            autoComplete="new-password"
                                            placeholder="Crie uma senha"
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
                                        className={`invalid-feedback ${showPasswordError ? 'd-block' : ''}`}
                                        aria-live="polite"
                                    >
                                        {showPasswordError ? passwordError : ''}
                                    </div>
                                </div>

                                <div className="mb-4">
                                    <label htmlFor="confirm-password" className="form-label small fw-semibold">
                                        Confirmar senha
                                    </label>
                                    <div className="position-relative">
                                        <input
                                            id="confirm-password"
                                            name="confirmPassword"
                                            type={showConfirmPassword ? 'text' : 'password'}
                                            autoComplete="new-password"
                                            placeholder="Digite a senha novamente"
                                            value={confirmPassword}
                                            onChange={(event) => setConfirmPassword(event.target.value)}
                                            onBlur={() => setTouched((previous) => ({ ...previous, confirmPassword: true }))}
                                            className={`form-control bg-body text-body rounded-3 py-2 pe-5 ${showConfirmPasswordError ? 'is-invalid' : ''}`}
                                            style={{ backgroundImage: 'none' }}
                                            aria-invalid={showConfirmPasswordError}
                                            aria-describedby={showConfirmPasswordError ? 'confirm-password-error' : undefined}
                                            required
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                            className="btn position-absolute top-50 end-0 translate-middle-y text-body-secondary border-0 d-flex align-items-center justify-content-center"
                                            aria-label={showConfirmPassword ? 'Ocultar confirmação de senha' : 'Mostrar confirmação de senha'}
                                            aria-controls="confirm-password"
                                            aria-pressed={showConfirmPassword}
                                        >
                                            {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                        </button>
                                    </div>
                                    <div
                                        id="confirm-password-error"
                                        className={`invalid-feedback ${showConfirmPasswordError ? 'd-block' : ''}`}
                                        aria-live="polite"
                                    >
                                        {showConfirmPasswordError ? confirmPasswordError : ''}
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
                                    {isSubmitting ? 'Criando conta...' : 'Criar conta'}
                                </button>
                            </fieldset>
                        </form>
                    )}

                    {!isSuccess && (
                        <p className="text-body-secondary small text-center border-top pt-4 mt-4 mb-0">
                            Já tem uma conta?{' '}
                            <Link href={loginHref} className="fw-semibold text-decoration-none" style={{ color: '#7C3AED' }}>
                                Entrar
                            </Link>
                        </p>
                    )}
                </div>
            </div>
        </main>
    );
}

export default function RegisterPage() {
    return (
        <Suspense fallback={
            <main className="min-vh-100 bg-body text-body d-flex align-items-center justify-content-center px-3">
                <p className="text-body-secondary small mb-0" role="status">Carregando...</p>
            </main>
        }>
            <RegisterForm />
        </Suspense>
    );
}
