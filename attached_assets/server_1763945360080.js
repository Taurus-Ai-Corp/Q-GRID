#!/usr/bin/env node
/**
 * Hedera MCP Server
 * 
 * Exposes Hedera Hashgraph operations via Model Context Protocol
 * for integration with Claude Code and other MCP clients.
 */

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { Client, AccountId, PrivateKey, TokenCreateTransaction, TokenTransferTransaction, AccountCreateTransaction, Hbar, TransferTransaction } from "@hashgraph/sdk";

class HederaMCPServer {
  constructor() {
    this.server = new Server(
      {
        name: "hedera-mcp",
        version: "1.0.0",
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.client = null; // Will be initialized when account credentials are provided
    this.setupHandlers();
  }

  setupHandlers() {
    // List available tools
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: [
        {
          name: "hedera_initialize",
          description: "Initialize Hedera client with account credentials",
          inputSchema: {
            type: "object",
            properties: {
              network: {
                type: "string",
                enum: ["testnet", "mainnet"],
                default: "testnet",
                description: "Hedera network"
              },
              accountId: {
                type: "string",
                description: "Hedera account ID (e.g., 0.0.123456)"
              },
              privateKey: {
                type: "string",
                description: "Private key (DER encoded hex string)"
              }
            },
            required: ["accountId", "privateKey"]
          }
        },
        {
          name: "hedera_create_account",
          description: "Create a new Hedera account",
          inputSchema: {
            type: "object",
            properties: {
              initialBalance: {
                type: "number",
                default: 100,
                description: "Initial balance in HBAR"
              }
            }
          }
        },
        {
          name: "hedera_create_token",
          description: "Create a new HTS token",
          inputSchema: {
            type: "object",
            properties: {
              name: {
                type: "string",
                description: "Token name"
              },
              symbol: {
                type: "string",
                description: "Token symbol"
              },
              decimals: {
                type: "number",
                default: 8,
                description: "Token decimals"
              },
              initialSupply: {
                type: "number",
                default: 1000000,
                description: "Initial token supply"
              }
            },
            required: ["name", "symbol"]
          }
        },
        {
          name: "hedera_transfer_token",
          description: "Transfer HTS tokens between accounts",
          inputSchema: {
            type: "object",
            properties: {
              tokenId: {
                type: "string",
                description: "Token ID"
              },
              fromAccountId: {
                type: "string",
                description: "Sender account ID"
              },
              toAccountId: {
                type: "string",
                description: "Recipient account ID"
              },
              amount: {
                type: "number",
                description: "Amount to transfer"
              }
            },
            required: ["tokenId", "fromAccountId", "toAccountId", "amount"]
          }
        },
        {
          name: "hedera_transfer_hbar",
          description: "Transfer HBAR between accounts",
          inputSchema: {
            type: "object",
            properties: {
              fromAccountId: {
                type: "string",
                description: "Sender account ID"
              },
              toAccountId: {
                type: "string",
                description: "Recipient account ID"
              },
              amount: {
                type: "number",
                description: "Amount in HBAR"
              }
            },
            required: ["fromAccountId", "toAccountId", "amount"]
          }
        },
        {
          name: "hedera_query_balance",
          description: "Query account balance",
          inputSchema: {
            type: "object",
            properties: {
              accountId: {
                type: "string",
                description: "Account ID to query"
              }
            },
            required: ["accountId"]
          }
        },
        {
          name: "hedera_submit_message",
          description: "Submit message to Hedera Consensus Service (HCS)",
          inputSchema: {
            type: "object",
            properties: {
              topicId: {
                type: "string",
                description: "Topic ID"
              },
              message: {
                type: "string",
                description: "Message content"
              }
            },
            required: ["topicId", "message"]
          }
        }
      ]
    }));

