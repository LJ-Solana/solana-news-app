import { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import { ArticleCardProps } from '../components/ArticleCard';

// Move the getNews and categorizeArticle functions here

async function getNews() {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || '';
    const url = `${baseUrl}/api/news`;
    
    try {
      const res = await fetch(url, { cache: 'no-store' });
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      const newsData = await res.json();
  
      const slugs = newsData.articles.map((article: ArticleCardProps) => 
        encodeURIComponent(article.title?.toLowerCase().replace(/ /g, '-') || '')
      );
  
      // Query Supabase for verified articles
      const { data: verifiedArticles, error } = await supabase
        .from('articles')
        .select('slug, verifier')
        .in('slug', slugs);
  
      if (error) {
        console.error("Error fetching verified articles:", error);
      }
  
      // Create a map of verified articles for quick lookup
      const verifiedMap = new Map(verifiedArticles?.map(a => [a.slug, a.verifier]) || []);
      // Add verification status to each article
      const articlesWithVerification = newsData.articles.map((article: ArticleCardProps) => {
        const slug = encodeURIComponent(article.title?.toLowerCase().replace(/ /g, '-') || '');
        return {
          ...article,
          slug,
          verifiedBy: verifiedMap.get(slug) || undefined
        };
      });
  
      return { ...newsData, articles: articlesWithVerification };
    } catch (error) {
      console.error("Failed to fetch news:", error);
      return { articles: [] }; 
    }
  }

function categorizeArticle(title: string, description: string): string {
    const text = (title + ' ' + description).toLowerCase();
    const categoryPatterns: Record<string, string[]> = {
      Technology: ['tech', 'software', 'hardware', 'ai', 'robot', 'computer', 'internet', 'cyber', 'digital', 'innovation', 'gadget', 'programming', 'algorithm', 'data'],
      Science: ['science', 'research', 'study', 'discovery', 'experiment', 'laboratory', 'hypothesis', 'theory', 'scientific', 'breakthrough', 'innovation'],
      Health: ['health', 'medical', 'disease', 'treatment', 'drug', 'vaccine', 'doctor', 'patient', 'healthcare', 'wellness', 'medicine', 'therapy', 'diagnosis', 'clinical'],
      Business: ['business', 'economy', 'market', 'stock', 'company', 'startup', 'finance', 'investment', 'entrepreneur', 'corporate', 'industry', 'trade', 'commerce'],
      Politics: ['politic', 'government', 'election', 'war', 'ukraine', 'russia', 'policy', 'law', 'vote', 'congress', 'senate', 'legislation', 'diplomat', 'campaign', 'parliament', 'democracy'],
      Environment: ['environment', 'climate', 'green', 'sustainable', 'ecology', 'pollution', 'renewable', 'conservation', 'biodiversity', 'ecosystem', 'carbon'],
      Space: ['space', 'nasa', 'rocket', 'planet', 'star', 'galaxy', 'astronaut', 'satellite', 'cosmos', 'orbit', 'telescope', 'spacecraft', 'extraterrestrial'],
      Blockchain: ['blockchain', 'crypto', 'bitcoin', 'ethereum', 'nft', 'defi', 'web3', 'cryptocurrency', 'token', 'ledger', 'mining', 'decentralized', 'smart contract'],
    };
  
    for (const [category, patterns] of Object.entries(categoryPatterns)) {
      if (patterns.some(pattern => text.includes(pattern))) {
        return category;
      }
    }
  
    return 'Other';
  }

// Updated categories and emojis
export const categories = {
  "Technology": "🖥️",
  "Science": "🔬",
  "Health": "🩺",
  "Business": "💼",
  "Politics": "🏛️",
  "Environment": "🌿",
  "Space": "🚀",
  "Blockchain": "⛓️",
};

export function useNews() {
  const [articles, setArticles] = useState<ArticleCardProps[]>([]);
  const [featuredArticles, setFeaturedArticles] = useState<ArticleCardProps[]>([]);
  const [filteredArticles, setFilteredArticles] = useState<ArticleCardProps[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  useEffect(() => {
    async function fetchNews() {
      const newsData = await getNews();
      const processedArticles = newsData.articles.map((article: ArticleCardProps) => {
        const category = categorizeArticle(article.title, article.description);
        return {
          slug: article.slug,
          title: article.title || 'Untitled Article',
          description: article.description || "No description available",
          author: article.author || 'Unknown Author',
          publishedAt: article.publishedAt,
          source: article.source || { name: 'Unknown Source' },
          category: category,
          icon: categories[category as keyof typeof categories] || '📰',
          urlToImage: article.urlToImage,
          verifiedBy: article.verifiedBy, 
        };
      });
      setArticles(processedArticles);
      setFeaturedArticles(processedArticles.slice(0, 3));
    }
    fetchNews();
  }, []);

  useEffect(() => {
    const featuredSlugs = new Set(featuredArticles.map(article => article.slug));
    setFilteredArticles(
      selectedCategory
        ? articles.filter(article => article.category === selectedCategory)
        : articles.filter(article => !featuredSlugs.has(article.slug))
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
