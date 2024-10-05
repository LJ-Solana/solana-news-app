// import React, { useState } from 'react';
// import { useWallet } from '@solana/wallet-adapter-react';
// import { FaCoins } from 'react-icons/fa';

// const FaucetButton: React.FC = () => {
//   const { publicKey } = useWallet();
//   const [isLoading, setIsLoading] = useState(false);

//   const handleFaucet = async () => {
//     if (!publicKey) {
//       alert('Please connect your wallet first');
//       return;
//     }

//     setIsLoading(true);

//     try {
//       const response = await fetch('/api/faucet', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({ walletAddress: publicKey.toBase58() }),
//       });

//       if (!response.ok) {
//         const errorData = await response.json();
//         throw new Error(errorData.message || 'Faucet request failed');
//       }

//       const data = await response.json();
//       alert(data.message || 'Successfully minted 100 NEWS tokens to your account!');
//     } catch (error) {
//       console.error('Error minting tokens:', error);
//       if (error instanceof Error) {
//         alert(`Failed to mint tokens: ${error.message}`);
//       } else {
//         alert('Failed to mint tokens. Please try again.');
//       }
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   return (
//     <button 
//       onClick={handleFaucet}
//       disabled={isLoading || !publicKey}
//       className="wallet-adapter-button-trigger h-12 flex items-center"
//     >
//       <FaCoins className="mr-2" />
//       {isLoading ? 'Minting...' : 'Get NEWS Token'}
//     </button>
//   );
// };

// export default FaucetButton;