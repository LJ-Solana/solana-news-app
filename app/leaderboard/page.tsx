"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { FaTrophy, FaArrowLeft } from 'react-icons/fa';
import { supabase } from '../lib/supabaseClient';
import WarningBanner from '../components/WarningBanner';

interface Verifier {
  pubkey: string;
  verified_count: number;
}

const LeaderboardPage: React.FC = () => {
  const [verifiers, setVerifiers] = useState<Verifier[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchVerifiers = async () => {
      try {
        const { data, error } = await supabase
          .from('articles')
          .select('verified_by')
          .not('verified_by', 'is', null);

        if (error) throw error;

        console.log('Fetched data:', data); // Debug log

        const verifierCounts = data.reduce((acc: { [key: string]: number }, article) => {
          if (article.verified_by) {
            acc[article.verified_by] = (acc[article.verified_by] || 0) + 1;
          }
          return acc;
        }, {});

        console.log('Verifier counts:', verifierCounts); // Debug log

        const sortedVerifiers = Object.entries(verifierCounts)
          .map(([pubkey, verified_count]) => ({ pubkey, verified_count }))
          .sort((a, b) => b.verified_count - a.verified_count);

        setVerifiers(sortedVerifiers);
      } catch (err) {
        setError('Failed to load verifiers. Please try again later.');
        console.error('Error fetching verifiers:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchVerifiers();
  }, []);

  return (
    
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 ">
      <WarningBanner />
      <div className="max-w-3xl mx-auto pt-12">
        <div className="flex items-center justify-between mb-8">
          <Link href="/" className="absolute top-24 left-8 text-gray-300 hover:text-blue-400">
            <FaArrowLeft className="text-2xl" aria-label="Back to Home" />
          </Link>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-100 text-center flex-grow">
            <FaTrophy className="inline-block mr-4 text-yellow-500" />
             Leaderboard
          </h1>
        </div>
        <p className="text-center text-gray-400 mb-6">
          Top wallets ranked by their contribution to content verification.
        </p>
        {isLoading ? (
          <p className="text-center text-gray-400">Loading verifiers...</p>
        ) : error ? (
          <p className="text-center text-red-400">{error}</p>
        ) : (
          <div className="bg-gray-800 shadow overflow-hidden sm:rounded-lg">
            <ul className="divide-y divide-gray-700">
              {verifiers.map((verifier, index) => (
                <li key={verifier.pubkey} className="px-4 sm:px-6 py-4 flex items-center">
                  <span className="text-xl sm:text-2xl font-bold mr-3 sm:mr-4 text-gray-400 w-6 sm:w-8">{index + 1}</span>
                  <div className="flex-grow">
                    <p className="text-sm font-medium text-gray-200">
                      {verifier.pubkey && `${verifier.pubkey.slice(0, 6)}...${verifier.pubkey.slice(-4)}`}
                    </p>
                    <p className="text-xs sm:text-sm text-gray-400">
                      {`${verifier.verified_count} contributions`}
                    </p>
                  </div>
                  {index < 3 && (
                    <FaTrophy className={`text-xl sm:text-2xl ${
                      index === 0 ? 'text-yellow-500' :
                      index === 1 ? 'text-gray-400' :
                      'text-yellow-700'
                    }`} />
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default LeaderboardPage;
