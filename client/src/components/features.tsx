import { Shield, Lock, Activity, Database, Globe, Cpu } from "lucide-react";

const features = [
  {
    title: "Post-Quantum Cryptography",
    description: "Implementing NIST FIPS 204 (ML-DSA) for digital signatures and FIPS 203 (ML-KEM) for key encapsulation.",
    icon: Shield,
    color: "bg-accent"
  },
  {
    title: "Hedera Governance",
    description: "Built on the only public network with 17 Forbes 500 governance members. Enterprise credibility.",
    icon: Globe,
    color: "bg-warning"
  },
  {
    title: "Cryptographic Agility",
    description: "Seamless migration framework from Ed25519 to quantum-resistant standards without downtime.",
    icon: Activity,
    color: "bg-white"
  },
  {
    title: "Healthcare Security",
    description: "HIPAA compliant frameworks with ML-DSA signed medical history and immutable audit trails.",
    icon: Lock,
    color: "bg-white"
  },
  {
    title: "CBDC Infrastructure",
    description: "Future-proof digital currency platforms compliant with approaching SWIFT 2027 deadlines.",
    icon: Database,
    color: "bg-white"
  },
  {
    title: "Industrial IoT",
    description: "Supply chain tracking with authenticity verification and tamper-proof product history.",
    icon: Cpu,
    color: "bg-accent"
  }
];

export default function Features() {
  return (
    <section className="py-24 bg-background border-b-4 border-black">
      <div className="container mx-auto px-4">
        <div className="mb-16 border-l-8 border-black pl-8">
          <h2 className="text-6xl font-black uppercase mb-4">The Ecosystem</h2>
          <p className="text-xl max-w-2xl font-mono">
            /// ARCHITECTURE_V1.0<br/>
            Deployed on Hedera Hashgraph. Secured by Math.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-0 border-4 border-black bg-black">
          {features.map((feature, index) => (
            <div 
              key={index} 
              className={`p-8 border border-black ${feature.color} hover:invert transition-all duration-300 group relative overflow-hidden`}
            >
              <div className="absolute top-2 right-2 font-mono text-xs opacity-50">0{index + 1}</div>
              <feature.icon className="w-12 h-12 mb-6 stroke-[2px] group-hover:scale-110 transition-transform" />
              <h3 className="text-2xl font-bold uppercase mb-3 tracking-tight">{feature.title}</h3>
              <p className="font-medium opacity-80 leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
