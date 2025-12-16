import { Copy, CheckCircle, AlertCircle, Lock } from "lucide-react";
import { useState } from "react";
import Header from "@/components/Header";

export default function Setup() {
  const [copied, setCopied] = useState("");

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(""), 2000);
  };

  const secrets = [
    {
      id: "account_id",
      key: "VITE_HEDERA_ACCOUNT_ID",
      value: "0.0.7231851",
      description: "Your Hedera account ID (ED25519 format)"
    },
    {
      id: "private_key",
      key: "VITE_HEDERA_PRIVATE_KEY",
      value: "0x0242d9566016bd0b19dc564df257fe816bb29cbb73bd3fb129afa451b71c0398",
      description: "Your Hedera private key (ED25519 HEX encoded)"
    },
    {
      id: "network",
      key: "VITE_HEDERA_NETWORK",
      value: "testnet",
      description: "Network: testnet or mainnet"
    },
    {
      id: "api_token",
      key: "VITE_HEDERA_API_TOKEN",
      value: "v4.public.eyJzdWIiOiI0M2FjMDNkMi1hMjQ2LTExZjAtOTBmMy03Zjg4MTljZmYyMjgiLCJpYXQiOiIyMDI1LTExLTI0VDAxOjUyOjM4LjkyMloiLCJqdGkiOiI0MWIyOTdlYS1jOGQ4LTExZjAtODY2MS1lNzY5MmM5MjliZWUifUTQyWNacBa3k3a2QUEOgbyaedbcco9qM0BS-MiV8o5ScE3XS_6dCAJmip_Z5oFixYN9j2fzyvJupSHZah275Qc",
      description: "Personal token API for Hedera operations"
    }
  ];

  return (
    <div className="min-h-screen bg-black text-white font-mono pt-20">
      <Header />
      <div className="container mx-auto px-4 relative z-10">
        {/* Header */}
        <div className="mb-8 border-b-4 border-white pb-4">
          <div className="text-xs text-gray-400 mb-1">/// SETUP_WIZARD</div>
          <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter mb-4">
            Configure Replit Secrets
          </h1>
          <p className="text-gray-400 max-w-2xl">
            Secure your Hedera credentials in Replit Secrets. These environment variables will be used for all blockchain operations.
          </p>
        </div>

        {/* Warning */}
        <div className="mb-8 p-4 border-l-4 border-warning bg-warning/10 text-warning">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-5 h-5 mt-0.5" />
            <div>
              <div className="font-bold mb-1">⚠️ SECURITY WARNING</div>
              <p className="text-sm">
                Never commit your private keys to Git. Always use Replit Secrets to store sensitive credentials.
                These keys control your Hedera account and can transfer funds.
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Setup Instructions */}
          <div className="space-y-6">
            <div className="border-2 border-gray-800 bg-gray-900/50 p-6 backdrop-blur-sm">
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <Lock className="w-6 h-6 text-accent" />
                STEP-BY-STEP SETUP
              </h2>

              <div className="space-y-4">
                {[
                  {
                    step: 1,
                    title: "Open Replit Secrets",
                    desc: "Click the lock icon (🔒) in the left sidebar of Replit"
                  },
                  {
                    step: 2,
                    title: "Add New Secret",
                    desc: "Click 'New Secret' button"
                  },
                  {
                    step: 3,
                    title: "Copy Key-Value Pairs",
                    desc: "Copy each secret from the list below and paste into Replit"
                  },
                  {
                    step: 4,
                    title: "Verify Setup",
                    desc: "Go to /accounts page and click 'CONNECT ACCOUNT' without entering credentials"
                  },
                  {
                    step: 5,
                    title: "Test Connection",
                    desc: "Your balance should load automatically from environment variables"
                  }
                ].map(item => (
                  <div key={item.step} className="flex gap-3">
                    <div className="flex-shrink-0">
                      <div className="flex items-center justify-center h-8 w-8 rounded border-2 border-accent bg-accent text-black font-bold">
                        {item.step}
                      </div>
                    </div>
                    <div>
                      <h3 className="font-bold text-accent mb-1">{item.title}</h3>
                      <p className="text-sm text-gray-400">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Account Info */}
            <div className="border-2 border-gray-800 bg-gray-900/50 p-6 backdrop-blur-sm">
              <h3 className="text-lg font-bold mb-4">YOUR ACCOUNT</h3>
              <div className="space-y-3 text-sm">
                <div>
                  <div className="text-gray-500 text-xs mb-1">ACCOUNT ID</div>
                  <div className="font-mono font-bold text-accent">0.0.7231851</div>
                </div>
                <div>
                  <div className="text-gray-500 text-xs mb-1">ACCOUNT TYPE</div>
                  <div className="font-mono">ED25519 (Post-Quantum Ready)</div>
                </div>
                <div>
                  <div className="text-gray-500 text-xs mb-1">PUBLIC KEY</div>
                  <div className="font-mono text-xs break-all">67971f5c7603d9c0c2ce2728fe0c98e5cad256284d0913f478e5d11e5cdcc43f</div>
                </div>
                <div>
                  <div className="text-gray-500 text-xs mb-1">NETWORK SUPPORT</div>
                  <div className="font-mono">Hedera Testnet (Quantum-Ready)</div>
                </div>
              </div>
            </div>
          </div>

          {/* Secrets List */}
          <div className="space-y-4">
            {secrets.map(secret => (
              <div key={secret.id} className="border-2 border-gray-800 bg-gray-900/50 p-4 backdrop-blur-sm">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-bold text-accent mb-1">{secret.key}</h3>
                    <p className="text-xs text-gray-500">{secret.description}</p>
                  </div>
                  <button
                    onClick={() => copyToClipboard(secret.value, secret.id)}
                    className="text-xs font-bold uppercase px-2 py-1 bg-black border border-gray-700 hover:border-accent transition-colors"
                  >
                    {copied === secret.id ? "✓ Copied" : "Copy"}
                  </button>
                </div>

                <div className="p-3 bg-black border border-gray-700 rounded font-mono text-xs break-all">
                  {secret.value}
                </div>

                <div className="mt-3 text-xs text-gray-500">
                  Paste this value in Replit Secrets for key: <span className="font-bold text-white">{secret.key}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Next Steps */}
        <div className="mt-8 border-2 border-accent bg-accent/10 p-6">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-accent" />
            AFTER SETUP
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <div className="font-bold text-accent mb-2">1. Visit /accounts</div>
              <p className="text-sm text-gray-400">Navigate to the Accounts page to manage your Hedera account</p>
            </div>
            <div>
              <div className="font-bold text-accent mb-2">2. Create Tokens</div>
              <p className="text-sm text-gray-400">Use the Token Creator form to create HTS tokens on Hedera</p>
            </div>
            <div>
              <div className="font-bold text-accent mb-2">3. Monitor System</div>
              <p className="text-sm text-gray-400">Check /monitoring page to see real-time transaction status</p>
            </div>
          </div>

          <div className="mt-4 p-3 bg-black border border-accent/50 rounded text-xs">
            <span className="text-accent">💡 Tip:</span> Your credentials are automatically loaded from Replit Secrets. You don't need to paste them into forms.
          </div>
        </div>
      </div>
    </div>
  );
}
