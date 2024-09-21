import React, { useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { Connection, PublicKey } from '@solana/web3.js';
import { TOKEN_PROGRAM_ID } from '@solana/spl-token';
import Image from 'next/image';

const USDCBalanceButton: React.FC = () => {
  const [balance, setBalance] = useState<number | null>(null);
  const { publicKey } = useWallet();

  useEffect(() => {
    const fetchBalance = async () => {
      if (!publicKey) return;

      const connection = new Connection('https://api.devnet.solana.com');
      const tokenMintAddress = new PublicKey('5ruoovCtJDSuQcrUU3LQ4yMZuSAVBGCc6885Qh6P2Vz9');

      try {
        const tokenAccounts = await connection.getParsedTokenAccountsByOwner(publicKey, {
          programId: TOKEN_PROGRAM_ID,
        });

        const usdcAccount = tokenAccounts.value.find(
          (account) => account.account.data.parsed.info.mint === tokenMintAddress.toString()
        );

        if (usdcAccount) {
          const usdcBalance = usdcAccount.account.data.parsed.info.tokenAmount.uiAmount;
          setBalance(usdcBalance);
        } else {
          setBalance(0);
        }
      } catch (error) {
        console.error('Error fetching USDC balance:', error);
        setBalance(null);
      }
    };

    fetchBalance();
  }, [publicKey]);

  return (
    <button className="bg-gray-800 hover:bg-gray-700 text-gray-200 font-bold py-2 px-4 rounded border border-gray-200 h-[48px] flex items-center justify-center">
      <Image src="/stakeSOL-logo.png" alt="stakeSOL Logo" width={24} height={24} unoptimized />
      <span className="ml-2">
        {balance !== null ? `${balance.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}` : 'Loading...'}
      </span>
    </button>
  );
};

export default USDCBalanceButton;
