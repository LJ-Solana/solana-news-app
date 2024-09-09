import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { FaUser, FaCalendar, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import { useWallet } from '@solana/wallet-adapter-react';
import { handleVerifyArticle } from '../lib/articleVerification';
import VerificationModal from '../components/VerificationModal';
import SourceDataModal from '../components/SourceDataModal';
import { supabase } from '../lib/supabaseClient';

export interface ArticleCardProps {
  id: string;
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
  summary?: string;
}

const ArticleCard: React.FC<ArticleCardProps> = ({ slug, title, description, author, publishedAt, source, category, icon, urlToImage, featured = false }) => {
  const [isVerified, setIsVerified] = useState(false);
  const [verifier, setVerifier] = useState<string | undefined>(undefined);
  const [signature, setSignature] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showSourceDataModal, setShowSourceDataModal] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const wallet = useWallet();

  useEffect(() => {
    async function fetchVerificationStatus() {
      const { data, error } = await supabase
        .from('articles')
        .select('verified, verifier, signature')
        .eq('slug', slug)
        .single();

      if (error) {
        console.error('Error fetching verification status:', error);
      } else if (data) {
        setIsVerified(data.verified);
        setVerifier(data.verifier);
        setSignature(data.signature);
      }
    }

    fetchVerificationStatus();
  }, [slug]);

  const verifyArticle = async (sourceData: string) => {
    if (!wallet.connected || !wallet.publicKey || !wallet.signMessage) {
      console.log('Wallet not connected or missing required properties');
      console.log('Please connect your wallet first');
      return;
    }

    setIsVerifying(true);

    try {
      console.log(`Attempting to verify article with slug: ${slug}`);
      const message = new TextEncoder().encode(`Verify article: ${slug}\nSource: ${sourceData}`);
      console.log('Encoded message:', message);
      
      const signatureBytes = await wallet.signMessage(message);
      console.log('Signature obtained:', signatureBytes);
      
      const walletAddress = wallet.publicKey.toBase58();
      console.log('Wallet address:', walletAddress);
      
      const base64Signature = Buffer.from(signatureBytes).toString('base64');
      console.log('Base64 signature:', base64Signature);

      const result = await handleVerifyArticle(slug, walletAddress, base64Signature, sourceData);
      console.log('Verification result:', result);

      if (result.success) {
        setIsVerified(true);
        setVerifier(walletAddress);
        setSignature(base64Signature);
        console.log(`Article ${slug} verified by ${walletAddress}`);
        console.log(result.message);
        setShowModal(true);
      } else {
        console.log('Verification failed:', result.message);
        console.log(`Verification failed: ${result.message}`);
      }
    } catch (error) {
      console.log('Error verifying article:', error);
      if (error instanceof Error) {
        console.log('Error message:', error.message);
        console.log('Error stack:', error.stack);
      }
      console.log('An unexpected error occurred while verifying the article. Please try again.');
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <>
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
          <Link href={`/article/${slug}`} className="flex-1">
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
          onSubmit={verifyArticle}
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