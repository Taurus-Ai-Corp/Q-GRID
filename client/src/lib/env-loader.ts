import { hederaClient } from "./hedera";

export async function initializeFromEnv(): Promise<boolean> {
  // Get credentials from Replit Secrets (automatically prefixed with VITE_)
  const accountId = import.meta.env.VITE_HEDERA_ACCOUNT_ID;
  const privateKey = import.meta.env.VITE_HEDERA_PRIVATE_KEY;
  const network = (import.meta.env.VITE_HEDERA_NETWORK || "testnet") as "testnet" | "mainnet";

  if (!accountId || !privateKey) {
    console.log("⚠️ Hedera credentials not found in Replit Secrets");
    console.log("📋 Visit /setup to configure environment variables");
    return false;
  }

  try {
    console.log("🔄 Initializing Hedera client from Replit Secrets...");
    const success = await hederaClient.initialize({
      accountId,
      privateKey,
      network
    });

    if (success) {
      console.log("✅ Hedera client initialized from environment variables");
      return true;
    }
  } catch (error) {
    console.error("❌ Failed to initialize from environment:", error);
  }

  return false;
}
