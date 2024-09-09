import { useState, useEffect } from 'react';
import { getNews } from '../lib/serverNewsFetcher';

interface ArticleCardProps {
  id: string;
  category: string;
  title: string;
  description: string;
  author: string;
  urlToImage: string | null;
  publishedAt: string;
  source: {
    name: string;
  };
  verifiedBy: string | null;
}

export function useNews() {
  const [articles, setArticles] = useState<ArticleCardProps[]>([]);
  const [featuredArticles, setFeaturedArticles] = useState<ArticleCardProps[]>([]);
  const [filteredArticles, setFilteredArticles] = useState<ArticleCardProps[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  useEffect(() => {
    async function fetchNews() {
      const newsData = await getNews();
      setArticles(newsData as ArticleCardProps[]);
      setFeaturedArticles(newsData.slice(0, 3) as ArticleCardProps[]);
    }
    fetchNews();
  }, []);

  useEffect(() => {
    const featuredIds = new Set(featuredArticles.map(article => article.id));
    setFilteredArticles(
      selectedCategory
        ? articles.filter(article => article.category === selectedCategory)
        : articles.filter(article => !featuredIds.has(article.id))
    );
  }, [articles, selectedCategory, featuredArticles]);

  return {
    articles,
    featuredArticles,
    filteredArticles,
    selectedCategory,
    setSelectedCategory
  };
}
