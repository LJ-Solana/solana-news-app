"use client";

import React from 'react';
import WalletButton from '../components/WalletButton';
import USDCBalanceButton from '../components/USDCBalanceButton';
import Link from 'next/link';
import { FaArrowLeft, FaInfoCircle } from 'react-icons/fa';


export default function VerifyArticlePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-100 to-gray-200">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-4">
          <Link href="/" className="text-black hover:text-blue-600">
            <FaArrowLeft className="text-2xl" aria-label="Back to Home" />
          </Link>
          <div className="flex space-x-4">
            <USDCBalanceButton />
            <WalletButton />
          </div>
        </div>
        <main className="bg-white p-8 rounded-lg shadow-md">
          <h1 className="text-3xl font-bold mb-6 text-gray-800">How Article Verification Works</h1>
          <div className="space-y-6 text-gray-600">
            <p className="flex items-start">
              <FaInfoCircle className="text-blue-500 mr-2 mt-1 flex-shrink-0" />
              To verify an article, you need to deposit $5 USDC into an escrow contract. This helps ensure the integrity and commitment of our verification process.
            </p>
            <h2 className="text-2xl font-semibold text-gray-700">Escrow Process:</h2>
            <ol className="list-decimal list-inside space-y-4 pl-4">
              <li>Connect your wallet containing USDC tokens.</li>
              <li>When you choose to verify an article, $5 USDC will be automatically deposited into the escrow contract.</li>
              <li>This deposit is held securely while you complete the verification process.</li>
              <li>If your verification is accepted, your deposit is returned to you along with any earned rewards.</li>
              <li>If your verification is challenged and found to be incorrect, you will lose your deposit as a penalty.</li>
            </ol>
            <p className="flex items-start">
              <FaInfoCircle className="text-blue-500 mr-2 mt-1 flex-shrink-0" />
              This escrow system encourages accurate and honest verifications while deterring malicious behavior.
            </p>
            <div className="bg-blue-100 border-l-4 border-blue-500 p-4 mt-6">
              <p className="font-semibold">Important:</p>
              <p>Ensure you have at least $5 USDC in your wallet before attempting to verify an article. Insufficient funds will prevent you from participating in the verification process.</p>
            </div>
          </div>
          <div className="mt-8">
            <Link href="/" className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition duration-300">
              Start Verifying Articles
            </Link>
          </div>
        </main>
      </div>
    </div>
  );
}