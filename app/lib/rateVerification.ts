import { WalletContextState } from '@solana/wallet-adapter-react';
import { web3 } from '@project-serum/anchor';
import { toast } from 'react-toastify'; 
import { getSolanaProgram } from './solanaClient';
import { SendTransactionError } from '@solana/web3.js';
import { generateContentHash, getPDAFromContentHash } from './articleVerification';

export const rateContent = async (articleData: { title: string; description: string }, rating: number, wallet: WalletContextState) => {
  console.log('Rating:', rating);
  const program = getSolanaProgram();
  const publicKey = wallet.publicKey;
  const signTransaction = wallet.signTransaction;

  console.log('Wallet public key:', publicKey?.toBase58());

  if (!publicKey || !signTransaction) {
    console.error('Wallet not connected');
    throw new Error("Wallet not connected");
  }

  if (!program) {
    console.error('Failed to get program');
    throw new Error("Failed to get program");
  }

  console.log('Program ID:', program.programId.toString());
  console.log('Program methods:', Object.keys(program.methods));
  console.log('Program accounts:', Object.keys(program.account));
  console.log('Full program.account object:', program.account);

  // Use the same content hash generation as in articleVerification
  const contentHash = generateContentHash(articleData);
  console.log('Generated content hash:', contentHash);

  // Use the same PDA derivation as in articleVerification
  const contentPDA = getPDAFromContentHash(contentHash);
  console.log('Content PDA for rating:', contentPDA.toBase58());

  // Check for both 'Content' and 'content'
  if (!program.account.Content && !program.account.content) {
    console.error('Content account not found in program');
    throw new Error("Content account not found in program");
  }

  // Use the correct property based on what's available
  const ContentAccount = program.account.Content || program.account.content;

  if (rating < 1 || rating > 5) {
    console.error('Invalid rating:', rating);
    throw new Error("Invalid rating. Must be between 1 and 5.");
  }

  try {
    console.log('Fetching content account');
    const contentAccount = await ContentAccount.fetchNullable(contentPDA);
    
    if (contentAccount) {
      console.log('Content account exists:', contentAccount);
      console.log('Creating transaction for rating content');
      const tx = await program.methods.rateContent(Array.from(Buffer.from(contentHash, 'hex')), rating)
        .accounts({
          content: contentPDA,
          rater: publicKey,
          systemProgram: web3.SystemProgram.programId,
        })
        .transaction();

      console.log('Getting latest blockhash');
      tx.recentBlockhash = (await program.provider.connection.getLatestBlockhash()).blockhash;
      tx.feePayer = publicKey;

      const signedTx = await signTransaction(tx);
      console.log('Transaction signed');

      const txid = await program.provider.connection.sendRawTransaction(signedTx.serialize());
      console.log('Transaction sent, ID:', txid);

      console.log('Confirming transaction');
      await program.provider.connection.confirmTransaction(txid);

      console.log("Rating submitted successfully. Transaction signature", txid);
      toast.success('Rating has been added successfully', {
        position: "bottom-left",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
      return txid;
    } else {
      console.log('Content account does not exist');
      throw new Error('Content account does not exist. Please verify the article first.');
    }
  } catch (error) {
    console.error("Error fetching or processing content account:", error);
    if (error instanceof SendTransactionError) {
      const logs = error.logs;
      if (logs && logs.some(log => log.includes("Error Code: AlreadyRated"))) {
        toast.warning('You have already rated this content', {
          position: "bottom-left",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
      } else {
        toast.error('Failed to add rating. Please try again.', {
          position: "bottom-left",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
      }
    } else {
      toast.error('Failed to add rating. Please try again.', {
        position: "bottom-left",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    }
    throw error;
  }
}