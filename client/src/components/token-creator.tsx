import { useState } from "react";
import { Plus, Loader } from "lucide-react";
import { hederaClient } from "@/lib/hedera";

interface TokenCreationResult {
  tokenId: string;
  transactionId: string;
  status: "pending" | "success" | "error";
  error?: string;
}

export default function TokenCreator() {
  const [tokenName, setTokenName] = useState("");
  const [symbol, setSymbol] = useState("");
  const [supply, setSupply] = useState("1000000");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<TokenCreationResult | null>(null);

  const handleCreateToken = async () => {
    if (!tokenName || !symbol || !supply) {
      setResult({
        tokenId: "",
        transactionId: "",
        status: "error",
        error: "All fields required"
      });
      return;
    }

    if (!hederaClient.isInitialized()) {
      setResult({
        tokenId: "",
        transactionId: "",
        status: "error",
        error: "Hedera client not initialized"
      });
      return;
    }

    setLoading(true);
    setResult({ tokenId: "", transactionId: "", status: "pending" });

    try {
      const response = await hederaClient.createToken(
        tokenName,
        symbol,
        parseInt(supply)
      );

      if (response) {
        setResult({
          tokenId: response.tokenId,
          transactionId: response.transactionId,
          status: "success"
        });
        // Clear form
        setTokenName("");
        setSymbol("");
        setSupply("1000000");
      } else {
        setResult({
          tokenId: "",
          transactionId: "",
          status: "error",
          error: "Failed to create token"
        });
      }
    } catch (error) {
      setResult({
        tokenId: "",
        transactionId: "",
        status: "error",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
    setLoading(false);
  };

  return (
    <div className="border-2 border-gray-800 bg-gray-900/50 p-6 backdrop-blur-sm">
      <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
        <Plus className="w-5 h-5 text-accent" />
        CREATE HTS TOKEN
      </h3>

      <div className="space-y-4">
        {/* Token Name */}
        <div>
          <label className="block text-sm font-bold text-gray-400 mb-2 uppercase">
            TOKEN NAME
          </label>
          <input
            type="text"
            placeholder="e.g., Quantum Asset Token"
            value={tokenName}
            onChange={(e) => setTokenName(e.target.value)}
            disabled={loading}
            className="w-full bg-black border-2 border-gray-700 px-4 py-2 text-white placeholder-gray-600 focus:border-accent outline-none disabled:opacity-50"
          />
        </div>

        {/* Symbol */}
        <div>
          <label className="block text-sm font-bold text-gray-400 mb-2 uppercase">
            SYMBOL
          </label>
          <input
            type="text"
            placeholder="e.g., QAT"
            value={symbol}
            onChange={(e) => setSymbol(e.target.value.toUpperCase())}
            maxLength={4}
            disabled={loading}
            className="w-full bg-black border-2 border-gray-700 px-4 py-2 text-white placeholder-gray-600 focus:border-accent outline-none disabled:opacity-50"
          />
        </div>

        {/* Initial Supply */}
        <div>
          <label className="block text-sm font-bold text-gray-400 mb-2 uppercase">
            INITIAL SUPPLY
          </label>
          <input
            type="number"
            placeholder="1000000"
            value={supply}
            onChange={(e) => setSupply(e.target.value)}
            disabled={loading}
            className="w-full bg-black border-2 border-gray-700 px-4 py-2 text-white placeholder-gray-600 focus:border-accent outline-none disabled:opacity-50"
          />
        </div>

        {/* Create Button */}
        <button
          onClick={handleCreateToken}
          disabled={loading || !hederaClient.isInitialized()}
          className="w-full bg-accent text-black px-6 py-3 font-bold uppercase border-2 border-black hover:bg-black hover:text-white transition-all disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <Loader className="w-4 h-4 animate-spin" />
              CREATING...
            </>
          ) : (
            <>
              <Plus className="w-4 h-4" />
              CREATE TOKEN
            </>
          )}
        </button>

        {/* Result */}
        {result && (
          <div
            className={`p-4 border-l-4 ${
              result.status === "success"
                ? "border-green-500 bg-green-500/10 text-green-500"
                : result.status === "pending"
                ? "border-accent bg-accent/10 text-accent"
                : "border-red-500 bg-red-500/10 text-red-500"
            }`}
          >
            {result.status === "success" && (
              <div>
                <div className="font-bold mb-2">✅ Token Created Successfully!</div>
                <div className="text-xs space-y-1">
                  <div>
                    <span className="text-gray-400">Token ID:</span> {result.tokenId}
                  </div>
                  <div>
                    <span className="text-gray-400">TX ID:</span> {result.transactionId}
                  </div>
                </div>
              </div>
            )}
            {result.status === "pending" && (
              <div>
                <div className="font-bold">⏳ Creating token...</div>
                <div className="text-xs text-gray-400">This may take a few seconds</div>
              </div>
            )}
            {result.status === "error" && (
              <div>
                <div className="font-bold">⚠️ Error</div>
                <div className="text-xs">{result.error}</div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
