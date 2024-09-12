import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { FaUser, FaCalendar, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import { useWallet } from '@solana/wallet-adapter-react';
import VerificationModal from '../components/VerificationModal';
import SourceDataModal from '../components/SourceDataModal';
import { supabase } from '../lib/supabaseClient';
import { verifyArticle } from '../lib/articleVerification';

export interface ArticleCardProps {
  id: string;
  slug: string;
  title: string;
  description: string;
  author: string;
  publishedAt: string;
  source: {
    name: string;
    [key: string]: string | number; 
  };
  category: string;
  icon: string;
  urlToImage: string | null;
  featured?: boolean;
  verifiedBy?: string;
  summary?: string;
}

const ArticleCard: React.FC<ArticleCardProps> = ({ 
  id, 
  slug,
  title, 
  description, 
  author, 
  publishedAt, 
  source, 
  category, 
  icon, 
  urlToImage, 
  featured = false,
}) => {
  const [isVerified, setIsVerified] = useState(false);
  const [verifier, setVerifier] = useState<string | undefined>(undefined);
  const [signature, setSignature] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showSourceDataModal, setShowSourceDataModal] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const wallet = useWallet();
  const [imageError, setImageError] = useState(false);

  const fetchVerificationStatus = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('articles')
        .select('verified, verifier, signature')
        .eq('slug', slug)
        .eq('verified', true)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setIsVerified(true);
        setVerifier(data.verifier);
        setSignature(data.signature);
      } else {
        console.log('Article not verified or not found');
        setIsVerified(false);
        setVerifier(undefined);
        setSignature(null);
      }
    } catch (error) {
      console.error('Error fetching verification status:', error);
      setIsVerified(false);
      setVerifier(undefined);
      setSignature(null);
    }
  }, [slug]);

  useEffect(() => {
    fetchVerificationStatus();
  }, [fetchVerificationStatus]);

  const handleVerification = async (sourceData: string) => {
    if (!wallet.connected || !wallet.publicKey || !wallet.signMessage) {
      console.log('Wallet not connected or missing required properties');
      return;
    }

    setIsVerifying(true);

    try {
      const message = `Verify article: ${slug}\nSource: ${sourceData}`;
      const encodedMessage = new TextEncoder().encode(message);
      const signatureBytes = await wallet.signMessage(encodedMessage);
      const base64Signature = Buffer.from(signatureBytes).toString('base64');
      const walletAddress = wallet.publicKey.toBase58();

      const result = await verifyArticle(
        slug,
        walletAddress,
        base64Signature,
        {
          title,
          content: description,
          sourceUrl: sourceData
        },
        wallet // Pass the entire wallet object
      );

      if (result.success) {
        await fetchVerificationStatus();
        setShowModal(true);
      } else {
        console.log('Verification failed:', result.message);
        // Optionally, show an error message to the user
      }
    } catch (error) {
      console.error('Error verifying article:', error);
      // Optionally, show an error message to the user
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <>
      <div className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 border border-gray-200 flex flex-col h-full">
        <Link href={`/article/${id}`} className="block flex-grow">
          <div className="relative w-full h-48">
            <Image
              src={imageError ? '/placeholder-image.jpg' : (urlToImage || '/placeholder-image.jpg')}
              alt={title}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              style={{ objectFit: 'cover' }}
              onError={() => setImageError(true)}
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
            <div className="text-xs flex justify-between mt-2">
              <div className="flex flex-col">
                {isVerified ? (
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
              <div className="flex flex-col text-right">
                {isVerified && signature ? (
                  <span className="text-pink-600">
                    Signature: {`${signature.slice(0, 4)}...${signature.slice(-4)}`}
                  </span>
                ) : null}
              </div>
            </div>
          </div>
        </Link>
        <div className="px-4 pb-4 mt-auto flex space-x-2">
          <button
            onClick={() => setShowSourceDataModal(true)}
            className={`flex-1 py-2 rounded-md text-white font-semibold transition duration-300 ${
              isVerified ? 'bg-green-500 cursor-not-allowed' : isVerifying ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-600'
            }`}
            disabled={isVerified || isVerifying}
          >
            {isVerified ? 'Verified' : isVerifying ? 'Verifying...' : 'Verify Article'}
          </button>
          <Link href={`/article/${id}`} className="flex-1">
            <button className="w-full py-2 rounded-md text-white font-semibold transition duration-300 bg-purple-500 hover:bg-purple-600">
              Read Summary
            </button>
          </Link>
        </div>
      </div>
      {showSourceDataModal && (
        <SourceDataModal
          isOpen={showSourceDataModal}
          onClose={() => setShowSourceDataModal(false)}
          onSubmit={handleVerification}
          articleTitle={title}
          articleSlug={slug}
        />
      )}
      {showModal && (
        <VerificationModal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          title={title}
          verifier={verifier || ''}
          signature={signature || ''}
        />
      )}
    </>
  );
};

export default ArticleCard;