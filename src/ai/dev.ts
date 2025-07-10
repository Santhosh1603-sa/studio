'use server';

import { config } from 'dotenv';
config();

import '@/ai/flows/analyze-article';
import '@/ai/flows/extract-article-from-url';
