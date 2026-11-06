export interface AuthUser {
    sub: number;
    email: string;
    name: string;
    role: 'USER' | 'ADMIN';
}

export interface AuthSession {
    access_token: string;
    user: AuthUser;
}

const SESSION_KEY = 'playce_session';
export const AUTH_CHANGED_EVENT = 'playce_auth_changed';

export function getTokenExpiration(token: string): number {
    try {
        const parts = token.split('.');
        if (parts.length !== 3) return 0;

        const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));
        return typeof payload.exp === 'number' && Number.isFinite(payload.exp) ? payload.exp * 1000 : 0;
    } catch {
        return 0;
    }
}

function isValidSession(value: unknown): value is AuthSession {
    if (!value || typeof value !== 'object' || !('access_token' in value) || !('user' in value)) return false;
    if (typeof value.access_token !== 'string' || getTokenExpiration(value.access_token) <= Date.now()) return false;

    const user = value.user;
    return Boolean(user && typeof user === 'object'
        && 'sub' in user && typeof user.sub === 'number' && Number.isInteger(user.sub) && user.sub > 0
        && 'email' in user && typeof user.email === 'string'
        && 'name' in user && typeof user.name === 'string'
        && 'role' in user && (user.role === 'USER' || user.role === 'ADMIN'));
}

export function getSession(): AuthSession | null {
    if (typeof window === 'undefined') return null;

    try {
        const saved = window.sessionStorage.getItem(SESSION_KEY);
        if (!saved) return null;

        const session: unknown = JSON.parse(saved);
        if (isValidSession(session)) return session;

        window.sessionStorage.removeItem(SESSION_KEY);
    } catch {
        try { window.sessionStorage.removeItem(SESSION_KEY); } catch { /* Sem sessão disponível. */ }
    }

    return null;
}

export function saveSession(session: AuthSession) {
    if (!isValidSession(session)) {
        throw new Error('A API retornou uma sessão inválida. Tente entrar novamente.');
    }

    try {
        const { sub, email, name, role } = session.user;
        window.sessionStorage.setItem(SESSION_KEY, JSON.stringify({ access_token: session.access_token, user: { sub, email, name, role } }));
    } catch {
        throw new Error('Não foi possível guardar a sessão. Permita o armazenamento do site e tente novamente.');
    }

    window.dispatchEvent(new Event(AUTH_CHANGED_EVENT));
}

export function clearSession() {
    if (typeof window === 'undefined') return;

    try { window.sessionStorage.removeItem(SESSION_KEY); } catch { /* O armazenamento pode estar indisponível. */ }
    window.dispatchEvent(new Event(AUTH_CHANGED_EVENT));
}
