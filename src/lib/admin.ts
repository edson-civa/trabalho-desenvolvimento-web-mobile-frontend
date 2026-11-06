import type { ApiGame } from './games';

export interface AdminUser {
    id: number;
    name: string;
    email: string;
    role: 'USER' | 'ADMIN';
    createdAt: string;
}

export interface AdminSummary {
    totalUsers: number;
    totalGames: number;
    totalSales: number;
    totalRevenue: number;
}

export type PublishedGame = ApiGame & { salesCount: number; revenue: number };
export interface PublisherDashboard {
    games: PublishedGame[];
    totals: { gamesCount: number; salesCount: number; revenue: number };
}
