'use server';

/**
 * @fileOverview A news article categorization AI agent.
 *
 * - categorizeArticle - A function that handles the article categorization process.
 * - CategorizeArticleInput - The input type for the categorizeArticle function.
 * - CategorizeArticleOutput - The return type for the categorizeArticle function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const CategorizeArticleInputSchema = z.object({
  content: z.string().describe('The content of the news article to categorize.'),
});
export type CategorizeArticleInput = z.infer<typeof CategorizeArticleInputSchema>;

const CategorizeArticleOutputSchema = z.object({
  categoryLabels: z
    .array(z.string())
    .describe('The predicted category labels for the article.'),
  confidenceScores: z
    .array(z.number())
    .describe('The confidence scores for each predicted category label.'),
});
export type CategorizeArticleOutput = z.infer<typeof CategorizeArticleOutputSchema>;

export async function categorizeArticle(input: CategorizeArticleInput): Promise<CategorizeArticleOutput> {
  return categorizeArticleFlow(input);
}

const prompt = ai.definePrompt({
  name: 'categorizeArticlePrompt',
  input: {schema: CategorizeArticleInputSchema},
  output: {schema: CategorizeArticleOutputSchema},
  prompt: `You are a news article categorization expert.

You will categorize the given news article content into a set of relevant categories.
Provide also a confidence score for each category.

Article Content: {{{content}}}`,
});

const categorizeArticleFlow = ai.defineFlow(
  {
    name: 'categorizeArticleFlow',
    inputSchema: CategorizeArticleInputSchema,
    outputSchema: CategorizeArticleOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
