"use client"

import React, { useEffect, useState } from 'react';
import { Connection, PublicKey } from '@solana/web3.js';
import { FaChartBar, FaNewspaper, FaStar } from 'react-icons/fa';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const programId = new PublicKey('DcyZJhRUd96TAEYV7a7rWofy6kz9QAqsji4fftcox89y');

const AnalyticsPage: React.FC = () => {
  const [contentCount, setContentCount] = useState<number>(0);
  const [totalRatings, setTotalRatings] = useState<number>(0);
  const [averageRating, setAverageRating] = useState<string>('0');
  const [isLoading, setIsLoading] = useState(false);
  const [dailyWalletLogins, setDailyWalletLogins] = useState<{ [key: string]: number }>({});

  useEffect(() => {
    fetchAccountData();
    fetchDailyWalletLogins();
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
      setTotalRatings(totalRatings);
      setAverageRating(averageRating);
    } catch (error) {
      console.error('Failed to fetch program accounts:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchDailyWalletLogins = async () => {
    // This is a mock function. In a real scenario, you would fetch this data from your backend or analytics service
    const mockData = {
      '2023-05-01': 120,
      '2023-05-02': 150,
      '2023-05-03': 180,
      '2023-05-04': 200,
      '2023-05-05': 190,
      '2023-05-06': 210,
      '2023-05-07': 230,
    };
    setDailyWalletLogins(mockData);
  };

  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    } else {
      return num.toString();
    }
  };

  const chartData = {
    labels: Object.keys(dailyWalletLogins),
    datasets: [
      {
        label: 'Daily Wallet Logins',
        data: Object.values(dailyWalletLogins),
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Daily Wallet Logins',
      },
    },
  };

  return (
    <div className="bg-gradient-to-b from-gray-900 to-gray-800 min-h-screen text-gray-200">
      <div className="container mx-auto px-4 py-8">
        <header className="text-center mb-12">
          <h1 className="text-5xl font-extrabold text-gray-100 mb-4 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-green-300 flex items-center justify-center">
            <FaChartBar className="mr-4" />
            Byte Analytics
          </h1>
        </header>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div className="bg-gray-800 shadow-lg rounded-lg p-6 mb-4 flex flex-col items-center justify-center">
            <h2 className="text-2xl font-bold mb-2 text-center">All On-Chain Articles</h2>
            {isLoading ? (
              <p className="text-xl text-center">Loading...</p>
            ) : (
              <p className="text-4xl font-bold text-green-400 text-center">
                <FaNewspaper className="inline-block mr-2" />
                {contentCount}
              </p>
            )}
          </div>
          <div className="bg-gray-800 shadow-lg rounded-lg p-6 mb-4 flex flex-col items-center justify-center">
            <h2 className="text-2xl font-bold mb-2 text-center">Total Ratings</h2>
            {isLoading ? (
              <p className="text-xl text-center">Loading...</p>
            ) : (
              <p className="text-4xl font-bold text-purple-400 text-center">
                <FaStar className="inline-block mr-2" />
                {formatNumber(totalRatings)}
              </p>
            )}
          </div>
          <div className="bg-gray-800 shadow-lg rounded-lg p-6 mb-4 flex flex-col items-center justify-center">
            <h2 className="text-2xl font-bold mb-2 text-center">Average Rating</h2>
            {isLoading ? (
              <p className="text-xl text-center">Loading...</p>
            ) : (
              <p className="text-4xl font-bold text-yellow-400 text-center">
                <FaStar className="inline-block mr-2" />
                {averageRating}
              </p>
            )}
          </div>
        </div>
        
        <div className="bg-gray-800 shadow-lg rounded-lg p-6 mb-8">
          <h2 className="text-2xl font-bold mb-4 text-center">Daily Wallet Logins</h2>
          <Bar data={chartData} options={chartOptions} />
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPage;