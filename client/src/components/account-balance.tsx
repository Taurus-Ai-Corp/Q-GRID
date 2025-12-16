import { useEffect, useState } from "react";
import { Wallet, Zap } from "lucide-react";
import { hederaClient } from "@/lib/hedera";

interface BalanceData {
  hbars: string;
  tinybars: string;
  loaded: boolean;
  error: string | null;
}

export default function AccountBalance() {
  const [balance, setBalance] = useState<BalanceData>({
    hbars: "0",
    tinybars: "0",
    loaded: false,
    error: null
  });

  useEffect(() => {
    const fetchBalance = async () => {
      // Check if client is initialized
      if (!hederaClient.isInitialized()) {
        setBalance(prev => ({
          ...prev,
          error: "Hedera client not configured",
          loaded: true
        }));
        return;
      }

      const result = await hederaClient.getAccountBalance();
      
      if (result) {
        setBalance({
          hbars: parseFloat(result.hbars).toFixed(4),
          tinybars: result.tinybars,
          loaded: true,
          error: null
        });
      } else {
        setBalance(prev => ({
          ...prev,
          error: "Failed to fetch balance",
          loaded: true
        }));
      }
    };

    fetchBalance();
    
    // Refresh every 30 seconds
    const interval = setInterval(fetchBalance, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="border-2 border-gray-800 bg-gray-900/50 p-6 backdrop-blur-sm hover:border-white transition-colors">
      <div className="flex justify-between items-start mb-6">
        <div className="font-bold text-lg text-accent">HEDERA ACCOUNT</div>
        <Wallet className="w-5 h-5 text-accent" />
      </div>

      {!balance.loaded && (
        <div className="text-sm text-gray-500">Loading account data...</div>
      )}

      {balance.error && (
        <div className="text-sm text-red-500">⚠️ {balance.error}</div>
      )}

      {balance.loaded && !balance.error && (
        <div className="space-y-4">
          <div>
            <div className="text-sm text-gray-500 mb-1">HBAR BALANCE</div>
            <div className="text-4xl font-black text-white">
              {balance.hbars}
              <span className="text-lg text-gray-500 ml-2">Ⓗ</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 text-center pt-4 border-t border-gray-800">
            <div>
              <div className="text-xs text-gray-500">ACCOUNT ID</div>
              <div className="font-mono text-xs text-white break-all">
                {hederaClient.getAccountId() || "Not set"}
              </div>
            </div>
            <div>
              <div className="text-xs text-gray-500">STATUS</div>
              <div className="flex items-center justify-center gap-1">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span className="text-xs text-green-500">ACTIVE</span>
              </div>
            </div>
          </div>

          <div className="text-xs text-gray-600 pt-2 font-mono">
            Network: Hedera (Testnet/Mainnet)
          </div>
        </div>
      )}
    </div>
  );
}
