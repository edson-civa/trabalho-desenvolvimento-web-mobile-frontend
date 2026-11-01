import Header from '@/components/Header';
import PromoCarousel from '@/components/PromoCarousel';
import GameSection from '@/components/GameSection';
import { GAMES_LIST } from '@/data/games';

export default function Home() {
  return (
    <div className="min-vh-100 bg-body text-body">
      <Header />
      <main className="container my-4" style={{ paddingTop: '80px' }}>
        <PromoCarousel />

        {/* Seção 1: Todos os Jogos / Em Destaque */}
        <GameSection 
          title="Em destaque"
          description="Os jogos que estão chamando atenção esta semana."
          games={GAMES_LIST}
        />

        {/* Seção 2: Outra Categoria (facilmente reaproveitada) */}
        <GameSection 
          title="Jogos de Ação e Aventura"
          description="Explore mundos abertos e combates intensos."
          games={GAMES_LIST.filter(g => g.category.includes('Ação'))}
        />
      </main>
    </div>
  );
}