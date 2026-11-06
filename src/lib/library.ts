interface LibraryApiGame {
    id: number;
    name: string;
    imageUrl?: string | null;
    categories: { id: number; name: string }[];
}

export interface LibraryResponse {
    id: number;
    totalHoursPlayed: number;
    games: { gameId: number; timePlayed: number; game: LibraryApiGame }[];
}

export interface PlanLibraryGame extends LibraryApiGame {
    planId: number;
    access: 'PLAN';
}

export interface LibraryItem {
    id: number;
    title: string;
    category: string;
    imageUrl: string | null;
    access: 'PURCHASED' | 'PLAN';
    timePlayed: number | null;
    installed: boolean;
    downloadProgress?: number;
}

export function buildLibrary(libraries: LibraryResponse[], planGames: PlanLibraryGame[]) {
    const games = new Map<number, LibraryItem>();
    const toItem = (game: LibraryApiGame, access: LibraryItem['access'], timePlayed: number | null): LibraryItem => ({
        id: game.id,
        title: game.name,
        category: game.categories.map((category) => category.name).join(' · '),
        imageUrl: game.imageUrl || null,
        access,
        timePlayed,
        installed: false,
    });

    for (const library of libraries) {
        for (const entry of library.games) {
            games.set(entry.game.id, toItem(entry.game, 'PURCHASED', entry.timePlayed));
        }
    }

    for (const game of planGames) {
        if (!games.has(game.id)) games.set(game.id, toItem(game, 'PLAN', null));
    }

    return {
        games: [...games.values()].sort((a, b) => a.title.localeCompare(b.title, 'pt-BR')),
        totalHoursPlayed: libraries.reduce((total, library) => total + library.totalHoursPlayed, 0),
    };
}

export function formatLibraryHours(minutes: number | null): string {
    return minutes === null ? '—' : `${(minutes / 60).toLocaleString('pt-BR', { maximumFractionDigits: 2 })} h`;
}
