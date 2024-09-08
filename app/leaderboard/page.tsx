"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { FaTrophy, FaArrowLeft } from 'react-icons/fa';
import { supabase } from '../lib/supabaseClient';

interface Verifier {
  id: number;
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
          .from('verifiers')
          .select('*')
          .order('verified_count', { ascending: false });

        if (error) throw error;

        setVerifiers(data || []);
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
    <div className="min-h-screen bg-gradient-to-b from-gray-100 to-gray-200 py-4 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto pt-12">
        <div className="flex items-center justify-between mb-8">
          <Link href="/" className="text-black hover:text-blue-600">
            <FaArrowLeft className="text-2xl" aria-label="Back to Home" />
          </Link>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 text-center flex-grow">
            <FaTrophy className="inline-block mr-4 text-yellow-500" />
            Verifiers Leaderboard
          </h1>
        </div>
        {isLoading ? (
          <p className="text-center text-gray-600">Loading verifiers...</p>
        ) : error ? (
          <p className="text-center text-red-500">{error}</p>
        ) : (
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <ul className="divide-y divide-gray-200">
              {verifiers.map((verifier, index) => (
                <li key={verifier.id} className="px-4 sm:px-6 py-4 flex items-center">
                  <span className="text-xl sm:text-2xl font-bold mr-3 sm:mr-4 text-gray-500 w-6 sm:w-8">{index + 1}</span>
                  <div className="flex-grow">
                    <p className="text-sm font-medium text-gray-900">
                      {verifier.pubkey && `${verifier.pubkey.slice(0, 6)}...${verifier.pubkey.slice(-4)}`}
                    </p>
                    <p className="text-xs sm:text-sm text-gray-500">{verifier.verified_count} verifications</p>
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
