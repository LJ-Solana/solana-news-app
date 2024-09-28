"use client"

import React, { useEffect, useState } from 'react';
import { Connection, PublicKey } from '@solana/web3.js';
import { FaChartBar, FaNewspaper, FaStar } from 'react-icons/fa';

const programId = new PublicKey('DcyZJhRUd96TAEYV7a7rWofy6kz9QAqsji4fftcox89y');

const AnalyticsPage: React.FC = () => {
  const [contentCount, setContentCount] = useState<number>(0);
  const [ratingCount, setRatingCount] = useState<number>(0);
  const [averageRating, setAverageRating] = useState<string>('0');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchAccountData();
  }, []);

  const calculateTotalRatings = (contentAccounts: { totalRatings: bigint; sumOfRatings: bigint }[]) => {
    let totalRatings = BigInt(0);
    let totalSumOfRatings = BigInt(0);

    for (const account of contentAccounts) {
      totalRatings += account.totalRatings;
      totalSumOfRatings += account.sumOfRatings;
    }

    const avgRating = totalRatings > 0 ? Number(totalSumOfRatings) / Number(totalRatings) : 0;

    return {
      totalRatings: Number(totalRatings),
      averageRating: avgRating.toFixed(2),
    };
  };

  const fetchAccountData = async () => {
    setIsLoading(true);
    try {
      const connection = new Connection('https://ashely-3dqk65-fast-devnet.helius-rpc.com');

      const accounts = await connection.getProgramAccounts(programId);
      const contentAccounts = [];

      for (const account of accounts) {
        if (account.account.data.length >= 139) {  // Minimum size for a Content account
          const dataView = new DataView(account.account.data.buffer);
          contentAccounts.push({
            totalRatings: dataView.getBigUint64(131, true),  // Offset for total_ratings
            sumOfRatings: dataView.getBigUint64(139, true),  // Offset for sum_of_ratings
          });
        }
      }

      const { totalRatings, averageRating } = calculateTotalRatings(contentAccounts);

      setContentCount(contentAccounts.length);
      setRatingCount(totalRatings);
      setAverageRating(averageRating);
    } catch (error) {
      console.error('Failed to fetch program accounts:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-gradient-to-b from-gray-900 to-gray-800 min-h-screen text-gray-200">
      <div className="container mx-auto px-4 py-8">
        <header className="text-center mb-12">
          <h1 className="text-5xl font-extrabold text-gray-100 mb-4 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-green-300 flex items-center justify-center">
            <FaChartBar className="mr-4" />
            Analytics
          </h1>
        </header>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gray-800 shadow-lg rounded-lg p-6 mb-8">
                <h2 className="text-2xl font-bold mb-2">All On-Chain Articles</h2>
                {isLoading ? (
                <p className="text-xl">Loading...</p>
                ) : (
                <p className="text-4xl font-bold text-green-400">
                    <FaNewspaper className="inline-block mr-2" />
                    {contentCount}
                </p>
                )}
            </div>
          <div className="bg-gray-800 shadow-lg rounded-lg p-6 mb-8">
            <h2 className="text-2xl font-bold mb-2">All On-Chain Ratings</h2>
            {isLoading ? (
              <p className="text-xl">Loading...</p>
            ) : (
              <p className="text-4xl font-bold text-purple-400">
                <FaStar className="inline-block mr-2" />
                {ratingCount}
              </p>
            )}
          </div>
          <div className="bg-gray-800 shadow-lg rounded-lg p-6 mb-8">
            <h2 className="text-2xl font-bold mb-2">Average Rating</h2>
            {isLoading ? (
              <p className="text-xl">Loading...</p>
            ) : (
              <p className="text-4xl font-bold text-yellow-400">
                <FaStar className="inline-block mr-2" />
                {averageRating}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPage;