import { Zap, CheckCircle } from "lucide-react";
import Header from "@/components/Header";

export default function CBDCService() {
  return (
    <div className="min-h-screen bg-black text-white font-mono pt-20">
      <Header />
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-12 border-b-4 border-accent pb-8">
            <div className="flex items-center gap-3 mb-4">
              <Zap className="w-8 h-8 text-accent" />
              <div className="text-xs text-gray-400">SERVICE 2 OF 3</div>
            </div>
            <h1 className="text-5xl font-black uppercase tracking-tighter mb-4">Offline CBDC Transfers</h1>
            <p className="text-gray-400 text-lg">Unlimited Quantum-Safe Payments for 600M Rural Indians</p>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-3 gap-4 mb-12">
            <div className="p-4 bg-yellow-900/30 border border-yellow-700">
              <div className="text-2xl font-black text-accent">UNLIMITED</div>
              <div className="text-xs text-gray-400">Transactions Offline</div>
              <div className="text-xs text-gray-600">vs RBI's 1 transaction</div>
            </div>
            <div className="p-4 bg-yellow-900/30 border border-yellow-700">
              <div className="text-2xl font-black text-accent">0%</div>
              <div className="text-xs text-gray-400">Internet Required</div>
              <div className="text-xs text-gray-600">100% offline capable</div>
            </div>
            <div className="p-4 bg-yellow-900/30 border border-yellow-700">
              <div className="text-2xl font-black text-accent">ML-DSA</div>
              <div className="text-xs text-gray-400">Quantum-Safe Ready</div>
              <div className="text-xs text-gray-600">Post-2027 compliant</div>
            </div>
          </div>

          {/* Solution Overview */}
          <div className="border-2 border-gray-800 bg-gray-900/50 p-8 mb-8 backdrop-blur-sm">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <Zap className="w-6 h-6 text-accent" />
              Revolutionary Technology
            </h2>

            <div className="space-y-4">
              <div className="p-4 bg-black border-l-4 border-accent">
                <div className="font-bold text-accent mb-2">State Channel Architecture</div>
                <div className="text-sm text-gray-400">
                  Patent-pending protocol for unlimited consecutive offline transactions. 
                  Pre-signed transaction chains enable payments without blockchain connectivity. 
                  Automatic settlement when device comes online.
                </div>
              </div>

              <div className="p-4 bg-black border-l-4 border-accent">
                <div className="font-bold text-accent mb-2">Multi-Protocol Connectivity</div>
                <div className="text-sm text-gray-400">
                  Primary: Bluetooth 5.3 Mesh (200m range). Secondary: NFC (10cm). 
                  Backup: QR codes + USSD SMS. Works on feature phones + smartphones + wearables.
                </div>
              </div>

              <div className="p-4 bg-black border-l-4 border-accent">
                <div className="font-bold text-accent mb-2">Quantum-Resistant Cryptography</div>
                <div className="text-sm text-gray-400">
                  Current: Ed25519. Migration: Hybrid wrapper (2025). Future: ML-DSA (2027). 
                  Zero downtime transition. Ready for SWIFT PQC mandate.
                </div>
              </div>

              <div className="p-4 bg-black border-l-4 border-accent">
                <div className="font-bold text-accent mb-2">Offline-First Design</div>
                <div className="text-sm text-gray-400">
                  Conflict resolution via cryptographic proofs (Merkle trees). 
                  Double-spend prevention without online validation. Batch settlement (hourly).
                </div>
              </div>
            </div>
          </div>

          {/* Use Case: Rural Market */}
          <div className="border-2 border-gray-800 bg-gray-900/50 p-8 mb-8 backdrop-blur-sm">
            <h2 className="text-2xl font-bold mb-6">Real-World Impact: Rural Market</h2>
            
            <div className="bg-black p-4 mb-4 border border-gray-800">
              <div className="font-bold text-accent mb-3">Scenario: Village Market Transaction</div>
              <div className="text-sm text-gray-400 space-y-2">
                <div>🚜 <span className="font-bold">Farmer sells vegetables to 50 customers</span></div>
                <div>💰 Each transaction: ₹50-₹200 (multiple transactions per day)</div>
                <div>📡 Internet access: Intermittent (available at night only)</div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-red-900/20 border border-red-700">
                <div className="font-bold text-red-400 mb-2">RBI's Current Solution</div>
                <div className="text-sm text-gray-400 space-y-1">
                  <div>• Max 20 transactions/day limit</div>
                  <div>• Can only serve 20 customers!</div>
                  <div>• Farmer loses 30 potential sales</div>
                  <div>• Customer drop-off: 60%</div>
                </div>
              </div>

              <div className="p-4 bg-green-900/20 border border-green-700">
                <div className="font-bold text-green-400 mb-2">QUANTUM_RUPEE Solution</div>
                <div className="text-sm text-gray-400 space-y-1">
                  <div>• UNLIMITED transactions offline</div>
                  <div>• Serve all 50 customers instantly</div>
                  <div>• Batch settle at night online</div>
                  <div>• 0% customer drop-off</div>
                </div>
              </div>
            </div>

            <div className="mt-4 p-4 bg-accent/10 border border-accent">
              <div className="text-sm text-gray-400">
                <span className="font-bold text-accent">Impact Scale:</span> 600M rural Indians × ₹500/year economic benefit = 
                <span className="font-bold text-accent">₹300 Cr annual economic value</span>
              </div>
            </div>
          </div>

          {/* Features */}
          <div className="border-2 border-gray-800 bg-gray-900/50 p-8 mb-8 backdrop-blur-sm">
            <h2 className="text-2xl font-bold mb-6">Key Features</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                "Unlimited consecutive offline transactions",
                "Bluetooth 5.3 Mesh networking",
                "NFC/QR code backup protocols",
                "Post-quantum cryptography ready",
                "Device-agnostic (feature phones to IoT)",
                "Automatic conflict resolution",
                "Zero merchant infrastructure needed",
                "Batch settlement on sync"
              ].map((feature, idx) => (
                <div key={idx} className="flex items-start gap-3 p-3 bg-black border border-gray-800">
                  <CheckCircle className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-gray-300">{feature}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Business Model */}
          <div className="border-2 border-gray-800 bg-gray-900/50 p-8 mb-8 backdrop-blur-sm">
            <h2 className="text-2xl font-bold mb-6">Revenue Model</h2>
            <div className="space-y-4">
              <div className="p-4 bg-black border border-gray-800">
                <div className="text-sm text-gray-500 mb-2">Government (RBI)</div>
                <div className="text-lg font-bold text-accent">Licensing + Settlement Fees</div>
                <div className="text-xs text-gray-400">₹50-100 Cr/year</div>
              </div>

              <div className="p-4 bg-black border border-gray-800">
                <div className="text-sm text-gray-500 mb-2">Banks & Fintechs</div>
                <div className="text-lg font-bold text-accent">API Gateway + Per-Transaction</div>
                <div className="text-xs text-gray-400">₹0.001 per transaction (at scale: ₹100 Cr/year)</div>
              </div>

              <div className="p-4 bg-accent/10 border border-accent">
                <div className="font-bold text-accent mb-2">5-Year Projection</div>
                <div className="text-sm text-gray-400">
                  Y1: ₹8.5 Cr | Y3: ₹85 Cr | Y5: ₹200 Cr
                </div>
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="text-center p-8 border-2 border-accent bg-accent/5">
            <h2 className="text-2xl font-bold mb-4">Ready to Deploy?</h2>
            <p className="text-gray-400 mb-6">
              Complete offline payment architecture. State channels. Quantum-ready. 
              Production deployment within 12 weeks.
            </p>
            <a href="/app/monitoring" className="inline-block px-8 py-3 bg-accent text-black font-bold uppercase hover:bg-yellow-400 transition-colors">
              View System Status
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
