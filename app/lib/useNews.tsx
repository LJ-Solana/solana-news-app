import { useState, useEffect, useCallback } from 'react';
import { fetchNewsFromAPI, ArticleCardProps } from '../lib/serverNewsFetcher';

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

  const fetchMoreArticles = useCallback(async (page: number) => {
    const newArticles = await fetchNewsFromAPI(page);
    setArticles(prevArticles => [...prevArticles, ...newArticles]);
    setFilteredArticles(prevFiltered => {
      if (selectedCategory) {
        return [...prevFiltered, ...newArticles.filter(article => article.category === selectedCategory)];
      } else {
        return [...prevFiltered, ...newArticles];
      }
    });
    return newArticles;
  }, [selectedCategory]);

  return {
    articles,
    featuredArticles,
    filteredArticles,
    selectedCategory,
    setSelectedCategory,
    fetchMoreArticles
  };
}
