"use client";

import React, { useState } from 'react';
import WalletButton from '../components/WalletButton';
import Link from 'next/link';
import { FaTrophy, FaArrowLeft, FaLock } from 'react-icons/fa';
import { useWallet } from '@solana/wallet-adapter-react';
import { Connection, PublicKey, Transaction, SystemProgram, LAMPORTS_PER_SOL } from '@solana/web3.js';

export default function VerifyArticlePage() {
  const [amount, setAmount] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const wallet = useWallet();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');

    if (!wallet.connected || !wallet.publicKey || !wallet.signTransaction) {
      setError('Please connect your wallet first');
      setIsLoading(false);
      return;
    }

    try {
      const connection = new Connection(process.env.NEXT_PUBLIC_SOLANA_RPC_URL || '');
      const escrowAccount = new PublicKey(process.env.NEXT_PUBLIC_ESCROW_ACCOUNT || '');
      
      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: wallet.publicKey,
          toPubkey: escrowAccount,
          lamports: LAMPORTS_PER_SOL * parseFloat(amount)
        })
      );

      const { blockhash } = await connection.getRecentBlockhash();
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = wallet.publicKey;

      const signedTransaction = await wallet.signTransaction(transaction);
      const txid = await connection.sendRawTransaction(signedTransaction.serialize());

      await connection.confirmTransaction(txid);

      setSuccess(`Successfully added ${amount} SOL to escrow. You are now approved as a verifier!`);
    } catch (err) {
      setError('Failed to add SOL to escrow. Please try again.');
      console.error(err);
    }

    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-100 to-gray-200">
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
        <main className="bg-white p-8 rounded-lg shadow-md">
          <h1 className="text-3xl font-bold mb-6 text-gray-800">Become a Verifier</h1>
          <p className="mb-6 text-gray-600">To become a verifier, you need to add a minimum of <strong>0.25 SOL</strong> to an escrow account. This helps ensure the integrity of our verification process.</p>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="amount" className="block text-sm font-medium text-gray-700">Amount of SOL to add to escrow</label>
              <input
                type="number"
                id="amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                placeholder="Enter amount"
                required
              />
            </div>
            <button
              type="submit"
              disabled={isLoading || !wallet.connected}
              className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${isLoading || !wallet.connected ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {isLoading ? 'Processing...' : 'Add SOL to Escrow'}
              <FaLock className="ml-2" />
            </button>
          </form>
          {error && <p className="mt-4 text-red-600">{error}</p>}
          {success && <p className="mt-4 text-green-600">{success}</p>}
        </main>
      </div>
    </div>
  );
}