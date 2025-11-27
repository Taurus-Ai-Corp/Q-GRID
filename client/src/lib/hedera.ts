import { Client, AccountId, PrivateKey, TokenCreateTransaction, Hbar, TokenAssociateTransaction, TransferTransaction, TokenId, AccountInfoQuery } from "@hashgraph/sdk";

interface HederaConfig {
  accountId: string;
  privateKey: string;
  network: "testnet" | "mainnet";
}

export class HederaClient {
  private client: Client | null = null;
  private accountId: AccountId | null = null;
  private config: HederaConfig | null = null;

  async initialize(config: HederaConfig): Promise<boolean> {
    try {
      this.config = config;
      
      // Select network
      this.client = config.network === "testnet" 
        ? Client.forTestnet()
        : Client.forMainnet();

      // Set operator
      this.accountId = AccountId.fromString(config.accountId);
      const privateKey = PrivateKey.fromStringECDSA(config.privateKey);
      
      this.client.setOperator(this.accountId, privateKey);
      
      console.log(`✅ Hedera client initialized on ${config.network}`);
      return true;
    } catch (error) {
      console.error("❌ Failed to initialize Hedera client:", error);
      return false;
    }
  }

  async getAccountBalance(): Promise<{ hbars: string; tinybars: string } | null> {
    try {
      if (!this.client || !this.accountId) {
        console.error("Hedera client not initialized");
        return null;
      }

      // Use AccountInfoQuery instead of direct method
      const query = new AccountInfoQuery().setAccountId(this.accountId);
      const accountInfo = await query.execute(this.client);
      
      return {
        hbars: accountInfo.balance.toString(),
        tinybars: accountInfo.balance.toTinybars().toString()
      };
    } catch (error) {
      console.error("Failed to get account balance:", error);
      return null;
    }
  }

  async createToken(tokenName: string, symbol: string, initialSupply: number): Promise<{ tokenId: string; transactionId: string } | null> {
    try {
      if (!this.client || !this.accountId) {
        throw new Error("Hedera client not initialized");
      }

      const createTokenTx = new TokenCreateTransaction()
        .setTokenName(tokenName)
        .setTokenSymbol(symbol)
        .setDecimals(8)
        .setInitialSupply(initialSupply)
        .setTreasuryAccountId(this.accountId)
        .setAdminKey(PrivateKey.generateED25519());

      const txResponse = await createTokenTx.execute(this.client);
      const receipt = await txResponse.getReceipt(this.client);

      return {
        tokenId: receipt.tokenId?.toString() || "",
        transactionId: txResponse.transactionId.toString()
      };
    } catch (error) {
      console.error("Failed to create token:", error);
      return null;
    }
  }

  async transferToken(
    tokenId: string,
    toAccountId: string,
    amount: number
  ): Promise<{ transactionId: string; status: string } | null> {
    try {
      if (!this.client || !this.accountId) {
        throw new Error("Hedera client not initialized");
      }

      const transferTx = new TransferTransaction()
        .addTokenTransfer(TokenId.fromString(tokenId), this.accountId, -amount)
        .addTokenTransfer(TokenId.fromString(tokenId), AccountId.fromString(toAccountId), amount);

      const txResponse = await transferTx.execute(this.client);
      const receipt = await txResponse.getReceipt(this.client);

      return {
        transactionId: txResponse.transactionId.toString(),
        status: receipt.status.toString()
      };
    } catch (error) {
      console.error("Failed to transfer token:", error);
      return null;
    }
  }

  async associateToken(tokenId: string): Promise<boolean> {
    try {
      if (!this.client || !this.accountId) {
        throw new Error("Hedera client not initialized");
      }

      const associateTx = new TokenAssociateTransaction()
        .setAccountId(this.accountId)
        .setTokenIds([TokenId.fromString(tokenId)]);

      const txResponse = await associateTx.execute(this.client);
      await txResponse.getReceipt(this.client);

      return true;
    } catch (error) {
      console.error("Failed to associate token:", error);
      return false;
    }
  }

  getAccountId(): string {
    return this.accountId?.toString() || "";
  }

  isInitialized(): boolean {
    return this.client !== null;
  }
}

// Singleton instance
export const hederaClient = new HederaClient();
