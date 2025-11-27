import { Lock, CheckCircle, ArrowRight, Zap } from "lucide-react";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import Header from "@/components/Header";

export default function KYCService() {
  const [isVerifying, setIsVerifying] = useState(false);

  const verifyKYCMutation = useMutation({
    mutationFn: async () => {
      setIsVerifying(true);
      try {
        const response = await fetch("/api/kyc/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: "user_demo",
            verificationType: "full_kyc",
          }),
        });
        if (!response.ok) throw new Error("KYC verification failed");
        const data = await response.json();
        toast.success("✅ KYC Verified", {
          description: `Processing Time: ${data.verification.processingTime} | Settlement: ${data.verification.settlementTime}`,
        });
        return data;
      } catch (error) {
        toast.error("❌ Verification Failed", {
          description: error instanceof Error ? error.message : "Unknown error",
        });
        throw error;
      } finally {
        setIsVerifying(false);
      }
    },
  });

  return (
    <div className="min-h-screen bg-black text-white font-mono pt-20">
      <Header />
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto">
          {/* Launch Button */}
          <div className="mb-8 border-4 border-accent bg-accent/10 p-6 text-center">
            <button
              data-testid="button-verify-kyc"
              onClick={() => verifyKYCMutation.mutate()}
              disabled={isVerifying || verifyKYCMutation.isPending}
              className="px-8 py-3 bg-accent text-black font-bold uppercase hover:bg-yellow-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all border-2 border-accent"
            >
              {isVerifying || verifyKYCMutation.isPending ? "🔄 Verifying..." : "▶ VERIFY KYC"}
            </button>
          </div>

          {/* Header */}
          <div className="mb-12 border-b-4 border-accent pb-8">
            <div className="flex items-center gap-3 mb-4">
              <Lock className="w-8 h-8 text-accent" />
              <div className="text-xs text-gray-400">SERVICE 1 OF 3</div>
            </div>
            <h1 className="text-5xl font-black uppercase tracking-tighter mb-4">Tokenized KYC</h1>
            <p className="text-gray-400 text-lg">Reusable Digital Identity for Financial Inclusion</p>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-3 gap-4 mb-12">
            <div className="p-4 bg-blue-900/30 border border-blue-700">
              <div className="text-2xl font-black text-accent">87s</div>
              <div className="text-xs text-gray-400">KYC Time</div>
              <div className="text-xs text-gray-600">vs 3-7 days</div>
            </div>
            <div className="p-4 bg-blue-900/30 border border-blue-700">
              <div className="text-2xl font-black text-accent">90%</div>
              <div className="text-xs text-gray-400">Cost Reduction</div>
              <div className="text-xs text-gray-600">₹15 vs ₹150-300</div>
            </div>
            <div className="p-4 bg-blue-900/30 border border-blue-700">
              <div className="text-2xl font-black text-accent">95%</div>
              <div className="text-xs text-gray-400">Privacy Protected</div>
              <div className="text-xs text-gray-600">ZK-SNARK proofs</div>
            </div>
          </div>

          {/* Solution Overview */}
          <div className="border-2 border-gray-800 bg-gray-900/50 p-8 mb-8 backdrop-blur-sm">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <Zap className="w-6 h-6 text-accent" />
              How It Works
            </h2>

            <div className="space-y-4">
              <div className="p-4 bg-black border-l-4 border-accent">
                <div className="font-bold text-accent mb-2">Step 1: Aadhaar Authentication</div>
                <div className="text-sm text-gray-400">
                  User authenticates via UIDAI biometric (fingerprint/iris) using existing STARTEK_FM220 devices. 
                  Production-proven with 1M+ authentications completed.
                </div>
              </div>

              <div className="p-4 bg-black border-l-4 border-accent">
                <div className="font-bold text-accent mb-2">Step 2: Credential Issuance</div>
                <div className="text-sm text-gray-400">
                  W3C Verifiable Credential generated with encrypted PII. 
                  Stored on IPFS (distributed) + Filecoin (permanent backup). 
                  Blockchain hash on Polygon for verification.
                </div>
              </div>

              <div className="p-4 bg-black border-l-4 border-accent">
                <div className="font-bold text-accent mb-2">Step 3: Zero-Knowledge Proof Generation</div>
                <div className="text-sm text-gray-400">
                  Generate ZK-SNARKs for selective disclosure: prove age &gt;= 18 without revealing DOB, 
                  prove city = Mumbai without full address. Privacy improvement: 95%.
                </div>
              </div>

              <div className="p-4 bg-black border-l-4 border-accent">
                <div className="font-bold text-accent mb-2">Step 4: Universal Verification</div>
                <div className="text-sm text-gray-400">
                  Any bank/fintech verifies credential instantly (&lt;2 seconds) using blockchain hash. 
                  One KYC accepted by 500+ institutions. Automatic sync with CKYC registry.
                </div>
              </div>
            </div>
          </div>

          {/* Features */}
          <div className="border-2 border-gray-800 bg-gray-900/50 p-8 mb-8 backdrop-blur-sm">
            <h2 className="text-2xl font-bold mb-6">Key Features</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                "Aadhaar biometric authentication (existing infrastructure)",
                "W3C Verifiable Credentials standard",
                "Zero-Knowledge Proofs (Circom + SnarkJS)",
                "IPFS encrypted storage with Filecoin backup",
                "Polygon L2 blockchain integration",
                "DigiLocker API integration (165M users)",
                "CKYC bidirectional sync",
                "Multi-institution acceptance"
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
            <h2 className="text-2xl font-bold mb-6">Business Model</h2>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-black border border-gray-800">
                  <div className="text-sm text-gray-500 mb-2">B2C Pricing</div>
                  <div className="text-2xl font-bold text-accent mb-1">₹49/token</div>
                  <div className="text-xs text-gray-400">Cost: ₹15.50 | Margin: 68%</div>
                </div>
                <div className="p-4 bg-black border border-gray-800">
                  <div className="text-sm text-gray-500 mb-2">B2B Pricing</div>
                  <div className="text-2xl font-bold text-accent mb-1">₹5/verification</div>
                  <div className="text-xs text-gray-400">Monthly: ₹15K unlimited</div>
                </div>
              </div>

              <div className="p-4 bg-accent/10 border border-accent">
                <div className="font-bold text-accent mb-2">5-Year Revenue Projection</div>
                <div className="text-sm text-gray-400 space-y-1">
                  <div>• Y1: ₹3.35 Cr (500K users, 50 institutions)</div>
                  <div>• Y3: ₹48.2 Cr (8M users, 500 institutions)</div>
                  <div>• Y5: ₹281 Cr (50M users, 2,000 institutions)</div>
                </div>
              </div>
            </div>
          </div>

          {/* Regulatory Compliance */}
          <div className="border-2 border-gray-800 bg-gray-900/50 p-8 mb-8 backdrop-blur-sm">
            <h2 className="text-2xl font-bold mb-6">Regulatory Compliance</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {[
                "✓ RBI Master Direction on KYC (2023)",
                "✓ PMLA Act 2002 & Rules 2005",
                "✓ Aadhaar Act 2016 Section 4",
                "✓ IT Act 2000 Section 43A",
                "✓ DPDP Act 2023 (Data Protection)",
                "✓ Data localization (India-only)"
              ].map((item, idx) => (
                <div key={idx} className="p-3 bg-black border border-gray-800 text-sm">
                  {item}
                </div>
              ))}
            </div>
          </div>

          {/* CTA */}
          <div className="text-center p-8 border-2 border-accent bg-accent/5">
            <h2 className="text-2xl font-bold mb-4">Ready to Implement?</h2>
            <p className="text-gray-400 mb-6">
              Production-ready codebase with Aadhaar integration, smart contracts, and zero-knowledge circuits. 
              RBI sandbox ready.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a href="/app/command-center" className="px-8 py-3 bg-accent text-black font-bold uppercase hover:bg-yellow-400 transition-colors">
                View Dashboard
              </a>
              <a href="/app/accounts" className="px-8 py-3 border-2 border-accent text-accent font-bold uppercase hover:bg-accent hover:text-black transition-colors">
                Connect Account
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
