import axios from 'axios';
import { ArticleCardProps } from '../components/ArticleCard';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://www.gulfstream.wtf';

export async function fetchNewsFromAPI(): Promise<ArticleCardProps[]> {
  try {
    const apiUrl = new URL('/api/news', API_BASE_URL).toString();
    console.log('Fetching news from API:', apiUrl);
    const response = await axios.get<{ articles: ArticleCardProps[] }>(apiUrl);
    console.log('API response:', response.data);
    return response.data.articles;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('Axios error:', error.message);
      if (error.response) {
        console.error('Error response:', error.response.data);
        console.error('Error status:', error.response.status);
      } else if (error.request) {
        console.error('Error request:', error.request);
      }
    } else {
      console.error('Unexpected error:', error);
    }
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