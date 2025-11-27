import { Zap, TrendingUp } from "lucide-react";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { useLocation } from "wouter";
import Header from "@/components/Header";

export default function CBDCOfflineFlow() {
  const [activeStep, setActiveStep] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [, setLocation] = useLocation();

  const launchServiceMutation = useMutation({
    mutationFn: async () => {
      setIsProcessing(true);
      try {
        const pubKeyHex = Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join("");
        const walletResponse = await fetch("/api/cbdc/wallet", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: "user_demo",
            hederaAccountId: "0.0.7231851",
            publicKey: pubKeyHex,
          }),
        });

        if (!walletResponse.ok) throw new Error("Wallet creation failed");
        const walletData = await walletResponse.json();

        const paymentResponse = await fetch("/api/x402/process", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            amount: "0.01",
            currency: "USDC",
            recipientAddress: "0.0.123456",
            paymentType: "cbdc_transfer",
            metadata: { walletId: walletData.wallet.id },
          }),
        });

        if (!paymentResponse.ok) throw new Error("Payment processing failed");
        const paymentData = await paymentResponse.json();

        toast.success("🚀 CBDC Payment Platform Launching!", {
          description: `Wallet: ${walletData.wallet.hederaAccountId}\nX402 Settlement: ${paymentData.settlement.settlementTime}`,
        });

        setTimeout(() => {
          setLocation("/app/cbdc-payment-platform");
        }, 1500);

        return { wallet: walletData, payment: paymentData };
      } catch (error) {
        toast.error("❌ Launch Failed", {
          description: error instanceof Error ? error.message : "Unknown error",
        });
        throw error;
      } finally {
        setIsProcessing(false);
      }
    },
  });

  const steps = [
    {
      id: "wallet-init",
      title: "Wallet Initialization",
      description: "User downloads CBDC Lite wallet, creates account",
      technical: "SQLite local DB + Ed25519 keypair generation",
      time: "30 seconds"
    },
    {
      id: "online-sync",
      title: "Online Sync (Initial)",
      description: "Connect to Hedera → Download ₹10,000 CBDC tokens",
      technical: "Hedera API → Local encrypted storage",
      time: "45 seconds"
    },
    {
      id: "offline-tx",
      title: "Offline Transactions",
      description: "Create 100+ transactions without internet",
      technical: "State channels + pre-signed batches",
      time: "Unlimited"
    },
    {
      id: "ble-mesh",
      title: "Bluetooth Mesh Transfer",
      description: "Peer-to-peer payments via BLE 5.3",
      technical: "ECC encryption + device discovery",
      time: "<2 seconds/tx"
    },
    {
      id: "batch-settle",
      title: "Batch Settlement",
      description: "Come online → Merkle tree settlement",
      technical: "Hedera Consensus → Bank ledger update",
      time: "T+0 (same day)"
    }
  ];

  return (
    <div className="min-h-screen bg-black text-white font-mono pt-20">
      <Header />
      <div className="container mx-auto px-4 relative z-10">
        {/* Header */}
        <div className="mb-12 border-b-4 border-accent pb-8">
          <div className="flex items-center gap-3 mb-4">
            <Zap className="w-8 h-8 text-accent" />
            <div className="text-xs text-gray-400">PRODUCTION ARCHITECTURE</div>
          </div>
          <h1 className="text-5xl font-black uppercase tracking-tighter mb-4">CBDC Offline Payment Flow</h1>
          <p className="text-gray-400 text-lg">Production-ready architecture for unlimited offline transactions with quantum-resistant settlement</p>
        </div>

        {/* System Architecture Diagram */}
        <div className="border-2 border-accent bg-accent/5 p-8 mb-12">
          <h2 className="text-2xl font-bold mb-6">End-to-End Architecture</h2>
          
          <div className="space-y-4">
            {/* Layer 1: Client Side */}
            <div className="p-4 bg-black border-2 border-yellow-600">
              <div className="font-bold text-yellow-400 mb-3">CLIENT LAYER (Mobile Device)</div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="text-gray-400 mb-1">Storage</div>
                  <div className="text-xs">SQLite DB + encrypted keystore</div>
                </div>
                <div>
                  <div className="text-gray-400 mb-1">Cryptography</div>
                  <div className="text-xs">Ed25519 + ML-DSA hybrid</div>
                </div>
                <div>
                  <div className="text-gray-400 mb-1">Connectivity</div>
                  <div className="text-xs">BLE 5.3 + NFC + USSD</div>
                </div>
                <div>
                  <div className="text-gray-400 mb-1">State Management</div>
                  <div className="text-xs">Local state channels</div>
                </div>
              </div>
            </div>

            {/* Layer 2: Peer Network */}
            <div className="p-4 bg-black border-2 border-orange-600">
              <div className="font-bold text-orange-400 mb-3">PEER NETWORK LAYER (Device-to-Device)</div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="text-gray-400 mb-1">Protocol</div>
                  <div className="text-xs">Bluetooth Mesh 5.3 + NFC tap</div>
                </div>
                <div>
                  <div className="text-gray-400 mb-1">Encryption</div>
                  <div className="text-xs">ECIES-P256 + session keys</div>
                </div>
                <div>
                  <div className="text-gray-400 mb-1">Range</div>
                  <div className="text-xs">200m mesh + 10cm NFC</div>
                </div>
                <div>
                  <div className="text-gray-400 mb-1">Throughput</div>
                  <div className="text-xs">1Mbps BLE / 424Kbps NFC</div>
                </div>
              </div>
            </div>

            {/* Layer 3: Settlement Network */}
            <div className="p-4 bg-black border-2 border-green-600">
              <div className="font-bold text-green-400 mb-3">SETTLEMENT LAYER (Blockchain)</div>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <div className="text-gray-400 mb-1">Primary</div>
                  <div className="text-xs">Hedera Hashgraph (10K TPS)</div>
                </div>
                <div>
                  <div className="text-gray-400 mb-1">Batching</div>
                  <div className="text-xs">Merkle trees (hourly)</div>
                </div>
                <div>
                  <div className="text-gray-400 mb-1">Finality</div>
                  <div className="text-xs">3-5 seconds consensus</div>
                </div>
              </div>
            </div>

            {/* Layer 4: Bank Settlement */}
            <div className="p-4 bg-black border-2 border-blue-600">
              <div className="font-bold text-blue-400 mb-3">BANK LAYER (Ledger Settlement)</div>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <div className="text-gray-400 mb-1">Protocol</div>
                  <div className="text-xs">NEFT / RTGS (India)</div>
                </div>
                <div>
                  <div className="text-gray-400 mb-1">Settlement</div>
                  <div className="text-xs">T+0 (same day)</div>
                </div>
                <div>
                  <div className="text-gray-400 mb-1">Status</div>
                  <div className="text-xs">Real-time balance updates</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Transaction Flow Steps */}
        <div className="border-2 border-gray-800 bg-gray-900/50 p-8 mb-12">
          <h2 className="text-2xl font-bold mb-8">Transaction Flow: 5-Step Process</h2>
          
          <div className="space-y-6">
            {steps.map((step, idx) => (
              <div
                key={step.id}
                className={`p-6 border-2 cursor-pointer transition-all ${
                  activeStep === idx
                    ? "border-accent bg-accent/10"
                    : "border-gray-700 bg-black hover:border-accent"
                }`}
                onClick={() => setActiveStep(idx)}
                data-testid={`step-${step.id}`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <div className="text-3xl font-black text-accent">{idx + 1}</div>
                      <h3 className="text-lg font-bold">{step.title}</h3>
                    </div>
                    <p className="text-gray-400 text-sm">{step.description}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-gray-500 mb-1">Timeline</div>
                    <div className="text-sm font-bold text-accent">{step.time}</div>
                  </div>
                </div>
                
                {activeStep === idx && (
                  <div className="mt-6 pt-6 border-t border-gray-700">
                    <div className="text-xs text-gray-500 mb-2">Technical Implementation</div>
                    <div className="text-sm text-gray-300 font-mono bg-black p-3 border border-gray-700">{step.technical}</div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Backend Infrastructure */}
        <div className="border-2 border-gray-800 bg-gray-900/50 p-8 mb-12">
          <h2 className="text-2xl font-bold mb-6">Backend Infrastructure</h2>
          
          <div className="space-y-4">
            <div className="p-4 bg-black">
              <div className="font-bold text-accent mb-3">💾 Database Layer</div>
              <div className="text-sm text-gray-400 space-y-2">
                <div>• <span className="font-bold">Primary:</span> PostgreSQL (transactions, wallets, KYC)</div>
                <div>• <span className="font-bold">Cache:</span> Redis (state channels, session data)</div>
                <div>• <span className="font-bold">Archive:</span> Filecoin (immutable backup)</div>
                <div>• <span className="font-bold">Replication:</span> Real-time sync (Mumbai + Delhi)</div>
              </div>
            </div>

            <div className="p-4 bg-black">
              <div className="font-bold text-accent mb-3">🔗 State Channel Management</div>
              <div className="text-sm text-gray-400 space-y-2">
                <div>• <span className="font-bold">Protocol:</span> Hedera State Channels (unlimited capacity)</div>
                <div>• <span className="font-bold">Creation:</span> Sub-second setup</div>
                <div>• <span className="font-bold">Transactions:</span> Cryptographically signed (no revocation)</div>
                <div>• <span className="font-bold">Settlement:</span> On-chain finality via Hedera</div>
              </div>
            </div>

            <div className="p-4 bg-black">
              <div className="font-bold text-accent mb-3">⚡ Batch Settlement Engine</div>
              <div className="text-sm text-gray-400 space-y-2">
                <div>• <span className="font-bold">Collection:</span> Merkle trees group 1000s of txs</div>
                <div>• <span className="font-bold">Validation:</span> Multi-signature scheme (3-of-5)</div>
                <div>• <span className="font-bold">Hedera:</span> Submit root hash every hour</div>
                <div>• <span className="font-bold">Bank:</span> NEFT settlement T+0</div>
              </div>
            </div>

            <div className="p-4 bg-black">
              <div className="font-bold text-accent mb-3">🛡️ Security & Compliance</div>
              <div className="text-sm text-gray-400 space-y-2">
                <div>• <span className="font-bold">KYC:</span> Aadhaar-based (87 seconds)</div>
                <div>• <span className="font-bold">AML:</span> Real-time transaction monitoring</div>
                <div>• <span className="font-bold">Sanctions:</span> SWIFT screening (auto)</div>
                <div>• <span className="font-bold">Encryption:</span> AES-256-GCM at rest, TLS 1.3 in transit</div>
              </div>
            </div>

            <div className="p-4 bg-black">
              <div className="font-bold text-accent mb-3">📊 Monitoring & Operations</div>
              <div className="text-sm text-gray-400 space-y-2">
                <div>• <span className="font-bold">Real-time:</span> Prometheus metrics + Grafana dashboards</div>
                <div>• <span className="font-bold">Alerts:</span> PagerDuty (SLA: &lt;5min response)</div>
                <div>• <span className="font-bold">Logging:</span> ELK stack (ElasticSearch + Logstash + Kibana)</div>
                <div>• <span className="font-bold">Uptime:</span> 99.99% (multi-AZ failover)</div>
              </div>
            </div>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="border-2 border-gray-800 bg-gray-900/50 p-8 mb-8">
          <h2 className="text-2xl font-bold mb-6">Production Metrics & Specifications</h2>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 bg-black border border-gray-700 text-center">
              <div className="text-3xl font-bold text-accent">10K+</div>
              <div className="text-xs text-gray-400">Transactions/second (Hedera capacity)</div>
            </div>
            <div className="p-4 bg-black border border-gray-700 text-center">
              <div className="text-3xl font-bold text-accent">&lt;200ms</div>
              <div className="text-xs text-gray-400">Peer-to-peer latency</div>
            </div>
            <div className="p-4 bg-black border border-gray-700 text-center">
              <div className="text-3xl font-bold text-accent">₹0.001</div>
              <div className="text-xs text-gray-400">Cost per transaction</div>
            </div>
            <div className="p-4 bg-black border border-gray-700 text-center">
              <div className="text-3xl font-bold text-accent">99.99%</div>
              <div className="text-xs text-gray-400">Uptime SLA</div>
            </div>
            <div className="p-4 bg-black border border-gray-700 text-center">
              <div className="text-3xl font-bold text-accent">UNLIMITED</div>
              <div className="text-xs text-gray-400">Offline transactions</div>
            </div>
            <div className="p-4 bg-black border border-gray-700 text-center">
              <div className="text-3xl font-bold text-accent">T+0</div>
              <div className="text-xs text-gray-400">Settlement finality</div>
            </div>
            <div className="p-4 bg-black border border-gray-700 text-center">
              <div className="text-3xl font-bold text-accent">600M</div>
              <div className="text-xs text-gray-400">Rural population target</div>
            </div>
            <div className="p-4 bg-black border border-gray-700 text-center">
              <div className="text-3xl font-bold text-accent">2027</div>
              <div className="text-xs text-gray-400">Quantum readiness</div>
            </div>
          </div>
        </div>

        {/* Launch Service Button */}
        <div className="border-4 border-accent bg-accent/10 p-12 text-center">
          <h2 className="text-3xl font-black uppercase mb-4 text-accent">Ready to Launch</h2>
          <p className="text-gray-400 mb-8">Click below to initialize the CBDC Payment Platform with X402 settlement</p>
          <button
            data-testid="button-launch-cbdc-service"
            onClick={() => launchServiceMutation.mutate()}
            disabled={isProcessing || launchServiceMutation.isPending}
            className="px-12 py-4 bg-accent text-black font-black uppercase text-lg hover:bg-yellow-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all border-2 border-accent"
          >
            {isProcessing || launchServiceMutation.isPending ? "🔄 Initializing..." : "▶ LAUNCH SERVICE"}
          </button>
          {launchServiceMutation.isSuccess && (
            <div className="mt-6 p-4 bg-green-900/30 border border-green-700 text-left">
              <div className="font-bold text-green-400 mb-2">✅ CBDC Platform Launched</div>
              <div className="text-sm text-gray-400">
                <div>Wallet ID: {launchServiceMutation.data?.wallet.wallet.id.slice(0, 12)}...</div>
                <div>Settlement TX: {launchServiceMutation.data?.payment.settlement.transactionHash.slice(0, 20)}...</div>
                <div>Settlement Time: {launchServiceMutation.data?.payment.settlement.settlementTime}</div>
              </div>
            </div>
          )}
          {launchServiceMutation.isError && (
            <div className="mt-6 p-4 bg-red-900/30 border border-red-700">
              <div className="font-bold text-red-400">❌ Launch Failed</div>
              <div className="text-sm text-gray-400">{String(launchServiceMutation.error)}</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
