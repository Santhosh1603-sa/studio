'use client';

import { type AnalyzeArticleOutput } from '@/ai/flows/analyze-article';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Tag, Users, Building, MapPin, Calendar, FileText } from 'lucide-react';

interface CategorizationResultProps {
  result: AnalyzeArticleOutput | null;
  isLoading: boolean;
}

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
    <Skeleton className="h-8 w-1/3" />
    <Skeleton className="h-20 w-full" />
    <Skeleton className="h-8 w-1/3" />
    <Skeleton className="h-16 w-full" />
  </div>
);

const EmptyState = () => (
  <div className="text-center py-10">
    <p className="text-muted-foreground">Analysis results will appear here once an article is submitted.</p>
  </div>
);


export function CategorizationResult({ result, isLoading }: CategorizationResultProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Analysis Results</CardTitle>
        <CardDescription>A detailed breakdown of the submitted article.</CardDescription>
      </CardHeader>
      <CardContent className="min-h-[300px]">
        {isLoading ? <LoadingState /> : !result ? <EmptyState /> : (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-2 flex items-center"><Tag className="w-5 h-5 mr-2 text-accent" />Categories</h3>
              <div className="space-y-3">
                {result.categories.labels.length > 0 ? (
                  result.categories.labels.map((label, index) => (
                    <div key={index} className="space-y-1.5 animate-in fade-in">
                      <div className="flex items-center justify-between">
                        <p className="font-medium">{label}</p>
                        <p className="text-sm text-muted-foreground">
                          {(result.categories.scores[index] * 100).toFixed(0)}%
                        </p>
                      </div>
                      <Progress value={result.categories.scores[index] * 100} className="[&>div]:bg-accent" />
                    </div>
                  ))
                ) : <p className="text-sm text-muted-foreground">No categories identified.</p>}
              </div>
            </div>

            <Accordion type="multiple" defaultValue={['summary', 'timeline', 'entities']} className="w-full">
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
                <AccordionTrigger className="text-lg font-semibold"><Users className="w-5 h-5 mr-2 text-accent" />Entities</AccordionTrigger>
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
