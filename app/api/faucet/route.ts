// import { NextApiRequest, NextApiResponse } from 'next';
// import { Connection, PublicKey, Keypair } from '@solana/web3.js';
// import { getOrCreateAssociatedTokenAccount, mintTo } from '@solana/spl-token';

// const NEWS_TOKEN_MINT = new PublicKey('Your_NEWS_Token_Mint_Address_Here');
// const FAUCET_AMOUNT = 100 * 1e9; // 100 tokens with 9 decimals
// const FAUCET_KEYPAIR = Keypair.fromSecretKey(new Uint8Array(/* Your faucet account's private key */));

// export default async function handler(req: NextApiRequest, res: NextApiResponse) {
//   if (req.method !== 'POST') {
//     return res.status(405).json({ message: 'Method Not Allowed' });
//   }

//   const { walletAddress } = req.body;

//   if (!walletAddress) {
//     return res.status(400).json({ message: 'Wallet address is required' });
//   }

//   try {
//     const connection = new Connection('https://api.devnet.solana.com', 'confirmed');
//     const recipientAddress = new PublicKey(walletAddress);

//     // Get or create associated token account
//     const associatedTokenAccount = await getOrCreateAssociatedTokenAccount(
//       connection,
//       FAUCET_KEYPAIR,
//       NEWS_TOKEN_MINT,
//       recipientAddress
//     );

//     // Mint tokens to the associated token account
//     await mintTo(
//       connection,
//       FAUCET_KEYPAIR,
//       NEWS_TOKEN_MINT,
//       associatedTokenAccount.address,
//       FAUCET_KEYPAIR.publicKey,
//       FAUCET_AMOUNT
//     );

//     res.status(200).json({ message: 'Successfully minted 100 NEWS tokens to your account!' });
//   } catch (error) {
//     console.error('Error minting tokens:', error);
//     res.status(500).json({ message: 'Failed to mint tokens. Please try again.' });
//   }
// }