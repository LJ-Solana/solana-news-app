import React from 'react';
import Link from 'next/link';

const articles = [
  {
    slug: "breakthrough-in-quantum-computing",
    title: "Breakthrough in Quantum Computing",
    fullContent: "Scientists have achieved a new milestone in quantum supremacy, paving the way for revolutionary advancements in computing power and cryptography. This breakthrough involves...",
    author: "Dr. Quantum",
    date: "Sept 8, 2024",
    category: "Technology",
    icon: "🖥️"
  },
];

export default function ArticlePage({ params }: { params: { slug: string } }) {
  const article = articles.find(a => a.slug === params.slug);

  if (!article) {
    return (
      <div className="min-h-screen bg-gray-100">
        <main className="container mx-auto px-4 py-8">
          <h1 className="text-4xl font-bold mb-4">Article Not Found</h1>
          <p className="text-gray-800 leading-relaxed">
            Sorry, the article youre looking for doesnt exist.
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
            <span className="mr-4">By {article.author}</span>
            <span>{article.date}</span>
          </div>
          <p className="text-gray-800 leading-relaxed">{article.fullContent}</p>
        </article>
      </main>
    </div>
  );
}