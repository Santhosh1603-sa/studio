'use server';

/**
 * @fileOverview An AI agent for extracting article content from a URL.
 *
 * - extractArticleFromUrl - A function that handles the article extraction process.
 * - ExtractArticleInput - The input type for the extractArticleFromUrl function.
 * - ExtractArticleOutput - The return type for the extractArticleFromUrl function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { JSDOM } from 'jsdom';

const ExtractArticleInputSchema = z.object({
  url: z.string().url().describe('The URL of the article to extract.'),
});
export type ExtractArticleInput = z.infer<typeof ExtractArticleInputSchema>;

const ExtractArticleOutputSchema = z.object({
  content: z.string().describe('The extracted article content.'),
  imageUrl: z.string().optional().describe('The URL of the main image of the article.'),
  authors: z.array(z.string()).optional().describe('The authors of the article.'),
});
export type ExtractArticleOutput = z.infer<typeof ExtractArticleOutputSchema>;

export async function extractArticleFromUrl(
  input: ExtractArticleInput,
): Promise<ExtractArticleOutput> {
  return extractArticleFromUrlFlow(input);
}

const extractArticleFromUrlFlow = ai.defineFlow(
  {
    name: 'extractArticleFromUrlFlow',
    inputSchema: ExtractArticleInputSchema,
    outputSchema: ExtractArticleOutputSchema,
  },
  async ({ url }) => {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Failed to fetch URL: ${response.statusText}`);
      }
      const html = await response.text();
      const dom = new JSDOM(html);
      const document = dom.window.document;

      // Meta tag extraction
      const getMetaContent = (name: string) => document.querySelector(`meta[name="${name}"], meta[property="${name}"]`)?.getAttribute('content');

      const imageUrl = getMetaContent('og:image') || getMetaContent('twitter:image');
      
      const authors: string[] = [];
      const authorTag = getMetaContent('author');
      if (authorTag) {
        authors.push(authorTag);
      }
      document.querySelectorAll('meta[property="article:author"]').forEach(tag => {
        const content = tag.getAttribute('content');
        if (content) authors.push(content);
      });

      // Remove script and style elements
      document.querySelectorAll('script, style, nav, header, footer, aside, noscript, svg, form').forEach(el => el.remove());
      
      const paragraphs = Array.from(document.querySelectorAll('p'))
        .map(p => p.textContent?.trim())
        .filter(Boolean)
        .join('\n\n');

      const mainContent = paragraphs.length > 200 ? paragraphs : (document.body.textContent || '');
      
      const cleanedText = mainContent.replace(/\s\s+/g, ' ').trim();
      
      return { 
        content: cleanedText,
        imageUrl: imageUrl || undefined,
        authors: authors.length > 0 ? Array.from(new Set(authors)) : undefined,
      };
    } catch (error) {
      console.error('Error extracting article:', error);
      throw new Error('Could not extract article content from the URL.');
    }
  },
);