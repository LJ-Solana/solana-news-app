import * as ed from '@noble/ed25519';
import { sha512 } from '@noble/hashes/sha512';
import { sha256 } from 'js-sha256';
import { getSolanaProgram, initializeSolanaProgram } from './solanaClient';
import { supabase } from './supabaseClient';
import { web3 } from '@project-serum/anchor';
import { WalletContextState } from '@solana/wallet-adapter-react';
import { SystemProgram, Transaction, PublicKey, Connection, clusterApiUrl } from '@solana/web3.js';
import { getAssociatedTokenAddress, createAssociatedTokenAccountInstruction, ASSOCIATED_TOKEN_PROGRAM_ID } from '@solana/spl-token';
import { Buffer } from 'buffer';
import { toast } from 'react-toastify';
import slugify from 'slugify';

// USDC token mint address (devnet USDC token)
const USDC_TEST_TOKEN_MINT_ADDRESS = new PublicKey('5ruoovCtJDSuQcrUU3LQ4yMZuSAVBGCc6885Qh6P2Vz9');
const SPL_TOKEN_PROGRAM_ID = new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA'); 

// Initialize ed25519 hashing
console.log('Initializing ed.etc.sha512Sync');
ed.etc.sha512Sync = (...m) => sha512(ed.etc.concatBytes(...m));

// Add this function at the beginning of the file
async function ensureProgramInitialized(wallet: WalletContextState) {
  await initializeSolanaProgram(wallet);
}


function createSlug(title: string): string {
  return slugify(title, { lower: true, strict: true });
}

// Function to generate content hash
export function generateContentHash(articleData: { title: string; description?: string }): string {
  console.log('Generating content hash for:', articleData);
  const contentString = articleData.description ? `${articleData.title}|${articleData.description}` : articleData.title;
  const hash = sha256(contentString);
  console.log('Generated content hash:', hash);
  return hash;
}

// Function to get PDA from content hash
export function getPDAFromContentHash(contentHash: string): web3.PublicKey {
  console.log('Getting PDA for content hash:', contentHash);

  const contentHashBuffer = Buffer.from(contentHash, 'hex');
  console.log('Content Hash Buffer:', contentHashBuffer.toString('hex'));

  const [pda] = web3.PublicKey.findProgramAddressSync(
    [Buffer.from('content'), contentHashBuffer],
    new web3.PublicKey(process.env.NEXT_PUBLIC_PROGRAM_ID!)
  );
  console.log('Generated PDA:', pda.toBase58());
  return pda;
}

// Function to get or create the escrow token account
async function getOrCreateEscrowTokenAccount(connection: Connection, wallet: WalletContextState, escrowAuthorityPDA: PublicKey) {
  const associatedTokenAddress = await getAssociatedTokenAddress(
    USDC_TEST_TOKEN_MINT_ADDRESS,
    escrowAuthorityPDA,
    true,
    SPL_TOKEN_PROGRAM_ID,
    ASSOCIATED_TOKEN_PROGRAM_ID 
  );

  console.log('Associated Token Address:', associatedTokenAddress.toBase58());

  // Check if the account already exists
  const accountInfo = await connection.getAccountInfo(associatedTokenAddress);
  
  if (!accountInfo) {
    console.log('Creating new associated token account');
    const transaction = new Transaction();
    const createATAIx = createAssociatedTokenAccountInstruction(
      wallet.publicKey!,
      associatedTokenAddress,
      escrowAuthorityPDA,
      USDC_TEST_TOKEN_MINT_ADDRESS,
      SPL_TOKEN_PROGRAM_ID, 
      ASSOCIATED_TOKEN_PROGRAM_ID
    );
    transaction.add(createATAIx);
    transaction.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;
    transaction.feePayer = wallet.publicKey!;

    if (wallet.signTransaction) {
        const signedTx = await wallet.signTransaction(transaction);
        const txId = await connection.sendRawTransaction(signedTx.serialize());
        await connection.confirmTransaction(txId, 'confirmed');
    } else {
        throw new Error('Wallet does not support signing transactions');
    }
  } else {
    console.log('Associated token account already exists');
  }

  return associatedTokenAddress;
}

