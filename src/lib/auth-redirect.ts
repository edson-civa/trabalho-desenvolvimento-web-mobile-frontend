const allowedReturnPaths = ['/biblioteca', '/checkout', '/publicar', '/meus-jogos', '/admin', '/planos'];

export function getSafeReturnPath(value: string | null): string {
    if (!value) return '/';

    try {
        const url = new URL(value, 'http://playce.local');

        const isPlanDetail = /^\/planos\/[1-9]\d*(?:\/(?:assinar|confirmado))?$/.test(url.pathname);

        if (url.origin !== 'http://playce.local' || (!allowedReturnPaths.includes(url.pathname) && !isPlanDetail)) {
            return '/';
        }

        return `${url.pathname}${url.search}${url.hash}`;
    } catch {
        return '/';
    }
}
