import { Program, AnchorProvider } from '@project-serum/anchor';
import { Connection, PublicKey } from '@solana/web3.js';
import { IDL } from './news_content'; 

let programInstance: Program | null = null;
let initializationPromise: Promise<void> | null = null;

export async function initializeSolanaProgram(wallet: AnchorProvider['wallet'], connection: Connection): Promise<void> {
  if (!initializationPromise) {
    initializationPromise = (async () => {
      const provider = new AnchorProvider(connection, wallet, {
        preflightCommitment: 'processed',
      });
      const programId = new PublicKey(process.env.NEXT_PUBLIC_PROGRAM_ID!);
      
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      programInstance = new Program(IDL as unknown as any, programId, provider);
      console.log('Solana program initialized:', programInstance);
    })();
  }
  return initializationPromise;
}

export function getSolanaProgram(): Program | null {
  if (!programInstance) {
    throw new Error('Solana program not initialized. Call initializeSolanaProgram first.');
  }
  return programInstance;
}
