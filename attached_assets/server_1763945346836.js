#!/usr/bin/env node
/**
 * Quantum Crypto MCP Server
 * 
 * Exposes ML-DSA and ML-KEM operations via Model Context Protocol
 * for integration with Claude Code and other MCP clients.
 */

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { MLDSACrypto } from "../../quantum-crypto-core/src/MLDSACrypto.js";
import { MLKEMCrypto } from "../../quantum-crypto-core/src/MLKEMCrypto.js";
import { CryptoAgility } from "../../quantum-crypto-core/src/CryptoAgility.js";

class QuantumCryptoMCPServer {
  constructor() {
    this.server = new Server(
      {
        name: "quantum-crypto-mcp",
        version: "1.0.0",
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.mldsa = new MLDSACrypto("ML-DSA-65");
    this.mlkem = new MLKEMCrypto("ML-KEM-768");
    this.agility = new CryptoAgility();

    this.setupHandlers();
  }

  setupHandlers() {
    // List available tools
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: [
        {
          name: "mldsa_generate_keypair",
          description: "Generate ML-DSA quantum-resistant key pair (NIST FIPS 204)",
          inputSchema: {
            type: "object",
            properties: {
              level: {
                type: "string",
                enum: ["ML-DSA-44", "ML-DSA-65", "ML-DSA-87"],
                default: "ML-DSA-65",
                description: "ML-DSA security level"
              }
            }
          }
        },
        {
          name: "mldsa_sign",
          description: "Sign data with ML-DSA quantum-resistant signature",
          inputSchema: {
            type: "object",
            properties: {
              privateKey: {
                type: "string",
                description: "Private key (hex encoded)"
              },
              data: {
                type: "string",
                description: "Data to sign"
              },
              level: {
                type: "string",
                enum: ["ML-DSA-44", "ML-DSA-65", "ML-DSA-87"],
                default: "ML-DSA-65"
              }
            },
            required: ["privateKey", "data"]
          }
        },
        {
          name: "mldsa_verify",
          description: "Verify ML-DSA quantum-resistant signature",
          inputSchema: {
            type: "object",
            properties: {
              publicKey: {
                type: "string",
                description: "Public key (hex encoded)"
              },
              data: {
                type: "string",
                description: "Original data"
              },
              signature: {
                type: "string",
                description: "Signature to verify (hex encoded)"
              },
              level: {
                type: "string",
                enum: ["ML-DSA-44", "ML-DSA-65", "ML-DSA-87"],
                default: "ML-DSA-65"
              }
            },
            required: ["publicKey", "data", "signature"]
          }
        },
        {
          name: "mlkem_generate_keypair",
          description: "Generate ML-KEM quantum-resistant key pair (NIST FIPS 203)",
          inputSchema: {
            type: "object",
            properties: {
              level: {
                type: "string",
                enum: ["ML-KEM-512", "ML-KEM-768", "ML-KEM-1024"],
                default: "ML-KEM-768",
                description: "ML-KEM security level"
              }
            }
          }
        },
        {
          name: "mlkem_encapsulate",
          description: "Encapsulate shared secret with ML-KEM",
          inputSchema: {
            type: "object",
            properties: {
              publicKey: {
                type: "string",
                description: "Recipient's public key (hex encoded)"
              },
              level: {
                type: "string",
                enum: ["ML-KEM-512", "ML-KEM-768", "ML-KEM-1024"],
                default: "ML-KEM-768"
              }
            },
            required: ["publicKey"]
          }
        },
        {
          name: "mlkem_decapsulate",
          description: "Decapsulate shared secret with ML-KEM",
          inputSchema: {
            type: "object",
            properties: {
              secretKey: {
                type: "string",
                description: "Recipient's secret key (hex encoded)"
              },
              ciphertext: {
                type: "string",
                description: "Encapsulated ciphertext (hex encoded)"
              },
              level: {
                type: "string",
                enum: ["ML-KEM-512", "ML-KEM-768", "ML-KEM-1024"],
                default: "ML-KEM-768"
              }
            },
            required: ["secretKey", "ciphertext"]
          }
        },
        {
          name: "crypto_agility_status",
          description: "Get cryptographic agility framework status",
          inputSchema: {
            type: "object",
            properties: {}
          }
        },
        {
          name: "crypto_agility_migrate",
          description: "Migrate from Ed25519 to ML-DSA",
          inputSchema: {
            type: "object",
            properties: {
              ed25519PrivateKey: {
                type: "string",
                description: "Ed25519 private key (hex encoded)"
              }
            },
            required: ["ed25519PrivateKey"]
          }
        }
      ]
    }));

