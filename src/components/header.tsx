import { Newspaper } from 'lucide-react';

export function Header() {
  return (
    <header className="border-b">
      <div className="container mx-auto flex h-16 items-center px-4 md:px-8">
        <Newspaper className="h-6 w-6 text-primary" />
        <h1 className="ml-2 text-2xl font-bold font-headline tracking-tight">
          NewsWise
        </h1>
      </div>
    </header>
  );
}
