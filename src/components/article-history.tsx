'use client';

import { type CategorizeArticleOutput } from '@/ai/flows/categorize-article';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { History } from 'lucide-react';

export interface HistoryItem extends CategorizeArticleOutput {
  content: string;
  date: string;
}

interface ArticleHistoryProps {
  history: HistoryItem[];
}

export function ArticleHistory({ history }: ArticleHistoryProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <Card className="shadow-lg h-full">
      <CardHeader>
        <CardTitle className="flex items-center">
            <History className="w-6 h-6 mr-2" />
            Article History
        </CardTitle>
        <CardDescription>Review your previously categorized articles.</CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[520px] w-full border rounded-md">
            <Table>
                <TableHeader>
                    <TableRow>
                    <TableHead>Article</TableHead>
                    <TableHead>Categories</TableHead>
                    <TableHead className="text-right">Date</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {history.length > 0 ? (
                    history.map((item, index) => (
                        <TableRow key={index}>
                            <TableCell className="font-medium text-sm text-muted-foreground">
                                {item.content.substring(0, 40)}...
                            </TableCell>
                            <TableCell>
                                <div className="flex flex-wrap gap-1">
                                {item.categoryLabels.length > 0 ? (
                                    item.categoryLabels.slice(0, 2).map((label, i) => (
                                    <Badge key={i} variant="secondary">{label}</Badge>
                                    ))
                                ) : (
                                    <span className="text-xs text-muted-foreground">None</span>
                                )}
                                {item.categoryLabels.length > 2 && (
                                    <Badge variant="outline">+{item.categoryLabels.length - 2}</Badge>
                                )}
                                </div>
                            </TableCell>
                            <TableCell className="text-right text-muted-foreground text-xs">
                                {formatDate(item.date)}
                            </TableCell>
                        </TableRow>
                    ))
                    ) : (
                    <TableRow>
                        <TableCell colSpan={3} className="h-24 text-center text-muted-foreground">
                        No history yet.
                        </TableCell>
                    </TableRow>
                    )}
                </TableBody>
            </Table>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