    // Handle tool calls
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      try {
        switch (name) {
          case "mldsa_generate_keypair":
            return await this.handleMLDSAGenerateKeypair(args);
          case "mldsa_sign":
            return await this.handleMLDSASign(args);
          case "mldsa_verify":
            return await this.handleMLDSAVerify(args);
          case "mlkem_generate_keypair":
            return await this.handleMLKEMGenerateKeypair(args);
          case "mlkem_encapsulate":
            return await this.handleMLKEMEncapsulate(args);
          case "mlkem_decapsulate":
            return await this.handleMLKEMDecapsulate(args);
          case "crypto_agility_status":
            return await this.handleCryptoAgilityStatus(args);
          case "crypto_agility_migrate":
            return await this.handleCryptoAgilityMigrate(args);
          default:
            throw new Error(`Unknown tool: ${name}`);
        }
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `Error: ${error.message}`
            }
          ],
          isError: true
        };
      }
    });
  }

  async handleMLDSAGenerateKeypair(args) {
    const level = args.level || "ML-DSA-65";
    const mldsa = new MLDSACrypto(level);
    const keyPair = mldsa.generateKeyPair();

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify({
            algorithm: keyPair.algorithm,
            securityLevel: keyPair.securityLevel,
            publicKey: {
              hex: Array.from(keyPair.publicKey.key)
                .map(b => b.toString(16).padStart(2, '0')).join(''),
              size: keyPair.publicKey.size
            },
            privateKey: {
              hex: Array.from(keyPair.privateKey.key)
                .map(b => b.toString(16).padStart(2, '0')).join(''),
              size: keyPair.privateKey.size
            },
            created: keyPair.created
          }, null, 2)
        }
      ]
    };
  }

  async handleMLDSASign(args) {
    const level = args.level || "ML-DSA-65";
    const mldsa = new MLDSACrypto(level);
    
    const privateKey = new Uint8Array(
      args.privateKey.match(/.{1,2}/g).map(byte => parseInt(byte, 16))
    );
    
    const signature = mldsa.sign(privateKey, args.data);

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify({
            algorithm: signature.algorithm,
            signature: {
              hex: Array.from(signature.signature)
                .map(b => b.toString(16).padStart(2, '0')).join(''),
              size: signature.signatureSize
            },
            signingTime: signature.signingTime,
            timestamp: signature.timestamp
          }, null, 2)
        }
      ]
    };
  }

  async handleMLDSAVerify(args) {
    const level = args.level || "ML-DSA-65";
    const mldsa = new MLDSACrypto(level);
    
    const publicKey = new Uint8Array(
      args.publicKey.match(/.{1,2}/g).map(byte => parseInt(byte, 16))
    );
    
    const signature = new Uint8Array(
      args.signature.match(/.{1,2}/g).map(byte => parseInt(byte, 16))
    );
    
    const result = mldsa.verify(publicKey, args.data, signature);

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify({
            valid: result.valid,
            algorithm: result.algorithm,
            verificationTime: result.verificationTime,
            timestamp: result.timestamp
          }, null, 2)
        }
      ]
    };
  }

  async handleMLKEMGenerateKeypair(args) {
    const level = args.level || "ML-KEM-768";
    const mlkem = new MLKEMCrypto(level);
    const keyPair = mlkem.generateKeyPair();

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify({
            algorithm: keyPair.algorithm,
            securityLevel: keyPair.securityLevel,
            publicKey: {
              hex: Array.from(keyPair.publicKey.key)
                .map(b => b.toString(16).padStart(2, '0')).join(''),
              size: keyPair.publicKey.size
            },
            secretKey: {
              hex: Array.from(keyPair.secretKey.key)
                .map(b => b.toString(16).padStart(2, '0')).join(''),
              size: keyPair.secretKey.size
            },
            created: keyPair.created
          }, null, 2)
        }
      ]
    };
  }

  async handleMLKEMEncapsulate(args) {
    const level = args.level || "ML-KEM-768";
    const mlkem = new MLKEMCrypto(level);
    
    const publicKey = new Uint8Array(
      args.publicKey.match(/.{1,2}/g).map(byte => parseInt(byte, 16))
    );
    
    const result = mlkem.encapsulate(publicKey);

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify({
            algorithm: result.algorithm,
            ciphertext: {
              hex: Array.from(result.ciphertext)
                .map(b => b.toString(16).padStart(2, '0')).join(''),
              size: result.ciphertextSize
            },
            sharedSecret: {
              hex: Array.from(result.sharedSecret)
                .map(b => b.toString(16).padStart(2, '0')).join(''),
              size: result.sharedSecretSize
            },
            encapsulationTime: result.encapsulationTime,
            timestamp: result.timestamp
          }, null, 2)
        }
      ]
    };
  }

  async handleMLKEMDecapsulate(args) {
    const level = args.level || "ML-KEM-768";
    const mlkem = new MLKEMCrypto(level);
    
    const secretKey = new Uint8Array(
      args.secretKey.match(/.{1,2}/g).map(byte => parseInt(byte, 16))
    );
    
    const ciphertext = new Uint8Array(
      args.ciphertext.match(/.{1,2}/g).map(byte => parseInt(byte, 16))
    );
    
    const result = mlkem.decapsulate(secretKey, ciphertext);

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify({
            algorithm: result.algorithm,
            sharedSecret: {
              hex: Array.from(result.sharedSecret)
                .map(b => b.toString(16).padStart(2, '0')).join(''),
              size: result.sharedSecretSize
            },
            decapsulationTime: result.decapsulationTime,
            timestamp: result.timestamp
          }, null, 2)
        }
      ]
    };
  }

  async handleCryptoAgilityStatus(args) {
    const status = this.agility.getStatus();

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(status, null, 2)
        }
      ]
    };
  }

  async handleCryptoAgilityMigrate(args) {
    // Framework implementation - in production, would use actual Ed25519 key
    const migration = this.agility.migrateToQuantum(null);

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify({
            message: "Migration framework ready. In production, would migrate actual Ed25519 key.",
            migrationRecord: migration.migrationRecord,
            metadata: migration.metadata
          }, null, 2)
        }
      ]
    };
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error("Quantum Crypto MCP Server running on stdio");
  }
}

const server = new QuantumCryptoMCPServer();
server.run().catch(console.error);

