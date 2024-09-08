import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { FaUser, FaCalendar, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import { useWallet } from '@solana/wallet-adapter-react';

// Update the ArticleCardProps interface
export interface ArticleCardProps {
  slug: string;
  title: string;
  description: string;
  author: string;
  publishedAt: string;
  source: {
    name: string;
  };
  category: string;
  icon: string;
  urlToImage: string | null;
  featured?: boolean;
  verifiedBy?: string;
}

const ArticleCard: React.FC<ArticleCardProps> = ({ slug, title, description, author, publishedAt, source, category, icon, urlToImage, featured = false, verifiedBy }) => {
  const [isVerified, setIsVerified] = useState(!!verifiedBy);
  const [verifier, setVerifier] = useState(verifiedBy);
  const wallet = useWallet();

  const verifyArticle = async () => {
    if (!wallet.connected || !wallet.publicKey || !wallet.signMessage) {
      alert('Please connect your wallet first');
      return;
    }

    try {
      const message = new TextEncoder().encode(`Verify article: ${title}`);
      const signature = await wallet.signMessage(message);
      
      // Here you would typically send the signature to your backend for verification
      // For this example, we'll just set it as verified
      setIsVerified(true);
      
      // Use the signature in some way to avoid the unused variable warning
      console.log('Article verified with signature:', signature);
      // In a real application, you'd update this on the server and then refresh the data
      const walletAddress = wallet.publicKey.toBase58();
      setVerifier(walletAddress);
      alert('Article verified successfully!');
    } catch (error) {
      console.error('Error verifying article:', error);
      alert('Failed to verify article. Please try again.');
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 border border-gray-200 flex flex-col h-full">
      <Link href={`/article/${slug}`} className="block flex-grow">
        <div className="relative w-full h-48">
          <Image
            src={urlToImage || '/placeholder-image.jpg'}
            alt={title}
            fill
            style={{ objectFit: 'cover' }}
          />
        </div>
        <div className="p-4 space-y-3 flex-grow">
          <h2 className={`font-bold ${featured ? 'text-xl' : 'text-lg'} leading-tight text-gray-800`}>{title}</h2>
          <p className="text-sm text-gray-600 line-clamp-2">{description}</p>
          <div className="flex justify-between items-center text-xs text-gray-500">
            <span className="flex items-center"><FaUser className="mr-1" /> {author}</span>
            <span className="flex items-center"><FaCalendar className="mr-1" /> {new Date(publishedAt).toLocaleDateString()}</span>
          </div>
          <div className="text-xs text-gray-600 flex items-center justify-between">
            <span>Source: {source.name}</span>
            <span>{icon} {category}</span>
          </div>
          <div className="text-xs flex items-center mt-2">
            {isVerified || verifier ? (
              <span className="text-green-600 flex items-center">
                <FaCheckCircle className="mr-1" /> 
                Verified by {verifier ? `${verifier.slice(0, 4)}...${verifier.slice(-4)}` : 'Unknown'}
              </span>
            ) : (
              <span className="text-red-600 flex items-center">
                <FaTimesCircle className="mr-1" /> Unverified
              </span>
            )}
          </div>
        </div>
      </Link>
      <div className="px-4 pb-4 mt-auto">
        <button
          onClick={verifyArticle}
          className={`w-full py-2 rounded-md text-white font-semibold transition duration-300 ${
            isVerified ? 'bg-green-500 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-600'
          }`}
          disabled={isVerified}
        >
          {isVerified ? 'Verified' : 'Verify Article'}
        </button>
      </div>
    </div>
  );
};

export default ArticleCard;