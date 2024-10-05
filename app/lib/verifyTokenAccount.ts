import { getAssociatedTokenAddress, createAssociatedTokenAccountInstruction } from '@solana/spl-token';
import { Connection, PublicKey, sendAndConfirmTransaction, Transaction, Signer } from '@solana/web3.js';

export async function ensureAssociatedTokenAccount(connection: Connection, payer: Signer, mint: PublicKey, owner: PublicKey) {
  const associatedToken = await getAssociatedTokenAddress(mint, owner);
  const accountInfo = await connection.getAccountInfo(associatedToken);
  
  if (!accountInfo) {
    console.log('Associated token account does not exist. Creating...');
    const transaction = new Transaction().add(
      createAssociatedTokenAccountInstruction(
        payer.publicKey,
        associatedToken,
        owner,
        mint
      )
    );
    await sendAndConfirmTransaction(connection, transaction, [payer]);
  }
  
  return associatedToken;
}