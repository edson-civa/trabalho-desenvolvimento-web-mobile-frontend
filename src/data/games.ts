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
  platform?: string;
  mode?: string;
  language?: string;
  developer?: string;
  publisher?: string;
  releaseDate?: string;
  screenshots?: string[];
}

export const GAMES_LIST: Game[] = [
  {
    id: 1,
    title: 'Neon Protocol',
    category: 'Ação · Mundo aberto',
    price: 'R$ 89,90',
    originalPrice: 'R$ 149,90',
    discountBadge: '-40%',
    imageUrl: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=600&auto=format&fit=crop',
  },
  {
    id: 2,
    title: 'Silent Horizon',
    category: 'Aventura · Exploração',
    price: 'R$ 76,90',
    imageUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=600&auto=format&fit=crop',
    screenshots: [
      'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=1000&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?q=80&w=1000&auto=format&fit=crop',
    ]
  },
  {
    id: 3,
    title: 'Afterlight',
    category: 'RPG · Fantasia',
    price: 'R$ 119,90',
    imageUrl: 'https://images.unsplash.com/photo-1579373903781-fd5c0c30c4cd?q=80&w=600&auto=format&fit=crop',
  },
  {
    id: 4,
    title: 'Chrome District',
    category: 'Ação · Cyberpunk',
    price: 'R$ 99,90',
    originalPrice: 'R$ 133,20',
    discountBadge: '-25%',
    imageUrl: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?q=80&w=600&auto=format&fit=crop',
  },
  {
    id: 5,
    title: 'Dusk Valley',
    category: 'Indie · Narrativa',
    price: 'R$ 42,90',
    imageUrl: 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?q=80&w=600&auto=format&fit=crop',
  },
  {
    id: 6,
    title: 'Nightshift',
    category: 'Corrida · Competitivo',
    price: 'R$ 54,90',
    originalPrice: 'R$ 109,80',
    discountBadge: '-50%',
    imageUrl: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=600&auto=format&fit=crop',
  },
  {
    id: 7,
    title: 'Neon Protocol',
    category: 'Ação · Mundo aberto',
    price: 'R$ 89,90',
    originalPrice: 'R$ 149,90',
    discountBadge: '-40%',
    imageUrl: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=600&auto=format&fit=crop',
    description: 'Enfrente corporações em uma metrópole futurista repleta de perigos e segredos.',
    longDescription: 'Em Neon Protocol, você entra no submundo de uma megalópole cyberpunk dominante. Domine habilidades cibernéticas, modifique suas armas e faça escolhas cruciais que mudarão o rumo da cidade.',
    tags: ['Ação', 'Cyberpunk', 'Mundo aberto'],
    platform: 'PC - Windows',
    mode: 'Um jogador',
    language: 'Português (Brasil)',
    developer: 'Neon Studios',
    publisher: 'Playce Publishing',
    releaseDate: '15 de novembro de 2025',
    screenshots: [
      'https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=1000&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1511512578047-dfb367046420?q=80&w=1000&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=1000&auto=format&fit=crop',
    ]
  }
];