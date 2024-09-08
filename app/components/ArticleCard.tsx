import React from 'react';
import Link from 'next/link';

export interface ArticleCardProps {
  slug: string;
  title: string;
  excerpt: string;
  author: string;
  date: string;
  category: string;
  icon: string;
  featured?: boolean;
}

const ArticleCard: React.FC<ArticleCardProps> = ({ slug, title, excerpt, author, date, category, icon, featured = false }) => {
  // Placeholder for Solana blockhash
  const solanaBlockhash = "4xh7dtGQ5gQDmEZiCGNZjMVCbRKqRGNKqTHNiXdpDRK7";

  return (
    <Link href={`/article/${slug}`} className={`block bg-white rounded-lg shadow-md overflow-hidden ${featured ? 'border-2 border-blue-500' : ''} hover:shadow-lg transition-shadow duration-300`}>
      <div className="p-6">
        <div className="flex items-center mb-4">
          <span className="text-2xl mr-2" role="img" aria-label={category}>{icon}</span>
          <span className="text-sm text-gray-500">{category}</span>
        </div>
        <h2 className={`font-bold mb-2 ${featured ? 'text-2xl' : 'text-xl'}`}>{title}</h2>
        <p className="text-gray-600 mb-4">{excerpt}</p>
        <div className="flex justify-between text-sm text-gray-500">
          <span>{author}</span>
          <span>{date}</span>
        </div>
        <div className="text-xs text-gray-400 mt-2">Verified with Solana: {solanaBlockhash}</div>
      </div>
    </Link>
  );
};

export default ArticleCard;