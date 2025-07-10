'use client';

import { useState } from 'react';
import { categorizeArticle, type CategorizeArticleOutput } from '@/ai/flows/categorize-article';
import { extractArticleFromUrl } from '@/ai/flows/extract-article-from-url';
import { useToast } from '@/hooks/use-toast';
import { CategorizationForm } from '@/components/categorization-form';
import { CategorizationResult } from '@/components/categorization-result';
import { ArticleHistory, type HistoryItem } from '@/components/article-history';

export function NewsWiseClient() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<CategorizeArticleOutput | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const { toast } = useToast();

  const handleCategorize = async (data: {inputType: 'text' | 'url', value: string}) => {
    setIsLoading(true);
    setResult(null);

    try {
      let contentToCategorize = '';
      let originalContent = data.value;

      if (data.inputType === 'url') {
        try {
            const extractionResult = await extractArticleFromUrl({ url: data.value });
            contentToCategorize = extractionResult.content;
            if (!contentToCategorize) {
                throw new Error("Content extraction failed.");
            }
        } catch (error) {
            console.error(error);
            toast({
                title: 'Failed to fetch article.',
                description: 'Could not extract content from the provided URL. Please check the URL or paste the text directly.',
                variant: 'destructive',
            });
            setIsLoading(false);
            return;
        }
      } else {
        contentToCategorize = data.value;
      }
      
      const output = await categorizeArticle({ content: contentToCategorize });
      
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
          content: originalContent,
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
