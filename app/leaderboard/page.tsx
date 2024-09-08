"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { FaTrophy, FaArrowLeft } from 'react-icons/fa';

interface LeaderboardEntry {
  walletAddress: string;
  verifiedCount: number;
}

const LeaderboardPage: React.FC = () => {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const response = await fetch('/api/leaderboard');
        if (!response.ok) {
          throw new Error('Failed to fetch leaderboard data');
        }
        const data = await response.json();
        setLeaderboard(data);
      } catch (err) {
        setError('Failed to load leaderboard. Please try again later.');
        console.error('Error fetching leaderboard:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLeaderboard();
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
            Verification Leaderboard
          </h1>
        </div>
        {isLoading ? (
          <p className="text-center text-gray-600">Loading leaderboard...</p>
        ) : error ? (
          <p className="text-center text-red-500">{error}</p>
        ) : (
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <ul className="divide-y divide-gray-200">
              {leaderboard.map((entry, index) => (
                <li key={entry.walletAddress} className="px-4 sm:px-6 py-4 flex items-center">
                  <span className="text-xl sm:text-2xl font-bold mr-3 sm:mr-4 text-gray-500 w-6 sm:w-8">{index + 1}</span>
                  <div className="flex-grow">
                    <p className="text-sm font-medium text-gray-900">
                      {entry.walletAddress.slice(0, 6)}...{entry.walletAddress.slice(-4)}
                    </p>
                    <p className="text-xs sm:text-sm text-gray-500">{entry.verifiedCount} verifications</p>
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
