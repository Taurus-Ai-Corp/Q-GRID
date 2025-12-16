import Header from "@/components/Header";
import { KeyRound, CheckCircle, Cpu, Lock } from "lucide-react";

export default function PQCSigService() {
  return (
    <div className="min-h-screen bg-black text-white font-mono pt-20">
      <Header />
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-12 border-b-4 border-accent pb-8">
            <div className="flex items-center gap-3 mb-4">
              <KeyRound className="w-8 h-8 text-accent" />
              <div className="text-xs text-gray-400">SERVICE 4 OF 4</div>
            </div>
            <h1 className="text-5xl font-black uppercase tracking-tighter mb-4">PQC-SIG M</h1>
            <p className="text-gray-400 text-lg">Post-Quantum Cryptographic Signature Module - ML-DSA FIPS 204 Compliant</p>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-3 gap-4 mb-12">
            <div className="p-4 bg-purple-900/30 border border-purple-700">
              <div className="text-2xl font-black text-accent">ML-DSA</div>
              <div className="text-xs text-gray-400">FIPS 204 Standard</div>
              <div className="text-xs text-gray-600">NIST approved</div>
            </div>
            <div className="p-4 bg-purple-900/30 border border-purple-700">
              <div className="text-2xl font-black text-accent">&lt;5ms</div>
              <div className="text-xs text-gray-400">Signature Time</div>
              <div className="text-xs text-gray-600">High-speed signing</div>
            </div>
            <div className="p-4 bg-purple-900/30 border border-purple-700">
              <div className="text-2xl font-black text-accent">256-bit</div>
              <div className="text-xs text-gray-400">Security Level</div>
              <div className="text-xs text-gray-600">Post-quantum safe</div>
            </div>
          </div>

          {/* Solution Overview */}
          <div className="border-2 border-gray-800 bg-gray-900/50 p-8 mb-8 backdrop-blur-sm">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <Cpu className="w-6 h-6 text-accent" />
              Quantum-Resistant Digital Signatures
            </h2>

            <div className="space-y-4">
              <div className="p-4 bg-black border-l-4 border-accent">
                <div className="font-bold text-accent mb-2">ML-DSA Algorithm (FIPS 204)</div>
                <div className="text-sm text-gray-400">
                  NIST-standardized lattice-based digital signature scheme. Provides security against both classical 
                  and quantum computing attacks. Based on Module Learning With Errors (MLWE) problem hardness.
                </div>
              </div>

              <div className="p-4 bg-black border-l-4 border-accent">
                <div className="font-bold text-accent mb-2">Hybrid Cryptography Mode</div>
                <div className="text-sm text-gray-400">
                  Dual-layer signing: Ed25519 (classical) + ML-DSA (quantum-resistant). Ensures backward compatibility 
                  while providing future-proof security. Automatic algorithm negotiation based on peer capabilities.
                </div>
              </div>

              <div className="p-4 bg-black border-l-4 border-accent">
                <div className="font-bold text-accent mb-2">Hardware Security Module (HSM) Integration</div>
                <div className="text-sm text-gray-400">
                  Dedicated cryptographic processors for key generation and signing operations. FIPS 140-3 Level 3 
                  certified. Tamper-resistant key storage with automatic key rotation every 90 days.
                </div>
              </div>

              <div className="p-4 bg-black border-l-4 border-accent">
                <div className="font-bold text-accent mb-2">Key Management Infrastructure</div>
                <div className="text-sm text-gray-400">
                  Hierarchical key derivation (BIP-32). Multi-signature support (M-of-N). Threshold cryptography 
                  for distributed signing. Automated key lifecycle management with audit trails.
                </div>
              </div>
            </div>
          </div>

          {/* Technical Specifications */}
          <div className="border-2 border-gray-800 bg-gray-900/50 p-8 mb-8 backdrop-blur-sm">
            <h2 className="text-2xl font-bold mb-6">Technical Specifications</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-4 bg-black border border-gray-700">
                <div className="text-accent font-bold mb-3">Signature Algorithms</div>
                <div className="text-sm text-gray-400 space-y-2">
                  <div>• <span className="font-bold">Primary:</span> ML-DSA-87 (FIPS 204)</div>
                  <div>• <span className="font-bold">Secondary:</span> ML-DSA-65</div>
                  <div>• <span className="font-bold">Legacy:</span> Ed25519 (backward compat)</div>
                  <div>• <span className="font-bold">Fallback:</span> ECDSA P-256</div>
                </div>
              </div>

              <div className="p-4 bg-black border border-gray-700">
                <div className="text-accent font-bold mb-3">Performance Metrics</div>
                <div className="text-sm text-gray-400 space-y-2">
                  <div>• <span className="font-bold">Signing:</span> &lt;5ms (ML-DSA-87)</div>
                  <div>• <span className="font-bold">Verification:</span> &lt;3ms</div>
                  <div>• <span className="font-bold">Key Gen:</span> &lt;10ms</div>
                  <div>• <span className="font-bold">Throughput:</span> 100K+ signatures/sec</div>
                </div>
              </div>

              <div className="p-4 bg-black border border-gray-700">
                <div className="text-accent font-bold mb-3">Security Parameters</div>
                <div className="text-sm text-gray-400 space-y-2">
                  <div>• <span className="font-bold">Classical:</span> 256-bit security</div>
                  <div>• <span className="font-bold">Quantum:</span> NIST Level 5</div>
                  <div>• <span className="font-bold">Signature Size:</span> 4,595 bytes</div>
                  <div>• <span className="font-bold">Public Key:</span> 2,592 bytes</div>
                </div>
              </div>

              <div className="p-4 bg-black border border-gray-700">
                <div className="text-accent font-bold mb-3">Integration Standards</div>
                <div className="text-sm text-gray-400 space-y-2">
                  <div>• <span className="font-bold">Protocol:</span> X.509 v3 certificates</div>
                  <div>• <span className="font-bold">Format:</span> ASN.1 DER encoding</div>
                  <div>• <span className="font-bold">API:</span> PKCS#11 v3.0</div>
                  <div>• <span className="font-bold">Transport:</span> TLS 1.3 + PQC</div>
                </div>
              </div>
            </div>
          </div>

          {/* Use Cases */}
          <div className="border-2 border-gray-800 bg-gray-900/50 p-8 mb-8 backdrop-blur-sm">
            <h2 className="text-2xl font-bold mb-6">Enterprise Use Cases</h2>

            <div className="space-y-4">
              <div className="p-4 bg-black border border-gray-700">
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-accent flex-shrink-0 mt-1" />
                  <div>
                    <div className="font-bold text-white mb-1">Central Bank Transaction Signing</div>
                    <div className="text-sm text-gray-400">
                      Sign CBDC transactions, batch settlements, and interbank transfers with quantum-safe signatures. 
                      Ensures transaction authenticity and non-repudiation for regulatory compliance.
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-black border border-gray-700">
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-accent flex-shrink-0 mt-1" />
                  <div>
                    <div className="font-bold text-white mb-1">KYC Credential Issuance</div>
                    <div className="text-sm text-gray-400">
                      Issue W3C Verifiable Credentials with PQC signatures. Credentials remain valid post-quantum 
                      transition. Supports selective disclosure with ZK-SNARK proofs.
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-black border border-gray-700">
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-accent flex-shrink-0 mt-1" />
                  <div>
                    <div className="font-bold text-white mb-1">Smart Contract Execution</div>
                    <div className="text-sm text-gray-400">
                      Sign Hedera smart contract deployments and function calls. Prevents unauthorized contract 
                      modifications. Enables multi-party computation with threshold signatures.
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-black border border-gray-700">
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-accent flex-shrink-0 mt-1" />
                  <div>
                    <div className="font-bold text-white mb-1">Document Authentication</div>
                    <div className="text-sm text-gray-400">
                      Sign legal documents, loan agreements, and regulatory filings. Long-term signature validity 
                      (25+ years). Timestamping with RFC 3161 trusted authorities.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Compliance & Standards */}
          <div className="border-2 border-gray-800 bg-gray-900/50 p-8 mb-8 backdrop-blur-sm">
            <h2 className="text-2xl font-bold mb-6">Compliance & Standards</h2>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-black border border-gray-700 text-center">
                <Lock className="w-8 h-8 text-accent mx-auto mb-2" />
                <div className="text-sm font-bold text-white">NIST FIPS 204</div>
                <div className="text-xs text-gray-500">ML-DSA Standard</div>
              </div>
              <div className="p-3 bg-black border border-gray-700 text-center">
                <Lock className="w-8 h-8 text-accent mx-auto mb-2" />
                <div className="text-sm font-bold text-white">FIPS 140-3 Level 3</div>
                <div className="text-xs text-gray-500">HSM Certification</div>
              </div>
              <div className="p-3 bg-black border border-gray-700 text-center">
                <Lock className="w-8 h-8 text-accent mx-auto mb-2" />
                <div className="text-sm font-bold text-white">eIDAS 2.0</div>
                <div className="text-xs text-gray-500">EU Regulation</div>
              </div>
              <div className="p-3 bg-black border border-gray-700 text-center">
                <Lock className="w-8 h-8 text-accent mx-auto mb-2" />
                <div className="text-sm font-bold text-white">ISO 27001</div>
                <div className="text-xs text-gray-500">Information Security</div>
              </div>
            </div>
          </div>

          {/* Transition Timeline */}
          <div className="border-2 border-accent bg-accent/10 p-8">
            <h2 className="text-2xl font-bold mb-6 text-accent">Quantum Transition Timeline</h2>
            
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="text-accent font-black text-2xl">2025</div>
                <div className="flex-1">
                  <div className="font-bold text-white">Hybrid Mode Deployment</div>
                  <div className="text-sm text-gray-400">Dual-signing with Ed25519 + ML-DSA</div>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="text-accent font-black text-2xl">2027</div>
                <div className="flex-1">
                  <div className="font-bold text-white">ML-DSA Primary Mode</div>
                  <div className="text-sm text-gray-400">Post-quantum signatures become default</div>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="text-accent font-black text-2xl">2030</div>
                <div className="flex-1">
                  <div className="font-bold text-white">Legacy Deprecation</div>
                  <div className="text-sm text-gray-400">Classical algorithms disabled (Ed25519, ECDSA)</div>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="text-accent font-black text-2xl">2035</div>
                <div className="flex-1">
                  <div className="font-bold text-white">Full Quantum Readiness</div>
                  <div className="text-sm text-gray-400">100% PQC infrastructure operational</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
