import { supabase } from './supabaseClient';
import * as ed from '@noble/ed25519';
import { sha512 } from '@noble/hashes/sha512';
import { sha256 } from '@noble/hashes/sha256';
import { getProgram } from './solanaClient';
import { web3 } from '@project-serum/anchor';
import { v5 as uuidv5 } from 'uuid';
import { WalletContextState } from '@solana/wallet-adapter-react';
import { Transaction, SystemProgram, SendTransactionError } from '@solana/web3.js';

console.log('Initializing ed.etc.sha512Sync');
ed.etc.sha512Sync = (...m) => sha512(ed.etc.concatBytes(...m));

// Function to generate content hash
function generateContentHash(articleData: { title: string; content: string; sourceUrl: string }): string {
  console.log('Generating content hash for:', articleData);
  const contentString = `${articleData.title}|${articleData.content}|${articleData.sourceUrl}`;
  const hash = Buffer.from(sha256(contentString)).toString('hex');
  console.log('Generated content hash:', hash);
  return hash;
}

// Function to get PDA from slug
function getPDAFromSlug(slug: string): web3.PublicKey {
  console.log('Getting PDA for slug:', slug);
  const UUID_NAMESPACE = '1b671a64-40d5-491e-99b0-da01ff1f3341';
  const uuid = uuidv5(slug, UUID_NAMESPACE);
  console.log('Generated UUID:', uuid);
  
  const uuidBuffer = Buffer.from(uuid.replace(/-/g, ''), 'hex').slice(0, 16);
  console.log('UUID Buffer (first 16 bytes):', uuidBuffer.toString('hex'));
  
  const [pda] = web3.PublicKey.findProgramAddressSync(
    [Buffer.from('content'), uuidBuffer],
    new web3.PublicKey(process.env.NEXT_PUBLIC_PROGRAM_ID!)
  );
  console.log('Generated PDA:', pda.toBase58());
  return pda;
}

export async function verifyArticle(
  articleSlug: string,
  walletAddress: string,
  signature: string,
  articleData: { title: string; content: string; sourceUrl: string },
  wallet: WalletContextState
): Promise<{ success: boolean; message: string }> {
  console.log('Starting verifyArticle function with params:', { articleSlug, walletAddress, signature, articleData });
  try {
    const program = getProgram();
    if (!program) {
      throw new Error('Failed to get program');
    }

    const pda = getPDAFromSlug(articleSlug);

    if (!wallet.publicKey) {
      throw new Error('Wallet is not connected or missing public key');
    }

    const transaction = new Transaction();

    const submitAndVerifyIx = await program.methods.submitAndVerifyContent(
      articleSlug,
      { article: {} },
      true,
      true
    )
    .accounts({
      content: pda,
      author: wallet.publicKey,
      verifier: new web3.PublicKey(walletAddress),
      feePayer: wallet.publicKey,
      systemProgram: SystemProgram.programId,
    })
    .instruction();

    transaction.add(submitAndVerifyIx);
    transaction.feePayer = wallet.publicKey;

    const latestBlockhash = await program.provider.connection.getLatestBlockhash();
    transaction.recentBlockhash = latestBlockhash.blockhash;

    // Simulate the transaction
    console.log('Simulating transaction...');
    const simulation = await program.provider.connection.simulateTransaction(transaction);
    if (simulation.value.err) {
      console.error('Transaction simulation failed:', simulation.value.err);
      console.error('Logs:', simulation.value.logs);
      throw new Error(`Transaction simulation failed: ${JSON.stringify(simulation.value.err)}`);
    }
    console.log('Transaction simulation successful');

    if (!wallet.signTransaction) {
      throw new Error('Wallet does not support signing transactions');
    }
    const signedTx = await wallet.signTransaction(transaction);
    
    try {
      const txid = await wallet.sendTransaction(signedTx, program.provider.connection);
      console.log('Transaction sent. Transaction ID:', txid);
      const confirmation = await program.provider.connection.confirmTransaction(txid);
      if (confirmation.value.err) {
        throw new Error(`Transaction failed: ${JSON.stringify(confirmation.value.err)}`);
      }
      console.log('On-chain verification successful. Transaction signature:', txid);
    } catch (error) {
      if (error instanceof SendTransactionError) {
        console.error('SendTransactionError:', error.message);
        console.error('Error logs:', error.logs);
        throw new Error(`Transaction failed: ${error.message}`);
      }
      console.error('Unknown error while sending transaction:', error);
      throw error;
    }

    console.log('Preparing verification data for Supabase');
    const verificationData = {
      verified: true,
      verified_by: walletAddress,
      verified_at: new Date().toISOString(),
      signature: signature,
      content_hash: generateContentHash(articleData),
      on_chain_verification: pda.toString(),
    };
    console.log('Verification data:', verificationData);

    console.log('Checking if article exists in Supabase');
    const { data: existingArticle, error: fetchError } = await supabase
      .from('articles')
      .select('*')
      .eq('slug', articleSlug)
      .single();

    if (fetchError) {
      console.error('Error fetching article:', fetchError);
      if (fetchError.code !== 'PGRST116') {
        throw fetchError;
      }
    }

    if (existingArticle) {
      console.log('Updating existing article in Supabase');
      const { error: updateError } = await supabase
        .from('articles')
        .update(verificationData)
        .eq('slug', articleSlug);

      if (updateError) {
        console.error('Error updating article:', updateError);
        throw updateError;
      }
      console.log('Article updated successfully');
    } else {
      console.log('Inserting new article in Supabase');
      const { error: insertError } = await supabase
        .from('articles')
        .insert({
          slug: articleSlug,
          title: articleData.title,
          content: articleData.content,
          source_url: articleData.sourceUrl,
          created_at: new Date().toISOString(),
          ...verificationData
        });

      if (insertError) {
        console.error('Error inserting article:', insertError);
        throw insertError;
      }
      console.log('Article inserted successfully');
    }

    console.log('Article verification completed successfully');
    return { success: true, message: 'Article submitted and verified on-chain and off-chain' };
  } catch (error: unknown) {
    console.error('Error in verifyArticle:', error);
    if (error instanceof Error) {
      return { success: false, message: `Verification failed: ${error.message}` };
    } else {
      return { success: false, message: 'Verification failed: Unknown error' };
    }
  }
}