async function submitAndVerifyArticle(
  contentHash: string,
  isVerified: boolean,
  isValid: boolean,
  wallet: WalletContextState
) {
  try {
    await ensureProgramInitialized(wallet);

    const program = getSolanaProgram();
    const connection = new Connection(clusterApiUrl('devnet'), 'confirmed');
    if (!program) {
      throw new Error('Failed to get program');
    }

    // Ensure contentHashBuffer is exactly 32 bytes
    const contentHashBuffer = Buffer.from(contentHash, 'hex'); // 32 bytes
    if (contentHashBuffer.length !== 32) {
      throw new Error(`Content hash must be 32 bytes, but is ${contentHashBuffer.length} bytes`);
    }

    console.log('Content Hash Buffer:', contentHashBuffer.toString('hex'));

    const [contentPDA] = PublicKey.findProgramAddressSync(
      [Buffer.from('content'), contentHashBuffer],
      program.programId
    );

    console.log('Content PDA:', contentPDA.toBase58());

    // Ensure isVerified and isValid are booleans
    if (typeof isVerified !== 'boolean' || typeof isValid !== 'boolean') {
      throw new Error('isVerified and isValid must be boolean values');
    }

    // Get the escrow authority PDA
    const [escrowAuthorityPDA] = PublicKey.findProgramAddressSync([Buffer.from('escrow_authority')], program.programId);

    // Get or create the escrow token account
    const escrowTokenAccount = await getOrCreateEscrowTokenAccount(connection, wallet, escrowAuthorityPDA);

    // Prepare the transaction
    const tx = new Transaction();

    // Add instruction for submitting and verifying content
    const submitAndVerifyIx = await program.methods
      .submitAndVerifyContentWithStake(Array.from(contentHashBuffer))
      .accounts({
        content: contentPDA,
        author: wallet.publicKey!,
        verifier: wallet.publicKey!,
        verifierUsdcTokenAccount: await getAssociatedTokenAddress(
          USDC_TEST_TOKEN_MINT_ADDRESS,
          wallet.publicKey!,
          false,
          SPL_TOKEN_PROGRAM_ID, 
          ASSOCIATED_TOKEN_PROGRAM_ID
        ),
        escrowTokenAccount,  
        escrowAuthority: escrowAuthorityPDA,
        feePayer: wallet.publicKey!,
        tokenProgram: SPL_TOKEN_PROGRAM_ID, 
        systemProgram: SystemProgram.programId,
      })
      .instruction();

    console.log('Instruction accounts:', submitAndVerifyIx.keys.map(k => k.pubkey.toBase58()));

    // Add the instruction to the transaction
    tx.add(submitAndVerifyIx);
    tx.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;
    tx.feePayer = wallet.publicKey!;

    if (!wallet.signTransaction) {
      throw new Error('Wallet does not support signTransaction');
    }

    console.log('Signing transaction...');
    const signedTx = await wallet.signTransaction(tx);

    console.log('Sending transaction...');
    const signature = await connection.sendRawTransaction(signedTx.serialize());

    console.log('Confirming transaction...');
    let confirmed = false;
    let attempts = 0;
    const maxAttempts = 5;
    while (!confirmed && attempts < maxAttempts) {
      try {
        const confirmation = await connection.confirmTransaction(signature, 'confirmed');
        console.log('Transaction confirmation:', confirmation);
        confirmed = true;
      } catch (error) {
        console.error('Confirmation attempt failed, retrying...', error);
        attempts++;
        if (attempts >= maxAttempts) {
          throw new Error('Transaction confirmation failed after multiple attempts.');
        }
        await new Promise((resolve) => setTimeout(resolve, 5000));
      }
    }

    if (!confirmed) {
      throw new Error(`Transaction was not confirmed. Check signature ${signature} using Solana Explorer or CLI.`);
    }

    return signature;
  } catch (error) {
    console.error('Error in submitAndVerifyArticle:', error);
    throw error;
  }
}

export async function verifyArticle(
  article: {
    title: string;
    content: string;
    sourceUrl: string;
    author: string;
    publishedAt: string;
    urlToImage: string;
    description: string;
    slug?: string;
  },
  walletAddress: string,
  signature: string,
  wallet: WalletContextState
): Promise<{ success: boolean; message: string; onChainSignature?: string }> {
  console.log('Starting verifyArticle function with params:', { article, walletAddress, signature });
  try {
    if (!wallet.publicKey) {
      throw new Error('Wallet is not connected or missing public key');
    }
    console.log('Wallet public key:', wallet.publicKey.toBase58());

    await ensureProgramInitialized(wallet);

    // Generate content hash and PDA on the frontend
    const contentHash = generateContentHash(article);
    const pda = getPDAFromContentHash(contentHash);

    console.log('Generated content hash:', contentHash);
    console.log('Generated PDA:', pda.toBase58());

    console.log('Starting on-chain verification');
    const onChainSignature = await submitAndVerifyArticle(
      contentHash,
      true, 
      true, 
      wallet,
    );
    console.log('On-chain verification completed:', onChainSignature);

    const slug = article.slug || createSlug(article.title);
    console.log(`Article ${slug} verified successfully with on-chain signature: ${onChainSignature}`);

    // Add to supabase
    const { error } = await supabase
      .from('articles')
      .update({
        verified: true,
        verified_by: walletAddress,
        signature,
        on_chain_verification: onChainSignature,
      })
      .eq('slug', slug);

    if (error) {
      console.error('Error updating article in supabase:', error);
      throw new Error('Failed to update article in supabase');
    } else {
      console.log('Article successfully updated in supabase');
    }

    toast.success('Article verified successfully', {
      position: "bottom-left",
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
    });

    return { success: true, message: 'Article verified successfully', onChainSignature };
  } catch (error: unknown) {
    console.error('Error in verifyArticle:', error);
    if (error instanceof Error) {
      // Handling custom program error codes for on-chain verification
      if (error.message.includes('custom program error: 0x1772') || 
          error.message.includes('Content has already been submitted')) {
        toast.error('Article already submitted', {
          position: "bottom-left",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
        return { success: false, message: 'Article already submitted and verified.' };
      }
      if (error.message.includes('custom program error: 0xbc4')) {
        toast.warning('Please top up USDC', {
          position: "bottom-left",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
        return { success: false, message: 'Insufficient USDC balance. Please top up your USDC.' };
      }
      if (error.message.includes('{"Custom":6002}')) {
        toast.info('Article already verified on-chain', {
          position: "bottom-left",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
        return { success: false, message: 'Article has already been verified on-chain.' };
      }
      if (error.message.includes('Error Number: 3012')) {
        toast.warning('Insufficient USDC balance', {
          position: "bottom-left",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
        return { success: false, message: 'Insufficient USDC balance. Please top up.' };
      }

      // Generic error handling
      toast.error(`${error.message}`, {
        position: "bottom-left",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
      return { success: false, message: `${error.message}` };
    } else {
      // Unknown error case
      toast.error('Verification failed: Unknown error', {
        position: "bottom-left",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
      return { success: false, message: 'Verification failed: Unknown error' };
    }
  }
}