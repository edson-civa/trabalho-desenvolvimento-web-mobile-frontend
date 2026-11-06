'use client';

import { useEffect } from 'react';
import type { ReactNode } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { getSafeReturnPath } from '@/lib/auth-redirect';

export default function RequireAuth({ children, adminOnly = false }: { children: ReactNode; adminOnly?: boolean }) {
    const { user, isReady } = useAuth();
    const pathname = usePathname();
    const router = useRouter();

    useEffect(() => {
        if (!isReady || user) return;

        const returnPath = getSafeReturnPath(`${pathname}${window.location.search}${window.location.hash}`);
        router.replace(`/login?next=${encodeURIComponent(returnPath)}`);
    }, [isReady, user, pathname, router]);

    if (!isReady || !user) {
        return (
            <main className="min-vh-100 bg-body text-body d-flex align-items-center justify-content-center px-3">
                <p className="text-body-secondary small mb-0" role="status">Verificando acesso...</p>
            </main>
        );
    }

    if (adminOnly && user.role !== 'ADMIN') {
        return (
            <main className="min-vh-100 bg-body text-body d-flex align-items-center justify-content-center px-3">
                <div className="text-center">
                    <h1 className="fw-bold fs-4 mb-2">Acesso restrito</h1>
                    <p className="text-body-secondary mb-4">Esta página está disponível apenas para administradores.</p>
                    <Link href="/" className="btn text-white rounded-3 px-4" style={{ backgroundColor: '#7C3AED' }}>Voltar para a loja</Link>
                </div>
            </main>
        );
    }

    return children;
}
