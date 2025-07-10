'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Loader2, FileText, Link } from 'lucide-react';

const formSchema = z.object({
  inputType: z.enum(['text', 'url']),
  content: z.string().min(50, {
    message: 'Article text must be at least 50 characters.',
  }),
  url: z.string().url({ message: 'Please enter a valid URL.' }).optional().or(z.literal('')),
});

type FormValues = z.infer<typeof formSchema>;

interface CategorizationFormProps {
  onSubmit: (content: string) => void;
  isLoading: boolean;
}

export function CategorizationForm({ onSubmit, isLoading }: CategorizationFormProps) {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      inputType: 'text',
      content: '',
      url: '',
    },
  });

  const handleSubmit = (values: FormValues) => {
    if (values.inputType === 'text' && values.content) {
      onSubmit(values.content);
    } else {
      // This is a placeholder for URL fetching logic
      form.setError("url", { type: "manual", message: "URL submission is not yet implemented." });
    }
  };

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle>Submit an Article</CardTitle>
        <CardDescription>Paste article text below to categorize it using our AI model.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <Tabs defaultValue="text" className="w-full" onValueChange={(value) => form.setValue('inputType', value as 'text' | 'url')}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="text"><FileText className="w-4 h-4 mr-2" />Paste Text</TabsTrigger>
                <TabsTrigger value="url" disabled><Link className="w-4 h-4 mr-2" />From URL (Coming Soon)</TabsTrigger>
              </TabsList>
              <TabsContent value="text">
                <FormField
                  control={form.control}
                  name="content"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="sr-only">Article Content</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Paste your news article content here..."
                          className="min-h-[200px] mt-4"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </TabsContent>
              <TabsContent value="url">
                <FormField
                  control={form.control}
                  name="url"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="sr-only">Article URL</FormLabel>
                      <FormControl>
                          <Input placeholder="https://example.com/news-article" {...field} className="mt-4" disabled/>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </TabsContent>
            </Tabs>

            <Button type="submit" className="w-full bg-accent hover:bg-accent/90" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Categorizing...
                </>
              ) : (
                'Categorize Article'
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
