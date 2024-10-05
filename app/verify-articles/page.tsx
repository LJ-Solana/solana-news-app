"use client";

import React from 'react';
import Link from 'next/link';
import { FaArrowLeft, FaInfoCircle, FaStar, FaExclamationTriangle, FaPencilAlt } from 'react-icons/fa';
import WalletButton from '../components/WalletButton';
import USDCBalanceButton from '../components/USDCBalanceButton';
// import FaucetButton from '../components/FaucetButton';

export default function VerifyArticlePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800">
      <div className="container mx-auto px-8 py-8">
        <div className="flex justify-between items-center mb-4">
          <Link href="/" className="text-gray-300 hover:text-blue-400">
            <FaArrowLeft className="text-2xl" aria-label="Back to Home" />
          </Link>
          <div className="flex space-x-4">
            {/* <FaucetButton /> */}
            <USDCBalanceButton />
            <WalletButton />
          </div>
        </div>
        <main className="bg-gray-800 p-8 rounded-lg shadow-md">
          <h1 className="text-3xl font-bold mb-6 text-gray-100">How Article Contribution Works</h1>
          <div className="space-y-6 text-gray-300">
            <p className="flex items-start">
              <FaInfoCircle className="text-blue-400 mr-2 mt-1 flex-shrink-0" />
              To contribute an article, you need to deposit 0.1 worth of News Tokens into an escrow contract. 
              This helps ensure the quality and commitment of our contribution process.
            </p>
            <h2 className="text-2xl font-semibold text-gray-200">Escrow and Rating Process:</h2>
            <ol className="list-decimal list-inside space-y-4">
              <li>Connect your wallet containing News Tokens.</li>
              <li>When you choose to contribute an article, 0.1 worth of News Tokens will be automatically deposited into the escrow contract.</li>
              <li>This deposit is held securely while you complete the contribution process.</li>
              <li>After submission, your article enters a 3-day rating period set by the smart contract.</li>
              <li>During this period, community members can rate your contribution.</li>
              <li>
                Once the rating period ends, the following outcomes apply:
                <div className="overflow-x-auto mt-4">
                  <table className="min-w-full bg-gray-700 text-gray-300 rounded-lg overflow-hidden">
                    <thead>
                      <tr>
                        <th className="px-6 py-3 border-b border-gray-600 text-left">Rating</th>
                        <th className="px-6 py-3 border-b border-gray-600 text-left">Outcomes</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="px-6 py-4 border-b border-gray-600">
                          <div className="flex items-center">
                            <FaStar className="text-yellow-400 mr-2" />
                            4.0 or higher
                          </div>
                        </td>
                        <td className="px-6 py-4 border-b border-gray-600">
                          <ul className="list-disc list-inside">
                            <li>Receive a token incentive</li>
                            <li>Get boosted staking rewards</li>
                            <li>Initial deposit is returned</li>
                          </ul>
                        </td>
                      </tr>
                      <tr>
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <FaExclamationTriangle className="text-red-400 mr-2" />
                            Below 4.0
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <ul className="list-disc list-inside">
                            <li>Percentage of escrowed staked SOL is slashed</li>
                            <li>Remaining deposit is returned</li>
                          </ul>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </li>
            </ol>
            <p className="flex items-start">
              <FaInfoCircle className="text-blue-400 mr-2 mt-1 flex-shrink-0" />
              This rating system encourages high-quality contributions while deterring low-effort or inappropriate submissions.
            </p>
            <div className="bg-gray-700 border-l-4 border-blue-500 p-6 mt-6 rounded-lg">
              <p className="font-semibold mb-2">Important:</p>
              <p>
                Ensure you have at least 0.25 worth of News Tokens in your wallet before attempting to contribute an article. 
                Insufficient funds will prevent you from participating in the contribution process.
              </p>
            </div>
          </div>
          <div className="mt-8 flex justify-center">
            <Link href="/" className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-8 rounded transition duration-300 flex items-center">
              <FaPencilAlt className="mr-2" /> Start Contributing Articles
            </Link>
          </div>
        </main>
      </div>
    </div>
  );
}