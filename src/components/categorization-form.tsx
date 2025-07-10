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
  content: z.string().optional(),
  url: z.string().optional(),
}).refine(data => {
    if (data.inputType === 'text') {
        return data.content && data.content.length >= 50;
    }
    if (data.inputType === 'url') {
        return data.url && z.string().url().safeParse(data.url).success;
    }
    return false;
}, {
    message: "Please provide a valid input.",
    path: ['content'], // you can adjust the path to point to a more general location if needed
});


type FormValues = z.infer<typeof formSchema>;

interface CategorizationFormProps {
  onSubmit: (data: {inputType: 'text' | 'url', value: string}) => void;
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
      onSubmit({inputType: 'text', value: values.content});
    } else if (values.inputType === 'url' && values.url) {
      onSubmit({inputType: 'url', value: values.url});
    }
  };

  const inputType = form.watch('inputType');

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle>Submit an Article</CardTitle>
        <CardDescription>Paste article text or provide a URL to categorize it using our AI model.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <Tabs defaultValue="text" className="w-full" onValueChange={(value) => form.setValue('inputType', value as 'text' | 'url')}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="text"><FileText className="w-4 h-4 mr-2" />Paste Text</TabsTrigger>
                <TabsTrigger value="url"><Link className="w-4 h-4 mr-2" />From URL</TabsTrigger>
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
                          placeholder="Paste your news article content here... (min. 50 characters)"
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
                          <Input placeholder="https://example.com/news-article" {...field} className="mt-4" />
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
                  {inputType === 'url' ? 'Fetching & Categorizing...' : 'Categorizing...'}
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
