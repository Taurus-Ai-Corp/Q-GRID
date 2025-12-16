import { useState } from "react";
import { Wallet, Plus, Send, Settings, Lock } from "lucide-react";
import { hederaClient } from "@/lib/hedera";
import { quantumSignatureManager } from "@/lib/quantum-signature";
import AccountBalance from "@/components/account-balance";
import TokenCreator from "@/components/token-creator";
import TransactionMonitor from "@/components/transaction-monitor";
import Header from "@/components/Header";

export default function Accounts() {
  const [accountId, setAccountId] = useState("");
  const [privateKey, setPrivateKey] = useState("");
  const [network, setNetwork] = useState<"testnet" | "mainnet">("testnet");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{ type: string; message: string } | null>(null);

  const handleConnect = async () => {
    if (!accountId || !privateKey) {
      setStatus({ type: "error", message: "Account ID and Private Key required" });
      return;
    }

    setLoading(true);
    setStatus({ type: "info", message: "Connecting to Hedera..." });

    const success = await hederaClient.initialize({
      accountId,
      privateKey,
      network
    });

    if (success) {
      setStatus({ type: "success", message: "✅ Connected to Hedera!" });
      setPrivateKey(""); // Clear sensitive data
    } else {
      setStatus({ type: "error", message: "Failed to connect to Hedera" });
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-black text-white font-mono pt-20">
      <Header />
      <div className="container mx-auto px-4 relative z-10">
        {/* Header */}
        <div className="flex justify-between items-end mb-8 border-b-4 border-white pb-4">
          <div>
            <div className="text-xs text-gray-400 mb-1">/// ACCOUNT_MANAGEMENT</div>
            <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter">
              Account Manager
            </h1>
          </div>
          <div className="text-right hidden md:block">
            <div className="flex items-center gap-2 justify-end text-accent font-bold">
              <Wallet className="w-5 h-5" />
              HEDERA MAINNET
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Connection Form */}
          <div className="lg:col-span-2 space-y-6">
            <div className="border-2 border-gray-800 bg-gray-900/50 p-8 backdrop-blur-sm">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <Settings className="w-6 h-6" />
                CONNECT WALLET
              </h2>

              <div className="space-y-4">
                {/* Network Selection */}
                <div>
                  <label className="block text-sm font-bold text-gray-400 mb-2 uppercase">
                    NETWORK
                  </label>
                  <div className="flex gap-4">
                    {["testnet", "mainnet"].map(net => (
                      <button
                        key={net}
                        onClick={() => setNetwork(net as "testnet" | "mainnet")}
                        className={`px-4 py-2 border-2 uppercase font-bold transition-all ${
                          network === net
                            ? "border-accent bg-accent text-black"
                            : "border-gray-700 hover:border-white"
                        }`}
                      >
                        {net}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Account ID Input */}
                <div>
                  <label className="block text-sm font-bold text-gray-400 mb-2 uppercase">
                    ACCOUNT ID
                  </label>
                  <input
                    type="text"
                    placeholder="0.0.6952220"
                    value={accountId}
                    onChange={(e) => setAccountId(e.target.value)}
                    className="w-full bg-black border-2 border-gray-700 px-4 py-2 font-mono text-white placeholder-gray-600 focus:border-accent outline-none"
                  />
                </div>

                {/* Private Key Input */}
                <div>
                  <label className="block text-sm font-bold text-gray-400 mb-2 uppercase">
                    PRIVATE KEY (HEX)
                  </label>
                  <input
                    type="password"
                    placeholder="0x..."
                    value={privateKey}
                    onChange={(e) => setPrivateKey(e.target.value)}
                    className="w-full bg-black border-2 border-gray-700 px-4 py-2 font-mono text-white placeholder-gray-600 focus:border-accent outline-none"
                  />
                  <div className="text-xs text-gray-500 mt-1">
                    🔒 Keys are encrypted and never stored. Best practice: Use Replit Secrets
                  </div>
                </div>

                {/* Status Message */}
                {status && (
                  <div className={`p-3 border-l-4 ${
                    status.type === "success" ? "border-green-500 bg-green-500/10 text-green-500" :
                    status.type === "error" ? "border-red-500 bg-red-500/10 text-red-500" :
                    "border-accent bg-accent/10 text-accent"
                  }`}>
                    {status.message}
                  </div>
                )}

                {/* Connect Button */}
                <button
                  onClick={handleConnect}
                  disabled={loading}
                  className="w-full bg-accent text-black px-8 py-4 text-xl font-bold uppercase border-2 border-black hover:bg-black hover:text-white transition-all disabled:opacity-50"
                >
                  {loading ? "CONNECTING..." : "CONNECT ACCOUNT"}
                </button>
              </div>
            </div>

            {/* Token Creator */}
            <TokenCreator />

            {/* Transaction Monitor */}
            <TransactionMonitor />
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <AccountBalance />

            {/* Account Info */}
            <div className="border-2 border-gray-800 bg-gray-900/50 p-6 backdrop-blur-sm">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <Wallet className="w-5 h-5" />
                ACCOUNT INFO
              </h3>
              
              <div className="grid grid-cols-1 gap-4 text-sm">
                <div>
                  <div className="text-gray-500 text-xs mb-1">ACCOUNT ID</div>
                  <div className="font-mono text-white break-all text-xs">{accountId || "Not connected"}</div>
                </div>
                <div>
                  <div className="text-gray-500 text-xs mb-1">NETWORK</div>
                  <div className="uppercase font-bold text-accent">{network}</div>
                </div>
              </div>
            </div>

            {/* Quantum Signature Status */}
            <div className="border-2 border-gray-800 bg-gray-900/50 p-6 backdrop-blur-sm">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <Lock className="w-5 h-5 text-accent" />
                QUANTUM STATUS
              </h3>
              
              <div className="space-y-3 text-sm">
                <div>
                  <div className="text-gray-500 text-xs mb-1">ALGORITHM</div>
                  <div className="font-mono text-white">{quantumSignatureManager.getStatus().algorithm}</div>
                </div>
                <div>
                  <div className="text-gray-500 text-xs mb-1">QUANTUM READY</div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-warning rounded-full" />
                    <span className="text-warning">Upgrading to ML-DSA</span>
                  </div>
                </div>
                <div>
                  <div className="text-gray-500 text-xs mb-1">MIGRATION TARGET</div>
                  <div className="text-xs text-accent">ML-DSA-65 (NIST FIPS 204)</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
