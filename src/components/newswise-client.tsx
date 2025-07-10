'use client';

import { useState } from 'react';
import { analyzeArticle, type AnalyzeArticleOutput } from '@/ai/flows/analyze-article';
import { extractArticleFromUrl } from '@/ai/flows/extract-article-from-url';
import { useToast } from '@/hooks/use-toast';
import { CategorizationForm } from '@/components/categorization-form';
import { CategorizationResult } from '@/components/categorization-result';
import { ArticleHistory, type HistoryItem } from '@/components/article-history';

export function NewsWiseClient() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<AnalyzeArticleOutput | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const { toast } = useToast();

  const handleAnalyze = async (data: {inputType: 'text' | 'url', value: string}) => {
    setIsLoading(true);
    setResult(null);

    try {
      let contentToAnalyze = '';
      let originalContent = data.value;

      if (data.inputType === 'url') {
        try {
            const extractionResult = await extractArticleFromUrl({ url: data.value });
            contentToAnalyze = extractionResult.content;
            if (!contentToAnalyze) {
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
        contentToAnalyze = data.value;
      }
      
      const output = await analyzeArticle({ content: contentToAnalyze });
      
      setResult(output);
      setHistory(prev => [
        {
          id: new Date().toISOString() + Math.random(),
          originalContent: originalContent,
          ...output,
          date: new Date().toISOString(),
        },
        ...prev,
      ]);
    } catch (error) {
      console.error(error);
      toast({
        title: 'An error occurred.',
        description: 'Failed to analyze the article. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="grid gap-12 lg:grid-cols-[1fr,0.8fr]">
      <div className="space-y-8">
        <CategorizationForm onSubmit={handleAnalyze} isLoading={isLoading} />
        <CategorizationResult result={result} isLoading={isLoading} />
      </div>
      <div>
        <ArticleHistory history={history} />
      </div>
    </div>
  );
}
