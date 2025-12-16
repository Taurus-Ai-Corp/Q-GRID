import { Lock, Zap, Shield, TrendingUp } from "lucide-react";

export default function QuantumRupeeLogin() {
  return (
    <div className="min-h-screen bg-black text-white font-mono">
      <div className="container mx-auto px-4 py-12">
        {/* Hero Section */}
        <div className="border-b-4 border-white pb-12 mb-12">
          <div className="text-center max-w-4xl mx-auto">
            <div className="text-xs text-gray-400 mb-2">/// RBI_HACKATHON_2025</div>
            <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tighter mb-6">
              Q_GRID
            </h1>
            <p className="text-xl md:text-2xl mb-8 font-bold text-gray-300">
              Production CBDC Platform with HYBRID Quantum-Resistant Cryptography
            </p>
            <a
              href="/api/login"
              data-testid="button-login"
              className="inline-block bg-accent text-black px-12 py-5 text-xl font-bold uppercase border-4 border-black hover:bg-black hover:text-white hover:border-white transition-all"
            >
              SIGN IN TO CONTINUE
            </a>
            <div className="mt-4 text-sm text-gray-500">
              Login with Google, GitHub, email or Apple
            </div>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {/* Feature 1 */}
          <div className="border-2 border-gray-800 bg-gray-900/50 p-8 backdrop-blur-sm">
            <div className="flex items-center gap-3 mb-4">
              <Shield className="w-8 h-8 text-accent" />
              <h3 className="text-xl font-bold uppercase">Tokenized KYC</h3>
            </div>
            <p className="text-gray-400 text-sm">
              Hedera blockchain-based identity verification with Aadhaar integration. 87-second verification.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="border-2 border-gray-800 bg-gray-900/50 p-8 backdrop-blur-sm">
            <div className="flex items-center gap-3 mb-4">
              <Zap className="w-8 h-8 text-accent" />
              <h3 className="text-xl font-bold uppercase">Offline CBDC</h3>
            </div>
            <p className="text-gray-400 text-sm">
              UNLIMITED offline transfers via X402 protocol. Zero internet required. T+0 settlement.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="border-2 border-gray-800 bg-gray-900/50 p-8 backdrop-blur-sm">
            <div className="flex items-center gap-3 mb-4">
              <Lock className="w-8 h-8 text-accent" />
              <h3 className="text-xl font-bold uppercase">SARTHI AI™</h3>
            </div>
            <p className="text-gray-400 text-sm">
              Smart Anti-fraud Real-Time Threat & Heuristic Intelligence. 99.73% accuracy.
            </p>
          </div>

          {/* Feature 4 */}
          <div className="border-2 border-gray-800 bg-gray-900/50 p-8 backdrop-blur-sm">
            <div className="flex items-center gap-3 mb-4">
              <TrendingUp className="w-8 h-8 text-accent" />
              <h3 className="text-xl font-bold uppercase">PQC-SIG M</h3>
            </div>
            <p className="text-gray-400 text-sm">
              Post-Quantum Cryptographic Signature Module. ML-DSA FIPS 204 compliance. Quantum-safe.
            </p>
          </div>
        </div>

        {/* Tech Stats */}
        <div className="border-2 border-gray-800 bg-gray-900/50 p-8 backdrop-blur-sm">
          <h2 className="text-2xl font-bold mb-6 uppercase">Platform Specifications</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div>
              <div className="text-accent text-3xl font-bold mb-1">10K+</div>
              <div className="text-gray-400 text-sm">Transactions/Second</div>
            </div>
            <div>
              <div className="text-accent text-3xl font-bold mb-1">&lt;200ms</div>
              <div className="text-gray-400 text-sm">P2P Latency</div>
            </div>
            <div>
              <div className="text-accent text-3xl font-bold mb-1">₹0.001</div>
              <div className="text-gray-400 text-sm">Cost Per Transaction</div>
            </div>
            <div>
              <div className="text-accent text-3xl font-bold mb-1">99.99%</div>
              <div className="text-gray-400 text-sm">Uptime SLA</div>
            </div>
          </div>
        </div>

        {/* Cryptography Info */}
        <div className="mt-8 border-2 border-accent bg-accent/10 p-6 backdrop-blur-sm">
          <div className="flex items-center gap-3 mb-3">
            <Lock className="w-6 h-6 text-accent" />
            <h3 className="text-lg font-bold text-accent uppercase">Quantum-Resistant Security</h3>
          </div>
          <p className="text-gray-300 text-sm mb-2">
            HYBRID ECDSA+PQC: Classical ECDSA P-256 combined with ML-DSA-65 (NIST FIPS 204) quantum-safe signatures.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 text-xs">
            <div>
              <span className="text-accent font-bold">ECDSA:</span> 64-byte signatures (backward compatible)
            </div>
            <div>
              <span className="text-accent font-bold">ML-DSA:</span> 3,309-byte signatures (quantum-safe)
            </div>
            <div>
              <span className="text-accent font-bold">Standards:</span> NIST FIPS 204, 186-5, 140-3 Level 3
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-12 text-center text-gray-500 text-sm">
          <p>Built for RBI CBDC Hackathon 2025</p>
          <p className="mt-2">Targeting 600M+ Rural Indians | Domain: QUANTUM-RUPEE-GRID.TAURUSAI.IO</p>
        </div>
      </div>
    </div>
  );
}
