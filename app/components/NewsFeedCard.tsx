import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { FaUser, FaCalendar } from 'react-icons/fa';
import { ArticleCardProps } from './ArticleCard';

const NewsFeedCard: React.FC<ArticleCardProps> = ({
  slug,
  title,
  description,
  author,
  publishedAt,
  url_to_image,
}) => {
  return (
    <Link href={`/article/${slug}`} className="block">
      <div className="flex items-center bg-gray-800 rounded-lg shadow-lg overflow-hidden hover:bg-gray-700 transition-all duration-300 border border-gray-700">
        <div className="w-1/4 relative h-28">
          <Image
            src={url_to_image || '/placeholder-image.png'}
            alt={title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
            style={{ objectFit: 'cover' }}
          />
        </div>
        <div className="w-3/4 p-4">
          <h3 className="font-bold text-lg text-gray-200 mb-1 line-clamp-1">{title}</h3>
          <p className="text-sm text-gray-400 line-clamp-2 mb-2">{description}</p>
          <div className="flex flex-wrap items-center text-xs text-gray-400 gap-2">
            <span className="flex items-center"><FaUser className="mr-1" /> {author}</span>
            <span className="flex items-center"><FaCalendar className="mr-1" /> {new Date(publishedAt).toLocaleDateString()}</span>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default NewsFeedCard;
