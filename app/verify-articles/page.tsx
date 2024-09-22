"use client";

import React from 'react';
import WalletButton from '../components/WalletButton';
import USDCBalanceButton from '../components/USDCBalanceButton';
import Link from 'next/link';
import { FaArrowLeft, FaInfoCircle } from 'react-icons/fa';


export default function VerifyArticlePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-4">
          <Link href="/" className="text-gray-300 hover:text-blue-400">
            <FaArrowLeft className="text-2xl" aria-label="Back to Home" />
          </Link>
          <div className="flex space-x-4">
            <USDCBalanceButton />
            <WalletButton />
          </div>
        </div>
        <main className="bg-gray-800 p-8 rounded-lg shadow-md">
          <h1 className="text-3xl font-bold mb-6 text-gray-100">How Article Contribution Works</h1>
          <div className="space-y-6 text-gray-300">
            <p className="flex items-start">
              <FaInfoCircle className="text-blue-400 mr-2 mt-1 flex-shrink-0" />
              To contribute an article, you need to deposit 0.05 worth of News Tokens into an escrow contract. This helps ensure the quality and commitment of our contribution process.
            </p>
            <h2 className="text-2xl font-semibold text-gray-200">Escrow Process:</h2>
            <ol className="list-decimal list-inside space-y-4 pl-4">
              <li>Connect your wallet containing News Tokens.</li>
              <li>When you choose to contribute an article, 0.05 worth of News Tokens will be automatically deposited into the escrow contract.</li>
              <li>This deposit is held securely while you complete the contribution process.</li>
              <li>If your article is accepted, your deposit is returned to you along with any earned rewards.</li>
              <li>If your article is rejected due to quality issues or policy violations, you may lose your deposit as a penalty.</li>
            </ol>
            <p className="flex items-start">
              <FaInfoCircle className="text-blue-400 mr-2 mt-1 flex-shrink-0" />
              This escrow system encourages high-quality contributions while deterring low-effort or inappropriate submissions.
            </p>
            <div className="bg-gray-700 border-l-4 border-blue-500 p-4 mt-6">
              <p className="font-semibold">Important:</p>
              <p>Ensure you have at least $5 worth of News Tokens in your wallet before attempting to contribute an article. Insufficient funds will prevent you from participating in the contribution process.</p>
            </div>
          </div>
          <div className="mt-8">
            <Link href="/" className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition duration-300">
              Start Contributing Articles
            </Link>
          </div>
        </main>
      </div>
    </div>
  );
}