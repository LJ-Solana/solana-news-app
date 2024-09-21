import axios from 'axios';
import { ArticleCardProps } from '../components/ArticleCard';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://www.gulfstream.wtf/';

export async function fetchNewsFromAPI(): Promise<ArticleCardProps[]> {
  try {
    console.log('Fetching news from API:', `${API_BASE_URL}/api/news`);
    const response = await axios.get<{ articles: ArticleCardProps[] }>(`${API_BASE_URL}/api/news`);
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
    console.log(`Fetching article with slug: ${slug}`);
    const response = await axios.get<ArticleCardProps>(`${API_BASE_URL}/api/articles/${slug}`);
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