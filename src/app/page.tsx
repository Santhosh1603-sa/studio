import { Header } from '@/components/header';
import { NewsWiseClient } from '@/components/newswise-client';

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-1 container mx-auto p-4 md:p-8">
        <NewsWiseClient />
      </main>
    </div>
  );
}
