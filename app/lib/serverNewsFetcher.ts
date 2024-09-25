import axios from 'axios';
import { ArticleCardProps } from '../components/ArticleCard';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://www.gulfstream.wtf';
const CACHE_EXPIRATION_TIME = 5 * 60 * 1000; // 5 minutes in milliseconds
let cache: { data: ArticleCardProps[], timestamp: number } | null = null;

export async function fetchNewsFromAPI(page = 1, pageSize = 20): Promise<ArticleCardProps[]> {
  // Check if cached data exists and is still valid
  if (cache && (Date.now() - cache.timestamp < CACHE_EXPIRATION_TIME)) {
    console.log('Returning cached data');
    return cache.data;
  }

  try {
    console.log('Attempting to fetch news');
    const response = await axios.get<{ articles: ArticleCardProps[] }>(`${API_BASE_URL}/api/news`, {
      params: { page, pageSize }
    });
    console.log('Response received:', response.data);
    
    if (response.data.articles) {
      console.log('Fetched news successfully:', response.data.articles.length);

      // Update the cache
      cache = {
        data: response.data.articles,
        timestamp: Date.now()
      };

      return response.data.articles;
    }
    
    throw new Error('Unknown error occurred');
  } catch (error) {
    console.error('Error fetching news:', error);
    return [];
  }
}

export async function getNews(): Promise<ArticleCardProps[]> {
  try {
    const articles = await fetchNewsFromAPI();
    console.log('Fetched articles:', articles.length);
    return articles;
  } catch (error) {
    console.error("Failed to fetch news:", error);
    return []; 
  }
}

export async function getArticleBySlug(slug: string): Promise<ArticleCardProps | null> {
  try {
    const apiUrl = new URL(`/api/articles/${slug}`, API_BASE_URL).toString();
    console.log(`Fetching article with slug: ${slug}`);
    const response = await axios.get<ArticleCardProps>(apiUrl);
    console.log('Article data received:', response.data);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('Error fetching article:', error.response?.status, error.response?.data);
    } else {
      console.error('Unexpected error:', error);
    }
    return null;
  }
}

export const categories = {
  "Technology": "🖥️",
  "Science": "🔬",
  "Business": "💼",
  "Politics": "🏛️",
  "Environment": "🌿",
  "Space": "🚀",
  "Blockchain": "⛓️",
};