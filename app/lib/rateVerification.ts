import { WalletContextState } from '@solana/wallet-adapter-react';
import { web3, BN } from '@project-serum/anchor';
import { supabase } from './supabaseClient';
import { PublicKey } from '@solana/web3.js';

export const rateContent = async (program: any, articleData: { title: string; content: string }, rating: number, wallet: WalletContextState) => {
  console.log('Starting rateContent function');
  console.log('Article data:', articleData);
  console.log('Rating:', rating);

  const publicKey = wallet.publicKey;
  const signTransaction = wallet.signTransaction;

  console.log('Wallet public key:', publicKey?.toBase58());

  if (!publicKey || !signTransaction) {
    console.error('Wallet not connected');
    throw new Error("Wallet not connected");
  }

  if (rating < 1 || rating > 5) {
    console.error('Invalid rating:', rating);
    throw new Error("Invalid rating. Must be between 1 and 5.");
  }

  console.log('Fetching content hash from Supabase');
  const { data, error } = await supabase
    .from('articles')
    .select('content_hash')
    .eq('title', articleData.title)
    .single();

  if (error) {
    console.error('Error fetching content hash:', error);
    throw new Error(`Error fetching content hash: ${error.message}`);
  }

  if (!data || !data.content_hash) {
    console.error('Content hash not found for article:', articleData.title);
    throw new Error('Content hash not found for the article');
  }

  console.log('Content hash from Supabase:', data.content_hash);
  const contentHash = new Uint8Array(Buffer.from(data.content_hash, 'hex'));
  console.log('Content hash as Uint8Array:', contentHash);

  console.log('Deriving content PDA');
  const [contentPDA] = await PublicKey.findProgramAddress(
    [Buffer.from("content"), contentHash],
    program.programId
  );

  console.log('Content PDA for rating:', contentPDA.toBase58());

  try {
    console.log('Checking if content account exists');
    const contentAccount = await program.account.content.fetchNullable(contentPDA);

    if (!contentAccount) {
      console.error('Content account does not exist. It should have been created during article verification.');
      throw new Error('Content account not found. The article may not have been properly verified.');
    }

    console.log('Content account exists, proceeding with rating');

    console.log('Creating transaction for rating content');
    const tx = await program.methods.rateContent(contentHash, new BN(rating))
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
    return txid;
  } catch (error) {
    console.error("Error submitting rating:", error);
    if (error instanceof Error && 'logs' in error) {
      console.error("Transaction logs:", (error as any).logs);
    }
    throw error;
  }
}