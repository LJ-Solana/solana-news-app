import axios from 'axios';
import { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { ArticleCardProps } from '../components/ArticleCard';
import { supabase } from './supabaseClient';

const NEWS_API_KEY = process.env.NEWS_API_KEY;

interface NewsArticle {
  title: string;
  description?: string;
  author: string;
  urlToImage?: string;
  publishedAt: string;
  source: {
    name: string;
  };
}

export function useNews() {
  const [articles, setArticles] = useState<ArticleCardProps[]>([]);
  const [featuredArticles, setFeaturedArticles] = useState<ArticleCardProps[]>([]);
  const [filteredArticles, setFilteredArticles] = useState<ArticleCardProps[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  useEffect(() => {
    async function fetchNews() {
      const newsData = await getNews();
      setArticles(newsData);
      setFeaturedArticles(newsData.slice(0, 3));
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

export async function fetchNewsFromAPI() {
  const url = `https://newsapi.org/v2/top-headlines?country=us&pageSize=30&apiKey=${NEWS_API_KEY}`;
  
  try {
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'ByteNews/1.0',
      },
    });
    return response.data.articles.filter((article: NewsArticle) => 
      article.urlToImage && article.author
    );
  } catch (error) {
    console.error('Error fetching news:', error);
    return [];
  }
}

export async function getNews() {
  try {
    const newsArticles = await fetchNewsFromAPI();
    
    const articlesWithIds = newsArticles.map((article: NewsArticle) => {
      const slug = article.title.toLowerCase().replace(/\s+/g, '-');
      return {
        ...article,
        id: uuidv4(),
        slug,
      };
    });

    const { data: verifiedArticles, error } = await supabase
      .from('articles')
      .select('slug, verifier')
      .in('slug', articlesWithIds.map((a: { slug: string }) => a.slug));

    if (error) {
      console.error("Error fetching verified articles:", error);
    }

    const verifiedMap = new Map(verifiedArticles?.map(a => [a.slug, a.verifier]) || []);
    
    const processedArticles = articlesWithIds.map((article: ArticleCardProps) => {
      const category = categorizeArticle(article.title, article.description);
      return {
        ...article,
        verifiedBy: verifiedMap.get(article.slug) || undefined,
        category,
        icon: categories[category as keyof typeof categories] || '📰',
      };
    });

    return processedArticles;
  } catch (error) {
    console.error("Failed to fetch news:", error);
    return []; 
  }
}

export async function getArticleBySlug(slug: string): Promise<ArticleCardProps | null> {
  const newsArticles = await fetchNewsFromAPI();
  const article = newsArticles.find((a: NewsArticle) => a.title.toLowerCase().replace(/\s+/g, '-') === slug);
  
  if (!article) return null;

  const category = categorizeArticle(article.title, article.description || '');
  const summary = await generateSummary(article.description || article.title);

  return {
    id: slug,
    slug,
    title: article.title,
    description: article.description || '',
    author: article.author,
    publishedAt: article.publishedAt,
    source: article.source,
    category,
    icon: categories[category as keyof typeof categories] || '📰',
    urlToImage: article.urlToImage,
    verifiedBy: undefined,
    summary,
  };
}

export function categorizeArticle(title: string, description: string): string {
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

async function generateSummary(content: string): Promise<string> {
  try {
    const response = await fetch('/api/generate-summary', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ content }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.summary;
  } catch (error) {
    console.error('Error generating summary:', error);
    return "An error occurred while generating the summary.";
  }
}
