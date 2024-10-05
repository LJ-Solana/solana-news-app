import { WalletContextState } from '@solana/wallet-adapter-react';
import { web3 } from '@project-serum/anchor';
import { toast } from 'react-toastify'; 
import { getSolanaProgram } from './solanaClient';
import { SendTransactionError } from '@solana/web3.js';
import { generateContentHash, getPDAFromContentHash } from './articleVerification';
import { getAssociatedTokenAddress, TOKEN_PROGRAM_ID } from '@solana/spl-token';


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

      console.log('Creating transaction for rating content');
      const tx = await program.methods.rateContent(Array.from(Buffer.from(contentHash, 'hex')), rating)
        .accounts({
          content: contentPDA,
          rater: publicKey,
          raterTokenAccount: raterTokenAccount,
          systemProgram: web3.SystemProgram.programId,
          tokenProgram: TOKEN_PROGRAM_ID,
          rent: web3.SYSVAR_RENT_PUBKEY,
          clock: web3.SYSVAR_CLOCK_PUBKEY,  // Add this line for the wallet age check
        })
        .remainingAccounts([
          {
            pubkey: TOKEN_PROGRAM_ID,
            isWritable: false,
            isSigner: false,
          },
        ])
        .transaction();

      const { blockhash } = await program.provider.connection.getLatestBlockhash();
      tx.recentBlockhash = blockhash;
      tx.feePayer = publicKey;
      
      console.log('Transaction object:', tx);
      console.log('Transaction message:', tx.compileMessage().toString());

      // Log the accounts being used in the transaction
      console.log('Transaction accounts:', tx.instructions[0].keys.map(k => ({
        pubkey: k.pubkey.toBase58(),
        isSigner: k.isSigner,
        isWritable: k.isWritable
      })));

      console.log('Getting latest blockhash');
      tx.recentBlockhash = (await program.provider.connection.getLatestBlockhash()).blockhash;
      tx.feePayer = publicKey;
      const MAX_RETRIES = 3;
      for (let retries = 0; retries < MAX_RETRIES; retries++) {
        try {
          const signedTx = await signTransaction(tx);
          console.log('Transaction signed');

          const txid = await program.provider.connection.sendRawTransaction(signedTx.serialize());
          console.log('Transaction sent, ID:', txid);

          console.log('Confirming transaction');
          const confirmation = await program.provider.connection.confirmTransaction(txid, 'confirmed');
          
          if (confirmation.value.err) {
            console.error('Transaction failed:', confirmation.value.err);
            throw new Error(`Transaction failed: ${JSON.stringify(confirmation.value.err)}`);
          }

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
        } catch (error) {
          console.error("Error signing or sending transaction:", error);
          if (error instanceof SendTransactionError) {
            const logs = error.logs;
            console.error("Transaction logs:", logs);
          }
          // ... rest of the error handling code
        }
      }
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