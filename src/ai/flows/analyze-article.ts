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
  isSafeForWork: z
    .boolean()
    .describe('Whether the article content is safe for all audiences (not 18+).'),
  summary: z.string().describe('A concise, neutral summary of the article.'),
  authors: z.array(z.string()).describe('The authors of the article.'),
  sentiment: z.object({
    label: z.enum(['Positive', 'Negative', 'Neutral']).describe('The overall sentiment of the article.'),
    score: z.number().describe('A score from -1 (very negative) to 1 (very positive) representing the sentiment.'),
  }).describe('The sentiment analysis of the article.'),
  politicalView: z.object({
    bias: z.enum(['Left-leaning', 'Center', 'Right-leaning', 'Unknown']).describe('The detected political bias of the article.'),
    confidence: z.number().describe('The confidence score (0 to 1) for the political bias detection.'),
    explanation: z.string().describe('A brief explanation for the detected political bias, citing specific language or framing.'),
  }).describe('The political view analysis.'),
  topics: z.object({
    labels: z
      .array(z.string())
      .describe('The predicted topic labels for the article (topic modeling).'),
    scores: z
      .array(z.number())
      .describe('The confidence scores for each predicted topic label.'),
  }),
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
  prompt: `You are an expert news analyst AI. Your task is to perform a comprehensive, unbiased analysis of the provided article content.

You must extract the following information:
1.  **Content Safety**: Determine if the article is safe for work (SFW). If it contains sexually explicit, graphically violent, or hateful content, set isSafeForWork to false.
2.  **Summary**: Write a concise, neutral summary of the article's main points.
3.  **Authors**: Identify the authors of the article. If not mentioned, return an empty array.
4.  **Sentiment**: Analyze the overall sentiment. Provide a label ('Positive', 'Negative', 'Neutral') and a score from -1 to 1.
5.  **Political View**: Analyze the political leaning. Provide a bias label ('Left-leaning', 'Center', 'Right-leaning', 'Unknown'), a confidence score, and a brief explanation for your determination, highlighting specific wording or framing if possible.
6.  **Topic Modeling**: Categorize the article into general topics. Provide topic labels and confidence scores.
7.  **Timeline**: List key events chronologically with dates.
8.  **Entities**: Extract key people, organizations, and locations.

Analyze the following article content:

{{{content}}}`,
  config: {
    safetySettings: [
        {
            category: 'HARM_CATEGORY_HATE_SPEECH',
            threshold: 'BLOCK_MEDIUM_AND_ABOVE',
        },
        {
            category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
            threshold: 'BLOCK_MEDIUM_AND_ABOVE',
        },
        {
            category: 'HARM_CATEGORY_HARASSMENT',
            threshold: 'BLOCK_MEDIUM_AND_ABOVE',
        },
        {
            category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
            threshold: 'BLOCK_MEDIUM_AND_ABOVE',
        },
    ]
  }
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
