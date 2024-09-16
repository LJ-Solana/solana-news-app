import { WalletContextState } from '@solana/wallet-adapter-react';
import { web3, BN } from '@project-serum/anchor';
import { supabase } from './supabaseClient';
import { PublicKey } from '@solana/web3.js';

export const rateContent = async (program: any, articleData: { title: string; content: string }, rating: number, wallet: WalletContextState) => {
  const publicKey = wallet.publicKey;
  const signTransaction = wallet.signTransaction;

  if (!publicKey || !signTransaction) {
    throw new Error("Wallet not connected");
  }

  if (rating < 1 || rating > 5) {
    throw new Error("Invalid rating. Must be between 1 and 5.");
  }

  const { data, error } = await supabase
    .from('articles')
    .select('content_hash')
    .eq('title', articleData.title)
    .single();

  if (error) {
    throw new Error(`Error fetching content hash: ${error.message}`);
  }

  if (!data || !data.content_hash) {
    throw new Error('Content hash not found for the article');
  }

  const contentHash = new Uint8Array(Buffer.from(data.content_hash, 'hex'));
  const [contentPDA] = await PublicKey.findProgramAddress(
    [Buffer.from("content"), contentHash],
    program.programId
  );

  console.log('Content hash:', contentHash);
  console.log('Content PDA for rating:', contentPDA.toBase58());

  try {
    // Check if the content account exists
    const contentAccount = await program.account.content.fetchNullable(contentPDA);

    if (!contentAccount) {
      console.error('Content account does not exist. It should have been created during article verification.');
      throw new Error('Content account not found. The article may not have been properly verified.');
    }

    // Rate the content
    const tx = await program.methods.rateContent(contentHash, new BN(rating))
      .accounts({
        content: contentPDA,
        rater: publicKey,
        systemProgram: web3.SystemProgram.programId,
      })
      .transaction();

    tx.recentBlockhash = (await program.provider.connection.getLatestBlockhash()).blockhash;
    tx.feePayer = publicKey;

    const signedTx = await signTransaction(tx);
    const txid = await program.provider.connection.sendRawTransaction(signedTx.serialize());
    await program.provider.connection.confirmTransaction(txid);

    console.log("Rating submitted successfully. Transaction signature", txid);
    return txid;
  } catch (error) {
    console.error("Error submitting rating:", error);
    if (error instanceof Error && 'logs' in error) {
      console.error("Transaction logs:", (error as any).logs);
    }
    throw error;
  }
}