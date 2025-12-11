
import Link from 'next/link';
import { GameListItem } from '@/components/game-list-item';
import { SearchBar } from '@/components/search-bar';
import { AlertCircle, Gamepad2 } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import type { Game } from '@/lib/games';
import { Suspense } from 'react';
import { SearchResults } from '@/components/search-results';
import { config } from '@/lib/config';

async function searchGamesFromApi(query: string): Promise<Game[]> {
  if (!query) return [];
  try {
    const response = await fetch(`${config.api.gameSearchQuery}?q=${encodeURIComponent(query)}`, { next: { revalidate: 3600 } });
    if (!response.ok) {
      console.error('Failed to fetch games from API');
      return [];
    }
    const data = await response.json();
    
    if (!data.list) {
      return [];
    }

    return data.list.map((item: any) => ({
      id: item._id,
      name: item.name,
      iconUrl: item.icon,
      iconHint: item.tags.slice(0, 2).join(' ') || 'game icon',
      description: item.summary,
      tags: item.tags,
      downloadUrl: '#', 
      rating: 0, 
      size: 'N/A', 
      downloads: 'N/A' 
    }));
  } catch (error) {
    console.error('Error fetching games:', error);
    return [];
  }
}


type SearchPageProps = {
  searchParams: { q?: string };
};

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const query = searchParams.q || '';
  const results = await searchGamesFromApi(query);

  return (
    <main className="container mx-auto px-2 sm:px-4 py-8">
      <header className="flex flex-col items-center justify-center text-center py-8 md:py-12">
        <Link href="/" aria-label="返回首页">
          <h1 className="font-headline text-6xl sm:text-7xl md:text-8xl tracking-wider text-primary drop-shadow-lg">
            游戏宇宙中心
          </h1>
        </Link>
        <div className="mt-8 w-full max-w-2xl">
          <Suspense fallback={<div></div>}>
            <SearchBar />
          </Suspense>
        </div>
      </header>

      <Suspense fallback={<div></div>}>
        <SearchResults query={query} results={results} />
      </Suspense>
      
    </main>
  );
}
