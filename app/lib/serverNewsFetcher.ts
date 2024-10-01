import axios from 'axios';
import { ArticleCardProps } from '../components/ArticleCard';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://www.gulfstream.wtf';
const CACHE_EXPIRATION_TIME = 5 * 60 * 1000; 
const cache: { [page: number]: { data: ArticleCardProps[], timestamp: number } } = {};

const ensureAbsoluteUrl = (url: string) => {
  if (url.startsWith('//')) {
    return `https:${url}`;
  }
  return url;
};

export async function fetchNewsFromAPI(page = 1, pageSize = 20): Promise<ArticleCardProps[]> {
  // Check if cached data exists and is still valid for this page
  if (cache[page] && (Date.now() - cache[page].timestamp < CACHE_EXPIRATION_TIME)) {
    console.log(`Returning cached data for page ${page}`);
    return cache[page].data;
  }
  try {
    console.log(`Attempting to fetch news for page ${page}`);
    const response = await axios.get<{ articles: ArticleCardProps[] }>(`${API_BASE_URL}/api/news`, {
      params: { page, pageSize }
    });
    console.log('Response received:', response.data);
    
    if (response.data.articles) {
      const articlesWithAbsoluteUrls = response.data.articles.map(article => ({
        ...article,
        urlToImage: article.urlToImage ? ensureAbsoluteUrl(article.urlToImage) : null
      }));
      
      cache[page] = {
        data: articlesWithAbsoluteUrls,
        timestamp: Date.now()
      };
      return articlesWithAbsoluteUrls;
    }
    throw new Error('Unknown error occurred');
  } catch (error) {
    console.error('Error fetching news:', error);
    return [];
  }
}

export async function getNews(page = 1): Promise<ArticleCardProps[]> {
  try {
    const articles = await fetchNewsFromAPI(page);
    console.log(`Fetched ${articles.length} articles for page ${page}`);
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
  "Politics": "🏛️",
  "Technology": "💻",
  "Business": "💼",
  "Sports": "🏅",
  "Entertainment": "🎭",
  "Health": "🏥",
  "Science": "🔬",
  "Environment": "🌍",
};
