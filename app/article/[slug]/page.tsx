import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { FaUser, FaCalendar, FaCheckCircle, FaTimesCircle, FaLink, FaTag } from 'react-icons/fa';
import { getArticleBySlug } from '../../lib/serverNewsFetcher';
import { categories } from '../../lib/serverNewsFetcher';
import { GenerateSummary } from './GenerateSummary';

export default async function ArticlePage({ params }: { params: { slug: string } }) {
  const article = await getArticleBySlug(params.slug);

  if (!article) {
    return (
      <div className="min-h-screen bg-gray-100">
        <main className="container mx-auto px-4 py-8">
          <h1 className="text-4xl font-bold mb-4">Article Not Found</h1>
          <p className="text-gray-800 leading-relaxed">
            Sorry, the article you&apos;re looking for doesn&apos;t exist.
          </p>
          <Link href="/" className="text-blue-500 hover:underline mt-4 inline-block">
            Return to Home
          </Link>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <main className="container mx-auto px-4 py-8">
        <article className="bg-white rounded-lg shadow-md p-6">
          <h1 className="text-4xl font-bold mb-4">{article.title}</h1>
          
          {/* Article metadata */}
          <div className="flex flex-wrap items-center mb-6 text-gray-600">
            <span className="mr-4 flex items-center">
              {categories[article.category as keyof typeof categories]} {article.category}
            </span>
            <span className="mr-4 flex items-center"><FaUser className="mr-1" /> {article.author}</span>
            <span className="mr-4 flex items-center"><FaCalendar className="mr-1" /> {new Date(article.publishedAt).toLocaleDateString()}</span>
            <span className="flex items-center"><FaLink className="mr-1" /> {article.source.name}</span>
          </div>
          
          {/* Featured image */}
          {article.urlToImage && (
            <div className="mb-6 relative w-full h-64 md:h-96">
              <Image 
                src={article.urlToImage} 
                alt={article.title} 
                fill 
                style={{ objectFit: 'cover' }} 
                className="rounded-lg"
              />
            </div>
          )}
          
          {/* Verification status */}
          <div className="mb-6 p-4 bg-gray-100 rounded-lg">
            {article.verifiedBy ? (
              <span className="text-green-600 flex items-center">
                <FaCheckCircle className="mr-2" /> 
                Verified by {`${article.verifiedBy.slice(0, 4)}...${article.verifiedBy.slice(-4)}`}
              </span>
            ) : (
              <span className="text-red-600 flex items-center">
                <FaTimesCircle className="mr-2" /> Unverified
              </span>
            )}
          </div>
          
          {/* Full article */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Full Article</h2>
            <div className="text-gray-800 leading-relaxed whitespace-pre-wrap">{article.description}</div>
          </section>
          
          {/* AI Summary */}
          <section className="mb-8 bg-blue-50 p-4 rounded-lg">
            <h2 className="text-2xl font-semibold mb-2">AI Summary</h2>
            <GenerateSummary content={article.description} />
          </section>
          
          {/* Tags */}
          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-2">Related Tags</h2>
            <div className="flex flex-wrap gap-2">
              {generateTags(article.title, article.description).map((tag, index) => (
                <span key={index} className="bg-gray-200 text-gray-700 px-2 py-1 rounded-full text-sm flex items-center">
                  <FaTag className="mr-1" /> {tag}
                </span>
              ))}
            </div>
          </section>
          
          {/* Navigation */}
          <div className="mt-8 flex justify-between items-center">
            <Link href="/" className="text-blue-500 hover:underline">
              Back to Home
            </Link>
            <button 
              onClick={() => window.history.back()} 
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
            >
              Go Back
            </button>
          </div>
        </article>
      </main>
    </div>
  );
}

function generateTags(title: string, description: string): string[] {
  const text = `${title} ${description}`.toLowerCase();
  const words = text.split(/\W+/);
  const commonWords = new Set(['the', 'a', 'an', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by']);
  const tags = words
    .filter(word => word.length > 3 && !commonWords.has(word))
    .reduce((acc, word) => {
      acc[word] = (acc[word] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  
  return Object.entries(tags)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([tag]) => tag);
}