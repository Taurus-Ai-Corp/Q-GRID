import { useEffect, useState } from "react";
import { Activity, TrendingUp, AlertCircle } from "lucide-react";

interface Transaction {
  id: string;
  type: "token_create" | "token_transfer" | "hbar_transfer" | "contract_call";
  status: "pending" | "success" | "failed";
  timestamp: number;
  amount?: string;
  from?: string;
  to?: string;
  hash: string;
}

export default function TransactionMonitor() {
  const [transactions, setTransactions] = useState<Transaction[]>([
    {
      id: "1",
      type: "token_create",
      status: "success",
      timestamp: Date.now() - 300000,
      amount: "1000000",
      hash: "0x123abc...",
    },
    {
      id: "2",
      type: "hbar_transfer",
      status: "pending",
      timestamp: Date.now() - 60000,
      amount: "100 HBAR",
      from: "0.0.6952220",
      to: "0.0.123456",
      hash: "0x456def...",
    },
  ]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "success":
        return "text-green-500 bg-green-500/10";
      case "pending":
        return "text-warning bg-warning/10";
      case "failed":
        return "text-red-500 bg-red-500/10";
      default:
        return "text-gray-500 bg-gray-500/10";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "success":
        return "✅";
      case "pending":
        return "⏳";
      case "failed":
        return "❌";
      default:
        return "❓";
    }
  };

  const formatTime = (timestamp: number) => {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    return `${Math.floor(seconds / 3600)}h ago`;
  };

  return (
    <div className="border-2 border-gray-800 bg-gray-900/50 p-6 backdrop-blur-sm">
      <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
        <Activity className="w-5 h-5 text-accent" />
        TRANSACTION HISTORY
      </h3>

      <div className="space-y-2 max-h-[600px] overflow-y-auto">
        {transactions.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            <AlertCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <div className="text-sm">No transactions yet</div>
          </div>
        ) : (
          transactions.map((tx) => (
            <div
              key={tx.id}
              className={`p-3 border-l-4 border-gray-800 hover:border-accent transition-colors ${getStatusColor(
                tx.status
              )}`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-lg">{getStatusIcon(tx.status)}</span>
                    <span className="font-bold uppercase text-sm">
                      {tx.type === "token_create" && "Token Created"}
                      {tx.type === "token_transfer" && "Token Transfer"}
                      {tx.type === "hbar_transfer" && "HBAR Transfer"}
                      {tx.type === "contract_call" && "Contract Call"}
                    </span>
                    <span className="text-xs text-gray-500 ml-auto">
                      {formatTime(tx.timestamp)}
                    </span>
                  </div>

                  <div className="text-xs font-mono text-gray-500 mb-2">
                    TX: {tx.hash}
                  </div>

                  {tx.amount && (
                    <div className="text-xs flex items-center gap-1">
                      <TrendingUp className="w-3 h-3" />
                      {tx.amount}
                    </div>
                  )}

                  {tx.from && tx.to && (
                    <div className="text-xs text-gray-400 mt-1">
                      {tx.from} → {tx.to}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="mt-4 pt-4 border-t border-gray-800">
        <div className="grid grid-cols-3 gap-4 text-center text-xs">
          <div>
            <div className="text-gray-500">TOTAL</div>
            <div className="font-bold text-white">{transactions.length}</div>
          </div>
          <div>
            <div className="text-gray-500">SUCCESS</div>
            <div className="font-bold text-green-500">
              {transactions.filter((t) => t.status === "success").length}
            </div>
          </div>
          <div>
            <div className="text-gray-500">PENDING</div>
            <div className="font-bold text-warning">
              {transactions.filter((t) => t.status === "pending").length}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
