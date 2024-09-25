import { useState, useEffect, useCallback } from 'react';
import { fetchNewsFromAPI } from '../lib/serverNewsFetcher';
import { ArticleCardProps } from '../components/ArticleCard';

export function useNews() {
  const [articles, setArticles] = useState<ArticleCardProps[]>([]);
  const [featuredArticles, setFeaturedArticles] = useState<ArticleCardProps[]>([]);
  const [filteredArticles, setFilteredArticles] = useState<ArticleCardProps[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    async function fetchNews() {
      const newsData = await fetchNewsFromAPI(1);
      console.log('Fetched news data:', newsData);
      setArticles(newsData);
      setFeaturedArticles(newsData.slice(0, 3));
      setFilteredArticles(newsData);
      setCurrentPage(1);
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

  const fetchMoreArticles = useCallback(async () => {
    if (!hasMore) return [];
    
    const nextPage = currentPage + 1;
    const newArticles = await fetchNewsFromAPI(nextPage);
    
    if (newArticles.length === 0) {
      setHasMore(false);
      return [];
    }

    const uniqueNewArticles = newArticles.filter(
      newArticle => !articles.some(existingArticle => existingArticle.id === newArticle.id)
    );

    setArticles(prevArticles => [...prevArticles, ...uniqueNewArticles]);
    setCurrentPage(nextPage);

    return uniqueNewArticles;
  }, [currentPage, hasMore, articles]);

  return {
    articles,
    featuredArticles,
    filteredArticles,
    selectedCategory,
    setSelectedCategory,
    fetchMoreArticles,
    hasMore
  };
}
