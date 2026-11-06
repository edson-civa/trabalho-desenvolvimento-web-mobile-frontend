const CART_KEY = 'playce_cart';

export function readCartIds(): number[] {
    try {
        const entries: unknown = JSON.parse(window.localStorage.getItem(CART_KEY) ?? '[]');
        if (!Array.isArray(entries)) return [];
        return [...new Set(entries.filter((entry) => entry && Number.isInteger(entry.id) && entry.id > 0).map((entry) => entry.id as number))];
    } catch {
        return [];
    }
}

export function writeCartIds(ids: number[]) {
    window.localStorage.setItem(CART_KEY, JSON.stringify([...new Set(ids)].map((id) => ({ id }))));
    window.dispatchEvent(new Event('cartUpdated'));
}

export function addCartGame(id: number) {
    writeCartIds([...readCartIds(), id]);
}
