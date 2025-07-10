'use client';

import { useState } from 'react';
import { analyzeArticle, type AnalyzeArticleOutput } from '@/ai/flows/analyze-article';
import { extractArticleFromUrl } from '@/ai/flows/extract-article-from-url';
import { useToast } from '@/hooks/use-toast';
import { CategorizationForm } from '@/components/categorization-form';
import { CategorizationResult } from '@/components/categorization-result';
import { ArticleHistory, type HistoryItem } from '@/components/article-history';

type ResultState = (AnalyzeArticleOutput & { imageUrl?: string; }) | null;

export function NewsWiseClient() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<ResultState>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const { toast } = useToast();

  const handleAnalyze = async (data: {inputType: 'text' | 'url', value: string}) => {
    setIsLoading(true);
    setResult(null);

    try {
      let contentToAnalyze = '';
      let imageUrl: string | undefined;
      let historyItem: Partial<HistoryItem> = {
        id: new Date().toISOString() + Math.random(),
        date: new Date().toISOString(),
      };

      if (data.inputType === 'url') {
        historyItem.url = data.value;
        try {
            const extractionResult = await extractArticleFromUrl({ url: data.value });
            contentToAnalyze = extractionResult.content;
            imageUrl = extractionResult.imageUrl;
            if (extractionResult.authors) {
                historyItem.authors = extractionResult.authors;
            }

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
        historyItem.originalContent = data.value;
      }
      
      const output = await analyzeArticle({ content: contentToAnalyze });
      
      const fullResult = { ...output, imageUrl };
      setResult(fullResult);
      
      setHistory(prev => [
        { ...historyItem, ...output } as HistoryItem,
        ...prev,
      ]);

    } catch (error: any) {
      console.error(error);
      const isSafetyError = error.message?.includes('finishReason: SAFETY');
      
      if (isSafetyError) {
        setResult({
            isSafeForWork: false,
            summary: '', authors: [],
            sentiment: { label: 'Neutral', score: 0 },
            politicalView: { bias: 'Unknown', confidence: 0 },
            categories: { labels: [], scores: [] },
            timeline: [],
            entities: { people: [], organizations: [], locations: [] }
        });
      } else {
        toast({
            title: 'An error occurred.',
            description: 'Failed to analyze the article. Please try again.',
            variant: 'destructive',
        });
      }

    } finally {
      setIsLoading(false);
    }
  };

  const handleHistorySelect = (item: HistoryItem) => {
    const { originalContent, url, ...resultData } = item;
    let imageUrl: string | undefined;
    // This is a simplification; in a real app, you'd persist the image URL with the history item
    if (url) {
        const matchingResult = result?.url === url ? result : null;
        if(matchingResult) imageUrl = matchingResult.imageUrl
    }
    setResult({ ...resultData });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };


  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
      <div className="lg:col-span-2 space-y-8">
        <CategorizationForm onSubmit={handleAnalyze} isLoading={isLoading} />
        <CategorizationResult result={result} isLoading={isLoading} />
      </div>
      <div className="lg:col-span-1">
        <ArticleHistory history={history} onSelect={handleHistorySelect} />
      </div>
    </div>
  );
}
