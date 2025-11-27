import { Cpu, Lock, Layers, ArrowRight, Atom, Network, Shield } from "lucide-react";
import { useLocation } from "wouter";

export default function QGridLanding() {
  const [, setLocation] = useLocation();
  return (
    <div className="min-h-screen bg-black text-white overflow-hidden relative">
      {/* Animated Grid Background */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute inset-0" style={{
          backgroundImage: `
            linear-gradient(rgba(255, 255, 0, 0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255, 255, 0, 0.1) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px',
          animation: 'grid-pulse 4s ease-in-out infinite'
        }}></div>
      </div>
      {/* Quantum Particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-accent rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animation: `float ${3 + Math.random() * 4}s ease-in-out infinite`,
              animationDelay: `${Math.random() * 2}s`,
              opacity: 0.6
            }}
          />
        ))}
      </div>
      <div className="relative z-10 container mx-auto px-4 py-20">
        {/* Header */}
        <div className="text-center mb-20">
          <div className="inline-block mb-4">
            <div className="text-xs tracking-widest text-accent mb-2 font-mono">EST. 2025 /// TAURUS AI CORP.</div>
          </div>
          
          <h1 className="text-6xl md:text-8xl font-black mb-6 tracking-tighter">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-accent via-white to-accent">
              Q-GRID
            </span>
          </h1>
          
          <p className="text-2xl md:text-4xl font-bold text-gray-300 mb-4">
            QUANTUM INFRASTRUCTURE AS A SERVICE
          </p>
          
          <p className="text-sm md:text-base text-gray-500 max-w-2xl mx-auto mb-12 font-mono text-right">
            Next-generation quantum computing infrastructure powered by Hedera Hashgraph.
            <br />Distributed. Secure. Instantaneous.
          </p>

          <button
            onClick={() => setLocation("/big-bang")}
            data-testid="button-launch-app"
            className="group relative inline-flex items-center gap-3 bg-accent text-black px-10 py-5 text-xl font-black uppercase tracking-wider hover:bg-white transition-all duration-300 overflow-hidden"
          >
            <span className="relative z-10">LAUNCH APP</span>
            <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform relative z-10" />
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
          </button>
        </div>

        {/* Core Technologies - Minimal Icons */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20 max-w-5xl mx-auto">
          <div className="border border-accent/30 bg-black/40 backdrop-blur-sm p-8 hover:border-accent transition-all duration-300 group">
            <div className="flex items-center justify-center mb-4">
              <Atom className="w-12 h-12 text-accent group-hover:rotate-180 transition-transform duration-700" />
            </div>
            <h3 className="text-xl font-bold text-center mb-2 uppercase tracking-wide">
              QUANTUM COMPUTING
            </h3>
            <p className="text-gray-400 text-sm text-center font-mono">
              Hybrid ECDSA+PQC cryptography. ML-DSA FIPS 204 compliant. Post-quantum ready.
            </p>
          </div>

          <div className="border border-accent/30 bg-black/40 backdrop-blur-sm p-8 hover:border-accent transition-all duration-300 group">
            <div className="flex items-center justify-center mb-4">
              <Shield className="w-12 h-12 text-accent group-hover:scale-110 transition-transform duration-300" />
            </div>
            <h3 className="text-xl font-bold text-center mb-2 uppercase tracking-wide">
              CYBERSECURITY
            </h3>
            <p className="text-gray-400 text-sm text-center font-mono">
              Zero-trust architecture. AES-256-GCM encryption. TLS 1.3 transport layer.
            </p>
          </div>

          <div className="border border-accent/30 bg-black/40 backdrop-blur-sm p-8 hover:border-accent transition-all duration-300 group">
            <div className="flex items-center justify-center mb-4">
              <Network className="w-12 h-12 text-accent group-hover:animate-pulse" />
            </div>
            <h3 className="text-xl font-bold text-center mb-2 uppercase tracking-wide">
              HEDERA HASHGRAPH
            </h3>
            <p className="text-gray-400 text-sm text-center font-mono">
              10K+ TPS. &lt;200ms finality. Byzantine fault tolerant consensus.
            </p>
          </div>
        </div>

        {/* Stats Bar */}
        <div className="border-t border-b border-accent/30 py-8 mb-20">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-black text-accent mb-2">99.99%</div>
              <div className="text-xs text-gray-500 uppercase tracking-widest font-mono">Uptime SLA</div>
            </div>
            <div>
              <div className="text-4xl font-black text-accent mb-2">10K+</div>
              <div className="text-xs text-gray-500 uppercase tracking-widest font-mono">TPS</div>
            </div>
            <div>
              <div className="text-4xl font-black text-accent mb-2">&lt;200ms</div>
              <div className="text-xs text-gray-500 uppercase tracking-widest font-mono">Latency</div>
            </div>
            <div>
              <div className="text-4xl font-black text-accent mb-2">600M+</div>
              <div className="text-xs text-gray-500 uppercase tracking-widest font-mono">Users</div>
            </div>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto mb-20">
          <div className="border-l-4 border-accent pl-6 py-4">
            <div className="flex items-center gap-3 mb-2">
              <Cpu className="w-6 h-6 text-accent" />
              <h4 className="text-lg font-bold uppercase">Quantum Nodes</h4>
            </div>
            <p className="text-gray-400 text-sm font-mono">
              Distributed quantum processing with auto-scaling infrastructure
            </p>
          </div>

          <div className="border-l-4 border-accent pl-6 py-4">
            <div className="flex items-center gap-3 mb-2">
              <Lock className="w-6 h-6 text-accent" />
              <h4 className="text-lg font-bold uppercase">Post-Quantum Security</h4>
            </div>
            <p className="text-gray-400 text-sm font-mono">
              NIST-compliant cryptographic signatures resistant to quantum attacks
            </p>
          </div>

          <div className="border-l-4 border-accent pl-6 py-4">
            <div className="flex items-center gap-3 mb-2">
              <Layers className="w-6 h-6 text-accent" />
              <h4 className="text-lg font-bold uppercase">Hashgraph Consensus</h4>
            </div>
            <p className="text-gray-400 text-sm font-mono">
              Asynchronous Byzantine Fault Tolerant consensus mechanism
            </p>
          </div>

          <div className="border-l-4 border-accent pl-6 py-4">
            <div className="flex items-center gap-3 mb-2">
              <Network className="w-6 h-6 text-accent" />
              <h4 className="text-lg font-bold uppercase">Global Network</h4>
            </div>
            <p className="text-gray-400 text-sm font-mono">
              Multi-region deployment with edge computing capabilities
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-gray-600 text-xs font-mono">
          <div className="mb-2">QUANTUM-GRID.TAURUSAI.IO</div>
          <div>© 2025 TAURUS AI CORP. // ALL RIGHTS RESERVED</div>
        </div>
      </div>
      <style>{`
        @keyframes grid-pulse {
          0%, 100% { opacity: 0.2; }
          50% { opacity: 0.4; }
        }
        @keyframes float {
          0%, 100% {
            transform: translateY(0px) translateX(0px);
            opacity: 0.6;
          }
          50% {
            transform: translateY(-20px) translateX(10px);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}
