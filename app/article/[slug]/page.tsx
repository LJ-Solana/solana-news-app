import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { FaUser, FaCalendar, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import { getArticleData } from '../../lib/getArticleData';
import { GenerateSummary } from './GenerateSummary';

export default async function ArticlePage({ params }: { params: { slug: string } }) {
  const article = await getArticleData(params.slug);

  if (!article) {
    return (
      <div className="min-h-screen bg-gray-100">
        <main className="container mx-auto px-4 py-8">
          <h1 className="text-4xl font-bold mb-4">Article Not Found</h1>
          <p className="text-gray-800 leading-relaxed">
            Sorry, the article you're looking for doesn't exist.
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
          <div className="flex items-center mb-4 text-gray-600">
            <span className="mr-4">{article.icon} {article.category}</span>
            <span className="mr-4 flex items-center"><FaUser className="mr-1" /> {article.author}</span>
            <span className="flex items-center"><FaCalendar className="mr-1" /> {new Date(article.publishedAt).toLocaleDateString()}</span>
          </div>
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
          <div className="mb-4">
            {article.verifiedBy ? (
              <span className="text-green-600 flex items-center">
                <FaCheckCircle className="mr-1" /> 
                Verified by {`${article.verifiedBy.slice(0, 4)}...${article.verifiedBy.slice(-4)}`}
              </span>
            ) : (
              <span className="text-red-600 flex items-center">
                <FaTimesCircle className="mr-1" /> Unverified
              </span>
            )}
          </div>
          <h2 className="text-2xl font-semibold mb-2">AI Summary</h2>
          <GenerateSummary content={article.description} />
          <h2 className="text-2xl font-semibold mb-2">Original Article</h2>
          <p className="text-gray-800 leading-relaxed">{article.description}</p>
          <div className="mt-6">
            <Link href="/" className="inline-block text-blue-500 hover:underline">
              Back to Home
            </Link>
          </div>
        </article>
      </main>
    </div>
  );
}