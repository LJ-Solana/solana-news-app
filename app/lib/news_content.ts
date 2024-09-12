export type NewsContent = {
  "version": "0.1.0",
  "name": "news_content",
  "instructions": [
    {
      "name": "submitContent",
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
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "uuid",
          "type": "string"
        },
        {
          "name": "contentType",
          "type": {
            "defined": "ContentType"
          }
        }
      ]
    },
    {
      "name": "verifyContent",
      "accounts": [
        {
          "name": "content",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "verifier",
          "isMut": false,
          "isSigner": true
        }
      ],
      "args": [
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
            "name": "uuid",
            "type": "string"
          },
          {
            "name": "contentType",
            "type": {
              "defined": "ContentType"
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
  "types": [
    {
      "name": "ContentType",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "Article"
          },
          {
            "name": "Image"
          },
          {
            "name": "Video"
          }
        ]
      }
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "AlreadyVerified",
      "msg": "Content has already been verified"
    },
    {
      "code": 6001,
      "name": "InvalidUUID",
      "msg": "Invalid UUID format"
    }
  ]
};

export const IDL: NewsContent = {
  "version": "0.1.0",
  "name": "news_content",
  "instructions": [
    {
      "name": "submitContent",
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
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "uuid",
          "type": "string"
        },
        {
          "name": "contentType",
          "type": {
            "defined": "ContentType"
          }
        }
      ]
    },
    {
      "name": "verifyContent",
      "accounts": [
        {
          "name": "content",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "verifier",
          "isMut": false,
          "isSigner": true
        }
      ],
      "args": [
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
            "name": "uuid",
            "type": "string"
          },
          {
            "name": "contentType",
            "type": {
              "defined": "ContentType"
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
  "types": [
    {
      "name": "ContentType",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "Article"
          },
          {
            "name": "Image"
          },
          {
            "name": "Video"
          }
        ]
      }
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "AlreadyVerified",
      "msg": "Content has already been verified"
    },
    {
      "code": 6001,
      "name": "InvalidUUID",
      "msg": "Invalid UUID format"
    }
  ]
};