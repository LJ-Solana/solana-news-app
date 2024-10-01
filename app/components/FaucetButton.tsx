import React, { useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { Connection, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { createMint, createAssociatedTokenAccount, mintTo } from '@solana/spl-token';
import { FaCoins } from 'react-icons/fa';

const FaucetButton: React.FC = () => {
  const { publicKey, signTransaction } = useWallet();
  const [isLoading, setIsLoading] = useState(false);

  const handleFaucet = async () => {
    if (!publicKey || !signTransaction) {
      alert('Please connect your wallet first');
      return;
    }

    setIsLoading(true);

    try {
      const connection = new Connection('https://api.devnet.solana.com', 'confirmed');

      // Create a new mint account
      const mint = await createMint(
        connection,
        { publicKey, signTransaction },
        publicKey,
        publicKey,
        9 // 9 decimals for NEWS token
      );

      // Create an associated token account for the user
      const tokenAccount = await createAssociatedTokenAccount(
        connection,
        { publicKey, signTransaction },
        mint,
        publicKey
      );

      // Mint 100 NEWS tokens to the user's account
      await mintTo(
        connection,
        { publicKey },
        mint,
        tokenAccount,
        publicKey,
        100 * LAMPORTS_PER_SOL // 100 NEWS tokens
      );

      alert('Successfully minted 100 NEWS tokens to your account!');
    } catch (error) {
      console.error('Error minting tokens:', error);
      alert('Failed to mint tokens. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button 
      onClick={handleFaucet}
      disabled={isLoading || !publicKey}
      className="wallet-adapter-button-trigger h-15 flex items-center"
    >
      <FaCoins className="mr-2" />
      {isLoading ? 'Minting...' : 'Get NEWS Token'}
    </button>
  );
};

export default FaucetButton;
