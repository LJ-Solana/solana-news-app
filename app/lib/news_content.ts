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
    }
  ]
};