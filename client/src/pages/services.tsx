import { useEffect } from "react";
import { Lock, Zap, Shield, KeyRound, ArrowRight, Globe, Database, Brain } from "lucide-react";
import Header from "@/components/Header";

export default function Services() {
  useEffect(() => {
    // Scroll to top
    window.scrollTo(0, 0);
  }, []);

  const services = [
    {
      id: "kyc",
      title: "Tokenized KYC",
      subtitle: "Reusable Digital Identity",
      description: "Production-ready Aadhaar integration with W3C Verifiable Credentials and Zero-Knowledge Proofs",
      icon: <Lock className="w-12 h-12" />,
      metrics: [
        { label: "KYC Time", value: "87 seconds", vs: "vs 3-7 days" },
        { label: "Cost Reduction", value: "90%", vs: "₹15 vs ₹150-300" },
        { label: "Privacy", value: "95% Protected", vs: "ZK-SNARK proofs" }
      ],
      features: [
        "Aadhaar biometric authentication",
        "W3C Verifiable Credentials",
        "Zero-Knowledge Proofs",
        "IPFS encrypted storage",
        "DigiLocker integration",
        "CKYC sync"
      ],
      revenue: "₹281 Cr (Y5)",
      users: "50M+",
      subdomain: "kyc.quantumrupee.gov.in",
      launchUrl: "/app/kyc-service",
      color: "from-blue-600 to-blue-900"
    },
    {
      id: "cbdc",
      title: "Offline CBDC Transfers",
      subtitle: "Unlimited Quantum-Safe Payments",
      description: "Revolutionary state channel protocol for consecutive offline transactions with quantum-resistant cryptography",
      icon: <Zap className="w-12 h-12" />,
      metrics: [
        { label: "Transactions", value: "Unlimited", vs: "vs RBI's 1 tx" },
        { label: "Internet Needed", value: "0%", vs: "100% offline" },
        { label: "Quantum Ready", value: "ML-DSA", vs: "2027 compliant" }
      ],
      features: [
        "State channel architecture",
        "Bluetooth 5.3 Mesh protocol",
        "NFC/QR code backup",
        "Post-quantum cryptography",
        "Offline-first design",
        "Automatic settlement"
      ],
      revenue: "₹200 Cr (Y5)",
      users: "600M rural",
      subdomain: "cbdc.quantumrupee.gov.in",
      launchUrl: "/app/cbdc-service",
      color: "from-yellow-600 to-orange-900"
    },
    {
      id: "fraud",
      title: "AI Fraud Detection",
      subtitle: "Multimodal Deepfake Defense",
      description: "99.73% accuracy fraud detection with deepfake recognition, behavioral analytics, and real-time risk scoring",
      icon: <Shield className="w-12 h-12" />,
      metrics: [
        { label: "Accuracy", value: "99.73%", vs: "vs 99.0% industry" },
        { label: "Response Time", value: "<200ms", vs: "real-time alert" },
        { label: "Coverage", value: "Video+Audio+Behavior", vs: "multimodal" }
      ],
      features: [
        "Deepfake video detection",
        "Voice synthesis detection",
        "Behavioral anomaly analysis",
        "Device fingerprinting",
        "Real-time risk scoring",
        "Edge & cloud processing"
      ],
      revenue: "₹500 Cr (Y5)",
      users: "500+ banks",
      subdomain: "fraud.quantumrupee.gov.in",
      launchUrl: "/app/fraud-service",
      color: "from-red-600 to-red-900"
    },
    {
      id: "pqc-sig",
      title: "PQC-SIG M",
      subtitle: "Post-Quantum Cryptographic Signatures",
      description: "ML-DSA FIPS 204 compliant digital signatures with hardware security module integration and quantum-resistant key management",
      icon: <KeyRound className="w-12 h-12" />,
      metrics: [
        { label: "Algorithm", value: "ML-DSA", vs: "FIPS 204 std" },
        { label: "Signing Speed", value: "<5ms", vs: "high-speed ops" },
        { label: "Security", value: "256-bit", vs: "post-quantum" }
      ],
      features: [
        "ML-DSA-87 signatures",
        "HSM integration (FIPS 140-3)",
        "Hybrid cryptography mode",
        "Threshold signatures",
        "Key lifecycle management",
        "X.509 v3 certificates"
      ],
      revenue: "₹164 Cr (Y5)",
      users: "100+ enterprises",
      subdomain: "pqc.quantumrupee.gov.in",
      launchUrl: "/app/pqc-sig-service",
      color: "from-purple-600 to-purple-900"
    }
  ];

  return (
    <div className="min-h-screen bg-black text-white font-mono pt-20">
      <Header />
      <div className="container mx-auto px-4 relative z-10">
        {/* Header */}
        <div className="mb-16 text-center border-b-4 border-accent pb-8">
          <div className="text-xs text-gray-400 mb-2">/// QUANTUM_RUPEE ECOSYSTEM</div>
          <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tighter mb-4">Quantum-rupee-Grid™</h1>
          <p className="text-gray-400 max-w-3xl mx-auto mb-4">
            Enterprise-grade fintech solutions delivering ₹2,145+ Crore in 5-year revenue. 
            150M+ users. 500+ institutions. Quantum-proof infrastructure.
          </p>
        </div>

        {/* Service Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-8 mb-16">
          {services.map((service) => (
            <div
              key={service.id}
              className={`border-2 border-gray-800 bg-gradient-to-br ${service.color} bg-opacity-10 p-8 backdrop-blur-sm hover:border-accent transition-all group`}
            >
              {/* Icon */}
              <div className="mb-4 text-accent">{service.icon}</div>

              {/* Title */}
              <h2 className="text-3xl font-black uppercase mb-2">{service.title}</h2>
              <div className="text-sm text-accent font-bold mb-4">{service.subtitle}</div>
              <p className="text-gray-400 text-sm mb-6 leading-relaxed">{service.description}</p>

              {/* Key Metrics */}
              <div className="space-y-3 mb-6 p-4 bg-black/50 border border-gray-800">
                {service.metrics.map((metric, idx) => (
                  <div key={idx} className="flex justify-between items-start">
                    <span className="text-xs text-gray-500">{metric.label}</span>
                    <div className="text-right">
                      <div className="font-bold text-accent text-lg">{metric.value}</div>
                      <div className="text-xs text-gray-500">{metric.vs}</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Features */}
              <div className="mb-6">
                <div className="text-xs font-bold text-gray-500 mb-2">FEATURES</div>
                <div className="grid grid-cols-2 gap-2">
                  {service.features.map((feature, idx) => (
                    <div key={idx} className="text-xs text-gray-400 border-l-2 border-accent pl-2">
                      ✓ {feature}
                    </div>
                  ))}
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-4 mb-6 text-center p-4 bg-black/50 border border-gray-800">
                <div>
                  <div className="text-xs text-gray-500">REVENUE (Y5)</div>
                  <div className="font-bold text-accent">{service.revenue}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500">USERS</div>
                  <div className="font-bold text-accent">{service.users}</div>
                </div>
              </div>

              {/* Subdomain */}
              <div className="text-xs font-mono text-gray-500 mb-4 p-2 bg-black border border-gray-700">
                {service.subdomain}
              </div>

              {/* Launch Button */}
              <a
                href={service.launchUrl}
                className="w-full bg-accent text-black px-6 py-3 font-bold uppercase border-2 border-black hover:bg-black hover:text-white transition-all flex items-center justify-center gap-2 group/btn"
              >
                LAUNCH SERVICE
                <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
              </a>
            </div>
          ))}
        </div>

        {/* Architecture Diagram */}
        <div className="border-2 border-gray-800 bg-gray-900/50 p-8 backdrop-blur-sm mb-16">
          <h2 className="text-2xl font-black uppercase mb-8 flex items-center gap-2">
            <Database className="w-6 h-6 text-accent" />
            Integrated Tech Stack
          </h2>

          <div className="space-y-6">
            {/* Layer 1 */}
            <div className="p-4 bg-black border-l-4 border-accent">
              <div className="font-bold text-accent mb-2">LAYER 1: Blockchain & Data</div>
              <div className="text-sm text-gray-400 space-y-1">
                <div>• <span className="font-bold">Hedera Hashgraph</span>: 10,000+ TPS, quantum-resistant, RBI-compliant</div>
                <div>• <span className="font-bold">Polygon L2</span>: 100,000+ TPS scaling, EVM-compatible smart contracts</div>
                <div>• <span className="font-bold">Storage</span>: IPFS (distributed) + Filecoin (permanent backup)</div>
              </div>
            </div>

            {/* Layer 2 */}
            <div className="p-4 bg-black border-l-4 border-accent">
              <div className="font-bold text-accent mb-2">LAYER 2: Identity & KYC</div>
              <div className="text-sm text-gray-400 space-y-1">
                <div>• <span className="font-bold">Aadhaar Integration</span>: Production-ready e-KYC (STARTEK_FM220)</div>
                <div>• <span className="font-bold">W3C Credentials</span>: Verifiable credentials + DIDs</div>
                <div>• <span className="font-bold">Privacy</span>: Zero-Knowledge Proofs (Circom + SnarkJS)</div>
              </div>
            </div>

            {/* Layer 3 */}
            <div className="p-4 bg-black border-l-4 border-accent">
              <div className="font-bold text-accent mb-2">LAYER 3: Payment Processing</div>
              <div className="text-sm text-gray-400 space-y-1">
                <div>• <span className="font-bold">Offline Channels</span>: BLE 5.3 Mesh + NFC + QR + USSD SMS</div>
                <div>• <span className="font-bold">State Channels</span>: Patent-pending unlimited transactions</div>
                <div>• <span className="font-bold">Settlement</span>: Batch Merkle trees → Hedera → Bank (T+0)</div>
              </div>
            </div>

            {/* Layer 4 */}
            <div className="p-4 bg-black border-l-4 border-accent">
              <div className="font-bold text-accent mb-2">LAYER 4: AI & Fraud Detection</div>
              <div className="text-sm text-gray-400 space-y-1">
                <div>• <span className="font-bold">Video Analysis</span>: EfficientNet-B7 + 3D-ResNet + Vision Transformer</div>
                <div>• <span className="font-bold">Audio Analysis</span>: x-vector speaker embedding + Wav2Vec 2.0</div>
                <div>• <span className="font-bold">Inference</span>: TensorFlow Lite (mobile) + TensorFlow Serving (cloud)</div>
              </div>
            </div>

            {/* Layer 5 */}
            <div className="p-4 bg-black border-l-4 border-accent">
              <div className="font-bold text-accent mb-2">LAYER 5: Frontend & APIs</div>
              <div className="text-sm text-gray-400 space-y-1">
                <div>• <span className="font-bold">Interfaces</span>: React Native (mobile) + React.js (web)</div>
                <div>• <span className="font-bold">APIs</span>: REST + GraphQL + WebSocket + gRPC</div>
                <div>• <span className="font-bold">Deployment</span>: AWS Mumbai (primary) + Azure India (DR)</div>
              </div>
            </div>
          </div>
        </div>

        {/* 5-Year Revenue Projection */}
        <div className="border-2 border-gray-800 bg-gray-900/50 p-8 backdrop-blur-sm">
          <h2 className="text-2xl font-black uppercase mb-8 flex items-center gap-2">
            <Brain className="w-6 h-6 text-accent" />
            5-Year Revenue Projection
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full text-sm border border-gray-800">
              <thead>
                <tr className="border-b border-gray-800">
                  <th className="p-3 text-left font-bold text-accent">Year</th>
                  <th className="p-3 text-right font-bold text-accent">KYC</th>
                  <th className="p-3 text-right font-bold text-accent">CBDC</th>
                  <th className="p-3 text-right font-bold text-accent">Fraud AI</th>
                  <th className="p-3 text-right font-bold text-accent">Total Revenue</th>
                  <th className="p-3 text-right font-bold text-accent">Users</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { year: "Y1", kyc: "₹3.35 Cr", cbdc: "₹8.5 Cr", fraud: "₹15 Cr", total: "₹26.85 Cr", users: "1.5M" },
                  { year: "Y2", kyc: "₹13.4 Cr", cbdc: "₹35 Cr", fraud: "₹60 Cr", total: "₹108.4 Cr", users: "8M" },
                  { year: "Y3", kyc: "₹48.2 Cr", cbdc: "₹85 Cr", fraud: "₹180 Cr", total: "₹313.2 Cr", users: "25M" },
                  { year: "Y4", kyc: "₹116 Cr", cbdc: "₹150 Cr", fraud: "₹350 Cr", total: "₹616 Cr", users: "75M" },
                  { year: "Y5", kyc: "₹281 Cr", cbdc: "₹200 Cr", fraud: "₹500 Cr", total: "₹981 Cr", users: "150M" }
                ].map((row, idx) => (
                  <tr key={idx} className="border-b border-gray-800 hover:bg-gray-800/30">
                    <td className="p-3 font-bold text-accent">{row.year}</td>
                    <td className="p-3 text-right text-gray-300">{row.kyc}</td>
                    <td className="p-3 text-right text-gray-300">{row.cbdc}</td>
                    <td className="p-3 text-right text-gray-300">{row.fraud}</td>
                    <td className="p-3 text-right font-bold text-white">{row.total}</td>
                    <td className="p-3 text-right text-accent font-bold">{row.users}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-6 p-4 bg-accent/10 border border-accent">
            <div className="font-bold text-accent mb-2">5-YEAR TOTAL: ₹2,145+ CRORE</div>
            <div className="text-sm text-gray-400">
              Combined revenue from Tokenized KYC, Offline CBDC, and AI Fraud Detection services. 
              150M+ users. 500+ institutions. Market window: 36 months before SWIFT PQC mandate (2027).
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-16 p-8 border-2 border-accent bg-accent/5 text-center">
          <h2 className="text-3xl font-black uppercase mb-4">Ready to Launch?</h2>
          <p className="text-gray-400 mb-6 max-w-2xl mx-auto">
            Select a service above to explore production-ready infrastructure, technical documentation, 
            and go-to-market strategy. RBI-compliant. Quantum-proof. Future-ready.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="/app/kyc-service" className="px-8 py-3 bg-accent text-black font-bold uppercase hover:bg-yellow-400 transition-colors">
              Explore KYC Service
            </a>
            <a href="/app/cbdc-payment-platform" className="px-8 py-3 border-2 border-accent text-accent font-bold uppercase hover:bg-accent hover:text-black transition-colors">
              Explore CBDC Service
            </a>
            <a href="/app/fraud-service" className="px-8 py-3 border-2 border-accent text-accent font-bold uppercase hover:bg-accent hover:text-black transition-colors">
              Explore Fraud Detection
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
