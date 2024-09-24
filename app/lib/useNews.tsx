import { useState, useEffect } from 'react';
import { fetchNewsFromAPI } from '../lib/serverNewsFetcher';
import { ArticleCardProps } from '../components/ArticleCard';

export function useNews() {
  const [articles, setArticles] = useState<ArticleCardProps[]>([]);
  const [featuredArticles, setFeaturedArticles] = useState<ArticleCardProps[]>([]);
  const [filteredArticles, setFilteredArticles] = useState<ArticleCardProps[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  useEffect(() => {
    async function fetchNews() {
      const newsData = await fetchNewsFromAPI();
      console.log('Fetched news data:', newsData); 
      setArticles(newsData);
      setFeaturedArticles(newsData.slice(0, 3));
      setFilteredArticles(newsData);
    }
    fetchNews();
  }, []);

  useEffect(() => {
    if (selectedCategory) {
      setFilteredArticles(articles.filter(article => article.category === selectedCategory));
    } else {
      setFilteredArticles(articles);
    }
  }, [articles, selectedCategory]);

  return {
    articles,
    featuredArticles,
    filteredArticles,
    selectedCategory,
    setSelectedCategory,
  };
}