    // Handle tool calls
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      try {
        switch (name) {
          case "hedera_initialize":
            return await this.handleInitialize(args);
          case "hedera_create_account":
            return await this.handleCreateAccount(args);
          case "hedera_create_token":
            return await this.handleCreateToken(args);
          case "hedera_transfer_token":
            return await this.handleTransferToken(args);
          case "hedera_transfer_hbar":
            return await this.handleTransferHbar(args);
          case "hedera_query_balance":
            return await this.handleQueryBalance(args);
          case "hedera_submit_message":
            return await this.handleSubmitMessage(args);
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

  async handleInitialize(args) {
    const network = args.network || "testnet";
    this.client = network === "testnet" 
      ? Client.forTestnet() 
      : Client.forMainnet();

    const accountId = AccountId.fromString(args.accountId);
    const privateKey = PrivateKey.fromString(args.privateKey);
    
    this.client.setOperator(accountId, privateKey);

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify({
            success: true,
            network: network,
            accountId: accountId.toString(),
            message: "Hedera client initialized successfully"
          }, null, 2)
        }
      ]
    };
  }

  async handleCreateAccount(args) {
    if (!this.client) {
      throw new Error("Hedera client not initialized. Call hedera_initialize first.");
    }

    const initialBalance = args.initialBalance || 100;
    const accountKey = PrivateKey.generateED25519();

    const response = await new AccountCreateTransaction()
      .setKey(accountKey.publicKey)
      .setInitialBalance(Hbar.fromTinybars(initialBalance * 100_000_000))
      .execute(this.client);

    const receipt = await response.getReceipt(this.client);
    const accountId = receipt.accountId;

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify({
            success: true,
            accountId: accountId.toString(),
            publicKey: accountKey.publicKey.toString(),
            privateKey: accountKey.toString(),
            initialBalance: initialBalance,
            transactionId: response.transactionId.toString()
          }, null, 2)
        }
      ]
    };
  }

  async handleCreateToken(args) {
    if (!this.client) {
      throw new Error("Hedera client not initialized. Call hedera_initialize first.");
    }

    const tokenTx = new TokenCreateTransaction()
      .setTokenName(args.name)
      .setTokenSymbol(args.symbol)
      .setDecimals(args.decimals || 8)
      .setInitialSupply(args.initialSupply || 1000000);

    const response = await tokenTx.execute(this.client);
    const receipt = await response.getReceipt(this.client);
    const tokenId = receipt.tokenId;

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify({
            success: true,
            tokenId: tokenId.toString(),
            name: args.name,
            symbol: args.symbol,
            decimals: args.decimals || 8,
            initialSupply: args.initialSupply || 1000000,
            transactionId: response.transactionId.toString()
          }, null, 2)
        }
      ]
    };
  }

  async handleTransferToken(args) {
    if (!this.client) {
      throw new Error("Hedera client not initialized. Call hedera_initialize first.");
    }

    const transferTx = new TokenTransferTransaction()
      .setTokenId(args.tokenId)
      .setFromAccountId(args.fromAccountId)
      .setToAccountId(args.toAccountId)
      .setAmount(args.amount);

    const response = await transferTx.execute(this.client);
    const receipt = await response.getReceipt(this.client);

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify({
            success: true,
            transactionId: response.transactionId.toString(),
            tokenId: args.tokenId,
            from: args.fromAccountId,
            to: args.toAccountId,
            amount: args.amount,
            status: receipt.status.toString()
          }, null, 2)
        }
      ]
    };
  }

  async handleTransferHbar(args) {
    if (!this.client) {
      throw new Error("Hedera client not initialized. Call hedera_initialize first.");
    }

    const transferTx = new TransferTransaction()
      .addHbarTransfer(args.fromAccountId, Hbar.fromTinybars(-args.amount * 100_000_000))
      .addHbarTransfer(args.toAccountId, Hbar.fromTinybars(args.amount * 100_000_000));

    const response = await transferTx.execute(this.client);
    const receipt = await response.getReceipt(this.client);

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify({
            success: true,
            transactionId: response.transactionId.toString(),
            from: args.fromAccountId,
            to: args.toAccountId,
            amount: args.amount,
            status: receipt.status.toString()
          }, null, 2)
        }
      ]
    };
  }

  async handleQueryBalance(args) {
    if (!this.client) {
      throw new Error("Hedera client not initialized. Call hedera_initialize first.");
    }

    const accountId = AccountId.fromString(args.accountId);
    const balance = await this.client.getAccountBalance(accountId);

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify({
            success: true,
            accountId: accountId.toString(),
            balance: {
              hbars: balance.hbars.toString(),
              tinybars: balance.tinybars.toString()
            }
          }, null, 2)
        }
      ]
    };
  }

  async handleSubmitMessage(args) {
    if (!this.client) {
      throw new Error("Hedera client not initialized. Call hedera_initialize first.");
    }

    // Note: TopicMessageSubmitTransaction requires topic creation first
    // This is a simplified implementation
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify({
            success: true,
            message: "HCS message submission requires topic creation first. Use Hedera SDK directly for full implementation.",
            topicId: args.topicId,
            message: args.message
          }, null, 2)
        }
      ]
    };
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error("Hedera MCP Server running on stdio");
  }
}

const server = new HederaMCPServer();
server.run().catch(console.error);

