export type NewsContent = {
  "version": "0.1.0",
  "name": "verifier_stake_escrow",
  "instructions": [
    {
      "name": "submitAndVerifyContentWithStake",
      "accounts": [
        {
          "name": "content",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "author",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "verifier",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "feePayer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "verifierUsdcTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "escrowTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "escrowAuthority",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "contentHash",
          "type": {
            "array": ["u8", 32]
          }
        }
      ]
    },
    {
      "name": "rateContent",
      "accounts": [
        {
          "name": "content",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "rater",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "raterTokenAccount",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "contentHash",
          "type": {
            "array": ["u8", 32]
          }
        },
        {
          "name": "rating",
          "type": "u8"
        }
      ]
    },
    {
      "name": "finalizeContentRating",
      "accounts": [
        {
          "name": "content",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "verifierUsdcTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "escrowTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "rewardTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "treasuryTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "escrowAuthority",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    }
  ],
  "accounts": [
    {
      "name": "Content",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "author",
            "type": "publicKey"
          },
          {
            "name": "contentHash",
            "type": {
              "array": ["u8", 32]
            }
          },
          {
            "name": "isVerified",
            "type": "bool"
          },
          {
            "name": "verifiedBy",
            "type": {
              "option": "publicKey"
            }
          },
          {
            "name": "isValid",
            "type": "bool"
          },
          {
            "name": "submittedAt",
            "type": "i64"
          },
          {
            "name": "verifiedAt",
            "type": {
              "option": "i64"
            }
          },
          {
            "name": "verifierStakeAmount",
            "type": "u64"
          },
          {
            "name": "totalRatings",
            "type": "u64"
          },
          {
            "name": "sumOfRatings",
            "type": "u64"
          },
          {
            "name": "ratingEndTime",
            "type": "i64"
          },
          {
            "name": "isFinalized",
            "type": "bool"
          },
          {
            "name": "ratings",
            "type": {
              "vec": {
                "defined": "Rating"
              }
            }
          }
        ]
      }
    }
  ],
  "types": [
    {
      "name": "Rating",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "rater",
            "type": "publicKey"
          },
          {
            "name": "rating",
            "type": "u8"
          },
          {
            "name": "timestamp",
            "type": "i64"
          }
        ]
      }
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "InvalidUUID",
      "msg": "Invalid UUID format"
    },
    {
      "code": 6001,
      "name": "InvalidUUIDLength",
      "msg": "UUID exceeds maximum allowed length"
    },
    {
      "code": 6002,
      "name": "ContentAlreadySubmitted",
      "msg": "Content has already been submitted and verified."
    },
    {
      "code": 6003,
      "name": "InsufficientFunds",
      "msg": "Insufficient funds in verifier's USDC token account."
    },
    {
      "code": 6004,
      "name": "EscrowMintMismatch",
      "msg": "Escrow token account mint does not match verifier USDC token account mint."
    },
    {
      "code": 6005,
      "name": "InvalidEscrowAuthority",
      "msg": "Escrow token account owner is not the escrow authority."
    },
    {
      "code": 6006,
      "name": "ContentNotVerified",
      "msg": "Content has not been verified yet."
    },
    {
      "code": 6007,
      "name": "InvalidRating",
      "msg": "Invalid rating. Must be between 1 and 5."
    },
    {
      "code": 6008,
      "name": "ArithmeticOverflow",
      "msg": "Arithmetic overflow occurred"
    },
    {
      "code": 6009,
      "name": "ContentHashMismatch",
      "msg": "Content hash mismatch"
    },
    {
      "code": 6010,
      "name": "AlreadyRated",
      "msg": "User has already rated this content"
    },
    {
      "code": 6011,
      "name": "CannotRateOwnContent",
      "msg": "Cannot rate your own content"
    },
    {
      "code": 6012,
      "name": "RatingPeriodClosed",
      "msg": "Rating period has closed for this content"
    },
    {
      "code": 6013,
      "name": "RatingPeriodNotEnded",
      "msg": "Rating period has not ended yet"
    },
    {
      "code": 6014,
      "name": "ContentAlreadyFinalized",
      "msg": "Content rating has already been finalized"
    },
    {
      "code": 6015,
      "name": "InvalidTreasuryAccount",
      "msg": "Invalid treasury account"
    },
    {
      "code": 6016,
      "name": "InvalidVerifierAccount",
      "msg": "Invalid verifier account"
    },
    {
      "code": 6017,
      "name": "InsufficientAccountAge",
      "msg": "Wallet must be at least 2 weeks old to rate content"
    },
    {
      "code": 6018,
      "name": "InsufficientTokenBalance",
      "msg": "Insufficient token balance to rate content"
    },
    {
      "code": 6019,
      "name": "InvalidTokenAccount",
      "msg": "Invalid token account"
    },
    {
      "code": 6020,
      "name": "InvalidAccountData",
      "msg": "Invalid account data"
    }
  ]
};

