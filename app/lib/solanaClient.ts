import { Program, AnchorProvider } from '@project-serum/anchor';
import { Connection, PublicKey, clusterApiUrl } from '@solana/web3.js';
import { IDL } from './news_content';
import { WalletContextState } from '@solana/wallet-adapter-react';

let programInstance: Program | null = null;
let initializationPromise: Promise<void> | null = null;

export async function initializeSolanaProgram(wallet: WalletContextState): Promise<void> {
  if (!initializationPromise) {
    initializationPromise = (async () => {
      if (!wallet.publicKey) {
        throw new Error('Wallet is not connected');
      }

      const connection = new Connection(clusterApiUrl('devnet'), 'confirmed');
      const provider = new AnchorProvider(
        connection,
        
        wallet as any, // eslint-disable-line @typescript-eslint/no-explicit-any
        { preflightCommitment: 'processed' }
      );
      const programId = new PublicKey(process.env.NEXT_PUBLIC_PROGRAM_ID!);
      
      programInstance = new Program(IDL as any, programId, provider);// eslint-disable-line @typescript-eslint/no-explicit-any
      console.log('Solana program initialized:', programInstance);
    })();
  }
  return initializationPromise;
}

export function getSolanaProgram(): Program {
  if (!programInstance) {
    throw new Error('Solana program not initialized. Call initializeSolanaProgram first.');
  }
  return programInstance;
}
