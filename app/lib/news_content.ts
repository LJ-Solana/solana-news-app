export type NewsContent = {
  "version": "0.1.0",
  "name": "news_content",
  "instructions": [
    {
      "name": "submitAndVerifyContent",
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
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "feePayer",
          "isMut": true,
          "isSigner": true
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
          "name": "isVerified",
          "type": "bool"
        },
        {
          "name": "isValid",
          "type": "bool"
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
    }
  ]
};

export const IDL: NewsContent = {
  "version": "0.1.0",
  "name": "news_content",
  "instructions": [
    {
      "name": "submitAndVerifyContent",
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
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "feePayer",
          "isMut": true,
          "isSigner": true
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
          "name": "isVerified",
          "type": "bool"
        },
        {
          "name": "isValid",
          "type": "bool"
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
    }
  ]
};