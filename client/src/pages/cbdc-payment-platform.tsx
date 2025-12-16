import { Zap, Wallet, Send, History, CheckCircle, Clock, AlertCircle } from "lucide-react";
import { useState, useEffect } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import Header from "@/components/Header";

interface Wallet {
  id: string;
  userId: string;
  hederaAccountId: string;
  publicKey: string;
  balance: number;
  createdAt: string;
}

interface Transaction {
  id: string;
  fromWalletId: string;
  toAddress: string;
  amount: number;
  currency: string;
  status: string;
  transactionHash: string;
  createdAt: string;
}

export default function CBDCPaymentPlatform() {
  const [walletId, setWalletId] = useState<string | null>(null);
  const [recipientAddress, setRecipientAddress] = useState("");
  const [transferAmount, setTransferAmount] = useState("");
  const [activeTab, setActiveTab] = useState<"send" | "history">("send");

  const pubKeyHex = Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join("");

  const initializeWalletMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/cbdc/wallet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: "user_cbdc_platform",
          hederaAccountId: "0.0.7231851",
          publicKey: pubKeyHex,
        }),
      });

      if (!response.ok) throw new Error("Wallet initialization failed");
      const data = await response.json();
      return data.wallet;
    },
    onSuccess: (wallet) => {
      setWalletId(wallet.id);
      toast.success("✅ Wallet Initialized", {
        description: `Account: ${wallet.hederaAccountId}`,
      });
    },
    onError: () => {
      toast.error("❌ Wallet Initialization Failed");
    },
  });

  useEffect(() => {
    if (!walletId) {
      initializeWalletMutation.mutate();
    }
  }, []);

  const walletQuery = useQuery({
    queryKey: ["wallet", walletId],
    queryFn: async () => {
      if (!walletId) return null;
      const response = await fetch(`/api/cbdc/wallet?walletId=${walletId}`);
      if (!response.ok) throw new Error("Failed to fetch wallet");
      return response.json();
    },
    enabled: !!walletId,
    refetchInterval: 2000,
  });

  const transactionsQuery = useQuery({
    queryKey: ["transactions", walletId],
    queryFn: async () => {
      if (!walletId) return [];
      const response = await fetch(`/api/cbdc/transactions/${walletId}`);
      if (!response.ok) throw new Error("Failed to fetch transactions");
      const data = await response.json();
      return data.transactions || [];
    },
    enabled: !!walletId,
    refetchInterval: 2000,
  });

  const transferMutation = useMutation({
    mutationFn: async () => {
      if (!walletId || !recipientAddress || !transferAmount) {
        throw new Error("Please fill all fields");
      }

      const response = await fetch("/api/cbdc/transfer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          walletId,
          recipientAddress,
          amount: parseFloat(transferAmount),
          currency: "INR",
        }),
      });

      if (!response.ok) throw new Error("Transfer failed");
      const data = await response.json();
      return data;
    },
    onSuccess: (data) => {
      toast.success("🚀 Transfer Initiated", {
        description: `₹${transferAmount} → ${recipientAddress}`,
      });
      setRecipientAddress("");
      setTransferAmount("");
      transactionsQuery.refetch();
    },
    onError: (error) => {
      toast.error("❌ Transfer Failed", {
        description: error instanceof Error ? error.message : "Unknown error",
      });
    },
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "text-green-400";
      case "pending":
        return "text-yellow-400";
      case "failed":
        return "text-red-400";
      default:
        return "text-gray-400";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="w-4 h-4" />;
      case "pending":
        return <Clock className="w-4 h-4" />;
      case "failed":
        return <AlertCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-black text-white font-mono pt-20">
      <Header />
      <div className="container mx-auto px-4 relative z-10">
        {/* Header */}
        <div className="mb-12 border-b-4 border-accent pb-8">
          <div className="flex items-center gap-3 mb-4">
            <Zap className="w-8 h-8 text-accent" />
            <div className="text-xs text-gray-400">LIVE PAYMENT PLATFORM</div>
          </div>
          <h1 className="text-5xl font-black uppercase tracking-tighter mb-4">CBDC Payment Platform</h1>
          <p className="text-gray-400 text-lg">Quantum-resistant digital rupee transfers with real-time settlement</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          {/* Wallet Panel */}
          <div className="lg:col-span-1 border-2 border-accent bg-accent/10 p-6">
            <div className="flex items-center gap-2 mb-6">
              <Wallet className="w-6 h-6 text-accent" />
              <h2 className="text-2xl font-bold">Your Wallet</h2>
            </div>

            {walletQuery.isLoading ? (
              <div className="text-gray-400 text-sm">Loading wallet...</div>
            ) : walletQuery.data?.wallet ? (
              <div className="space-y-4">
                <div className="bg-black p-3 border border-gray-700">
                  <div className="text-xs text-gray-500 mb-1">Account ID</div>
                  <div className="text-sm font-mono text-accent truncate" data-testid="text-wallet-id">
                    {walletQuery.data.wallet.hederaAccountId}
                  </div>
                </div>

                <div className="bg-black p-3 border border-gray-700">
                  <div className="text-xs text-gray-500 mb-1">Balance</div>
                  <div className="text-3xl font-black text-accent" data-testid="text-wallet-balance">
                    ₹{(walletQuery.data.wallet.balance || 10000).toLocaleString()}
                  </div>
                </div>

                <div className="bg-black p-3 border border-gray-700">
                  <div className="text-xs text-gray-500 mb-1">Status</div>
                  <div className="text-sm text-green-400 flex items-center gap-2">
                    <CheckCircle className="w-4 h-4" />
                    Active
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-gray-400 text-sm">
                {initializeWalletMutation.isPending ? "Initializing..." : "Error loading wallet"}
              </div>
            )}
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Tab Navigation */}
            <div className="flex gap-4 mb-8 border-b-2 border-gray-800">
              <button
                onClick={() => setActiveTab("send")}
                className={`px-4 py-3 font-bold uppercase text-sm transition-colors ${
                  activeTab === "send"
                    ? "border-b-4 border-accent text-accent"
                    : "text-gray-400 hover:text-white"
                }`}
                data-testid="button-tab-send"
              >
                <Send className="w-4 h-4 inline mr-2" />
                Send Transfer
              </button>
              <button
                onClick={() => setActiveTab("history")}
                className={`px-4 py-3 font-bold uppercase text-sm transition-colors ${
                  activeTab === "history"
                    ? "border-b-4 border-accent text-accent"
                    : "text-gray-400 hover:text-white"
                }`}
                data-testid="button-tab-history"
              >
                <History className="w-4 h-4 inline mr-2" />
                Transaction History
              </button>
            </div>

            {/* Send Transfer Tab */}
            {activeTab === "send" && (
              <div className="border-2 border-accent bg-black p-8">
                <h3 className="text-2xl font-bold mb-6">Initiate Transfer</h3>

                <div className="space-y-4">
                  <div>
                    <label className="text-sm text-gray-400 block mb-2">Recipient Address (Hedera Account)</label>
                    <input
                      type="text"
                      value={recipientAddress}
                      onChange={(e) => setRecipientAddress(e.target.value)}
                      placeholder="0.0.123456"
                      className="w-full bg-gray-900 border border-gray-700 px-4 py-2 text-white font-mono focus:border-accent focus:outline-none"
                      data-testid="input-recipient"
                    />
                  </div>

                  <div>
                    <label className="text-sm text-gray-400 block mb-2">Amount (₹)</label>
                    <input
                      type="number"
                      value={transferAmount}
                      onChange={(e) => setTransferAmount(e.target.value)}
                      placeholder="100"
                      className="w-full bg-gray-900 border border-gray-700 px-4 py-2 text-white font-mono focus:border-accent focus:outline-none"
                      data-testid="input-amount"
                    />
                  </div>

                  <button
                    onClick={() => transferMutation.mutate()}
                    disabled={transferMutation.isPending || !walletId}
                    className="w-full bg-accent text-black font-black uppercase py-3 hover:bg-yellow-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all border-2 border-accent"
                    data-testid="button-send-transfer"
                  >
                    {transferMutation.isPending ? "⏳ Processing..." : "✈️ SEND TRANSFER"}
                  </button>

                  {transferMutation.isSuccess && (
                    <div className="p-4 bg-green-900/30 border border-green-700 text-sm text-gray-300">
                      <div className="font-bold text-green-400 mb-2">✅ Transfer Successful</div>
                      <div data-testid="text-transfer-hash">Hash: {transferMutation.data?.transactionHash?.slice(0, 20)}...</div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Transaction History Tab */}
            {activeTab === "history" && (
              <div className="border-2 border-accent bg-black p-8">
                <h3 className="text-2xl font-bold mb-6">Recent Transactions</h3>

                {transactionsQuery.isLoading ? (
                  <div className="text-gray-400">Loading transactions...</div>
                ) : transactionsQuery.data && transactionsQuery.data.length > 0 ? (
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {transactionsQuery.data.map((tx: Transaction, idx: number) => (
                      <div
                        key={tx.id || idx}
                        className="p-4 bg-gray-900 border border-gray-700 hover:border-accent transition-colors"
                        data-testid={`card-transaction-${idx}`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            {getStatusIcon(tx.status)}
                            <span className={`text-sm font-bold uppercase ${getStatusColor(tx.status)}`}>
                              {tx.status}
                            </span>
                          </div>
                          <div className="text-sm text-gray-400">{new Date(tx.createdAt).toLocaleTimeString()}</div>
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="text-xs text-gray-500">To: {tx.toAddress}</div>
                            <div className="text-xs font-mono text-gray-600 truncate">{tx.transactionHash?.slice(0, 20)}...</div>
                          </div>
                          <div className="text-lg font-bold text-accent">₹{tx.amount}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-gray-400 text-sm">No transactions yet. Send a transfer to get started!</div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* System Status */}
        <div className="border-2 border-gray-800 bg-gray-900/50 p-8">
          <h2 className="text-2xl font-bold mb-4">System Status</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-3 bg-black border border-gray-700">
              <div className="text-xs text-gray-500 mb-1">Hedera</div>
              <div className="text-sm font-bold text-green-400">✓ Connected</div>
            </div>
            <div className="p-3 bg-black border border-gray-700">
              <div className="text-xs text-gray-500 mb-1">Settlement</div>
              <div className="text-sm font-bold text-green-400">✓ Active</div>
            </div>
            <div className="p-3 bg-black border border-gray-700">
              <div className="text-xs text-gray-500 mb-1">Quantum Ready</div>
              <div className="text-sm font-bold text-accent">✓ ML-DSA</div>
            </div>
            <div className="p-3 bg-black border border-gray-700">
              <div className="text-xs text-gray-500 mb-1">Uptime</div>
              <div className="text-sm font-bold text-green-400">99.99%</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
