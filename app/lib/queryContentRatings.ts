import { Program } from '@project-serum/anchor';
import { PublicKey } from '@solana/web3.js';

export async function queryContentRatings(program: Program, contentPDA: PublicKey) {
  try {
    // Fetch the content account data
    const accountInfo = await program.provider.connection.getAccountInfo(contentPDA);

    // If the account doesn't exist, return default values
    if (!accountInfo) {
      console.log('Content account not found');
      return {
        totalRatings: 0,
        sumOfRatings: 0,
        averageRating: 0
      };
    }

    // Attempt to decode the account data
    let contentAccount;
    try {
      contentAccount = program.coder.accounts.decode('content', accountInfo.data);
    } catch (decodeError) {
      console.error('Error decoding content account:', decodeError);
      return {
        totalRatings: 0,
        sumOfRatings: 0,
        averageRating: 0
      };
    }

    // Extract the total ratings and sum of ratings
    const totalRatings = contentAccount.totalRatings.toNumber();
    const sumOfRatings = contentAccount.sumOfRatings.toNumber();

    // Calculate the average rating
    const averageRating = totalRatings > 0 ? sumOfRatings / totalRatings : 0;

    return {
      totalRatings,
      sumOfRatings,
      averageRating: parseFloat(averageRating.toFixed(2))
    };
  } catch (error) {
    console.error('Error querying content ratings:', error);
    return {
      totalRatings: 0,
      sumOfRatings: 0,
      averageRating: 0
    };
  }
}