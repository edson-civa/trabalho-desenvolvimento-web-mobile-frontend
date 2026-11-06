export interface Game {
    id: number;
    title: string;
    category: string;
    price: string;
    originalPrice?: string;
    discountBadge?: string;
    imageUrl: string;
    description?: string;
    longDescription?: string;
    tags?: string[];
    publisher?: string;
    releaseDate?: string;
    screenshots?: string[];
}
