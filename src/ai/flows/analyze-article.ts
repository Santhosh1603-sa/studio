'use server';

/**
 * @fileOverview A comprehensive news article analysis AI agent.
 *
 * - analyzeArticle - A function that handles the full article analysis process.
 * - AnalyzeArticleInput - The input type for the analyzeArticle function.
 * - AnalyzeArticleOutput - The return type for the analyzeArticle function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const AnalyzeArticleInputSchema = z.object({
  content: z.string().describe('The content of the news article to analyze.'),
});
export type AnalyzeArticleInput = z.infer<typeof AnalyzeArticleInputSchema>;

const AnalyzeArticleOutputSchema = z.object({
  categories: z.object({
    labels: z
      .array(z.string())
      .describe('The predicted category labels for the article.'),
    scores: z
      .array(z.number())
      .describe('The confidence scores for each predicted category label.'),
  }),
  summary: z.string().describe('A concise, neutral summary of the article.'),
  timeline: z
    .array(
      z.object({
        date: z
          .string()
          .describe(
            'The date of the event (e.g., YYYY-MM-DD, Month YYYY, or a descriptive but specific timeframe).',
          ),
        event: z.string().describe('A description of the key event.'),
      }),
    )
    .describe(
      'A chronological timeline of key events from the article. If no specific dates are mentioned, this can be empty.',
    ),
  entities: z
    .object({
      people: z.array(z.string()).describe('A list of key people mentioned.'),
      organizations: z
        .array(z.string())
        .describe('A list of key organizations or companies mentioned.'),
      locations: z
        .array(z.string())
        .describe('A list of key locations mentioned.'),
    })
    .describe('Key entities mentioned in the article.'),
});
export type AnalyzeArticleOutput = z.infer<typeof AnalyzeArticleOutputSchema>;

export async function analyzeArticle(
  input: AnalyzeArticleInput,
): Promise<AnalyzeArticleOutput> {
  return analyzeArticleFlow(input);
}

const prompt = ai.definePrompt({
  name: 'analyzeArticlePrompt',
  input: { schema: AnalyzeArticleInputSchema },
  output: { schema: AnalyzeArticleOutputSchema },
  prompt: `You are an expert news analyst AI. Your task is to perform a comprehensive analysis of the provided article content.

You must extract the following information:
1.  **Categories**: Categorize the article into a set of relevant topics. Provide confidence scores for each category.
2.  **Summary**: Write a concise, neutral summary of the article's main points.
3.  **Timeline**: Identify and list the key events from the article in chronological order. Include relevant dates or timeframes for each event.
4.  **Entities**: Extract the key people, organizations/companies, and locations mentioned in the text.

Analyze the following article content:

{{{content}}}`,
});

const analyzeArticleFlow = ai.defineFlow(
  {
    name: 'analyzeArticleFlow',
    inputSchema: AnalyzeArticleInputSchema,
    outputSchema: AnalyzeArticleOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  },
);
