'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { apiRequest } from '@/lib/api';
import { AUTH_CHANGED_EVENT, clearSession, getSession, getTokenExpiration, saveSession } from '@/lib/session';
import type { AuthSession, AuthUser } from '@/lib/session';

interface AuthContextValue {
    user: AuthUser | null;
    isReady: boolean;
    login: (email: string, password: string) => Promise<void>;
    logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [session, setSession] = useState<AuthSession | null>(null);
    const [isReady, setIsReady] = useState(false);

    useEffect(() => {
        const updateSession = () => {
            setSession(getSession());
            setIsReady(true);
        };

        updateSession();
        window.addEventListener(AUTH_CHANGED_EVENT, updateSession);
        window.addEventListener('focus', updateSession);

        return () => {
            window.removeEventListener(AUTH_CHANGED_EVENT, updateSession);
            window.removeEventListener('focus', updateSession);
        };
    }, []);

    useEffect(() => {
        if (!session) return;

        const remaining = getTokenExpiration(session.access_token) - Date.now();
        const timer = window.setTimeout(clearSession, Math.max(0, Math.min(remaining, 2147483647)));
        return () => window.clearTimeout(timer);
    }, [session]);

    const login = async (email: string, password: string) => {
        const response = await apiRequest<AuthSession>('/auth/login', {
            method: 'POST',
            body: { email: email.trim(), password },
        });

        saveSession(response);
    };

    return (
        <AuthContext.Provider value={{ user: session?.user ?? null, isReady, login, logout: clearSession }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth precisa estar dentro de AuthProvider.');
    return context;
}
