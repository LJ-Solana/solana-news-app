"use client"

import { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import { ArticleCardProps } from '../components/ArticleCard';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';

const ANTHROPIC_API_KEY = process.env.NEXT_PUBLIC_ANTHROPIC_API_KEY;
const NEWS_API_KEY = process.env.NEXT_PUBLIC_NEWS_API_KEY;

interface NewsArticle {
  title: string;
  description?: string;
  author: string;
  urlToImage?: string;
}

async function fetchNewsFromAPI() {
  const url = `https://newsapi.org/v2/top-headlines?country=us&pageSize=30&apiKey=${NEWS_API_KEY}`;
  
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    
    // Filter out articles with [removed] in the title or description, with unknown authors, or without images
    const filteredArticles = data.articles.filter((article: NewsArticle) => 
      !article.title.includes('[removed]') && 
      !article.description?.includes('[removed]') &&
      article.author && article.author !== 'unknown' &&
      article.urlToImage
    );

    return filteredArticles;
  } catch (error) {
    console.error('Error fetching news:', error);
    return [];
  }
}

async function getNews() {
  try {
    const newsArticles = await fetchNewsFromAPI();
    
    const articlesWithIds = newsArticles.map((article: ArticleCardProps) => {
      const id = uuidv4();
      return {
        ...article,
        id,
        slug: id, // Use the same UUID for both id and slug
      };
    });

    // Query Supabase for verified articles
    const { data: verifiedArticles, error } = await supabase
      .from('articles')
      .select('slug, verifier')
      .in('slug', articlesWithIds.map((a: { slug: string }) => a.slug));

    if (error) {
      console.error("Error fetching verified articles:", error);
    }

    // Create a map of verified articles for quick lookup
    const verifiedMap = new Map(verifiedArticles?.map(a => [a.slug, a.verifier]) || []);
    
    // Add verification status to each article
    const articlesWithVerification = articlesWithIds.map((article: ArticleCardProps) => {
      const slug = article.slug;
      return {
        ...article,
        slug,
        verifiedBy: verifiedMap.get(slug) || undefined
      };
    });

    // Generate summaries for each article
    const articlesWithSummaries = await Promise.all(
        articlesWithVerification.map(async (article: ArticleCardProps) => {
          const summary = await generateSummary(article.description);
          return { ...article, summary };
        })
      );
  
      return articlesWithSummaries;
    } catch (error) {
      console.error("Failed to fetch news:", error);
      return []; 
    }
  }

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
        const processedArticles = newsData.map((article: ArticleCardProps) => ({
          ...article,
          category: categorizeArticle(article.title, article.description),
          icon: categories[categorizeArticle(article.title, article.description) as keyof typeof categories] || '📰',
        }));
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

// Add this new function
export async function getArticleBySlug(slug: string): Promise<ArticleCardProps | null> {
  const newsArticles = await fetchNewsFromAPI();
  const article = newsArticles.find(a => a.slug === slug);
  
  if (!article) return null;

  const category = categorizeArticle(article.title, article.description);
  const summary = await generateSummary(article.description || article.title);

  return {
    ...article,
    id: slug,
    slug,
    category,
    icon: categories[category as keyof typeof categories] || '📰',
    summary,
  };
}