export const IDL: NewsContent = {
  "version": "0.1.0",
  "name": "verifier_stake_escrow",
  "instructions": [
    {
      "name": "submitAndVerifyContentWithStake",
      "accounts": [
        {
          "name": "content",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "author",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "verifier",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "feePayer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "verifierUsdcTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "escrowTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "escrowAuthority",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "contentHash",
          "type": {
            "array": ["u8", 32]
          }
        }
      ]
    },
    {
      "name": "rateContent",
      "accounts": [
        {
          "name": "content",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "rater",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "raterTokenAccount",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "contentHash",
          "type": {
            "array": ["u8", 32]
          }
        },
        {
          "name": "rating",
          "type": "u8"
        }
      ]
    },
    {
      "name": "finalizeContentRating",
      "accounts": [
        {
          "name": "content",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "verifierUsdcTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "escrowTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "rewardTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "treasuryTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "escrowAuthority",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    }
  ],
  "accounts": [
    {
      "name": "Content",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "author",
            "type": "publicKey"
          },
          {
            "name": "contentHash",
            "type": {
              "array": ["u8", 32]
            }
          },
          {
            "name": "isVerified",
            "type": "bool"
          },
          {
            "name": "verifiedBy",
            "type": {
              "option": "publicKey"
            }
          },
          {
            "name": "isValid",
            "type": "bool"
          },
          {
            "name": "submittedAt",
            "type": "i64"
          },
          {
            "name": "verifiedAt",
            "type": {
              "option": "i64"
            }
          },
          {
            "name": "verifierStakeAmount",
            "type": "u64"
          },
          {
            "name": "totalRatings",
            "type": "u64"
          },
          {
            "name": "sumOfRatings",
            "type": "u64"
          },
          {
            "name": "ratingEndTime",
            "type": "i64"
          },
          {
            "name": "isFinalized",
            "type": "bool"
          },
          {
            "name": "ratings",
            "type": {
              "vec": {
                "defined": "Rating"
              }
            }
          }
        ]
      }
    }
  ],
  "types": [
    {
      "name": "Rating",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "rater",
            "type": "publicKey"
          },
          {
            "name": "rating",
            "type": "u8"
          },
          {
            "name": "timestamp",
            "type": "i64"
          }
        ]
      }
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "InvalidUUID",
      "msg": "Invalid UUID format"
    },
    {
      "code": 6001,
      "name": "InvalidUUIDLength",
      "msg": "UUID exceeds maximum allowed length"
    },
    {
      "code": 6002,
      "name": "ContentAlreadySubmitted",
      "msg": "Content has already been submitted and verified."
    },
    {
      "code": 6003,
      "name": "InsufficientFunds",
      "msg": "Insufficient funds in verifier's USDC token account."
    },
    {
      "code": 6004,
      "name": "EscrowMintMismatch",
      "msg": "Escrow token account mint does not match verifier USDC token account mint."
    },
    {
      "code": 6005,
      "name": "InvalidEscrowAuthority",
      "msg": "Escrow token account owner is not the escrow authority."
    },
    {
      "code": 6006,
      "name": "ContentNotVerified",
      "msg": "Content has not been verified yet."
    },
    {
      "code": 6007,
      "name": "InvalidRating",
      "msg": "Invalid rating. Must be between 1 and 5."
    },
    {
      "code": 6008,
      "name": "ArithmeticOverflow",
      "msg": "Arithmetic overflow occurred"
    },
    {
      "code": 6009,
      "name": "ContentHashMismatch",
      "msg": "Content hash mismatch"
    },
    {
      "code": 6010,
      "name": "AlreadyRated",
      "msg": "User has already rated this content"
    },
    {
      "code": 6011,
      "name": "CannotRateOwnContent",
      "msg": "Cannot rate your own content"
    },
    {
      "code": 6012,
      "name": "RatingPeriodClosed",
      "msg": "Rating period has closed for this content"
    },
    {
      "code": 6013,
      "name": "RatingPeriodNotEnded",
      "msg": "Rating period has not ended yet"
    },
    {
      "code": 6014,
      "name": "ContentAlreadyFinalized",
      "msg": "Content rating has already been finalized"
    },
    {
      "code": 6015,
      "name": "InvalidTreasuryAccount",
      "msg": "Invalid treasury account"
    },
    {
      "code": 6016,
      "name": "InvalidVerifierAccount",
      "msg": "Invalid verifier account"
    },
    {
      "code": 6017,
      "name": "InsufficientAccountAge",
      "msg": "Wallet must be at least 2 weeks old to rate content"
    },
    {
      "code": 6018,
      "name": "InsufficientTokenBalance",
      "msg": "Insufficient token balance to rate content"
    },
    {
      "code": 6019,
      "name": "InvalidTokenAccount",
      "msg": "Invalid token account"
    },
    {
      "code": 6020,
      "name": "InvalidAccountData",
      "msg": "Invalid account data"
    }
  ]
};