import axios from 'axios';
import { ArticleCardProps } from '../components/ArticleCard';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://185.26.11.45:3001';

export async function fetchNewsFromAPI(): Promise<ArticleCardProps[]> {
  try {
    const response = await axios.get<{ articles: ArticleCardProps[] }>(`${API_BASE_URL}/api/news`);
    return response.data.articles;
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
    const response = await axios.get<ArticleCardProps>(`${API_BASE_URL}/api/articles/${slug}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching article:', error);
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