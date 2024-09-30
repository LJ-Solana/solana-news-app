import { WalletContextState } from '@solana/wallet-adapter-react';
import { web3 } from '@project-serum/anchor';
import { toast } from 'react-toastify'; 
import { getSolanaProgram } from './solanaClient';
import { SendTransactionError } from '@solana/web3.js';
import { generateContentHash, getPDAFromContentHash } from './articleVerification';
import { 
  getAssociatedTokenAddress, 
  createAssociatedTokenAccountInstruction,
  TOKEN_PROGRAM_ID,
  ASSOCIATED_TOKEN_PROGRAM_ID
} from '@solana/spl-token';

export const rateContent = async (articleData: { title: string; description: string }, rating: number, wallet: WalletContextState) => {
  console.log('Rating:', rating);
  const program = getSolanaProgram();
  const publicKey = wallet.publicKey;
  const signTransaction = wallet.signTransaction;

  if (!publicKey || !signTransaction) {
    console.error('Wallet not connected');
    throw new Error("Wallet not connected");
  }

  if (!program) {
    console.error('Failed to get program');
    throw new Error("Failed to get program");
  }

  const contentHash = generateContentHash(articleData);
  const contentPDA = getPDAFromContentHash(contentHash);

  const ContentAccount = program.account.Content || program.account.content;

  if (rating < 1 || rating > 5) {
    throw new Error("Invalid rating. Must be between 1 and 5.");
  }

  try {
    const contentAccount = await ContentAccount.fetchNullable(contentPDA);
    
    if (contentAccount) {
      const NEWS_TOKEN_MINT = new web3.PublicKey('5ruoovCtJDSuQcrUU3LQ4yMZuSAVBGCc6885Qh6P2Vz9');
      const raterTokenAccount = await getAssociatedTokenAddress(NEWS_TOKEN_MINT, publicKey);

      // Check if the token account exists
      const tokenAccountInfo = await program.provider.connection.getAccountInfo(raterTokenAccount);
      
      let tx = new web3.Transaction();

      // If the token account doesn't exist, add an instruction to create it
      if (!tokenAccountInfo) {
        console.log('Token account does not exist. Creating...');
        const createATAInstruction = createAssociatedTokenAccountInstruction(
          publicKey,
          raterTokenAccount,
          publicKey,
          NEWS_TOKEN_MINT
        );
        tx.add(createATAInstruction);
      }

      const rateContentInstruction = await program.methods.rateContent(Array.from(Buffer.from(contentHash, 'hex')), rating)
        .accounts({
          content: contentPDA,
          rater: publicKey,
          raterTokenAccount: raterTokenAccount,
          systemProgram: web3.SystemProgram.programId,
          tokenProgram: TOKEN_PROGRAM_ID,
          associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
        })
        .instruction();

      tx.add(rateContentInstruction);

      tx.recentBlockhash = (await program.provider.connection.getLatestBlockhash()).blockhash;
      tx.feePayer = publicKey;

      const signedTx = await signTransaction(tx);
      console.log('Transaction signed');

      const txid = await program.provider.connection.sendRawTransaction(signedTx.serialize());
      console.log('Transaction sent, ID:', txid);

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
      throw new Error('Content account does not exist. Please verify the article first.');
    }
  } catch (error) {
    console.error("Error fetching or processing content account:", error);
    if (error instanceof SendTransactionError) {
      const logs = error.logs;
      if (logs) {
        console.error("Transaction logs:", logs);
        if (logs.some(log => log.includes("Error Code: AlreadyRated"))) {
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