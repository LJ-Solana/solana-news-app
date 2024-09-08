import React from 'react';
import WalletButton from '../components/WalletButton';
import Link from 'next/link';
import { FaTrophy, FaArrowLeft } from 'react-icons/fa';

export default function VerifyArticlePage() {
  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-4">
          <Link href="/" className="text-black hover:text-blue-600">
            <FaArrowLeft className="text-2xl" aria-label="Back to Home" />
          </Link>
          <div className="flex space-x-4">
            <Link href="/leaderboard" className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-md transition duration-300 flex items-center">
              <FaTrophy className="mr-2" /> Leaderboard
            </Link>
            <WalletButton />
          </div>
        </div>
        <main>
          <h1 className="text-3xl font-bold mb-6">Verify Article</h1>
          {/* Add your article verification form or component here */}
          <p>Article verification functionality will be implemented here.</p>
        </main>
      </div>
    </div>
  );
}