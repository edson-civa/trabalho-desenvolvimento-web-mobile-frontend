import { clearSession, getSession } from './session';

type ApiRequestOptions = Omit<RequestInit, 'body'> & {
    body?: unknown;
};

export class ApiError extends Error {
    status: number;

    constructor(message: string, status: number) {
        super(message);
        this.name = 'ApiError';
        this.status = status;
    }
}

export async function apiRequest<T = unknown>(path: string, options: ApiRequestOptions = {}): Promise<T> {
    const endpoint = path.startsWith('/') ? path : `/${path}`;
    const headers = new Headers(options.headers);
    const isAuthRequest = endpoint === '/auth/login' || endpoint === '/auth/register';

    if (!isAuthRequest && !headers.has('Authorization')) {
        const session = getSession();
        if (session) headers.set('Authorization', `Bearer ${session.access_token}`);
    }

    headers.set('Accept', 'application/json');

    if (options.body !== undefined) {
        headers.set('Content-Type', 'application/json');
    }

    let response: Response;

    try {
        response = await fetch(`/api${endpoint}`, {
            ...options,
            headers,
            cache: options.cache ?? 'no-store',
            body: options.body === undefined ? undefined : JSON.stringify(options.body),
        });
    } catch (error) {
        if (error instanceof Error && error.name === 'AbortError') {
            throw error;
        }

        throw new ApiError('Não foi possível conectar à API. Tente novamente.', 0);
    }

    const text = await response.text();
    const isJson = response.headers.get('Content-Type')?.includes('application/json');
    let data: unknown;

    if (text && isJson) {
        try {
            data = JSON.parse(text);
        } catch {
            throw new ApiError('A API retornou uma resposta inválida.', response.status);
        }
    }

    if (!response.ok) {
        if (response.status === 401 && !isAuthRequest) clearSession();

        let message = 'Não foi possível concluir a solicitação. Tente novamente.';

        if (data && typeof data === 'object' && 'message' in data) {
            if (typeof data.message === 'string' && data.message.trim()) {
                message = data.message;
            } else if (Array.isArray(data.message)) {
                const messages = data.message.filter((item): item is string => typeof item === 'string' && Boolean(item.trim()));
                if (messages.length) message = messages.join(' ');
            }
        }

        throw new ApiError(message, response.status);
    }

    if (text && !isJson) {
        throw new ApiError('A API retornou uma resposta inválida.', response.status);
    }

    return data as T;
}
