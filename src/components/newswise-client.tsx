'use client';

import { useState } from 'react';
import { categorizeArticle, type CategorizeArticleOutput } from '@/ai/flows/categorize-article';
import { useToast } from '@/hooks/use-toast';
import { CategorizationForm } from '@/components/categorization-form';
import { CategorizationResult } from '@/components/categorization-result';
import { ArticleHistory, type HistoryItem } from '@/components/article-history';

export function NewsWiseClient() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<CategorizeArticleOutput | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const { toast } = useToast();

  const handleCategorize = async (content: string) => {
    setIsLoading(true);
    setResult(null);

    try {
      const output = await categorizeArticle({ content });
      if (output.categoryLabels.length === 0) {
        toast({
          title: "Categorization Complete",
          description: "Could not determine any categories for the provided text.",
          variant: "default",
        });
      }
      setResult(output);
      setHistory(prev => [
        {
          content,
          ...output,
          date: new Date().toISOString(),
        },
        ...prev,
      ]);
    } catch (error) {
      console.error(error);
      toast({
        title: 'An error occurred.',
        description: 'Failed to categorize the article. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="grid gap-12 lg:grid-cols-[1fr,0.8fr]">
      <div className="space-y-8">
        <CategorizationForm onSubmit={handleCategorize} isLoading={isLoading} />
        <CategorizationResult result={result} isLoading={isLoading} />
      </div>
      <div>
        <ArticleHistory history={history} />
      </div>
    </div>
  );
}
