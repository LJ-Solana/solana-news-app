import { Connection, PublicKey } from '@solana/web3.js';
import { AnchorProvider, Program } from '@project-serum/anchor';
import {IDL} from '../lib/news_content';

export function getProgram() {
  console.log('Initializing program...');

  const programId = process.env.NEXT_PUBLIC_PROGRAM_ID;
  if (!programId) {
    console.error('NEXT_PUBLIC_PROGRAM_ID is not set in environment variables');
    throw new Error('Program ID is not set');
  }

  console.log('Program ID:', programId);

  try {
    const connection = new Connection(process.env.NEXT_PUBLIC_SOLANA_RPC_URL!, 'confirmed');
    console.log('Connection created');

    const provider = new AnchorProvider(connection, window.solana, { commitment: 'confirmed' });
    console.log('Provider created');

    const program = new Program(IDL as any, new PublicKey(programId), provider);
    console.log('Program instance created');

    return program;
  } catch (error) {
    console.error('Error in getProgram:', error);
    throw error;
  }
}
