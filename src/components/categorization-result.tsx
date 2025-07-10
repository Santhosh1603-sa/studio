'use client';

import Image from 'next/image';
import { type AnalyzeArticleOutput } from '@/ai/flows/analyze-article';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Tag, Users, Building, MapPin, Calendar, FileText, Smile, Meh, Frown, Landmark, Scale, ShieldAlert, Quote } from 'lucide-react';

interface CategorizationResultProps {
  result: AnalyzeArticleOutput & { imageUrl?: string } | null;
  isLoading: boolean;
}

const LoadingState = () => (
  <div className="space-y-6 p-4">
    <Skeleton className="h-48 w-full rounded-lg" />
    <div className="space-y-3">
        <Skeleton className="h-6 w-1/2" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
    </div>
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
  <div className="text-center py-20">
    <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
    <p className="mt-4 text-muted-foreground">Analysis results will appear here once an article is submitted.</p>
  </div>
);

const NotSFWState = () => (
    <div className="text-center py-20 flex flex-col items-center">
      <ShieldAlert className="mx-auto h-12 w-12 text-destructive" />
      <h3 className="mt-4 text-lg font-semibold">Content Not Suitable for All Audiences</h3>
      <p className="mt-2 text-muted-foreground">The analysis was halted because the article content may be inappropriate (18+).</p>
    </div>
  );

export function CategorizationResult({ result, isLoading }: CategorizationResultProps) {
  const getSentimentIcon = (label: 'Positive' | 'Negative' | 'Neutral') => {
    switch(label) {
        case 'Positive': return <Smile className="w-5 h-5 mr-2 text-green-500" />;
        case 'Negative': return <Frown className="w-5 h-5 mr-2 text-red-500" />;
        default: return <Meh className="w-5 h-5 mr-2 text-yellow-500" />;
    }
  }

  const getPoliticalIcon = () => {
    return <Scale className="w-5 h-5 mr-2 text-accent" />;
  }
  
  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle>Analysis Results</CardTitle>
        <CardDescription>A detailed breakdown of the submitted article.</CardDescription>
      </CardHeader>
      <CardContent className="min-h-[500px]">
        {isLoading ? <LoadingState /> : !result ? <EmptyState /> : !result.isSafeForWork ? <NotSFWState /> : (
          <div className="space-y-6">
            {result.imageUrl && (
              <div className="relative aspect-video w-full rounded-lg overflow-hidden">
                <Image src={result.imageUrl} alt="Article Image" fill style={{objectFit: 'cover'}} data-ai-hint="news article" />
              </div>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                    <CardHeader className="flex flex-row items-center space-y-0 pb-2">
                        {getSentimentIcon(result.sentiment.label)}
                        <CardTitle className="text-sm font-medium">Sentiment</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-2xl font-bold">{result.sentiment.label}</p>
                        <p className="text-xs text-muted-foreground">Score: {result.sentiment.score.toFixed(2)}</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center space-y-0 pb-2">
                        {getPoliticalIcon()}
                        <CardTitle className="text-sm font-medium">Political View</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-2xl font-bold">{result.politicalView.bias}</p>
                        <p className="text-xs text-muted-foreground">Confidence: {(result.politicalView.confidence * 100).toFixed(0)}%</p>
                    </CardContent>
                </Card>
            </div>

            {result.politicalView.explanation && (
                <div className="p-4 bg-muted/50 rounded-lg">
                    <h4 className="font-semibold mb-2 flex items-center text-sm"><Quote className="w-4 h-4 mr-2 text-accent" />Bias Explanation</h4>
                    <p className="text-sm text-muted-foreground italic">"{result.politicalView.explanation}"</p>
                </div>
            )}
            
            <EntitySection icon={Users} title="Authors" items={result.authors} />

            <div>
              <h3 className="text-lg font-semibold mb-2 flex items-center"><Tag className="w-5 h-5 mr-2 text-accent" />Topic Modeling</h3>
              <div className="space-y-3">
                {result.topics.labels.length > 0 ? (
                  result.topics.labels.map((label, index) => (
                    <div key={index} className="space-y-1.5 animate-in fade-in">
                      <div className="flex items-center justify-between">
                        <p className="font-medium">{label}</p>
                        <p className="text-sm text-muted-foreground">
                          {(result.topics.scores[index] * 100).toFixed(0)}%
                        </p>
                      </div>
                      <Progress value={result.topics.scores[index] * 100} className="[&>div]:bg-accent" />
                    </div>
                  ))
                ) : <p className="text-sm text-muted-foreground">No topics identified.</p>}
              </div>
            </div>

            <Accordion type="multiple" defaultValue={['summary']} className="w-full">
              <AccordionItem value="summary">
                <AccordionTrigger className="text-lg font-semibold"><FileText className="w-5 h-5 mr-2 text-accent" />Summary</AccordionTrigger>
                <AccordionContent className="text-muted-foreground pt-2 text-base leading-relaxed">
                  {result.summary}
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="timeline">
                <AccordionTrigger className="text-lg font-semibold"><Calendar className="w-5 h-5 mr-2 text-accent" />Timeline</AccordionTrigger>
                <AccordionContent className="pt-2">
                  {result.timeline.length > 0 ? (
                    <div className="relative pl-6">
                      <div className="absolute left-0 top-0 h-full w-0.5 bg-border -translate-x-1/2 ml-1"></div>
                      {result.timeline.map((item, index) => (
                        <div key={index} className="relative mb-6">
                          <div className="absolute -left-6 -translate-x-1/2 top-1 h-3 w-3 rounded-full bg-accent"></div>
                          <p className="font-semibold text-primary">{item.date}</p>
                          <p className="text-muted-foreground">{item.event}</p>
                        </div>
                      ))}
                    </div>
                  ) : <p className="text-sm text-muted-foreground">No timeline events identified.</p>}
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="entities">
                <AccordionTrigger className="text-lg font-semibold"><Landmark className="w-5 h-5 mr-2 text-accent" />Entities</AccordionTrigger>
                <AccordionContent className="pt-2 space-y-4">
                  <EntitySection icon={Users} title="People" items={result.entities.people} />
                  <EntitySection icon={Building} title="Organizations" items={result.entities.organizations} />
                  <EntitySection icon={MapPin} title="Locations" items={result.entities.locations} />
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function EntitySection({ icon: Icon, title, items }: { icon: React.ElementType, title: string, items: string[] }) {
  if (items.length === 0) return null;
  
  return (
    <div>
      <h4 className="font-semibold mb-2 flex items-center"><Icon className="w-4 h-4 mr-2 text-muted-foreground" />{title}</h4>
      <div className="flex flex-wrap gap-2">
        {items.map((item, index) => (
          <Badge key={index} variant="secondary">{item}</Badge>
        ))}
      </div>
    </div>
  )
}
