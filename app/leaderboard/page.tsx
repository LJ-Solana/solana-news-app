"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { FaTrophy, FaArrowLeft } from 'react-icons/fa';
import { supabase } from '../lib/supabaseClient';

interface Verifier {
  pubkey: string;
  verified_count: number;
  rating_count: number;
}

const LeaderboardPage: React.FC = () => {
  const [verifiers, setVerifiers] = useState<Verifier[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showContributions, setShowContributions] = useState(true);

  useEffect(() => {
    const fetchVerifiers = async () => {
      try {
        let query;
        if (showContributions) {
          const { data, error } = await supabase
            .from('articles')
            .select('verified_by')
            .not('verified_by', 'is', null);

          if (error) throw error;

          const verifierCounts = data.reduce((acc: { [key: string]: number }, article) => {
            const verifiers = article.verified_by as string[];
            verifiers.forEach(verifier => {
              acc[verifier] = (acc[verifier] || 0) + 1;
            });
            return acc;
          }, {});

          query = Object.entries(verifierCounts).map(([pubkey, verified_count]) => ({
            pubkey,
            verified_count,
            rating_count: 0 // We'll need to fetch this separately if needed
          }));
        } else {
          // Fetch rating counts (assuming you have a separate table or column for this)
          const { data, error } = await supabase
            .from('verifiers')
            .select('pubkey, rating_count');

          if (error) throw error;
          query = data;
        }

        // Sort the results
        const sortedVerifiers = query.sort((a, b) => {
          if (showContributions) {
            return ((b as Verifier).verified_count || 0) - ((a as Verifier).verified_count || 0);
          } else {
            return ((b as Verifier).rating_count || 0) - ((a as Verifier).rating_count || 0);
          }
        });

        // Ensure all required properties are present in the sorted verifiers
        const completeVerifiers: Verifier[] = sortedVerifiers.map(v => ({
          pubkey: v.pubkey,
          verified_count: showContributions ? ((v as any).verified_count || 0) : 0,
          rating_count: showContributions ? 0 : ((v as any).rating_count || 0)
        }));

        setVerifiers(completeVerifiers);
      } catch (err) {
        setError('Failed to load verifiers. Please try again later.');
        console.error('Error fetching verifiers:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchVerifiers();
  }, [showContributions]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 py-4 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto pt-12">
        <div className="flex items-center justify-between mb-8">
          <Link href="/" className="text-gray-300 hover:text-blue-400">
            <FaArrowLeft className="text-2xl" aria-label="Back to Home" />
          </Link>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-100 text-center flex-grow">
            <FaTrophy className="inline-block mr-4 text-yellow-500" />
             Leaderboard
          </h1>
        </div>
        <div className="flex justify-center mb-6">
          <div className="flex bg-gray-700 rounded-lg p-1">
            <button
              onClick={() => setShowContributions(true)}
              className={`flex items-center px-4 py-2 rounded-md ${
                showContributions
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-300 hover:bg-gray-600'
              }`}
            >
              Contributions
            </button>
            <button
              onClick={() => setShowContributions(false)}
              className={`flex items-center px-4 py-2 rounded-md ${
                !showContributions
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-300 hover:bg-gray-600'
              }`}
            >
              Ratings
            </button>
          </div>
        </div>
        <p className="text-center text-gray-400 mb-6">
          Top verifiers ranked by their {showContributions ? 'contribution to content verification' : 'rating activity'}.
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
                      {showContributions
                        ? `${verifier.verified_count} verifications`
                        : `${verifier.rating_count} ratings`}
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
