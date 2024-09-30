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

    let totalRatings = 0;
    let sumOfRatings = 0;

    // Attempt to decode the account data
    try {
      const contentAccount = await program.account.content.fetch(contentPDA);
      totalRatings = contentAccount.totalRatings.toNumber();
      sumOfRatings = contentAccount.sumOfRatings.toNumber();
    } catch (decodeError) {
      // Manual extraction of data
      const dataView = new DataView(accountInfo.data.buffer);
      const dataLength = accountInfo.data.length;

      // Attempt to find the totalRatings and sumOfRatings fields
      for (let i = 0; i < dataLength - 8; i++) {
        try {
          const possibleTotalRatings = Number(dataView.getBigUint64(i, true));
          const possibleSumOfRatings = Number(dataView.getBigUint64(i + 8, true));
          
          if (possibleTotalRatings <= possibleSumOfRatings && possibleSumOfRatings > 0) {
            totalRatings = possibleTotalRatings;
            sumOfRatings = possibleSumOfRatings;
            break;
          }
        } catch (e) {
          // Ignore errors and continue searching
        }
      }
    }

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