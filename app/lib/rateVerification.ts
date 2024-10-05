import { WalletContextState } from '@solana/wallet-adapter-react';
import { web3 } from '@project-serum/anchor';
import { toast } from 'react-toastify'; 
import { getSolanaProgram } from './solanaClient';
import { SendTransactionError  } from '@solana/web3.js';
import { generateContentHash, getPDAFromContentHash } from './articleVerification';
import { getAssociatedTokenAddress, TOKEN_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID } from '@solana/spl-token';

export const rateContent = async (articleData: { title: string; description: string }, rating: number, wallet: WalletContextState) => {
  console.log('Rating:', rating);
  const program = getSolanaProgram();
  const publicKey = wallet.publicKey;
  const signTransaction = wallet.signTransaction;

  if (!wallet.connected) {
    console.error('Wallet is not connected');
    toast.error('Please connect your wallet before rating.');
    throw new Error("Wallet not connected");
  }

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

  const contentHash = generateContentHash(articleData);
  console.log('Generated content hash:', contentHash);
  console.log('Content hash:', contentHash);
  console.log('Content hash type:', typeof contentHash);
  console.log('Rating:', rating);
  console.log('Rating type:', typeof rating);

  const contentPDA = getPDAFromContentHash(contentHash);
  console.log('Content PDA for rating:', contentPDA.toBase58());

  if (!program.account.Content && !program.account.content) {
    console.error('Content account not found in program');
    throw new Error("Content account not found in program");
  }

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

      // Get the rater's token account for the NEWS token
      const NEWS_TOKEN_MINT = new web3.PublicKey('5ruoovCtJDSuQcrUU3LQ4yMZuSAVBGCc6885Qh6P2Vz9');
      const raterTokenAccount = await getAssociatedTokenAddress(NEWS_TOKEN_MINT, publicKey);

      // Check if the token account exists
      const tokenAccountInfo = await program.provider.connection.getAccountInfo(raterTokenAccount);
      
      if (!tokenAccountInfo) {
        console.error('Token account does not exist');
        toast.error('Token account does not exist. Please create it first.');
        throw new Error('Token account does not exist. Please create it first.');
      }
      const tx = await program.methods.rateContent(Array.from(Buffer.from(contentHash, 'hex')), rating)
      .accounts({
        content: contentPDA,
        rater: wallet.publicKey!,
        raterTokenAccount: raterTokenAccount,
        systemProgram: web3.SystemProgram.programId,
        tokenProgram: TOKEN_PROGRAM_ID,
        associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
        clock: web3.SYSVAR_CLOCK_PUBKEY,
        rent: web3.SYSVAR_RENT_PUBKEY,
        mint: NEWS_TOKEN_MINT,
        tokenAccount: raterTokenAccount,
        authority: wallet.publicKey!,
      })
      .transaction();

      // Set the fee payer
      tx.feePayer = publicKey;
      
      console.log('Transaction object:', JSON.stringify(tx, (key, value) =>
        typeof value === 'bigint'
          ? value.toString()
          : value // return everything else unchanged
      ));
      
      // Get latest blockhash
      console.log('Getting latest blockhash');
      const latestBlockhash = await program.provider.connection.getLatestBlockhash();
      tx.recentBlockhash = latestBlockhash.blockhash;
      
      // Sign transaction
      console.log('Signing transaction');
      if (!wallet || !wallet.signTransaction) {
        throw new Error('Wallet is not connected or does not support signing');
      }

      let signedTx;
      try {
        signedTx = await wallet.signTransaction(tx);
      } catch (signError) {
        console.error('Error signing transaction:', signError);
        throw new Error('Failed to sign transaction');
      }

      if (!signedTx) {
        throw new Error('Failed to sign transaction');
      }

      // Send transaction
      console.log('Sending transaction');
      let txId;
      try {
        txId = await program.provider.connection.sendRawTransaction(signedTx.serialize());
        console.log('Transaction sent, ID:', txId);
      } catch (sendError) {
        console.error('Error sending transaction:', sendError);
        throw new Error('Failed to send transaction');
      }

      console.log('Confirming transaction');
      const confirmation = await program.provider.connection.confirmTransaction({
        signature: txId,
        blockhash: latestBlockhash.blockhash,
        lastValidBlockHeight: latestBlockhash.lastValidBlockHeight,
      });

      if (confirmation.value.err) {
        console.error('Transaction failed:', confirmation.value.err);
        throw new Error(`Transaction failed: ${JSON.stringify(confirmation.value.err)}`);
      }

      console.log("Rating submitted successfully. Transaction signature", txId);
      toast.success('Rating has been added successfully', {
        position: "bottom-left",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
      return txId;
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