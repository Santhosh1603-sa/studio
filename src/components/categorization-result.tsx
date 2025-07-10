'use client';

import { type CategorizeArticleOutput } from '@/ai/flows/categorize-article';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { Tag } from 'lucide-react';

interface CategorizationResultProps {
  result: CategorizeArticleOutput | null;
  isLoading: boolean;
}

export function CategorizationResult({ result, isLoading }: CategorizationResultProps) {
  const LoadingState = () => (
    <div className="space-y-6 p-4">
      <div className="space-y-3">
        {[...Array(3)].map((_, i) => (
            <div key={i} className="space-y-2">
                <div className="flex justify-between">
                    <Skeleton className="h-5 w-1/4" />
                    <Skeleton className="h-5 w-1/6" />
                </div>
                <Skeleton className="h-4 w-full" />
            </div>
        ))}
      </div>
    </div>
  );

  const EmptyState = () => (
    <div className="text-center py-10">
      <p className="text-muted-foreground">Results will appear here once an article is submitted.</p>
    </div>
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Categorization Results</CardTitle>
        <CardDescription>Predicted categories for the submitted article.</CardDescription>
      </CardHeader>
      <CardContent className="min-h-[200px]">
        {isLoading ? <LoadingState /> : !result ? <EmptyState /> : (
          <div className="space-y-4">
            {result.categoryLabels.length > 0 ? (
              result.categoryLabels.map((label, index) => (
                <div key={index} className="space-y-1.5 animate-in fade-in">
                  <div className="flex items-center justify-between">
                    <p className="font-medium flex items-center">
                        <Tag className="w-4 h-4 mr-2 text-accent" />
                        {label}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {(result.confidenceScores[index] * 100).toFixed(0)}%
                    </p>
                  </div>
                  <Progress value={result.confidenceScores[index] * 100} className="[&>div]:bg-accent" />
                </div>
              ))
            ) : (
                <div className="text-center py-10">
                    <p className="text-muted-foreground">No categories could be identified for this article.</p>
                </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
